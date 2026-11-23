
const API_URL = "https://api.sleeper.app/v1/players/nfl";
const NFL_STATE_URL = "https://api.sleeper.app/v1/state/nfl";

const LEAGUE_KEY = "nfl-france-fantasy-v3";
const CACHE_KEY = "nfl-france-players-v6";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const PROJECTION_CACHE_PREFIX = "nfl-france-projections-";
const PROJECTION_CACHE_DURATION = 60 * 60 * 1000;

const TEAMS = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SF: "San Francisco 49ers",
  SEA: "Seattle Seahawks",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WAS: "Washington Commanders"
};

const $ = id => document.getElementById(id);

let PLAYERS = [];
let league = null;
let selectedTeam = "ALL";
let currentNFLWeek = null;
let modalOpen = false;
let leagueUnsubscribe = null;
let leagueDocRef = null;
let currentUser = null;
let leagueRaw = null;
let joinCodeInput = null;
let pseudoInput = null;
let createPseudoInput = null;
let multiplayerStatus = null;
let startDraftButton = null;

function save() {
  // Les données de ligue sont désormais enregistrées dans Firestore.
}

function firebaseTools() {
  if (!window.firebaseDB || !window.firebaseFirestore || !window.firebaseAuth) {
    throw new Error("Firebase n'est pas initialisé. Vérifie firebase.js et fantasy.html.");
  }
  return window.firebaseFirestore;
}

function managerName(uid) {
  return leagueRaw?.members?.[uid] || "Manager";
}

function mapFirestoreLeague(data, id) {
  const memberIds = Object.keys(data.members || {});
  const picks = (data.picks || []).map(pick => ({
    manager: memberIds.indexOf(pick.uid),
    playerId: String(pick.playerId),
    uid: pick.uid
  }));
  return {
    id,
    name: data.name || "Ligue NFL France",
    rounds: Number(data.rounds),
    managers: memberIds.map(uid => data.members[uid]),
    memberIds,
    picks,
    status: data.status,
    capacity: Number(data.capacity),
    owner: data.owner,
    inviteCode: id
  };
}

function stopLeagueListener() {
  if (leagueUnsubscribe) {
    leagueUnsubscribe();
    leagueUnsubscribe = null;
  }
  leagueDocRef = null;
  leagueRaw = null;
}

async function attachLeague(code) {
  const user = await window.firebaseReady;
  currentUser = user;
  const f = firebaseTools();
  const ref = f.doc(window.firebaseDB, "leagues", code);
  const snap = await f.getDoc(ref);
  if (!snap.exists()) throw new Error("Aucune ligue ne correspond à ce code.");
  leagueDocRef = ref;
  stopLeagueListener();
  leagueDocRef = ref;
  leagueUnsubscribe = f.onSnapshot(ref, snapshot => {
    if (!snapshot.exists()) {
      stopLeagueListener();
      league = null;
      render();
      return;
    }
    leagueRaw = snapshot.data();
    league = mapFirestoreLeague(leagueRaw, snapshot.id);
    render();
    renderMultiplayerControls();
  }, error => {
    console.error("Synchronisation Firestore :", error);
    showFantasyModal({
      title: "Erreur de synchronisation",
      message: error.message || "Impossible de suivre cette ligue.",
      confirmText: "Compris"
    });
  });
}

function randomInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function showMultiplayerError(error) {
  console.error(error);
  showFantasyModal({
    title: "Opération impossible",
    message: error?.message || "Une erreur est survenue.",
    confirmText: "Compris"
  });
}

async function createRemoteLeague(name, capacity, rounds, pseudo) {
  const user = await window.firebaseReady;
  currentUser = user;
  const f = firebaseTools();
  let code = randomInviteCode();
  let ref = f.doc(window.firebaseDB, "leagues", code);
  let existing = await f.getDoc(ref);
  while (existing.exists()) {
    code = randomInviteCode();
    ref = f.doc(window.firebaseDB, "leagues", code);
    existing = await f.getDoc(ref);
  }
  await f.setDoc(ref, {
    name,
    owner: user.uid,
    status: "waiting",
    members: { [user.uid]: pseudo },
    capacity,
    rounds,
    picks: [],
    pickedIds: [],
    draftOrder: [],
    createdAt: new Date().toISOString()
  });
  await attachLeague(code);
}

async function joinRemoteLeague(code, pseudo) {
  const user = await window.firebaseReady;
  currentUser = user;
  const f = firebaseTools();
  const ref = f.doc(window.firebaseDB, "leagues", code.toUpperCase());
  await f.runTransaction(window.firebaseDB, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error("Code de ligue introuvable.");
    const data = snap.data();
    if (data.status !== "waiting") throw new Error("Cette draft a déjà commencé.");
    if (data.members[user.uid]) throw new Error("Tu fais déjà partie de cette ligue.");
    if (Object.keys(data.members || {}).length >= data.capacity) {
      throw new Error("Cette ligue est complète.");
    }
    transaction.update(ref, { members: { ...data.members, [user.uid]: pseudo } });
  });
  await attachLeague(code.toUpperCase());
}

async function startRemoteDraft() {
  if (!leagueDocRef || !leagueRaw || leagueRaw.owner !== currentUser?.uid) return;
  const ids = Object.keys(leagueRaw.members || {});
  if (ids.length !== Number(leagueRaw.capacity)) {
    throw new Error("Il faut que tous les managers aient rejoint la ligue.");
  }
  const order = [];
  for (let round = 0; round < Number(leagueRaw.rounds); round++) {
    const sequence = round % 2 === 0 ? ids : [...ids].reverse();
    order.push(...sequence);
  }
  await firebaseTools().updateDoc(leagueDocRef, {
    status: "draft",
    draftOrder: order
  });
}

function setupMultiplayerUI() {
  // Ajoute le format Duel 1 contre 1 au sélecteur, sans modifier fantasy.html.
  const managerSelect = $("manager-count");
  if (managerSelect && !Array.from(managerSelect.options).some(option => Number(option.value) === 2)) {
    const duelOption = document.createElement("option");
    duelOption.value = "2";
    duelOption.textContent = "2 managers · Duel";
    managerSelect.insertBefore(duelOption, managerSelect.options[0] || null);
  }

  const creation = $("creation");
  if (!creation || $("multiplayer-entry")) return;

  // Le pseudo du créateur est placé dans le formulaire de création,
  // indépendamment du pseudo utilisé pour rejoindre une autre ligue.
  const form = $("league-form");
  if (form && !$("create-manager-pseudo")) {
    const createField = make("div", "fantasy-form-field");
    const createLabel = make("label", "", "Ton pseudo de manager");
    createLabel.htmlFor = "create-manager-pseudo";
    createPseudoInput = make("input");
    createPseudoInput.id = "create-manager-pseudo";
    createPseudoInput.placeholder = "Ex : VikingsFan24";
    createPseudoInput.maxLength = 24;
    createPseudoInput.required = true;
    createField.append(createLabel, createPseudoInput);
    const submit = form.querySelector('button[type="submit"]');
    if (submit) form.insertBefore(createField, submit);
    else form.append(createField);
  }

  const area = make("div", "fantasy-multiplayer-entry");
  area.id = "multiplayer-entry";
  area.append(make("h3", "", "Rejoindre une ligue existante"));

  pseudoInput = make("input");
  pseudoInput.id = "manager-pseudo";
  pseudoInput.placeholder = "Ton pseudo";
  pseudoInput.maxLength = 24;
  pseudoInput.required = true;

  joinCodeInput = make("input");
  joinCodeInput.id = "join-league-code";
  joinCodeInput.placeholder = "Code d'invitation";
  joinCodeInput.maxLength = 6;
  joinCodeInput.autocomplete = "off";

  const joinButton = make("button", "", "Rejoindre la ligue");
  joinButton.type = "button";
  joinButton.addEventListener("click", async () => {
    const pseudo = pseudoInput.value.trim();
    const code = joinCodeInput.value.trim().toUpperCase();
    if (pseudo.length < 2 || pseudo.length > 24) {
      showMultiplayerError(new Error("Ton pseudo doit contenir entre 2 et 24 caractères."));
      return;
    }
    if (!/^[A-Z2-9]{6}$/.test(code)) {
      showMultiplayerError(new Error("Le code doit contenir 6 caractères."));
      return;
    }
    try {
      joinButton.disabled = true;
      await joinRemoteLeague(code, pseudo);
    } catch (error) {
      showMultiplayerError(error);
    } finally {
      joinButton.disabled = false;
    }
  });

  area.append(pseudoInput, joinCodeInput, joinButton);
  creation.append(area);
}

function renderMultiplayerControls() {
  if (!league || !leagueRaw) return;
  const toolbar = $("vue-ensemble");
  if (!toolbar) return;

  let panel = $("multiplayer-controls");
  if (!panel) {
    panel = make("div", "fantasy-multiplayer-controls");
    panel.id = "multiplayer-controls";
    toolbar.after(panel);
  }
  panel.replaceChildren();

  const memberIds = Object.keys(leagueRaw.members || {});
  const count = make("p", "", `Managers : ${memberIds.length}/${leagueRaw.capacity}`);
  const codeLine = make("p", "", `Code d'invitation : ${league.inviteCode}`);
  const copy = make("button", "secondary", "Copier le code");
  copy.type = "button";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(league.inviteCode);
      copy.textContent = "Code copié !";
    } catch {
      showMultiplayerError(new Error("Copie impossible : sélectionne le code pour le copier."));
    }
  });
  panel.append(count, codeLine, copy);

  const members = make("div", "fantasy-manager-list");
  memberIds.forEach((uid, index) => {
    members.append(make("p", "", `${index + 1}. ${leagueRaw.members[uid]}${uid === leagueRaw.owner ? " · Créateur" : ""}`));
  });
  panel.append(members);

  if (leagueRaw.status === "waiting") {
    panel.append(make("p", "fantasy-hint", "En attente des autres managers…"));
    if (leagueRaw.owner === currentUser?.uid) {
      const start = make("button", "", "Démarrer la draft");
      start.type = "button";
      start.disabled = memberIds.length !== Number(leagueRaw.capacity);
      start.addEventListener("click", async () => {
        try { start.disabled = true; await startRemoteDraft(); }
        catch (error) { showMultiplayerError(error); start.disabled = false; }
      });
      panel.append(start);
    }
  } else {
    panel.append(make("p", "fantasy-hint", leagueRaw.status === "draft" ? "La draft est en cours." : "Ligue terminée."));
  }
}

function make(tag, className = "", content) {
  const element = document.createElement(tag);
  element.className = className;

  if (content !== undefined) {
    element.textContent = content;
  }

  return element;
}

function normalizeTeam(team) {
  const aliases = {
    JAC: "JAX",
    LA: "LAR",
    WSH: "WAS",
    OAK: "LV",
    SD: "LAC",
    STL: "LAR"
  };

  return aliases[team] || team;
}

function getTeamLogo(team) {
  const codes = {
    WAS: "wsh",
    JAX: "jax",
    LAR: "lar"
  };

  const code = codes[team] || team.toLowerCase();

  return `https://a.espncdn.com/i/teamlogos/nfl/500/${code}.png`;
}

function getPlayerPhoto(id) {
  return `https://sleepercdn.com/content/nfl/players/thumb/${id}.jpg`;
}

function createPlayerImages(player) {
  const container = make("div", "fantasy-player-images");

  const photo = make("img", "fantasy-player-photo");
  photo.src = player.photo || getTeamLogo(player.team);
  photo.alt = player.name;
  photo.loading = "lazy";

  photo.onerror = () => {
    photo.onerror = null;
    photo.src = getTeamLogo(player.team);
  };

  const logo = make("img", "fantasy-team-logo");
  logo.src = getTeamLogo(player.team);
  logo.alt = TEAMS[player.team] || player.team;
  logo.loading = "lazy";

  container.append(photo, logo);

  return container;
}

function normalizePlayers(data) {
  const result = [];

  for (const [id, raw] of Object.entries(data)) {
    const team = normalizeTeam(raw.team);
    const position = raw.position;
    const fantasyPositions = raw.fantasy_positions || [];

    if (
      raw.active !== true ||
      !TEAMS[team] ||
      !["QB", "RB", "WR", "TE", "K"].includes(position) ||
      !fantasyPositions.includes(position)
    ) {
      continue;
    }

    const name =
      raw.full_name ||
      `${raw.first_name || ""} ${raw.last_name || ""}`.trim();

    if (!name) continue;

    const playerId = String(raw.player_id || id);

    result.push({
      id: playerId,
      name,
      position,
      team,
      rank: Number(raw.search_rank) || 999999,
      injury: raw.injury_status || null,
      projection: null,
      photo: getPlayerPhoto(playerId)
    });
  }

  for (const [team, name] of Object.entries(TEAMS)) {
    result.push({
      id: `DEF-${team}`,
      name,
      position: "DEF",
      team,
      rank: 999999,
      injury: null,
      projection: null,
      photo: getTeamLogo(team)
    });
  }

  return result.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.name.localeCompare(b.name)
  );
}

const playerMap = new Map();

function setPlayers(players) {
  PLAYERS = players;
  playerMap.clear();

  PLAYERS.forEach(player => {
    playerMap.set(player.id, player);
  });
}

function getPlayer(id) {
  return playerMap.get(String(id));
}

async function loadPlayers() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));

    if (
      cached &&
      Date.now() - cached.date < CACHE_DURATION &&
      Array.isArray(cached.players) &&
      cached.players.length
    ) {
      setPlayers(cached.players);
      render();
      return;
    }
  } catch {}

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Catalogue NFL indisponible");
    }

    const data = await response.json();
    const players = normalizePlayers(data);

    if (!players.length) {
      throw new Error("Aucun joueur récupéré");
    }

    setPlayers(players);

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          date: Date.now(),
          players
        })
      );
    } catch {
      console.warn("Cache des joueurs trop volumineux.");
    }

    render();
  } catch (error) {
    console.error(error);

    if (league) {
      $("player-list").textContent =
        "Impossible de charger les joueurs NFL.";
    }
  }
}

function pickManager(index) {
  const round = Math.floor(index / league.managers.length);
  const slot = index % league.managers.length;

  return round % 2 === 0
    ? slot
    : league.managers.length - 1 - slot;
}

function setupTeamFilter() {
  if ($("nfl-team-filter")) return;

  const select = make("select");
  select.id = "nfl-team-filter";

  const all = make("option", "", "Toutes les équipes");
  all.value = "ALL";
  select.append(all);

  Object.entries(TEAMS).forEach(([code, name]) => {
    const option = make("option", "", name);
    option.value = code;
    select.append(option);
  });

  select.addEventListener("change", () => {
    selectedTeam = select.value;
    renderPlayers();
  });

  $("position-filter").parentElement.append(select);
}

function render() {
  $("creation").hidden = Boolean(league);
  $("dashboard").hidden = !league;

  if (!league) return;

  setupTeamFilter();

  const total = league.managers.length * league.rounds;
  const done = league.picks.length;
  const finished = done >= total;
  const current = finished ? null : pickManager(done);
  const waiting = leagueRaw?.status === "waiting";

  $("league-title").textContent = league.name;
  $("pick-count").textContent = `${done} / ${total}`;

  $("round-number").textContent = finished
    ? "Terminée"
    : `${Math.floor(done / league.managers.length) + 1} / ${league.rounds}`;

  $("current-manager").textContent = waiting || finished
    ? "—"
    : managerName(leagueRaw.draftOrder[done]);

  const currentTurnUid = leagueRaw?.draftOrder?.[done];
  $("draft-status").textContent = waiting
    ? "En attente des managers et du lancement de la draft."
    : finished
      ? "Draft terminée !"
      : currentTurnUid === currentUser?.uid
        ? "C'est ton tour ! Choisis ton joueur."
        : `Au tour de ${managerName(currentTurnUid)} de choisir un joueur.`;

  const teamSelect = $("team-select");
  const previous = teamSelect.value || "0";

  teamSelect.replaceChildren(
    ...league.managers.map((name, index) => {
      const option = make("option", "", name);
      option.value = String(index);
      return option;
    })
  );

  teamSelect.value = previous;

  const progress = $("draft-progress-fill");

  if (progress) {
    progress.style.width = `${(done / total) * 100}%`;
  }

  renderPlayers();
  renderRoster();
  renderHistory();
  renderMatchups();
}

function renderPlayers() {
  if (!league) return;

  const root = $("player-list");
  root.replaceChildren();

  if (!PLAYERS.length) {
    root.append(
      make("p", "empty-state", "Chargement des joueurs NFL...")
    );
    return;
  }

  const used = new Set(
    league.picks.map(pick => String(pick.playerId))
  );

  const query = $("player-search").value
    .trim()
    .toLocaleLowerCase("fr");

  const position = $("position-filter").value;

  const available = PLAYERS.filter(player => {
    if (used.has(player.id)) return false;

    if (position !== "ALL" && player.position !== position) {
      return false;
    }

    if (selectedTeam !== "ALL" && player.team !== selectedTeam) {
      return false;
    }

    const searchText =
      `${player.name} ${player.team} ${TEAMS[player.team]}`
        .toLocaleLowerCase("fr");

    return !query || searchText.includes(query);
  });

  available.sort((a, b) =>
    (b.projection ?? -1) - (a.projection ?? -1) ||
    a.rank - b.rank
  );

  root.append(
    make(
      "p",
      "fantasy-player-count",
      `${available.length} joueurs disponibles`
    )
  );

  if (!available.length) {
    root.append(make("p", "empty-state", "Aucun joueur trouvé."));
    return;
  }

  const finished =
    league.picks.length >=
    league.managers.length * league.rounds ||
    leagueRaw?.status !== "draft";

  const currentTurnUid = leagueRaw?.draftOrder?.[league.picks.length] || null;
  const isMyTurn = Boolean(currentUser?.uid && currentTurnUid === currentUser.uid);

  let shown = 0;
  const pageSize = 60;

  function showNextPage() {
    const previousButton = $("load-more-players");

    if (previousButton) previousButton.remove();

    const fragment = document.createDocumentFragment();
    const next = available.slice(shown, shown + pageSize);

    next.forEach(player => {
      const row = make("div", "player-row");
      const images = createPlayerImages(player);

      const info = make("div", "player-info");

      info.append(
        make("strong", "", player.name),
        make(
          "small",
          "",
          `${player.position} · ${TEAMS[player.team]}`
        )
      );

      if (player.injury) {
        info.append(
          make("small", "fantasy-injury", player.injury)
        );
      }

      const projection = make("div", "fantasy-projection");

      projection.append(
        make(
          "strong",
          "",
          typeof player.projection === "number"
            ? player.projection.toFixed(1)
            : "—"
        ),
        make("small", "", "PTS PROJ.")
      );

      const button = make("button", "", "Choisir");
      button.type = "button";
      button.disabled = finished || modalOpen || !isMyTurn;
      if (!finished && !isMyTurn) {
        button.title = "Attends ton tour pour sélectionner un joueur";
      }

      button.addEventListener("click", () => {
        draft(player.id);
      });

      row.append(images, info, projection, button);
      fragment.append(row);
    });

    root.append(fragment);
    shown += next.length;

    if (shown < available.length) {
      const more = make(
        "button",
        "",
        `Voir plus (${shown}/${available.length})`
      );

      more.id = "load-more-players";
      more.type = "button";
      more.addEventListener("click", showNextPage);
      root.append(more);
    }
  }

  showNextPage();
}

function showFantasyModal({
  title,
  message = "",
  player = null,
  confirmText = "Confirmer",
  danger = false
}) {
  return new Promise(resolve => {
    if (modalOpen) {
      resolve(false);
      return;
    }

    modalOpen = true;

    const overlay = make("div", "fantasy-modal-overlay");
    const modal = make("div", "fantasy-modal");
    const heading = make("h2", "", title);

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", title);

    const closeButton = make("button", "fantasy-modal-close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Fermer");

    modal.append(closeButton, heading);

    if (player) {
      const playerBox = make("div", "fantasy-modal-player");
      const info = make("div", "fantasy-modal-info");

      info.append(
        make("h3", "", player.name),
        make(
          "p",
          "",
          `${player.position} · ${TEAMS[player.team]}`
        )
      );

      if (typeof player.projection === "number") {
        info.append(
          make(
            "p",
            "fantasy-modal-points",
            `${player.projection.toFixed(1)} points PPR projetés`
          )
        );
      }

      playerBox.append(createPlayerImages(player), info);
      modal.append(playerBox);
    }

    if (message) {
      modal.append(
        make("p", "fantasy-modal-message", message)
      );
    }

    const actions = make("div", "fantasy-modal-actions");

    const cancel = make(
      "button",
      "fantasy-modal-cancel",
      "Annuler"
    );

    const confirm = make(
      "button",
      danger
        ? "fantasy-modal-confirm fantasy-modal-danger"
        : "fantasy-modal-confirm",
      confirmText
    );

    cancel.type = "button";
    confirm.type = "button";

    actions.append(cancel, confirm);
    modal.append(actions);
    overlay.append(modal);

    const previousFocus = document.activeElement;

    function close(result) {
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
      modalOpen = false;

      if (previousFocus && previousFocus.isConnected) {
        previousFocus.focus();
      }

      resolve(result);
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        close(false);
      }

      if (event.key === "Tab") {
        const focusable = [
          closeButton,
          cancel,
          confirm
        ];

        const index = focusable.indexOf(document.activeElement);

        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          confirm.focus();
        } else if (!event.shiftKey && index === 2) {
          event.preventDefault();
          closeButton.focus();
        }
      }
    }

    closeButton.addEventListener("click", () => close(false));
    cancel.addEventListener("click", () => close(false));
    confirm.addEventListener("click", () => close(true));

    overlay.addEventListener("click", event => {
      if (event.target === overlay) close(false);
    });

    document.addEventListener("keydown", onKeydown);
    document.body.append(overlay);
    cancel.focus();
  });
}

async function draft(playerId) {
  if (!league || !PLAYERS.length || modalOpen || !leagueRaw || !leagueDocRef) return;
  if (leagueRaw.status !== "draft") return;

  const user = await window.firebaseReady;
  const index = leagueRaw.picks.length;
  if (leagueRaw.draftOrder[index] !== user.uid) {
    showMultiplayerError(new Error("Ce n'est pas encore ton tour."));
    return;
  }

  const player = getPlayer(playerId);
  if (!player || leagueRaw.pickedIds.includes(String(playerId))) return;

  const confirmed = await showFantasyModal({
    title: "Confirmer votre sélection",
    message: `Tour ${Math.floor(index / league.managers.length) + 1}`,
    player,
    confirmText: "Choisir ce joueur"
  });
  if (!confirmed) return;

  try {
    const f = firebaseTools();
    await f.runTransaction(window.firebaseDB, async transaction => {
      const snap = await transaction.get(leagueDocRef);
      if (!snap.exists()) throw new Error("La ligue n'existe plus.");
      const data = snap.data();
      const pickIndex = data.picks.length;
      if (data.status !== "draft") throw new Error("La draft n'est pas active.");
      if (data.draftOrder[pickIndex] !== user.uid) throw new Error("Le tour a déjà changé.");
      if (data.pickedIds.includes(String(player.id))) throw new Error("Ce joueur vient d'être sélectionné.");
      const pick = {
        uid: user.uid,
        playerId: String(player.id),
        name: player.name,
        position: player.position,
        team: player.team
      };
      transaction.update(leagueDocRef, {
        picks: [...data.picks, pick],
        pickedIds: [...data.pickedIds, String(player.id)]
      });
    });
  } catch (error) {
    showMultiplayerError(error);
  }
}

function renderRoster() {
  if (!league) return;

  const index = Number($("team-select").value || 0);
  const root = $("team-roster");
  root.replaceChildren();

  const picks = league.picks.filter(
    pick => pick.manager === index
  );

  if (!picks.length) {
    root.append(
      make("p", "empty-state", "Aucun joueur sélectionné.")
    );
    return;
  }

  picks.forEach(pick => {
    const player = getPlayer(pick.playerId);
    const row = make("div", "roster-row");

    if (!player) {
      row.append(make("strong", "", "Joueur introuvable"));
      root.append(row);
      return;
    }

    const info = make("div", "player-info");

    info.append(
      make("strong", "", player.name),
      make(
        "small",
        "",
        `${player.position} · ${TEAMS[player.team]}`
      )
    );

    row.append(createPlayerImages(player), info);
    root.append(row);
  });
}

function renderHistory() {
  if (!league) return;

  const root = $("draft-history");
  root.replaceChildren();

  if (!league.picks.length) {
    root.append(
      make("p", "empty-state", "La draft n'a pas commencé.")
    );
    return;
  }

  league.picks
    .map((pick, index) => ({ pick, index }))
    .slice(-8)
    .reverse()
    .forEach(({ pick, index }) => {
      const player = getPlayer(pick.playerId);

      root.append(
        make(
          "div",
          "history-row",
          `Choix #${index + 1} · ` +
          `${league.managers[pick.manager]} — ` +
          `${player ? player.name : "Joueur introuvable"}`
        )
      );
    });
}

function renderMatchups() {
  if (!league) return;

  const root = $("matchups");
  root.replaceChildren();

  for (let i = 0; i < league.managers.length; i += 2) {
    const item = make("div", "matchup");

    item.append(
      make(
        "strong",
        "",
        `${league.managers[i]} VS ${league.managers[i + 1]}`
      ),
      make("span", "", "Score à venir")
    );

    root.append(item);
  }
}

async function loadProjections() {
  if (!PLAYERS.length) return;

  try {
    const stateResponse = await fetch(NFL_STATE_URL);

    if (!stateResponse.ok) {
      throw new Error("Semaine NFL indisponible");
    }

    const state = await stateResponse.json();
    const season = Number(state.season);
    const week = Number(state.week);

    if (
      state.season_type !== "regular" ||
      !Number.isInteger(season) ||
      !Number.isInteger(week) ||
      week < 1 ||
      week > 18
    ) {
      currentNFLWeek = null;

      PLAYERS.forEach(player => {
        player.projection = null;
      });

      if (league) renderPlayers();
      return;
    }

    currentNFLWeek = { season, week };

    const cacheKey =
      `${PROJECTION_CACHE_PREFIX}${season}-${week}`;

    let data = null;

    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey));

      if (
        cached &&
        Date.now() - cached.date < PROJECTION_CACHE_DURATION &&
        Array.isArray(cached.data)
      ) {
        data = cached.data;
      }
    } catch {}

    if (!data) {
      const url =
        `https://api.sleeper.app/projections/nfl/${season}/${week}` +
        "?season_type=regular";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Projections indisponibles");
      }

      data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Format des projections incorrect");
      }

      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            date: Date.now(),
            data
          })
        );
      } catch {}
    }

    const projections = new Map();

    data.forEach(item => {
      const id = String(item.player_id || "");
      const value = item.stats?.pts_ppr;

      if (
        id &&
        value != null &&
        Number.isFinite(Number(value))
      ) {
        projections.set(id, Number(value));
      }
    });

    PLAYERS.forEach(player => {
      const points =
        projections.get(player.id) ??
        (player.position === "DEF"
          ? projections.get(player.team)
          : undefined);

      player.projection =
        points === undefined ? null : points;
    });

    if (league) {
      renderPlayers();
      renderRoster();
    }

    console.log(
      `NFL ${season} · Week ${week} · ` +
      `${projections.size} projections récupérées`
    );

  } catch (error) {
    console.warn("Projections NFL :", error);

    PLAYERS.forEach(player => {
      player.projection = null;
    });

    if (league) renderPlayers();
  }
}

$("league-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (!PLAYERS.length) {
    showFantasyModal({ title: "Chargement en cours", message: "Attends que les joueurs NFL soient chargés.", confirmText: "Compris" });
    return;
  }
  const name = $("league-name").value.trim();
  const count = Number($("manager-count").value);
  const rounds = Number($("round-count").value);
  const pseudo = $("create-manager-pseudo")?.value.trim();
  if (!name) return;
  if (!pseudo || pseudo.length < 2 || pseudo.length > 24) {
    showMultiplayerError(new Error("Renseigne ton pseudo de manager (2 à 24 caractères)."));
    return;
  }
  if (count * rounds > PLAYERS.length) {
    showMultiplayerError(new Error("Pas assez de joueurs disponibles pour cette draft."));
    return;
  }
  const button = $("league-form").querySelector('button[type="submit"]');
  try {
    button.disabled = true;
    await createRemoteLeague(name, count, rounds, pseudo);
  } catch (error) {
    showMultiplayerError(error);
  } finally {
    button.disabled = false;
  }
});

$("reset-league").addEventListener("click", async () => {
  if (!league || modalOpen) return;
  const confirmed = await showFantasyModal({
    title: "Quitter cette ligue ?",
    message: "La ligue restera disponible pour les autres managers. Tu pourras la rejoindre à nouveau avec son code.",
    confirmText: "Quitter"
  });
  if (!confirmed) return;
  stopLeagueListener();
  league = null;
  render();
});

$("player-search").addEventListener("input", renderPlayers);

$("position-filter").addEventListener(
  "change",
  renderPlayers
);

$("team-select").addEventListener(
  "change",
  renderRoster
);

setupMultiplayerUI();

window.firebaseReady.then(user => {
  currentUser = user;
  console.log("Fantasy prête pour", user.uid);
}).catch(error => {
  console.error("Connexion Firebase impossible :", error);
});

render();

loadPlayers().then(() => {
  if (PLAYERS.length) loadProjections();
});

setInterval(() => {
  if (PLAYERS.length) loadProjections();
}, 60 * 60 * 1000);


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

try {
  league = JSON.parse(localStorage.getItem(LEAGUE_KEY));
} catch {
  league = null;
}

function save() {
  localStorage.setItem(LEAGUE_KEY, JSON.stringify(league));
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

  $("league-title").textContent = league.name;
  $("pick-count").textContent = `${done} / ${total}`;

  $("round-number").textContent = finished
    ? "Terminée"
    : `${Math.floor(done / league.managers.length) + 1} / ${league.rounds}`;

  $("current-manager").textContent = finished
    ? "—"
    : league.managers[current];

  $("draft-status").textContent = finished
    ? "Draft terminée !"
    : `Au tour de ${league.managers[current]} de choisir un joueur.`;

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
    league.managers.length * league.rounds;

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
      button.disabled = finished || modalOpen;

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
  if (!league || !PLAYERS.length || modalOpen) return;

  const originalLeague = league;
  const pickIndex = league.picks.length;
  const total = league.managers.length * league.rounds;

  if (pickIndex >= total) return;

  if (
    league.picks.some(
      pick => String(pick.playerId) === String(playerId)
    )
  ) return;

  const player = getPlayer(playerId);
  if (!player) return;

  const manager = pickManager(pickIndex);

  const confirmed = await showFantasyModal({
    title: "Confirmer votre sélection",
    message:
      `${league.managers[manager]} · ` +
      `Tour ${Math.floor(pickIndex / league.managers.length) + 1}`,
    player,
    confirmText: "Choisir ce joueur"
  });

  if (!confirmed) return;

  if (
    league !== originalLeague ||
    league.picks.length !== pickIndex ||
    league.picks.some(
      pick => String(pick.playerId) === String(playerId)
    )
  ) return;

  league.picks.push({
    manager,
    playerId: player.id
  });

  save();
  render();
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

$("league-form").addEventListener("submit", event => {
  event.preventDefault();

  if (!PLAYERS.length) {
    showFantasyModal({
      title: "Chargement en cours",
      message: "Attends que les joueurs NFL soient chargés.",
      confirmText: "Compris"
    });
    return;
  }

  const name = $("league-name").value.trim();
  const count = Number($("manager-count").value);
  const rounds = Number($("round-count").value);

  if (!name) return;

  if (count * rounds > PLAYERS.length) {
    showFantasyModal({
      title: "Pas assez de joueurs",
      message: "Choisis moins de managers ou de tours.",
      confirmText: "Compris"
    });
    return;
  }

  league = {
    name,
    rounds,
    managers: Array.from(
      { length: count },
      (_, index) => `Manager ${index + 1}`
    ),
    picks: []
  };

  save();
  render();
});

$("reset-league").addEventListener("click", async () => {
  if (!league || modalOpen) return;

  const confirmed = await showFantasyModal({
    title: "Supprimer la ligue ?",
    message:
      "Tous les choix de draft et les effectifs " +
      "de cette ligue seront supprimés.",
    confirmText: "Supprimer",
    danger: true
  });

  if (!confirmed) return;

  localStorage.removeItem(LEAGUE_KEY);
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

render();

loadPlayers().then(() => {
  if (PLAYERS.length) loadProjections();
});

setInterval(() => {
  if (PLAYERS.length) loadProjections();
}, 60 * 60 * 1000);

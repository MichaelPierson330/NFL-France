
/* NFL France — Résultats et classements 2026 */
const SAISON = 2026;
const API = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

const $ = id => document.getElementById(id);
const texte = value => String(value ?? "");
const echapper = value => texte(value).replace(
  /[&<>"']/g,
  c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c])
);

const nombre = value =>
  value === undefined || value === null ? "—" : texte(value);

const equipeNom = team =>
  team?.displayName || team?.name || "Équipe";

const logo = team =>
  team?.logo || team?.logos?.[0]?.href || "";

const logoHTML = team =>
  logo(team)
    ? `<img src="${echapper(logo(team))}" alt="" loading="lazy">`
    : "";

const statut = event =>
  event?.status?.type?.shortDetail ||
  event?.status?.type?.description ||
  "Match";

const dateFR = iso =>
  iso
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(iso))
    : "";

async function charger(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erreur réseau");
  }

  return response.json();
}

/* ONGLET RÉSULTATS / CLASSEMENTS */

function onglet(nom) {
  $("section-resultats").hidden = nom !== "resultats";
  $("section-classements").hidden = nom !== "classements";

  $("onglet-resultats").classList.toggle(
    "actif", nom === "resultats"
  );

  $("onglet-classements").classList.toggle(
    "actif", nom === "classements"
  );

  if (
    nom === "classements" &&
    !$("tableaux-classements").dataset.loaded
  ) {
    afficherClassements();
  }
}

$("onglet-resultats").addEventListener(
  "click", () => onglet("resultats")
);

$("onglet-classements").addEventListener(
  "click", () => onglet("classements")
);

/* CHOIX DES SEMAINES */

for (let n = 1; n <= 18; n++) {
  const option = document.createElement("option");
  option.value = n;
  option.textContent = `Week ${n}`;
  $("semaine").append(option);
}

$("semaine").value = "10";

$("semaine").addEventListener("change", afficherMatchs);
$("conference").addEventListener("change", afficherClassements);
$("division").addEventListener("change", afficherClassements);

/* RÉSULTATS DES MATCHS */

async function afficherMatchs() {
  const week = $("semaine").value;

  $("message-resultats").textContent =
    `Chargement des matchs de la Week ${week}…`;

  $("liste-matchs").replaceChildren();
  $("details-match").hidden = true;

  try {
    const data = await charger(
      `${API}/scoreboard?dates=${SAISON}&seasontype=2&week=${week}&limit=50`
    );

    const events = data.events || [];

    $("message-resultats").textContent = events.length
      ? `${events.length} match(s) — Week ${week}`
      : "Aucun match trouvé pour cette semaine.";

    events.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    for (const event of events) {
      const competitors =
        event.competitions?.[0]?.competitors || [];

      const away =
        competitors.find(x => x.homeAway === "away") ||
        competitors[0];

      const home =
        competitors.find(x => x.homeAway === "home") ||
        competitors[1];

      if (!away || !home) continue;

      const score = c =>
        event.status?.type?.completed ||
        event.status?.type?.state === "in"
          ? nombre(c.score)
          : "–";

      const card = document.createElement("button");
      card.type = "button";
      card.className = "carte-match";

      card.innerHTML = `
        <small>
          ${echapper(dateFR(event.date))}
          · ${echapper(statut(event))}
        </small>

        <div class="equipes-match">
          <span class="equipe-match">
            ${logoHTML(away.team)}
            <span>
              ${echapper(
                away.team?.shortDisplayName ||
                equipeNom(away.team)
              )}
            </span>
          </span>

          <span class="score-match">
            ${echapper(score(away))}
            -
            ${echapper(score(home))}
          </span>

          <span class="equipe-match">
            <span>
              ${echapper(
                home.team?.shortDisplayName ||
                equipeNom(home.team)
              )}
            </span>
            ${logoHTML(home.team)}
          </span>
        </div>

        <small>Voir les statistiques du match</small>
      `;

      card.addEventListener(
        "click",
        () => afficherDetails(event.id)
      );

      $("liste-matchs").append(card);
    }
  } catch (error) {
    $("message-resultats").textContent =
      "Impossible de charger les résultats. Vérifie ta connexion ou réessaie plus tard.";
    console.error(error);
  }
}

/* TABLEAUX DES STATISTIQUES */

function tableau(headers, rows) {
  if (!rows.length) {
    return "<p>Aucune statistique disponible.</p>";
  }

  return `
    <div class="tableau-scroll">
      <table class="tableau-nfl">
        <thead>
          <tr>
            ${headers.map(h =>
              `<th>${echapper(h)}</th>`
            ).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell =>
                `<td>${echapper(cell)}</td>`
              ).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* DÉTAILS D'UN MATCH */

async function afficherDetails(id) {
  const target = $("details-match");

  target.hidden = false;
  target.innerHTML =
    "<p>Chargement des statistiques du match…</p>";

  target.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  try {
    const data = await charger(
      `${API}/summary?event=${encodeURIComponent(id)}`
    );

    const header = data.header?.competitions?.[0];
    const comps = header?.competitors || [];

    const away =
      comps.find(x => x.homeAway === "away") || comps[0];

    const home =
      comps.find(x => x.homeAway === "home") || comps[1];

    let html = `
      <h2>
        ${echapper(equipeNom(away?.team))}
        ${echapper(nombre(away?.score))}
        –
        ${echapper(nombre(home?.score))}
        ${echapper(equipeNom(home?.team))}
      </h2>
    `;

    const teamStats = data.boxscore?.teams || [];

    if (teamStats.length) {
      html += "<h3>Statistiques des équipes</h3>";

      const keys = [
        ...new Set(
          teamStats.flatMap(t =>
            (t.statistics || []).map(s => s.name)
          )
        )
      ];

      const labels = new Map(
        teamStats.flatMap(t =>
          (t.statistics || []).map(s => [
            s.name,
            s.label || s.name
          ])
        )
      );

      html += tableau(
        [
          "Statistique",
          ...teamStats.map(t => equipeNom(t.team))
        ],
        keys.map(k => [
          labels.get(k),
          ...teamStats.map(t =>
            t.statistics?.find(s => s.name === k)
              ?.displayValue ?? "—"
          )
        ])
      );
    }

    /* STATISTIQUES DES JOUEURS */

    const players = data.boxscore?.players || [];

    const nomsCategories = {
      passing: "Passes",
      rushing: "Courses",
      receiving: "Réceptions",
      defensive: "Défense",
      kicking: "Coups de pied",
      punting: "Dégagements",
      interceptions: "Interceptions"
    };

    for (const team of players) {
      html += `
        <h3>
          ${echapper(equipeNom(team.team))}
          — joueurs
        </h3>
      `;

      for (const group of team.statistics || []) {
        const headers = group.labels || [];

        const rows = (group.athletes || []).map(a => [
          a.athlete?.displayName || "Joueur",
          ...(a.stats || [])
        ]);

        if (!rows.length) continue;

        html += `
          <div class="stats-bloc">
            <h4>
              ${echapper(
                nomsCategories[group.name] ||
                group.displayName ||
                group.name ||
                "Statistiques"
              )}
            </h4>
            ${tableau(["Joueur", ...headers], rows)}
          </div>
        `;
      }
    }

    /* ACTIONS QUI RAPPORTENT DES POINTS */

    const scoring = (data.scoringPlays || []).filter(
      p => p.scoringType || p.text
    );

    if (scoring.length) {
      html += "<h3>Actions qui ont rapporté des points</h3>";

      html += tableau(
        ["Période", "Temps", "Action"],
        scoring.map(p => [
          p.period?.number
            ? `Q${p.period.number}`
            : "—",
          p.clock?.displayValue || "—",
          p.text || "—"
        ])
      );
    }

    /* DÉROULEMENT DES POSSESSIONS */

    const drives = data.drives?.previous || [];

    if (drives.length) {
      html += "<h3>Déroulement des possessions</h3>";

      html += tableau(
        ["Équipe", "Résultat", "Résumé"],
        drives.map(d => [
          d.team?.displayName ||
            d.team?.abbreviation || "—",
          d.displayResult || d.result || "—",
          d.description ||
            d.shortDisplayResult || "—"
        ])
      );
    }

    if (
      !teamStats.length &&
      !players.length &&
      !scoring.length
    ) {
      html += `
        <p>
          Les statistiques détaillées ne sont
          pas encore disponibles pour ce match.
        </p>
      `;
    }

    target.innerHTML = html;
  } catch (error) {
    target.textContent =
      "Impossible de charger les statistiques de ce match pour le moment.";
    console.error(error);
  }
}

/* EXTRACTION DES CLASSEMENTS */

function extraireGroupes(node, results = []) {
  if (Array.isArray(node)) {
    node.forEach(n => extraireGroupes(n, results));
    return results;
  }

  if (!node || typeof node !== "object") {
    return results;
  }

  if (Array.isArray(node.standings?.entries)) {
    results.push({
      name: node.name || node.abbreviation || "",
      entries: node.standings.entries
    });
  }

  if (node.children) {
    extraireGroupes(node.children, results);
  }

  return results;
}

function valeurStat(entry, names) {
  const stats = entry.stats || [];

  const stat = stats.find(s =>
    names.includes(s.name) ||
    names.includes(s.abbreviation)
  );

  return stat?.displayValue ??
    (stat?.value === undefined
      ? "—"
      : texte(stat.value));
}

/* CLASSEMENTS AFC / NFC */

async function afficherClassements() {
  const conference = $("conference").value;
  const division = $("division").value;

  $("message-classements").textContent =
    "Chargement du classement…";

  $("tableaux-classements").replaceChildren();

  try {
    const data = await charger(
      `https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=${SAISON}&type=2`
    );

    const groups = extraireGroupes(data.children || data);

    const confGroup = groups.find(g =>
      g.name.toLowerCase().includes(conference)
    );

    const confNames = conference === "afc"
      ? ["afc", "american"]
      : ["nfc", "national"];

    const chosen = groups.filter(g => {
      const name = g.name.toLowerCase();

      const inConf =
        confNames.some(c => name.includes(c)) ||
        (
          confGroup &&
          confGroup.entries.some(e =>
            g.entries.some(
              x => x.team?.id === e.team?.id
            )
          )
        );

      return inConf && (
        division === "all"
          ? /east|north|south|west/i.test(g.name)
          : name.includes(division.toLowerCase())
      );
    });

    let displayGroups = chosen;

    if (
      !displayGroups.length &&
      confGroup &&
      division === "all"
    ) {
      displayGroups = [confGroup];
    }

    if (!displayGroups.length) {
      $("message-classements").textContent =
        "Classement indisponible pour ce filtre.";
      return;
    }

    $("message-classements").textContent =
      `Classement ${conference.toUpperCase()} — saison ${SAISON}`;

    for (const group of displayGroups) {
      const container = document.createElement("section");

      const heading = document.createElement("h2");
      heading.textContent = group.name;
      container.append(heading);

      const rows = [...group.entries].sort(
        (a, b) =>
          Number(valeurStat(b, ["winPercent", "PCT"])) -
          Number(valeurStat(a, ["winPercent", "PCT"]))
      );

      const div = document.createElement("div");
      div.className = "tableau-scroll";

      div.innerHTML = `
        <table class="tableau-nfl">
          <thead>
            <tr>
              <th>Équipe</th>
              <th>V</th>
              <th>D</th>
              <th>N</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(entry => `
              <tr>
                <td>
                  ${logoHTML(entry.team)}
                  ${echapper(equipeNom(entry.team))}
                </td>
                <td>
                  ${echapper(valeurStat(entry, ["wins", "W"]))}
                </td>
                <td>
                  ${echapper(valeurStat(entry, ["losses", "L"]))}
                </td>
                <td>
                  ${echapper(valeurStat(entry, ["ties", "T"]))}
                </td>
                <td>
                  ${echapper(valeurStat(entry, ["winPercent", "PCT"]))}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      container.append(div);
      $("tableaux-classements").append(container);
    }

    $("tableaux-classements").dataset.loaded = "1";

  } catch (error) {
    $("message-classements").textContent =
      "Impossible de charger les classements. La source de données peut être temporairement indisponible.";
    console.error(error);
  }
}

afficherMatchs();

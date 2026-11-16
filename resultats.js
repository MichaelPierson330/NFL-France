/* ==================================================
   NFL FRANCE — RÉSULTATS & CLASSEMENTS
   Saison 2026
   Source de données : ESPN (non officielle)
================================================== */

const SAISON = 2026;
const API = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

const $ = id => document.getElementById(id);

/* ==================================================
   OUTILS GÉNÉRAUX
================================================== */

function echapper(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function equipeNom(team) {
    return team?.displayName || team?.name || "Équipe";
}

function logo(team) {
    return team?.logo || team?.logos?.[0]?.href || "";
}

function logoHTML(team) {
    const url = logo(team);

    return url
        ? `<img src="${echapper(url)}" alt="" loading="lazy">`
        : "";
}

function dateFR(date) {
    if (!date) return "";

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(date));
}

async function charger(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erreur de chargement des données");
    }

    return response.json();
}

/* ==================================================
   TRADUCTION DES STATISTIQUES
================================================== */

const TRADUCTIONS_STATS = {

    // Premiers essais
    "1st downs": "Premiers essais",
    "first downs": "Premiers essais",
    "passing 1st downs": "Premiers essais à la passe",
    "rushing 1st downs": "Premiers essais à la course",
    "1st downs from penalties": "Premiers essais sur pénalité",

    // Tentatives
    "3rd down efficiency": "Réussite sur 3e tentative",
    "4th down efficiency": "Réussite sur 4e tentative",
    "third down efficiency": "Réussite sur 3e tentative",
    "fourth down efficiency": "Réussite sur 4e tentative",
    "3rd down": "Troisième tentative",
    "4th down": "Quatrième tentative",

    // Statistiques générales
    "total plays": "Nombre total de jeux",
    "plays": "Jeux offensifs",
    "total drives": "Séries offensives",
    "drives": "Séries offensives",
    "total yards": "Yards totaux",
    "yards per play": "Yards par jeu",
    "yards per pass": "Yards par passe",
    "yards per rush": "Yards par course",
    "yards per carry": "Yards par course",
    "net yards": "Yards nets",
    "passing": "Yards à la passe",
    "rushing": "Yards à la course",
    "receiving": "Yards en réception",
    "possession": "Temps de possession",
    "time of possession": "Temps de possession",
    "turnovers": "Pertes de balle",
    "total turnovers": "Pertes de balle totales",
    "points": "Points",
    "total points": "Points totaux",

    // Passe
    "comp/att": "Passes réussies / tentées",
    "cmp/att": "Passes réussies / tentées",
    "c/att": "Passes réussies / tentées",
    "completions/attempts": "Passes réussies / tentées",
    "completions": "Passes réussies",
    "passing completions": "Passes réussies",
    "attempts": "Tentatives de passe",
    "passing attempts": "Tentatives de passe",
    "passing yards": "Yards à la passe",
    "pass yards": "Yards à la passe",
    "pass yds": "Yards à la passe",
    "passing touchdowns": "Touchdowns à la passe",
    "passing td": "Touchdowns à la passe",
    "pass td": "Touchdowns à la passe",
    "interceptions thrown": "Interceptions lancées",
    "interceptions": "Interceptions",
    "sacks-yards lost": "Sacks concédés – yards perdus",
    "sacks - yards lost": "Sacks concédés – yards perdus",
    "sacks taken": "Sacks subis",
    "sack yards": "Yards perdus sur sacks",
    "passer rating": "Évaluation du passeur",
    "quarterback rating": "Évaluation du quarterback",
    "completion percentage": "Pourcentage de passes réussies",
    "longest pass": "Plus longue passe",
    "long pass": "Plus longue passe",

    // Course
    "rushing attempts": "Courses tentées",
    "rush attempts": "Courses tentées",
    "rushing yards": "Yards à la course",
    "rush yards": "Yards à la course",
    "rush yds": "Yards à la course",
    "rushing touchdowns": "Touchdowns à la course",
    "rushing td": "Touchdowns à la course",
    "rush td": "Touchdowns à la course",
    "yards per carry": "Yards par course",
    "longest rush": "Plus longue course",

    // Réception
    "receptions": "Réceptions",
    "receiving yards": "Yards en réception",
    "rec yards": "Yards en réception",
    "receiving touchdowns": "Touchdowns en réception",
    "receiving td": "Touchdowns en réception",
    "rec td": "Touchdowns en réception",
    "targets": "Cibles",
    "yards per reception": "Yards par réception",
    "longest reception": "Plus longue réception",

    // Défense
    "total tackles": "Plaquages totaux",
    "tackles": "Plaquages",
    "solo tackles": "Plaquages en solo",
    "assisted tackles": "Plaquages assistés",
    "tackles for loss": "Plaquages pour perte",
    "passes defended": "Passes défendues",
    "pass deflections": "Passes déviées",
    "forced fumbles": "Fumbles provoqués",
    "fumble recoveries": "Fumbles récupérés",
    "interception return yards": "Yards sur retour d'interception",
    "defensive touchdowns": "Touchdowns défensifs",

    // Fumbles
    "fumbles": "Fumbles",
    "fumbles lost": "Fumbles perdus",
    "lost fumbles": "Fumbles perdus",
    "fum lost": "Fumbles perdus",

    // Zone rouge
    "red zone": "Zone rouge",
    "red zone (made-att)": "Zone rouge (réussites / tentatives)",
    "red zone efficiency": "Réussite en zone rouge",
    "red zone attempts": "Tentatives en zone rouge",
    "red zone touchdowns": "Touchdowns en zone rouge",

    // Coups de pied
    "field goals": "Buts de placement",
    "field goals made": "Buts de placement réussis",
    "field goals attempted": "Buts de placement tentés",
    "extra points": "Transformations",
    "extra points made": "Transformations réussies",
    "punts": "Dégagements",
    "punt yards": "Yards sur dégagement",
    "punt average": "Moyenne des dégagements",
    "net punting average": "Moyenne nette des dégagements",
    "longest punt": "Plus long dégagement",
    "kick returns": "Retours de coups de pied",
    "kick return yards": "Yards sur retours de coups de pied",
    "punt returns": "Retours de dégagement",
    "punt return yards": "Yards sur retours de dégagement",

    // Équipes spéciales
    "defensive / special teams tds": "Touchdowns défensifs / équipes spéciales",
    "defensive/special teams tds": "Touchdowns défensifs / équipes spéciales",
    "special teams touchdowns": "Touchdowns des équipes spéciales",

    // Pénalités
    "penalties": "Pénalités",
    "penalty": "Pénalité",
    "penalty yards": "Yards de pénalité",
    "penalties-yards": "Pénalités – yards",

    // Divers
    "average": "Moyenne",
    "games played": "Matchs joués",
    "yards": "Yards",
    "touchdowns": "Touchdowns",
    "td": "Touchdowns",
    "yards per reception": "Yards par réception"
};

/* Traductions selon la catégorie du joueur */

const TRADUCTIONS_ABREVIATIONS = {
    passing: {
        "cmp": "Passes réussies",
        "comp": "Passes réussies",
        "att": "Passes tentées",
        "yds": "Yards à la passe",
        "td": "Touchdowns à la passe",
        "int": "Interceptions",
        "sack": "Sacks subis",
        "sacks": "Sacks subis",
        "lng": "Plus longue passe",
        "rtg": "Évaluation du passeur",
        "qbr": "Note QBR",
        "avg": "Moyenne"
    },

    rushing: {
        "car": "Courses",
        "att": "Courses tentées",
        "yds": "Yards à la course",
        "td": "Touchdowns à la course",
        "avg": "Yards par course",
        "lng": "Plus longue course",
        "fum": "Fumbles"
    },

    receiving: {
        "rec": "Réceptions",
        "tgt": "Cibles",
        "tgts": "Cibles",
        "yds": "Yards en réception",
        "td": "Touchdowns en réception",
        "avg": "Yards par réception",
        "lng": "Plus longue réception"
    },

    defensive: {
        "tot": "Plaquages totaux",
        "tkl": "Plaquages",
        "solo": "Plaquages en solo",
        "ast": "Plaquages assistés",
        "sck": "Sacks",
        "sacks": "Sacks",
        "tfl": "Plaquages pour perte",
        "pd": "Passes défendues",
        "ff": "Fumbles provoqués",
        "fr": "Fumbles récupérés",
        "int": "Interceptions",
        "yds": "Yards"
    },

    kicking: {
        "fg": "Buts de placement",
        "fgm": "Buts de placement réussis",
        "fga": "Buts de placement tentés",
        "xp": "Transformations",
        "xpm": "Transformations réussies",
        "xpa": "Transformations tentées",
        "yds": "Yards",
        "lng": "Plus longue distance",
        "pct": "Pourcentage de réussite"
    },

    punting: {
        "punts": "Dégagements",
        "yds": "Yards sur dégagement",
        "avg": "Moyenne",
        "lng": "Plus long dégagement"
    }
};

function traduireStat(label, categorie = "") {
    if (!label) return "Statistique";

    const cle = String(label)
        .trim()
        .toLowerCase()
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ");

    const abreviations = TRADUCTIONS_ABREVIATIONS[categorie];

    if (abreviations && abreviations[cle]) {
        return abreviations[cle];
    }

    return TRADUCTIONS_STATS[cle] || label;
}
/* ==================================================
   TRADUCTION DES DESCRIPTIONS DE MATCH
================================================== */

function traduireDescription(phrase) {
    if (!phrase) return "Description non disponible";

    const remplacements = [
        [/\bTouchdown\b/gi, "Touchdown"],
        [/\binterception\b/gi, "interception"],
        [/\bintercepted\b/gi, "interceptée"],
        [/\bsacked\b/gi, "plaqué derrière la ligne"],
        [/\bsack\b/gi, "sack"],
        [/\bfumble recovered\b/gi, "ballon récupéré après un fumble"],
        [/\bfumble\b/gi, "fumble"],
        [/\bfield goal\b/gi, "but de placement"],
        [/\bextra point\b/gi, "transformation"],
        [/\bkickoff\b/gi, "coup d'envoi"],
        [/\bpunt\b/gi, "dégagement"],
        [/\bpass complete\b/gi, "passe réussie"],
        [/\bpass incomplete\b/gi, "passe incomplète"],
        [/\bcomplete pass\b/gi, "passe réussie"],
        [/\bincomplete pass\b/gi, "passe incomplète"],
        [/\bpass\b/gi, "passe"],
        [/\brush\b/gi, "course"],
        [/\brushing\b/gi, "course"],
        [/\breception\b/gi, "réception"],
        [/\btackled\b/gi, "plaqué"],
        [/\btackle\b/gi, "plaquage"],
        [/\byards\b/gi, "yards"],
        [/\byard\b/gi, "yard"],
        [/\bfirst down\b/gi, "premier essai"],
        [/\bsecond down\b/gi, "deuxième tentative"],
        [/\bthird down\b/gi, "troisième tentative"],
        [/\bfourth down\b/gi, "quatrième tentative"],
        [/\bred zone\b/gi, "zone rouge"],
        [/\bpenalty\b/gi, "pénalité"],
        [/\bholding\b/gi, "retenue"],
        [/\bfalse start\b/gi, "faux départ"],
        [/\bdefensive pass interference\b/gi, "interférence défensive"],
        [/\bpass interference\b/gi, "interférence de passe"],
        [/\bpersonal foul\b/gi, "faute personnelle"],
        [/\bunsportsmanlike conduct\b/gi, "comportement antisportif"],
        [/\bno gain\b/gi, "aucun gain"],
        [/\bloss of\b/gi, "perte de"],
        [/\bfor a touchdown\b/gi, "pour un touchdown"],
        [/\bquarter\b/gi, "quart-temps"],
        [/\bend of game\b/gi, "fin du match"],
        [/\bend of half\b/gi, "fin de la mi-temps"]
    ];

    let resultat = String(phrase);

    for (const [motif, remplacement] of remplacements) {
        resultat = resultat.replace(motif, remplacement);
    }

    return resultat;
}

function traduireStatut(statut) {
    const traductions = {
        "final": "Terminé",
        "scheduled": "À venir",
        "in progress": "En cours",
        "halftime": "Mi-temps",
        "end of period": "Fin du quart-temps",
        "postponed": "Reporté",
        "canceled": "Annulé",
        "cancelled": "Annulé"
    };

    return traductions[String(statut || "").toLowerCase()] || statut || "Match";
}

/* ==================================================
   ONGLET RÉSULTATS / CLASSEMENTS
================================================== */

function onglet(nom) {
    $("section-resultats").hidden = nom !== "resultats";
    $("section-classements").hidden = nom !== "classements";

    $("onglet-resultats").classList.toggle(
        "actif",
        nom === "resultats"
    );

    $("onglet-classements").classList.toggle(
        "actif",
        nom === "classements"
    );

    if (
        nom === "classements" &&
        !$("tableaux-classements").dataset.loaded
    ) {
        afficherClassements();
    }
}

$("onglet-resultats").addEventListener("click", () => {
    onglet("resultats");
});

$("onglet-classements").addEventListener("click", () => {
    onglet("classements");
});

/* ==================================================
   CHOIX DE LA SEMAINE
================================================== */

for (let semaine = 1; semaine <= 18; semaine++) {
    const option = document.createElement("option");

    option.value = semaine;
    option.textContent = `Journée ${semaine}`;

    $("semaine").append(option);
}

$("semaine").value = "10";

$("semaine").addEventListener("change", afficherMatchs);
$("conference").addEventListener("change", afficherClassements);
$("division").addEventListener("change", afficherClassements);

/* ==================================================
   RÉSULTATS DES MATCHS
================================================== */

async function afficherMatchs() {
    const semaine = $("semaine").value;

    $("message-resultats").textContent =
        `Chargement des matchs de la journée ${semaine}…`;

    $("liste-matchs").replaceChildren();
    $("details-match").hidden = true;

    try {
        const data = await charger(
            `${API}/scoreboard?dates=${SAISON}&seasontype=2&week=${semaine}&limit=50`
        );

        const matchs = data.events || [];

        $("message-resultats").textContent = matchs.length
            ? `${matchs.length} match(s) — Journée ${semaine}`
            : "Aucun match trouvé pour cette journée.";

        matchs.sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        for (const match of matchs) {
            const equipes =
                match.competitions?.[0]?.competitors || [];

            const exterieur =
                equipes.find(e => e.homeAway === "away") || equipes[0];

            const domicile =
                equipes.find(e => e.homeAway === "home") || equipes[1];

            if (!exterieur || !domicile) continue;

            const termine = match.status?.type?.completed;

            const score = equipe =>
                termine ? String(equipe.score ?? "—") : "–";

            const carte = document.createElement("button");

            carte.type = "button";
            carte.className = "carte-match";

            carte.innerHTML = `
                <small>
                    ${echapper(dateFR(match.date))}
                    · ${echapper(traduireStatut(
                        match.status?.type?.description
                    ))}
                </small>

                <div class="equipes-match">
                    <span class="equipe-match">
                        ${logoHTML(exterieur.team)}
                        <span>
                            ${echapper(
                                exterieur.team?.shortDisplayName ||
                                equipeNom(exterieur.team)
                            )}
                        </span>
                    </span>

                    <span class="score-match">
                        ${echapper(score(exterieur))}
                        -
                        ${echapper(score(domicile))}
                    </span>

                    <span class="equipe-match">
                        <span>
                            ${echapper(
                                domicile.team?.shortDisplayName ||
                                equipeNom(domicile.team)
                            )}
                        </span>
                        ${logoHTML(domicile.team)}
                    </span>
                </div>

                <small>Voir les statistiques du match</small>
            `;

            carte.addEventListener("click", () => {
                afficherDetails(match.id);
            });

            $("liste-matchs").append(carte);
        }

    } catch (erreur) {
        console.error(erreur);

        $("message-resultats").textContent =
            "Impossible de charger les résultats. Vérifie ta connexion ou réessaie plus tard.";
    }
}

/* ==================================================
   TABLEAU DES STATISTIQUES DES ÉQUIPES
================================================== */

function tableau(entetes, lignes) {
    if (!lignes.length) {
        return "<p>Aucune statistique disponible.</p>";
    }

    return `
        <div class="tableau-scroll">
            <table class="tableau-nfl">
                <thead>
                    <tr>
                        ${entetes.map(entete => `
                            <th>${echapper(traduireStat(entete))}</th>
                        `).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${lignes.map(ligne => `
                        <tr>
                            ${ligne.map(cellule => `
                                <td>${echapper(cellule)}</td>
                            `).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* ==================================================
   PHOTOS DES JOUEURS
================================================== */

function photoJoueur(athlete) {
    const headshot = athlete?.headshot;

    if (typeof headshot === "string") {
        return headshot;
    }

    if (headshot && typeof headshot === "object") {
        return headshot.href || headshot.url || "";
    }

    return athlete?.image || "";
}

/* ==================================================
   TABLEAUX INDIVIDUELS AVEC PHOTOS
================================================== */

function tableauJoueurs(entetes, athletes, categorie) {
    if (!athletes.length) {
        return "<p>Aucune statistique disponible.</p>";
    }

    const lignes = athletes.map(joueur => {
        const athlete = joueur.athlete || {};
        const nom = athlete.displayName || "Joueur";
        const photo = photoJoueur(athlete);

        const image = photo
            ? `
                <img
                    src="${echapper(photo)}"
                    alt="${echapper(nom)}"
                    class="photo-stat-joueur"
                    loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                >
                <span class="photo-stat-vide" style="display:none;">🏈</span>
            `
            : `<span class="photo-stat-vide">🏈</span>`;

        return `
            <tr>
                <td>
                    <div class="joueur-stat-identite">
                        ${image}
                        <span>${echapper(nom)}</span>
                    </div>
                </td>

                ${(joueur.stats || []).map(stat => `
                    <td>${echapper(stat)}</td>
                `).join("")}
            </tr>
        `;
    }).join("");

    return `
        <div class="tableau-scroll">
            <table class="tableau-nfl">
                <thead>
                    <tr>
                        ${entetes.map(entete => `
                            <th>${echapper(
                                traduireStat(entete, categorie)
                            )}</th>
                        `).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${lignes}
                </tbody>
            </table>
        </div>
    `;
}

/* ==================================================
   DÉTAILS ET STATISTIQUES D'UN MATCH
================================================== */

async function afficherDetails(id) {
    const cible = $("details-match");

    cible.hidden = false;
    cible.innerHTML =
        "<p>Chargement des statistiques du match…</p>";

    cible.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const data = await charger(
            `${API}/summary?event=${encodeURIComponent(id)}`
        );

        const competition = data.header?.competitions?.[0];
        const equipes = competition?.competitors || [];

        const exterieur =
            equipes.find(e => e.homeAway === "away") || equipes[0];

        const domicile =
            equipes.find(e => e.homeAway === "home") || equipes[1];

        let html = `
            <h2>
                ${echapper(equipeNom(exterieur?.team))}
                ${echapper(exterieur?.score ?? "—")}
                –
                ${echapper(domicile?.score ?? "—")}
                ${echapper(equipeNom(domicile?.team))}
            </h2>
        `;

        /* STATISTIQUES DES ÉQUIPES */

        const statistiquesEquipes = data.boxscore?.teams || [];

        if (statistiquesEquipes.length) {
            html += "<h3>Statistiques des équipes</h3>";

            const cles = [
                ...new Set(
                    statistiquesEquipes.flatMap(equipe =>
                        (equipe.statistics || []).map(stat => stat.name)
                    )
                )
            ];

            const labels = new Map(
                statistiquesEquipes.flatMap(equipe =>
                    (equipe.statistics || []).map(stat => [
                        stat.name,
                        traduireStat(stat.label || stat.name)
                    ])
                )
            );

            const lignes = cles.map(cle => [
                labels.get(cle) || traduireStat(cle),

                ...statistiquesEquipes.map(equipe =>
                    equipe.statistics?.find(stat =>
                        stat.name === cle
                    )?.displayValue ?? "—"
                )
            ]);

            html += tableau(
                [
                    "Statistique",
                    ...statistiquesEquipes.map(equipe =>
                        equipeNom(equipe.team)
                    )
                ],
                lignes
            );
        }

        /* STATISTIQUES DES JOUEURS */

        const joueurs = data.boxscore?.players || [];

        for (const equipe of joueurs) {
            html += `
                <h3>
                    ${echapper(equipeNom(equipe.team))}
                    — Statistiques des joueurs
                </h3>
            `;

            for (const groupe of equipe.statistics || []) {
                const categorie = groupe.name || "";

                const athletes = (groupe.athletes || []).map(joueur => ({
                    athlete: joueur.athlete,
                    stats: joueur.stats || []
                }));

                if (!athletes.length) continue;

                const titres = {
                    passing: "Statistiques à la passe",
                    rushing: "Statistiques à la course",
                    receiving: "Statistiques en réception",
                    defensive: "Statistiques défensives",
                    kicking: "Coups de pied",
                    punting: "Dégagements",
                    interceptions: "Interceptions"
                };

                html += `
                    <div class="stats-bloc">
                        <h4>
                            ${echapper(
                                titres[categorie] ||
                                groupe.displayName ||
                                "Statistiques des joueurs"
                            )}
                        </h4>

                        ${tableauJoueurs(
                            ["Joueur", ...(groupe.labels || [])],
                            athletes,
                            categorie
                        )}
                    </div>
                `;
            }
        }

        /* ACTIONS QUI ONT RAPPORTE DES POINTS */

        const actions = (data.scoringPlays || []).filter(action =>
            action.scoringType || action.text
        );

        if (actions.length) {
            html += "<h3>Actions qui ont rapporté des points</h3>";

            html += tableau(
                ["Période", "Temps", "Action"],
                actions.map(action => [
                    action.period?.number
                        ? `Quart-temps ${action.period.number}`
                        : "—",

                    action.clock?.displayValue || "—",

                    traduireDescription(action.text || "")
                ])
            );
        }

        /* DÉROULEMENT DES POSSESSIONS */

        const possessions = data.drives?.previous || [];

        if (possessions.length) {
            html += "<h3>Déroulement des possessions</h3>";

            html += tableau(
                ["Équipe", "Résultat", "Résumé"],
                possessions.map(possession => [
                    possession.team?.displayName ||
                    possession.team?.abbreviation ||
                    "—",

                    traduireDescription(
                        possession.displayResult ||
                        possession.result ||
                        "—"
                    ),

                    traduireDescription(
                        possession.description ||
                        possession.shortDisplayResult ||
                        "—"
                    )
                ])
            );
        }

        if (
            !statistiquesEquipes.length &&
            !joueurs.length &&
            !actions.length &&
            !possessions.length
        ) {
            html += `
                <p>
                    Les statistiques détaillées ne sont pas encore
                    disponibles pour ce match.
                </p>
            `;
        }

        cible.innerHTML = html;

    } catch (erreur) {
        console.error(erreur);

        cible.innerHTML = `
            <p>
                Impossible de charger les statistiques de ce match
                pour le moment.
            </p>
        `;
    }
}
/* ==================================================
   CLASSEMENTS AFC / NFC
================================================== */

// Récupération des divisions et des conférences ESPN
function extraireGroupes(noeud, resultats = [], conferenceParente = "") {

    if (Array.isArray(noeud)) {
        noeud.forEach(element => {
            extraireGroupes(element, resultats, conferenceParente);
        });

        return resultats;
    }

    if (!noeud || typeof noeud !== "object") {
        return resultats;
    }

    const nom = String(noeud.name || noeud.abbreviation || "");
    const identite = `${nom} ${noeud.abbreviation || ""}`.toLowerCase();

    let conference = conferenceParente;

    if (/\bafc\b|american football conference/.test(identite)) {
        conference = "afc";
    } else if (/\bnfc\b|national football conference/.test(identite)) {
        conference = "nfc";
    }

    if (Array.isArray(noeud.standings?.entries)) {
        const divisionMatch = identite.match(/\b(east|north|south|west)\b/);

        resultats.push({
            name: nom || "Classement",
            conference,
            division: divisionMatch ? divisionMatch[1] : "",
            entries: noeud.standings.entries
        });
    }

    if (noeud.children) {
        extraireGroupes(noeud.children, resultats, conference);
    }

    return resultats;
}

// Récupération d'une statistique d'équipe
function valeurStat(entree, noms) {
    const statistiques = entree.stats || [];

    const stat = statistiques.find(element =>
        noms.includes(element.name) ||
        noms.includes(element.abbreviation)
    );

    return stat?.displayValue ??
        (stat?.value === undefined ? "—" : String(stat.value));
}

// Conversion du pourcentage pour trier les équipes
function valeurNumeriqueStat(entree, noms) {
    const statistiques = entree.stats || [];

    const stat = statistiques.find(element =>
        noms.includes(element.name) ||
        noms.includes(element.abbreviation)
    );

    if (typeof stat?.value === "number") {
        return stat.value;
    }

    const affichage = String(stat?.displayValue ?? "0")
        .replace("%", "")
        .trim();

    return Number(affichage) || 0;
}

// Affichage des classements
async function afficherClassements() {
    const conference = $("conference").value.toLowerCase();
    const division = $("division").value.toLowerCase();

    const message = $("message-classements");
    const conteneur = $("tableaux-classements");

    message.textContent = "Chargement du classement…";
    conteneur.replaceChildren();
    conteneur.dataset.loaded = "";

    try {
        const data = await charger(
            `https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=${SAISON}&type=2`
        );

        const groupes = extraireGroupes(data.children || data);

        // Sélection de la conférence et de ses divisions
        let groupesAffiches = groupes.filter(groupe =>
            groupe.conference === conference &&
            groupe.division &&
            (division === "all" || groupe.division === division)
        );

        // Solution de secours si ESPN renvoie les équipes
        // directement dans un groupe de conférence
        if (!groupesAffiches.length && division === "all") {
            groupesAffiches = groupes.filter(groupe =>
                groupe.conference === conference && !groupe.division
            );
        }

        if (!groupesAffiches.length) {
            console.error("Structure ESPN des classements :", data);

            message.textContent =
                "Aucun classement trouvé pour cette conférence ou cette division.";

            return;
        }

        const nomsDivisions = {
            east: "Est",
            north: "Nord",
            south: "Sud",
            west: "Ouest"
        };

        message.textContent =
            `Classement ${conference.toUpperCase()} — saison ${SAISON}`;

        for (const groupe of groupesAffiches) {
            const section = document.createElement("section");
            section.className = "bloc-classement";

            const titre = document.createElement("h2");

            titre.textContent =
                nomsDivisions[groupe.division] || groupe.name;

            section.append(titre);

            // Tri selon le pourcentage de victoires
            const lignes = [...groupe.entries].sort((a, b) =>
                valeurNumeriqueStat(b, ["winPercent", "PCT"]) -
                valeurNumeriqueStat(a, ["winPercent", "PCT"])
            );

            const tableauHTML = document.createElement("div");
            tableauHTML.className = "tableau-scroll";

            tableauHTML.innerHTML = `
                <table class="tableau-nfl">
                    <thead>
                        <tr>
                            <th>Équipe</th>
                            <th>Victoires</th>
                            <th>Défaites</th>
                            <th>Égalités</th>
                            <th>% de victoires</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${lignes.map(entree => `
                            <tr>
                                <td>
                                    ${logoHTML(entree.team)}
                                    ${echapper(equipeNom(entree.team))}
                                </td>

                                <td>
                                    ${echapper(valeurStat(entree, ["wins", "W"]))}
                                </td>

                                <td>
                                    ${echapper(valeurStat(entree, ["losses", "L"]))}
                                </td>

                                <td>
                                    ${echapper(valeurStat(entree, ["ties", "T"]))}
                                </td>

                                <td>
                                    ${echapper(valeurStat(entree, ["winPercent", "PCT"]))}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;

            section.append(tableauHTML);
            conteneur.append(section);
        }

        conteneur.dataset.loaded = "1";

    } catch (erreur) {
        console.error("Erreur lors du chargement des classements NFL :", erreur);

        message.textContent =
            "Impossible de charger les classements. Vérifie ta connexion ou réessaie plus tard.";
    }
}

/* ==================================================
   LANCEMENT DE LA PAGE
================================================== */

afficherMatchs();
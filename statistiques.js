
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ÉLÉMENTS HTML
    // =========================

    const choixEquipe = document.getElementById("choix-equipe");
    const choixPoste = document.getElementById("choix-poste");
    const recherche = document.getElementById("recherche-joueur");
    const grille = document.getElementById("joueurs-stats");
    const message = document.getElementById("message-stats");
    const details = document.getElementById("details-joueur");

    if (!choixEquipe || !choixPoste || !recherche || !grille || !details) {
        console.error("Certains éléments HTML sont introuvables.");
        return;
    }

    // =========================
    // LES 32 ÉQUIPES NFL
    // =========================

    const equipes = [
        ["Arizona Cardinals", "ari"],
        ["Atlanta Falcons", "atl"],
        ["Baltimore Ravens", "bal"],
        ["Buffalo Bills", "buf"],
        ["Carolina Panthers", "car"],
        ["Chicago Bears", "chi"],
        ["Cincinnati Bengals", "cin"],
        ["Cleveland Browns", "cle"],
        ["Dallas Cowboys", "dal"],
        ["Denver Broncos", "den"],
        ["Detroit Lions", "det"],
        ["Green Bay Packers", "gb"],
        ["Houston Texans", "hou"],
        ["Indianapolis Colts", "ind"],
        ["Jacksonville Jaguars", "jax"],
        ["Kansas City Chiefs", "kc"],
        ["Las Vegas Raiders", "lv"],
        ["Los Angeles Chargers", "lac"],
        ["Los Angeles Rams", "lar"],
        ["Miami Dolphins", "mia"],
        ["Minnesota Vikings", "min"],
        ["New England Patriots", "ne"],
        ["New Orleans Saints", "no"],
        ["New York Giants", "nyg"],
        ["New York Jets", "nyj"],
        ["Philadelphia Eagles", "phi"],
        ["Pittsburgh Steelers", "pit"],
        ["San Francisco 49ers", "sf"],
        ["Seattle Seahawks", "sea"],
        ["Tampa Bay Buccaneers", "tb"],
        ["Tennessee Titans", "ten"],
        ["Washington Commanders", "wsh"]
    ];

    const nomsEquipes = Object.fromEntries(
        equipes.map(([nom, code]) => [code, nom])
    );

    // =========================
    // JOUEURS STARS
    // =========================

    const joueursStars = {
        ari: ["Kyler Murray", "Marvin Harrison Jr.", "Trey McBride"],
        atl: ["Bijan Robinson", "Drake London", "Michael Penix Jr."],
        bal: ["Lamar Jackson", "Derrick Henry", "Zay Flowers"],
        buf: ["Josh Allen", "James Cook", "Khalil Shakir"],
        car: ["Bryce Young", "Chuba Hubbard", "Tetairoa McMillan"],
        chi: ["Caleb Williams", "DJ Moore", "Rome Odunze"],
        cin: ["Joe Burrow", "Ja'Marr Chase", "Tee Higgins"],
        cle: ["Myles Garrett", "David Njoku", "Jerry Jeudy"],
        dal: ["Dak Prescott", "CeeDee Lamb", "Jake Ferguson"],
        den: ["Bo Nix", "Courtland Sutton", "Patrick Surtain II"],
        det: ["Jahmyr Gibbs", "Amon-Ra St. Brown", "Jared Goff"],
        gb: ["Jordan Love", "Josh Jacobs", "Jayden Reed"],
        hou: ["C.J. Stroud", "Nico Collins", "Will Anderson Jr."],
        ind: ["Jonathan Taylor", "Michael Pittman Jr.", "Anthony Richardson"],
        jax: ["Trevor Lawrence", "Brian Thomas Jr.", "Travis Etienne Jr."],
        kc: ["Patrick Mahomes", "Travis Kelce", "Chris Jones"],
        lv: ["Brock Bowers", "Maxx Crosby", "Ashton Jeanty"],
        lac: ["Justin Herbert", "Ladd McConkey", "Derwin James Jr."],
        lar: ["Puka Nacua", "Matthew Stafford", "Kyren Williams"],
        mia: ["Tyreek Hill", "Jaylen Waddle", "De'Von Achane"],
        min: ["Justin Jefferson", "Jordan Addison", "T.J. Hockenson"],
        ne: ["Drake Maye", "Stefon Diggs", "Christian Gonzalez"],
        no: ["Chris Olave", "Alvin Kamara", "Rashid Shaheed"],
        nyg: ["Malik Nabers", "Dexter Lawrence II", "Cam Skattebo"],
        nyj: ["Garrett Wilson", "Breece Hall", "Sauce Gardner"],
        phi: ["Jalen Hurts", "Saquon Barkley", "A.J. Brown"],
        pit: ["T.J. Watt", "DK Metcalf", "George Pickens"],
        sf: ["Christian McCaffrey", "Brock Purdy", "George Kittle"],
        sea: ["Jaxon Smith-Njigba", "Kenneth Walker III", "Cooper Kupp"],
        tb: ["Baker Mayfield", "Mike Evans", "Bucky Irving"],
        ten: ["Cam Ward", "Tony Pollard", "Calvin Ridley"],
        wsh: ["Jayden Daniels", "Terry McLaurin", "Deebo Samuel"]
    };

    // =========================
    // VARIABLES
    // =========================

    let tousLesJoueurs = [];
    let joueursFiltres = [];
    let nombreAffiches = 12;
    let chargementTermine = false;
    let joueurSelectionne = null;
    let requeteStats = 0;

    const cacheStats = new Map();
    const equipesChargees = new Set();

    // =========================
    // OUTILS
    // =========================

    function normaliserNom(nom) {
        return String(nom || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    async function recupererJSON(url) {
        const reponse = await fetch(url);

        if (!reponse.ok) {
            throw new Error("Erreur HTTP " + reponse.status);
        }

        return reponse.json();
    }

    function photoJoueur(joueur) {
        return joueur.headshot?.href ||
            "https://a.espncdn.com/i/headshots/nfl/players/full/" +
            joueur.id + ".png";
    }

    function logoEquipe(code) {
        return "https://a.espncdn.com/i/teamlogos/nfl/500/" +
            code + ".png";
    }

    function estStar(joueur) {
        const stars = joueursStars[joueur.equipeCode] || [];

        return stars.some(nom =>
            normaliserNom(nom) === normaliserNom(joueur.displayName)
        );
    }

    function rangStar(joueur) {
        const stars = joueursStars[joueur.equipeCode] || [];

        const index = stars.findIndex(nom =>
            normaliserNom(nom) === normaliserNom(joueur.displayName)
        );

        return index === -1 ? 999 : index;
    }

    function correspondPoste(joueur, poste) {
        if (!poste) return true;

        const abbreviation = joueur.position?.abbreviation || "";
        const nom = joueur.position?.displayName || "";

        return normaliserNom(abbreviation) === normaliserNom(poste) ||
            normaliserNom(nom).includes(normaliserNom(poste));
    }

    function afficherMessage(texte) {
        if (message) {
            message.textContent = texte;
        }
    }

    // =========================
    // INITIALISATION FILTRES
    // =========================

    function preparerFiltreEquipes() {
        choixEquipe.innerHTML = "";

        const optionToutes = document.createElement("option");
        optionToutes.value = "";
        optionToutes.textContent = "Toutes les équipes";
        choixEquipe.appendChild(optionToutes);

        equipes.forEach(([nom, code]) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = nom;
            choixEquipe.appendChild(option);
        });
    }

    // =========================
    // CHARGEMENT DES JOUEURS
    // =========================

    async function chargerUneEquipe(nomEquipe, code) {
        try {
            const url =
                "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/" +
                code + "/roster";

            const donnees = await recupererJSON(url);

            const groupes = donnees.athletes || [];

            const liste = groupes.flatMap(groupe => {
                if (Array.isArray(groupe.items)) {
                    return groupe.items;
                }

                if (groupe.id && groupe.displayName) {
                    return [groupe];
                }

                return [];
            });

            const joueursEquipe = liste.map(joueur => ({
                ...joueur,
                equipeCode: code,
                equipeNom: nomEquipe
            }));

            tousLesJoueurs.push(...joueursEquipe);
            equipesChargees.add(code);

            afficherJoueurs(false);
            ouvrirJoueurAccueil()

        } catch (erreur) {
            console.error("Impossible de charger " + nomEquipe, erreur);
        }
    }
const parametresURL = new URLSearchParams(window.location.search);
const joueurDemande = parametresURL.get("joueur");

let joueurOuvert = false;

function ouvrirJoueurAccueil() {
    if (!joueurDemande || joueurOuvert) return;

    const joueurTrouve = tousLesJoueurs.find(joueur =>
        normaliserNom(joueur.displayName) ===
        normaliserNom(joueurDemande)
    );

    if (joueurTrouve) {
        joueurOuvert = true;

        recherche.value = joueurTrouve.displayName;
        choixEquipe.value = "";

        afficherJoueurs(true);
        afficherStatistiques(joueurTrouve);
    }
}
    async function chargerToutesLesEquipes() {
        chargementTermine = false;

        afficherMessage("Chargement des joueurs NFL...");

        await Promise.all(
            equipes.map(([nom, code]) =>
                chargerUneEquipe(nom, code)
            )
        );

        chargementTermine = true;
        afficherJoueurs(false);
    }

    // =========================
    // FILTRAGE DES JOUEURS
    // =========================

    function filtrerJoueurs() {
        const equipe = choixEquipe.value;
        const poste = choixPoste.value;
        const texte = normaliserNom(recherche.value);

        joueursFiltres = tousLesJoueurs.filter(joueur => {

            const bonneEquipe =
                !equipe || joueur.equipeCode === equipe;

            const bonPoste =
                correspondPoste(joueur, poste);

            const bonNom =
                !texte ||
                normaliserNom(joueur.displayName).includes(texte);

            return bonneEquipe && bonPoste && bonNom;
        });

        joueursFiltres.sort((a, b) => {
            const rangA = rangStar(a);
            const rangB = rangStar(b);

            if (rangA !== rangB) {
                return rangA - rangB;
            }

            return a.displayName.localeCompare(b.displayName);
        });
    }

    // =========================
    // CARTES JOUEURS
    // =========================

    function creerCarteJoueur(joueur) {
        const carte = document.createElement("div");
        carte.className = "carte-joueur-stats";

        const photo = document.createElement("img");
        photo.src = photoJoueur(joueur);
        photo.alt = joueur.displayName;
        photo.className = "photo-joueur-stats";
        photo.loading = "lazy";

        photo.onerror = function () {
            this.onerror = null;
            this.src =
                "https://a.espncdn.com/i/headshots/nfl/players/full/" +
                joueur.id + ".png";
        };

        carte.appendChild(photo);

        if (estStar(joueur)) {
            const badge = document.createElement("span");
            badge.className = "badge-star";
            badge.textContent = "⭐ Star NFL";
            carte.appendChild(badge);
        }

        const nom = document.createElement("h3");
        nom.textContent = joueur.displayName;
        carte.appendChild(nom);

        const poste = document.createElement("p");
        poste.textContent =
            (joueur.position?.abbreviation || "Poste inconnu") +
            (joueur.jersey ? " • N° " + joueur.jersey : "");

        carte.appendChild(poste);

        // Logo de l'équipe du joueur
        const logo = document.createElement("img");
        logo.src = logoEquipe(joueur.equipeCode);
        logo.alt = "Logo " + joueur.equipeNom;
        logo.className = "logo-equipe-joueur";
        logo.loading = "lazy";

        logo.style.width = "55px";
        logo.style.height = "55px";
        logo.style.objectFit = "contain";
        logo.style.display = "block";
        logo.style.margin = "10px auto";
        logo.style.visibility = "visible";

        carte.appendChild(logo);

        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "bouton-stats-joueur";
        bouton.textContent = "Voir les statistiques";

        bouton.addEventListener("click", () => {
            afficherStatistiques(joueur);
        });

        carte.appendChild(bouton);

        return carte;
    }

    // =========================
    // AFFICHAGE DES JOUEURS
    // =========================

    const zoneVoirPlus = document.createElement("div");
    zoneVoirPlus.style.textAlign = "center";
    zoneVoirPlus.style.margin = "25px 0";

    const boutonVoirPlus = document.createElement("button");
    boutonVoirPlus.type = "button";
    boutonVoirPlus.textContent = "Voir plus de joueurs";
    boutonVoirPlus.className = "bouton-voir-plus";

    zoneVoirPlus.appendChild(boutonVoirPlus);
    grille.insertAdjacentElement("afterend", zoneVoirPlus);

    function afficherJoueurs(reinitialiser = true) {
        if (reinitialiser) {
            nombreAffiches = 12;
        }

        filtrerJoueurs();

        grille.innerHTML = "";

        joueursFiltres
            .slice(0, nombreAffiches)
            .forEach(joueur => {
                grille.appendChild(creerCarteJoueur(joueur));
            });

        zoneVoirPlus.hidden =
            joueursFiltres.length <= nombreAffiches;

        if (!chargementTermine) {
            afficherMessage(
                joueursFiltres.length +
                " joueurs trouvés • Chargement des équipes en cours (" +
                equipesChargees.size + "/32)"
            );
        } else if (joueursFiltres.length === 0) {
            afficherMessage("Aucun joueur trouvé.");
        } else {
            afficherMessage(
                joueursFiltres.length + " joueurs trouvés"
            );
        }
    }

    boutonVoirPlus.addEventListener("click", () => {
        nombreAffiches += 12;
        afficherJoueurs(false);
    });

    // =========================
    // TRADUCTION DES STATISTIQUES
    // =========================

    const traductions = {
        "Games Played": "Matchs joués",
        "Games Started": "Matchs titulaires",
        "Completions": "Passes réussies",
        "Passing Attempts": "Passes tentées",
        "Passing Yards": "Yards à la passe",
        "Passing Touchdowns": "Touchdowns à la passe",
        "Interceptions": "Interceptions",
        "Completion Percentage": "Pourcentage de passes réussies",
        "Passer Rating": "Évaluation du quarterback",
        "QBR": "Évaluation QBR",
        "Sacks": "Sacks",
        "Total Sacks": "Total des sacks",
        "Rushing Attempts": "Courses tentées",
        "Rushing Yards": "Yards à la course",
        "Rushing Touchdowns": "Touchdowns à la course",
        "Yards Per Rush Attempt": "Yards par course",
        "Long Rushing": "Plus longue course",
        "Rushing 1st downs": "Premiers downs à la course",
        "Rushing Fumbles": "Fumbles à la course",
        "Rushing Fumbles Lost": "Fumbles perdus à la course",
        "Receptions": "Réceptions",
        "Receiving Yards": "Yards à la réception",
        "Receiving Touchdowns": "Touchdowns à la réception",
        "Receiving Targets": "Passes ciblées",
        "Yards Per Reception": "Yards par réception",
        "Long Reception": "Plus longue réception",
        "Receiving Fumbles": "Fumbles après réception",
        "Receiving Fumbles Lost": "Fumbles perdus après réception",
        "Total Tackles": "Plaquages totaux",
        "Solo Tackles": "Plaquages individuels",
        "Assist Tackles": "Plaquages assistés",
        "Tackles For Loss": "Plaquages pour perte",
        "Forced Fumbles": "Fumbles provoqués",
        "Fumbles Recovered": "Fumbles récupérés",
        "Fumbles Recovered Yards": "Yards après récupération",
        "Passes Defended": "Passes défendues",
        "Interception Yards": "Yards après interception",
        "Average Interception Yards": "Moyenne de yards par interception",
        "Long Interception": "Plus longue interception",
        "Stuffs": "Courses stoppées",
        "Stuff Yards": "Yards sur courses stoppées",
        "Kicks Blocked": "Coups de pied bloqués",
        "Total Touchdowns": "Total des touchdowns",
        "Total Two Point Conversions": "Conversions à deux points",
        "Kick Extra Points": "Points supplémentaires au pied",
        "Field Goals": "Field goals",
        "Field Goals Made": "Field goals réussis",
        "Field Goals Attempted": "Field goals tentés",
        "Total Points": "Total des points"
    };

    const categoriesFrancaises = {
        passing: "Statistiques de passe",
        rushing: "Statistiques de course",
        receiving: "Statistiques de réception",
        defensive: "Statistiques défensives",
        defense: "Statistiques défensives",
        kicking: "Statistiques de tir",
        punting: "Statistiques de dégagement",
        returning: "Statistiques de retour",
        fumbles: "Fumbles",
        interceptions: "Interceptions",
        scoring: "Points marqués"
    };

    function traduireStatistique(nom) {
        return traductions[nom] || nom;
    }

    function traduireCategorie(categorie) {
        return categoriesFrancaises[categorie.name] ||
            categorie.displayName ||
            categorie.name ||
            "Autres statistiques";
    }

    // =========================
    // SAISONS NFL
    // =========================

    function obtenirAnnee(ligne) {
        return Number(
            ligne.season?.year ||
            ligne.season?.value ||
            ligne.year ||
            0
        );
    }

    function nomSaison(annee) {
        return annee + "-" + (annee + 1);
    }

    function creerBoutonsSaisons(joueur, conteneur) {
        const zone = document.createElement("div");
        zone.className = "boutons-saisons";

        for (let annee = 2017; annee <= 2026; annee++) {
            const bouton = document.createElement("button");
            bouton.type = "button";
            bouton.textContent = annee + "-" + (annee + 1);
            bouton.dataset.annee = annee;

            bouton.addEventListener("click", () => {
                zone.querySelectorAll("button").forEach(btn => {
                    btn.classList.remove("actif");
                });

                bouton.classList.add("actif");
                chargerStatistiquesSaison(joueur, annee);
            });

            zone.appendChild(bouton);
        }

        conteneur.appendChild(zone);
    }

    // =========================
    // STATISTIQUES PAR SAISON
    // =========================

    async function chargerStatistiquesSaison(joueur, annee) {
        const zoneResultats =
            document.getElementById("resultats-saison");

        if (!zoneResultats) return;

        const numeroRequete = ++requeteStats;

        zoneResultats.innerHTML =
            "<p>Chargement des statistiques...</p>";

        const cleCache = joueur.id + "-" + annee;

        try {
            let donnees;

            if (cacheStats.has(cleCache)) {
                donnees = cacheStats.get(cleCache);
            } else {
                const url =
                    "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/" +
                    joueur.id +
                    "/stats?season=" +
                    annee +
                    "&seasontype=2";

                donnees = await recupererJSON(url);
                cacheStats.set(cleCache, donnees);
            }

            if (numeroRequete !== requeteStats) return;

            zoneResultats.innerHTML = "";

            const titre = document.createElement("h3");
            titre.textContent =
                "Saison " + annee + "-" + (annee + 1);

            zoneResultats.appendChild(titre);

            const categories = donnees.categories || [];
            let statistiquesTrouvees = false;

            categories.forEach(categorie => {
                const lignes = categorie.statistics || [];

                const ligne = lignes.find(stat =>
                    obtenirAnnee(stat) === annee
                );

                if (!ligne || !Array.isArray(ligne.stats)) {
                    return;
                }

                statistiquesTrouvees = true;

                const bloc = document.createElement("div");
                bloc.className = "bloc-statistiques";

                const titreCategorie = document.createElement("h4");
                titreCategorie.textContent =
                    traduireCategorie(categorie);

                bloc.appendChild(titreCategorie);

                const tableau = document.createElement("table");
                tableau.className = "tableau-statistiques";

                const tbody = document.createElement("tbody");

                const noms = categorie.displayNames ||
                    categorie.labels ||
                    categorie.names ||
                    [];

                ligne.stats.forEach((valeur, index) => {
                    const tr = document.createElement("tr");

                    const tdNom = document.createElement("td");
                    tdNom.textContent =
                        traduireStatistique(noms[index] || "Statistique");

                    const tdValeur = document.createElement("td");
                    tdValeur.textContent = valeur ?? "-";

                    tr.appendChild(tdNom);
                    tr.appendChild(tdValeur);
                    tbody.appendChild(tr);
                });

                tableau.appendChild(tbody);
                bloc.appendChild(tableau);
                zoneResultats.appendChild(bloc);
            });

            if (!statistiquesTrouvees) {
                zoneResultats.innerHTML =
                    "<p>Aucune statistique disponible pour cette saison.</p>";
            }

        } catch (erreur) {
            if (numeroRequete !== requeteStats) return;

            console.error(erreur);

            zoneResultats.innerHTML =
                "<p>Impossible de récupérer les statistiques de cette saison.</p>";
        }
    }

    // =========================
    // DÉTAILS D'UN JOUEUR
    // =========================

    function afficherStatistiques(joueur) {
        joueurSelectionne = joueur;
        requeteStats++;

        details.hidden = false;
        details.style.display = "block";
        details.innerHTML = "";

        const boutonFermer = document.createElement("button");
        boutonFermer.type = "button";
        boutonFermer.textContent = "✕ Fermer";
        boutonFermer.className = "fermer-statistiques";

        boutonFermer.addEventListener("click", () => {
            requeteStats++;
            details.hidden = true;
            details.style.display = "none";
            details.innerHTML = "";
        });

        details.appendChild(boutonFermer);

        const titre = document.createElement("h2");
        titre.textContent = joueur.displayName;
        details.appendChild(titre);

        const informations = document.createElement("p");
        informations.textContent =
            (joueur.position?.abbreviation || "") +
            " • " +
            joueur.equipeNom;

        details.appendChild(informations);

        const logo = document.createElement("img");
        logo.src = logoEquipe(joueur.equipeCode);
        logo.alt = joueur.equipeNom;
        logo.style.width = "70px";
        logo.style.height = "70px";
        logo.style.objectFit = "contain";

        details.appendChild(logo);

        creerBoutonsSaisons(joueur, details);

        const zoneResultats = document.createElement("div");
        zoneResultats.id = "resultats-saison";
        details.appendChild(zoneResultats);

        details.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        const anneeActuelle = new Date().getFullYear();

        const anneeParDefaut = Math.min(
            Math.max(anneeActuelle, 2017),
            2026
        );

        const boutonActif = details.querySelector(
            '[data-annee="' + anneeParDefaut + '"]'
        );

        if (boutonActif) {
            boutonActif.classList.add("actif");
        }

        chargerStatistiquesSaison(joueur, anneeParDefaut);
    }

    // =========================
    // ÉVÉNEMENTS DES FILTRES
    // =========================

    choixEquipe.addEventListener("change", () => {
        afficherJoueurs(true);
    });

    choixPoste.addEventListener("change", () => {
        afficherJoueurs(true);
    });

    recherche.addEventListener("input", () => {
        afficherJoueurs(true);
    });

    // =========================
    // DÉMARRAGE AUTOMATIQUE
    // =========================

    preparerFiltreEquipes();
    afficherJoueurs(true);
    chargerToutesLesEquipes();

});

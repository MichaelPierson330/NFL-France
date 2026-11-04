
document.addEventListener("DOMContentLoaded", () => {

    const ANNEE_ACTUELLE = 2026;
    const PREMIERE_ANNEE = 2017;
    const JOUEURS_PAR_PAGE = 12;

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

    // Sélection indicative de 10 joueurs par équipe.
    // Un joueur absent de l'effectif ESPN n'est pas affiché.

    const joueursStars = {
        ari: [
            "Trey McBride", "Budda Baker", "Michael Wilson",
            "James Conner", "Marvin Harrison Jr.",
            "Paris Johnson Jr.", "Garrett Williams",
            "Josh Sweat", "Walter Nolen", "Jacoby Brissett"
        ],
        atl: [
            "Bijan Robinson", "Drake London", "Kyle Pitts",
            "Michael Penix Jr.", "Jessie Bates III",
            "A.J. Terrell", "Chris Lindstrom",
            "Matthew Bergeron", "Jalon Walker", "Zach Harrison"
        ],
        bal: [
            "Lamar Jackson", "Derrick Henry", "Zay Flowers",
            "Mark Andrews", "Roquan Smith", "Kyle Hamilton",
            "Nnamdi Madubuike", "Rashod Bateman",
            "Roger Rosengarten", "Marlon Humphrey"
        ],
        buf: [
            "Josh Allen", "James Cook III", "Khalil Shakir",
            "Dalton Kincaid", "Dion Dawkins", "Spencer Brown",
            "Greg Rousseau", "Ed Oliver",
            "Christian Benford", "Keon Coleman"
        ],
        car: [
            "Tetairoa McMillan", "Chuba Hubbard", "Bryce Young",
            "Jaycee Horn", "Derrick Brown", "Ikem Ekwonu",
            "Jalen Coker", "Xavier Legette",
            "Tre'von Moehrig", "Trevin Wallace"
        ],
        chi: [
            "Caleb Williams", "Rome Odunze", "Luther Burden III",
            "D'Andre Swift", "Colston Loveland", "Cole Kmet",
            "Darnell Wright", "Jaylon Johnson",
            "Montez Sweat", "Tremaine Edmunds"
        ],
        cin: [
            "Joe Burrow", "Ja'Marr Chase", "Tee Higgins",
            "Chase Brown", "Mike Gesicki", "Orlando Brown Jr.",
            "Amarius Mims", "Trey Hendrickson",
            "Logan Wilson", "Geno Stone"
        ],
        cle: [
            "Myles Garrett", "Denzel Ward", "Quinshon Judkins",
            "David Njoku", "Jerry Jeudy", "Harold Fannin Jr.",
            "Joel Bitonio", "Wyatt Teller",
            "Jeremiah Owusu-Koramoah", "Grant Delpit"
        ],
        dal: [
            "Dak Prescott", "CeeDee Lamb", "George Pickens",
            "Jake Ferguson", "Javonte Williams",
            "Tyler Smith", "DaRon Bland",
            "Osa Odighizuwa", "Donovan Wilson", "KaVontae Turpin"
        ],
        den: [
            "Bo Nix", "Courtland Sutton", "RJ Harvey",
            "Patrick Surtain II", "Quinn Meinerz",
            "Nik Bonitto", "Zach Allen", "Marvin Mims Jr.",
            "Evan Engram", "Jonathon Cooper"
        ],
        det: [
            "Jahmyr Gibbs", "Amon-Ra St. Brown", "David Montgomery",
            "Jared Goff", "Sam LaPorta", "Penei Sewell",
            "Aidan Hutchinson", "Brian Branch",
            "Jameson Williams", "Kerby Joseph"
        ],
        gb: [
            "Jordan Love", "Josh Jacobs", "Tucker Kraft",
            "Jayden Reed", "Christian Watson", "Romeo Doubs",
            "Xavier McKinney", "Rashan Gary",
            "Edgerrin Cooper", "Elgton Jenkins"
        ],
        hou: [
            "C.J. Stroud", "Nico Collins", "Will Anderson Jr.",
            "Danielle Hunter", "Derek Stingley Jr.",
            "Dalton Schultz", "Tank Dell", "Jalen Pitre",
            "Kamari Lassiter", "Joe Mixon"
        ],
        ind: [
            "Jonathan Taylor", "Daniel Jones", "Alec Pierce",
            "Josh Downs", "Tyler Warren", "Michael Pittman Jr.",
            "Bernhard Raimann", "Quenton Nelson",
            "DeForest Buckner", "Zaire Franklin"
        ],
        jax: [
            "Trevor Lawrence", "Brian Thomas Jr.", "Travis Hunter",
            "Parker Washington", "Josh Hines-Allen",
            "Travon Walker", "Foyesade Oluokun",
            "Brenton Strange", "Anton Harrison", "Tank Bigsby"
        ],
        kc: [
            "Patrick Mahomes", "Travis Kelce", "Chris Jones",
            "Xavier Worthy", "Rashee Rice", "Isiah Pacheco",
            "Creed Humphrey", "Trent McDuffie",
            "George Karlaftis", "Nick Bolton"
        ],
        lv: [
            "Brock Bowers", "Maxx Crosby", "Ashton Jeanty",
            "Geno Smith", "Jakobi Meyers", "Tre Tucker",
            "Kolton Miller", "Christian Wilkins",
            "Tyree Wilson", "Jeremy Chinn"
        ],
        lac: [
            "Justin Herbert", "Ladd McConkey", "Omarion Hampton",
            "Quentin Johnston", "Derwin James",
            "Khalil Mack", "Tuli Tuipulotu", "Joe Alt",
            "Rashawn Slater", "Oronde Gadsden II"
        ],
        lar: [
            "Puka Nacua", "Matthew Stafford", "Kyren Williams",
            "Davante Adams", "Jared Verse", "Byron Young",
            "Kobie Turner", "Steve Avila",
            "Kevin Dotson", "Kamren Curl"
        ],
        mia: [
            "De'Von Achane", "Tyreek Hill", "Jaylen Waddle",
            "Jaylen Wright", "Malik Washington",
            "Patrick Paul", "Austin Jackson",
            "Jordyn Brooks", "Zach Sieler", "Minkah Fitzpatrick"
        ],
        min: [
            "Justin Jefferson", "Jordan Addison", "T.J. Hockenson",
            "Aaron Jones", "J.J. McCarthy", "Jonathan Greenard",
            "Andrew Van Ginkel", "Christian Darrisaw",
            "Brian O'Neill", "Byron Murphy Jr."
        ],
        ne: [
            "Drake Maye", "Christian Gonzalez", "Rhamondre Stevenson",
            "TreVeyon Henderson", "Hunter Henry",
            "Will Campbell", "DeMario Douglas",
            "Milton Williams", "Kyle Williams", "Stefon Diggs"
        ],
        no: [
            "Chris Olave", "Alvin Kamara", "Tyler Shough",
            "Juwan Johnson", "Demario Davis", "Bryan Bresee",
            "Taliese Fuaga", "Chase Young",
            "Tyrann Mathieu", "Rashid Shaheed"
        ],
        nyg: [
            "Malik Nabers", "Cam Skattebo", "Jaxson Dart",
            "Brian Burns", "Dexter Lawrence",
            "Andrew Thomas", "Kayvon Thibodeaux",
            "Bobby Okereke", "Deonte Banks", "Wan'Dale Robinson"
        ],
        nyj: [
            "Garrett Wilson", "Breece Hall", "Quinnen Williams",
            "Sauce Gardner", "Will McDonald IV",
            "Alijah Vera-Tucker", "Olu Fashanu",
            "Jermaine Johnson", "Mason Taylor", "Braelon Allen"
        ],
        phi: [
            "Jalen Hurts", "Saquon Barkley", "DeVonta Smith",
            "Dallas Goedert", "Jalen Carter",
            "Quinyon Mitchell", "Cooper DeJean",
            "Jordan Mailata", "Lane Johnson", "Zack Baun"
        ],
        pit: [
            "T.J. Watt", "DK Metcalf", "Jaylen Warren",
            "Cam Heyward", "Pat Freiermuth",
            "Joey Porter Jr.", "Alex Highsmith",
            "Nick Herbig", "Darnell Washington", "Broderick Jones"
        ],
        sf: [
            "Christian McCaffrey", "Brock Purdy", "George Kittle",
            "Nick Bosa", "Fred Warner", "Ricky Pearsall",
            "Brandon Aiyuk", "Trent Williams",
            "Jauan Jennings", "Ji'Ayir Brown"
        ],
        sea: [
            "Jaxon Smith-Njigba", "Devon Witherspoon",
            "Leonard Williams", "Sam Darnold",
            "Kenneth Walker III", "Cooper Kupp",
            "Zach Charbonnet", "Charles Cross",
            "Julian Love", "Byron Murphy II"
        ],
        tb: [
            "Baker Mayfield", "Mike Evans", "Chris Godwin",
            "Bucky Irving", "Emeka Egbuka", "Cade Otton",
            "Tristan Wirfs", "Antoine Winfield Jr.",
            "Vita Vea", "Lavonte David"
        ],
        ten: [
            "Cam Ward", "Jeffery Simmons", "Calvin Ridley",
            "Tony Pollard", "T'Vondre Sweat",
            "JC Latham", "Peter Skoronski",
            "Chig Okonkwo", "L'Jarius Sneed", "Arden Key"
        ],
        wsh: [
            "Jayden Daniels", "Terry McLaurin", "Deebo Samuel",
            "Laremy Tunsil", "Bobby Wagner",
            "Marshon Lattimore", "Daron Payne",
            "Jonathan Allen", "Zach Ertz", "Austin Ekeler"
        ]
    };

    const choixEquipe = document.getElementById("choix-equipe");
    const choixPoste = document.getElementById("choix-poste");
    const recherche = document.getElementById("recherche-joueur");
    const grille = document.getElementById("joueurs-stats");
    const message = document.getElementById("message-stats");
    const details = document.getElementById("details-joueur");

    if (!choixEquipe || !choixPoste || !recherche ||
        !grille || !message || !details) {
        console.error("Un élément HTML est manquant.");
        return;
    }

    let joueurs = [];
    let joueursFiltres = [];
    let nombreAffiches = 0;
    let numeroEquipe = 0;
    let numeroStats = 0;

    const cacheStats = new Map();

    const traductions = {
        passing: "Statistiques à la passe",
        rushing: "Statistiques à la course",
        receiving: "Statistiques à la réception",
        defensive: "Statistiques défensives",
        defense: "Statistiques défensives",
        kicking: "Statistiques au pied",
        punting: "Dégagements",
        fumbles: "Ballons échappés",
        returns: "Retours",
        kickReturns: "Retours de coups d'envoi",
        puntReturns: "Retours de dégagements",
        interceptions: "Interceptions",
        general: "Statistiques générales",
        scoring: "Points marqués",

        "Games Played": "Matchs joués",
        "Games Started": "Matchs comme titulaire",
        "Games": "Matchs",
        "Starts": "Titularisations",

        "Completions": "Passes réussies",
        "Passing Attempts": "Passes tentées",
        "Completion Percentage": "Pourcentage de passes réussies",
        "Passing Yards": "Yards à la passe",
        "Passing Touchdowns": "Touchdowns à la passe",
        "Passing Interceptions": "Passes interceptées",
        "Interceptions Thrown": "Passes interceptées",
        "Yards Per Pass Attempt": "Yards par tentative de passe",
        "Yards Per Completion": "Yards par passe réussie",
        "Longest Pass": "Plus longue passe",
        "Passer Rating": "Évaluation du quarterback",
        "Quarterback Rating": "Évaluation du quarterback",
        "Total QBR": "QBR total",
        "Adjusted QBR": "QBR ajusté",
        "Sacked": "Sacks subis",
        "Sack Yards Lost": "Yards perdus sur sacks",
        "Total Sacks": "Nombre total de sacks",

        "Rushing Attempts": "Courses tentées",
        "Rushing Yards": "Yards à la course",
        "Rushing Touchdowns": "Touchdowns à la course",
        "Yards Per Rush Attempt": "Yards par course",
        "Yards Per Carry": "Yards par course",
        "Longest Rush": "Plus longue course",
        "Long Rushing": "Plus longue course",
        "Rushing First Downs": "Premières tentatives obtenues à la course",
        "Rushing 1st downs": "Premières tentatives obtenues à la course",
        "Rushing Fumbles": "Ballons échappés à la course",
        "Rushing Fumbles Lost": "Ballons perdus à la course",

        "Receptions": "Réceptions",
        "Receiving Yards": "Yards à la réception",
        "Receiving Touchdowns": "Touchdowns à la réception",
        "Receiving Targets": "Passes ciblées",
        "Targets": "Passes ciblées",
        "Yards Per Reception": "Yards par réception",
        "Yards After Catch": "Yards après réception",
        "Longest Reception": "Plus longue réception",
        "Long Reception": "Plus longue réception",
        "Catch Percentage": "Pourcentage de réceptions",
        "Receiving First Downs": "Premières tentatives obtenues à la réception",
        "Drops": "Passes relâchées",
        "Receiving Fumbles": "Ballons échappés après réception",
        "Receiving Fumbles Lost": "Ballons perdus après réception",

        "Total Tackles": "Total des plaquages",
        "Solo Tackles": "Plaquages individuels",
        "Assisted Tackles": "Plaquages assistés",
        "Assist Tackles": "Plaquages assistés",
        "Tackles For Loss": "Plaquages pour perte",
        "Sacks": "Sacks",
        "Sack Yards": "Yards perdus sur sacks",
        "Quarterback Hits": "Contacts sur le quarterback",
        "Passes Defended": "Passes défendues",
        "Passes Defensed": "Passes défendues",
        "Interceptions": "Interceptions",
        "Interception Yards": "Yards après interception",
        "Average Interception Yards": "Moyenne de yards par interception",
        "Long Interception": "Plus long retour d'interception",
        "Interception Touchdowns": "Touchdowns sur interception",
        "Forced Fumbles": "Fumbles provoqués",
        "Fumble Recoveries": "Ballons échappés récupérés",
        "Fumbles Recovered Yards": "Yards après récupération d'un ballon",
        "Fumble Recovery Yards": "Yards après récupération d'un ballon",
        "Defensive Touchdowns": "Touchdowns défensifs",
        "Safeties": "Safeties",
        "Stuffs": "Courses stoppées derrière la ligne d'engagement",
        "Stuff Yards": "Yards perdus sur ces courses stoppées",
        "Kicks Blocked": "Coups de pied contrés",

        "Field Goals Made": "Field goals réussis",
        "Field Goals Attempted": "Field goals tentés",
        "Field Goal Percentage": "Pourcentage de field goals réussis",
        "Extra Points Made": "Transformations réussies",
        "Extra Points Attempted": "Transformations tentées",
        "Extra Point Percentage": "Pourcentage de transformations réussies",
        "Longest Field Goal": "Plus long field goal",

        "Punts": "Dégagements",
        "Punt Yards": "Yards sur dégagements",
        "Punt Average": "Moyenne par dégagement",
        "Longest Punt": "Plus long dégagement",
        "Punt Returns": "Retours de dégagements",
        "Punt Return Yards": "Yards sur retours de dégagements",
        "Kick Returns": "Retours de coups d'envoi",
        "Kick Return Yards": "Yards sur retours de coups d'envoi",
        "Return Touchdowns": "Touchdowns sur retour",

        "Fumbles": "Ballons échappés",
        "Fumbles Lost": "Ballons échappés perdus",
        "Fumbles Recovered": "Ballons échappés récupérés",

        "Total Touchdowns": "Total des touchdowns",
        "Total Two Point Conversions": "Total des transformations à deux points",
        "Kick Extra Points": "Transformations au pied réussies",
        "Field Goals": "Coups de pied à trois points",
        "Total Points": "Total des points",

        GP: "Matchs joués",
        GS: "Titularisations",
        CMP: "Passes réussies",
        ATT: "Tentatives",
        YDS: "Yards",
        TD: "Touchdowns",
        INT: "Interceptions",
        AVG: "Moyenne",
        LNG: "Plus longue action",
        REC: "Réceptions",
        TGT: "Passes ciblées",
        CAR: "Courses",
        FUM: "Ballons échappés",
        SACK: "Sacks",
        AST: "Plaquages assistés",
        TOT: "Total",
        SOLO: "Plaquages individuels",
        PCT: "Pourcentage",
        RTG: "Évaluation",
        YAC: "Yards après réception",
        YPC: "Yards par course",
        YPR: "Yards par réception",
        YPA: "Yards par tentative",
        FG: "Field goals",
        FGM: "Field goals réussis",
        FGA: "Field goals tentés",
        XPM: "Transformations réussies",
        XPA: "Transformations tentées"
    };

    const traductionsNormalisees = new Map(
        Object.entries(traductions).map(([cle, valeur]) => [
            cle.toLowerCase(),
            valeur
        ])
    );

    function traduire(texte) {
        const valeur = String(texte || "").trim();

        return traductions[valeur] ||
            traductionsNormalisees.get(valeur.toLowerCase()) ||
            valeur;
    }

    function creerElement(balise, classe = "", texte = "") {
        const element = document.createElement(balise);

        if (classe) {
            element.className = classe;
        }

        element.textContent = texte;
        return element;
    }

    async function recupererJSON(url) {
        const reponse = await fetch(url);

        if (!reponse.ok) {
            throw new Error("Erreur HTTP " + reponse.status);
        }

        return reponse.json();
    }

    function normaliserNom(nom) {
        return String(nom || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();
    }

    function classerJoueurs(liste, equipe) {
        const stars = (joueursStars[equipe] || [])
            .map(normaliserNom);

        return [...liste].sort((a, b) => {
            const rangA = stars.indexOf(
                normaliserNom(a.displayName)
            );

            const rangB = stars.indexOf(
                normaliserNom(b.displayName)
            );

            const positionA = rangA === -1 ? 999 : rangA;
            const positionB = rangB === -1 ? 999 : rangB;

            return positionA - positionB;
        });
    }

    function estJoueurStar(joueur, equipe) {
        const stars = (joueursStars[equipe] || [])
            .map(normaliserNom);

        return stars.includes(
            normaliserNom(joueur.displayName)
        );
    }

    function photoJoueur(joueur) {
        return (
            joueur.headshot?.href ||
            "https://a.espncdn.com/i/headshots/nfl/players/full/" +
            joueur.id + ".png"
        );
    }

    function creerPhoto(joueur, taille = 130, prioritaire = false) {
        const image = document.createElement("img");

        image.src = photoJoueur(joueur);
        image.alt = joueur.displayName || "Joueur NFL";

        image.width = taille;
        image.height = taille;

        image.loading = prioritaire ? "eager" : "lazy";
        image.decoding = "async";

        if (prioritaire) {
            image.fetchPriority = "high";
        }

        image.style.width = taille + "px";
        image.style.height = taille + "px";
        image.style.objectFit = "contain";

        image.onerror = () => {
            image.style.visibility = "hidden";
        };

        return image;
    }

    function correspondPoste(position, filtre) {
        if (!filtre) return true;

        const groupes = {
            OL: ["C", "G", "T", "OT", "OG"],
            DL: ["DE", "DT", "NT", "EDGE"],
            DB: ["CB", "S", "FS", "SS"]
        };

        return groupes[filtre]
            ? groupes[filtre].includes(position)
            : position === filtre;
    }

    equipes.forEach(([nom, code]) => {
        const option = document.createElement("option");

        option.value = code;
        option.textContent = nom;

        choixEquipe.appendChild(option);
    });

    const zoneBouton = creerElement(
        "div",
        "zone-voir-plus"
    );

    const boutonVoirPlus = creerElement(
        "button",
        "bouton-voir-plus",
        "Voir plus de joueurs"
    );

    boutonVoirPlus.type = "button";
    boutonVoirPlus.addEventListener("click", afficherPlusDeJoueurs);

    zoneBouton.appendChild(boutonVoirPlus);
    grille.insertAdjacentElement("afterend", zoneBouton);
    zoneBouton.hidden = true;

    function creerCarteJoueur(joueur, index) {
        const carte = creerElement(
            "article",
            "carte-joueur-stats"
        );

        const image = creerPhoto(
            joueur,
            130,
            index < 4
        );

        const nom = creerElement(
            "h3",
            "",
            joueur.displayName || "Joueur NFL"
        );

        const poste = creerElement(
            "p",
            "",
            "Poste : " +
            (joueur.position?.abbreviation || "—")
        );

        const numero = creerElement(
            "p",
            "",
            "Numéro : " + (joueur.jersey || "—")
        );

        const bouton = creerElement(
            "button",
            "",
            "Voir les statistiques"
        );

        bouton.type = "button";

        bouton.addEventListener("click", () => {
            afficherStatistiques(joueur);
        });

        carte.appendChild(image);

        if (estJoueurStar(joueur, choixEquipe.value)) {
            const badge = creerElement(
                "span",
                "badge-star",
                "⭐ Joueur star"
            );

            carte.appendChild(badge);
        }

        carte.append(nom, poste, numero, bouton);

        return carte;
    }

    function afficherPlusDeJoueurs() {
        const suivants = joueursFiltres.slice(
            nombreAffiches,
            nombreAffiches + JOUEURS_PAR_PAGE
        );

        const fragment = document.createDocumentFragment();

        suivants.forEach((joueur, index) => {
            fragment.appendChild(
                creerCarteJoueur(joueur, nombreAffiches + index)
            );
        });

        grille.appendChild(fragment);

        nombreAffiches += suivants.length;

        zoneBouton.hidden =
            nombreAffiches >= joueursFiltres.length;

        message.textContent =
            nombreAffiches + " joueur(s) affiché(s) sur " +
            joueursFiltres.length;
    }

async function rechercherJoueurGlobal(nomRecherche) {
    const rechercheNormalisee = nomRecherche.toLowerCase().trim();

    grille.innerHTML = "";
    details.hidden = true;
    zoneBouton.hidden = true;

    message.textContent = "Recherche du joueur dans les 32 équipes...";

    const requete = ++numeroEquipe;
    const joueursTrouves = [];

    const resultats = await Promise.allSettled(
        equipes.map(async ([nomEquipe, code]) => {
            const url =
                "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/" +
                code + "/roster";

            const donnees = await recupererJSON(url);

            return (donnees.athletes || []).flatMap(groupe => {
                const liste = Array.isArray(groupe.items)
                    ? groupe.items
                    : groupe.id ? [groupe] : [];

                return liste.map(joueur => ({
                    ...joueur,
                    equipeNom: nomEquipe,
                    equipeCode: code
                }));
            });
        })
    );

    if (requete !== numeroEquipe) return;

    resultats.forEach(resultat => {
        if (resultat.status === "fulfilled") {
            resultat.value.forEach(joueur => {
                if (
                    joueur.displayName
                        ?.toLowerCase()
                        .includes(rechercheNormalisee)
                ) {
                    joueursTrouves.push(joueur);
                }
            });
        }
    });

    grille.innerHTML = "";

    if (!joueursTrouves.length) {
        message.textContent = "Aucun joueur trouvé.";
        return;
    }

    message.textContent =
        joueursTrouves.length + " joueur(s) trouvé(s).";

    joueursTrouves.forEach((joueur, index) => {
        const carte = creerCarteJoueur(joueur, index);

        const equipe = creerElement(
            "p",
            "",
            "Équipe : " + joueur.equipeNom
        );

        carte.appendChild(equipe);
        grille.appendChild(carte);
    });
}

    function afficherJoueurs() {
        grille.innerHTML = "";
        details.hidden = true;
        numeroStats++;

        nombreAffiches = 0;

        const texte = recherche.value.toLowerCase().trim();
        const filtre = choixPoste.value;

        joueursFiltres = joueurs.filter(joueur => {
            const nom =
                (joueur.displayName || "").toLowerCase();

            const poste =
                joueur.position?.abbreviation || "";

            return nom.includes(texte) &&
                correspondPoste(poste, filtre);
        });

        joueursFiltres = classerJoueurs(
            joueursFiltres,
            choixEquipe.value
        );

        if (!joueursFiltres.length) {
            message.textContent = "Aucun joueur trouvé.";
            zoneBouton.hidden = true;
            return;
        }

        afficherPlusDeJoueurs();
    }

    async function chargerEquipe() {
        const code = choixEquipe.value;
        const requete = ++numeroEquipe;

        joueurs = [];
        joueursFiltres = [];

        grille.innerHTML = "";
        details.hidden = true;
        zoneBouton.hidden = true;
        numeroStats++;

        if (!code) {
            message.textContent = "Sélectionne une équipe NFL.";
            return;
        }

        message.textContent = "Chargement des joueurs...";

        try {
            const url =
                "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/" +
                code + "/roster";

            const donnees = await recupererJSON(url);

            if (requete !== numeroEquipe) return;

            joueurs = (donnees.athletes || []).flatMap(groupe => {
                if (Array.isArray(groupe.items)) {
                    return groupe.items;
                }

                if (groupe.id && groupe.displayName) {
                    return [groupe];
                }

                return [];
            });

            afficherJoueurs();

        } catch (erreur) {
            console.error(erreur);

            if (requete === numeroEquipe) {
                message.textContent =
                    "Impossible de charger cette équipe.";
            }
        }
    }

    function obtenirAnnee(ligne) {
        const saison = ligne.season;

        const valeur =
            saison?.year ??
            (
                typeof saison === "number" ||
                typeof saison === "string"
                    ? saison
                    : null
            ) ??
            ligne.year ??
            ligne.seasonYear;

        if (typeof valeur === "number") {
            return valeur;
        }

        if (typeof valeur === "string") {
            const match = valeur.match(/20\d{2}/);
            return match ? Number(match[0]) : null;
        }

        return null;
    }

    function estSaisonReguliere(ligne) {
        const type =
            ligne.seasonType?.id ??
            ligne.seasonType?.type ??
            ligne.seasonType ??
            ligne.seasontype;

        if (type === undefined || type === null) {
            return true;
        }

        if (typeof type === "number") {
            return type === 2;
        }

        if (typeof type === "string") {
            return type === "2" ||
                type.toLowerCase() === "regular" ||
                type.toLowerCase() === "regular season";
        }

        return false;
    }

    function extraireCategories(donnees, annee) {
        const resultats = [];

        if (!Array.isArray(donnees.categories)) {
            return resultats;
        }

        donnees.categories.forEach(categorie => {
            const saisons = Array.isArray(categorie.statistics)
                ? categorie.statistics
                : [];

            const saisonChoisie = saisons.find(ligne =>
                obtenirAnnee(ligne) === annee &&
                estSaisonReguliere(ligne)
            );

            if (!saisonChoisie) return;

            const labels =
                categorie.displayNames ||
                categorie.labels ||
                categorie.names ||
                [];

            const valeurs = saisonChoisie.stats || [];

            if (
                Array.isArray(labels) &&
                Array.isArray(valeurs) &&
                labels.length > 0 &&
                valeurs.length > 0
            ) {
                resultats.push({
                    nom: categorie.displayName ||
                        categorie.name ||
                        "Statistiques",
                    labels,
                    valeurs
                });
            }
        });

        return resultats;
    }

    function ajouterLigne(section, nom, valeur) {
        const ligne = creerElement(
            "div",
            "ligne-statistique"
        );

        const gauche = creerElement(
            "span",
            "",
            traduire(nom)
        );

        const droite = creerElement(
            "strong",
            "",
            String(valeur)
        );

        ligne.append(gauche, droite);
        section.appendChild(ligne);
    }

    function afficherCategories(zone, categories) {
        zone.innerHTML = "";

        let total = 0;

        categories.forEach(categorie => {
            const section = creerElement(
                "section",
                "section-statistique"
            );

            const titre = creerElement(
                "h3",
                "",
                traduire(categorie.nom)
            );

            section.appendChild(titre);

            categorie.labels.forEach((label, index) => {
                const valeur = categorie.valeurs[index];

                if (
                    valeur !== undefined &&
                    valeur !== null &&
                    typeof valeur !== "object"
                ) {
                    ajouterLigne(section, label, valeur);
                    total++;
                }
            });

            if (section.children.length > 1) {
                zone.appendChild(section);
            }
        });

        return total;
    }

    function nomSaison(annee) {
        return annee + "-" + (annee + 1);
    }

    function creerBoutonsSaisons(joueur, zoneStats, sousTitre) {
        const conteneur = creerElement(
            "div",
            "boutons-saisons"
        );

        const boutons = [];

        for (
            let annee = ANNEE_ACTUELLE;
            annee >= PREMIERE_ANNEE;
            annee--
        ) {
            const bouton = creerElement(
                "button",
                "",
                nomSaison(annee)
            );

            bouton.type = "button";

            bouton.addEventListener("click", () => {
                boutons.forEach(b => {
                    b.classList.remove("actif");
                });

                bouton.classList.add("actif");

                sousTitre.textContent =
                    "Saison NFL " + nomSaison(annee) +
                    " - Saison régulière";

                chargerStatistiquesSaison(
                    joueur,
                    annee,
                    zoneStats
                );
            });

            boutons.push(bouton);
            conteneur.appendChild(bouton);
        }

        return { conteneur, boutons };
    }

    async function chargerStatistiquesSaison(
        joueur,
        annee,
        zoneStats
    ) {
        const requete = ++numeroStats;

        zoneStats.textContent =
            "Chargement des statistiques " +
            nomSaison(annee) + "...";

        const cle = joueur.id + "_" + annee;

        try {
            let donnees = cacheStats.get(cle);

            if (!donnees) {
                const url =
                    "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/" +
                    joueur.id +
                    "/stats?season=" + annee +
                    "&seasontype=2";

                donnees = await recupererJSON(url);
                cacheStats.set(cle, donnees);
            }

            if (requete !== numeroStats) return;

            const categories = extraireCategories(
                donnees,
                annee
            );

            if (!categories.length) {
                zoneStats.textContent =
                    "Aucune statistique disponible pour la saison " +
                    nomSaison(annee) + ".";
                return;
            }

            const nombre = afficherCategories(
                zoneStats,
                categories
            );

            if (!nombre) {
                zoneStats.textContent =
                    "Aucune statistique disponible pour cette saison.";
            }

        } catch (erreur) {
            console.error("Erreur ESPN :", erreur);

            if (requete === numeroStats) {
                zoneStats.textContent =
                    "Impossible de charger les statistiques.";
            }
        }
    }

    function afficherStatistiques(joueur) {
        numeroStats++;

        details.hidden = false;
        details.innerHTML = "";

        const titre = creerElement(
            "h2",
            "",
            joueur.displayName
        );

        const image = creerPhoto(joueur, 180, true);
        image.className = "photo-detail-joueur";

        const sousTitre = creerElement(
            "p",
            "",
            "Saison NFL 2026-2027 - Saison régulière"
        );

        const zoneStats = creerElement("div");

        const selection = creerBoutonsSaisons(
            joueur,
            zoneStats,
            sousTitre
        );

        details.append(
            titre,
            image,
            sousTitre,
            selection.conteneur,
            zoneStats
        );

        details.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (selection.boutons.length) {
            selection.boutons[0].click();
        }
    }

    choixEquipe.addEventListener("change", chargerEquipe);
    choixPoste.addEventListener("change", afficherJoueurs);
    
let delaiRecherche;

recherche.addEventListener("input", () => {
    clearTimeout(delaiRecherche);

    const texte = recherche.value.trim();

    if (texte.length === 0) {
        afficherJoueurs();
        return;
    }

    if (texte.length < 2) {
        message.textContent =
            "Tape au moins 2 lettres pour rechercher un joueur.";
        grille.innerHTML = "";
        zoneBouton.hidden = true;
        return;
    }

    delaiRecherche = setTimeout(() => {
        rechercherJoueurGlobal(texte);
    }, 400);
});


});

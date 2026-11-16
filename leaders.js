
const API = "https://site.api.espn.com/apis/site/v3/sports/football/nfl/leaders";
const SAISON = 2026;
const TYPE_SAISON = 2;

// Catégories avec des intitulés français naturels
const categoriesLeaders = [
  { id: "passingYards", nom: "Yards à la passe", unite: "YDS" },
  { id: "passingTouchdowns", nom: "Touchdowns à la passe", unite: "TD" },
  { id: "rushingYards", nom: "Yards à la course", unite: "YDS" },
  { id: "rushingTouchdowns", nom: "Touchdowns à la course", unite: "TD" },
  { id: "receivingYards", nom: "Yards à la réception", unite: "YDS" },
  { id: "receptions", nom: "Réceptions", unite: "REC" },
  { id: "sacks", nom: "Sacks", unite: "SACKS" },
  { id: "interceptions", nom: "Interceptions", unite: "INT" }
];

let donneesLeaders = [];

// Récupération des classements ESPN
async function chargerLeaders() {
  const url = `${API}?season=${SAISON}&seasontype=${TYPE_SAISON}`;

  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error(`Erreur ESPN : ${reponse.status}`);
  }

  const donnees = await reponse.json();
  const categories = donnees.leaders?.categories;

  if (!Array.isArray(categories)) {
    throw new Error("Format des classements ESPN inattendu.");
  }

  return categories;
}

// Récupération des joueurs d'une catégorie
function recupererJoueurs(categorie) {
  if (!categorie || !Array.isArray(categorie.leaders)) {
    return [];
  }

  return categorie.leaders.map((element, index) => {
    const joueur = element.athlete || {};
    const equipe = element.team || {};

    return {
      rang: index + 1,
      nom: joueur.displayName || joueur.fullName || "Joueur NFL",
      photo:
        joueur.headshot?.href ||
        (joueur.id
          ? `https://a.espncdn.com/i/headshots/nfl/players/full/${joueur.id}.png`
          : ""),
      equipe: equipe.displayName || equipe.abbreviation || "",
      logo: equipe.logos?.[0]?.href || equipe.logo || "",
      valeur: element.displayValue ?? element.value ?? "—"
    };
  });
}

// Création d'une carte joueur
function creerCarte(joueur) {
  const carte = document.createElement("article");
  carte.className = "bloc-leader";

  const photo = document.createElement("img");
  photo.className = "leader-photo";
  photo.alt = joueur.nom;
  photo.loading = "lazy";

  if (joueur.photo) {
    photo.src = joueur.photo;
    photo.onerror = () => {
      photo.style.display = "none";
    };
  } else {
    photo.style.display = "none";
  }

  const rang = document.createElement("span");
  rang.className = "leader-rang";
  rang.textContent = `#${joueur.rang}`;

  const identite = document.createElement("div");
  identite.className = "leader-identite";

  const nom = document.createElement("strong");
  nom.textContent = joueur.nom;

  const equipe = document.createElement("span");
  equipe.textContent = joueur.equipe;

  identite.append(nom, equipe);

  const performance = document.createElement("strong");
  performance.className = "leader-performance";
  performance.textContent = joueur.valeur;

  carte.append(photo, rang, identite, performance);

  return carte;
}

// Affichage d'un classement
function afficherClassement(conteneur, categorie, limite = 50) {
  if (!conteneur) return;

  conteneur.innerHTML = "";

  const joueurs = recupererJoueurs(categorie).slice(0, limite);

  if (joueurs.length === 0) {
    conteneur.textContent = "Aucune statistique disponible pour cette catégorie.";
    return;
  }

  joueurs.forEach(joueur => {
    conteneur.appendChild(creerCarte(joueur));
  });
}

// Initialisation des classements sur l'accueil
function initialiserAccueil() {
  const conteneur = document.getElementById("apercu-leaders");
  const message = document.getElementById("message-leaders");

  if (!conteneur) return;

  conteneur.innerHTML = "";

  categoriesLeaders.slice(0, 5).forEach(info => {
    const categorie = donneesLeaders.find(c => c.name === info.id);

    if (!categorie) return;

    const section = document.createElement("section");
    section.className = "categorie-leader";

    const titre = document.createElement("h3");
    titre.textContent = info.nom;

    const joueurs = document.createElement("div");
    joueurs.className = "liste-leaders";

    afficherClassement(joueurs, categorie, 3);

    section.append(titre, joueurs);
    conteneur.appendChild(section);
  });

  if (message) {
    message.textContent = "";
  }
}

// Initialisation des classements sur la page Statistiques
function initialiserPageStatistiques() {
  const select = document.getElementById("categorie-leaders");
  const conteneur = document.getElementById("classement-complet");
  const message = document.getElementById("message-classements-joueurs");
  const titre = document.getElementById("titre-classement");

  if (!select || !conteneur) return;

  select.innerHTML = "";

  categoriesLeaders.forEach(info => {
    const option = document.createElement("option");
    option.value = info.id;
    option.textContent = info.nom;
    select.appendChild(option);
  });

  function mettreAJourClassement() {
    const idCategorie = select.value;
    const info = categoriesLeaders.find(c => c.id === idCategorie);
    const categorie = donneesLeaders.find(c => c.name === idCategorie);

    if (titre && info) {
      titre.textContent = info.nom;
    }

    if (!categorie) {
      conteneur.innerHTML = "";
      if (message) {
        message.textContent = "Classement indisponible pour cette catégorie.";
      }
      return;
    }

    if (message) {
      message.textContent = "";
    }

    afficherClassement(conteneur, categorie, 50);
  }

  select.addEventListener("change", mettreAJourClassement);

  mettreAJourClassement();
}

// Lancement général
async function initialiserLeaders() {
  try {
    donneesLeaders = await chargerLeaders();

    initialiserAccueil();
    initialiserPageStatistiques();

  } catch (erreur) {
    console.error("Erreur classement NFL :", erreur);

    const messageAccueil = document.getElementById("message-leaders");
    const messageStats = document.getElementById("message-classements-joueurs");

    if (messageAccueil) {
      messageAccueil.textContent = "Impossible de charger les classements NFL.";
    }

    if (messageStats) {
      messageStats.textContent = "Impossible de charger les classements NFL.";
    }
  }
}

document.addEventListener("DOMContentLoaded", initialiserLeaders);

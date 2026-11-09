
document.addEventListener("DOMContentLoaded", async () => {

    const recherche = document.getElementById("recherche-video");
    const filtre = document.getElementById("filtre-video");
    const grille = document.getElementById("grille-videos");
    const message = document.getElementById("message-videos");

    let videos = [];

    function afficherVideos() {
        const texte = recherche.value.toLowerCase().trim();
        const categorie = filtre.value;

        grille.innerHTML = "";

        const resultats = videos.filter(video => {
            const correspondRecherche =
                video.titre.toLowerCase().includes(texte);

            const correspondCategorie =
                categorie === "tous" ||
                video.categorie === categorie;

            return correspondRecherche && correspondCategorie;
        });

        resultats.forEach(video => {
            const carte = document.createElement("article");
            carte.className = "carte-video";

            const lecteur = document.createElement("div");
            lecteur.className = "lecteur-video";

            const lien = document.createElement("a");
            lien.className = "lien-video";
            lien.href = video.url;
            lien.target = "_blank";
            lien.rel = "noopener noreferrer";
            lien.setAttribute("aria-label", "Regarder " + video.titre);

            const image = document.createElement("img");
            image.src = video.image;
            image.alt = video.titre;
            image.className = "image-video";
            image.loading = "lazy";

            const bouton = document.createElement("span");
            bouton.className = "bouton-video";
            bouton.textContent = "▶";

            lien.appendChild(image);
            lien.appendChild(bouton);
            lecteur.appendChild(lien);

            const infos = document.createElement("div");
            infos.className = "infos-video";

            const categorieTexte = document.createElement("span");
            categorieTexte.className = "categorie-video";
            categorieTexte.textContent = video.categorieNom;

            const titre = document.createElement("h3");
            titre.textContent = video.titre;

            const date = document.createElement("p");

            if (video.date) {
                date.textContent = new Date(video.date).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
            }

            infos.appendChild(categorieTexte);
            infos.appendChild(titre);
            infos.appendChild(date);

            carte.appendChild(lecteur);
            carte.appendChild(infos);
            grille.appendChild(carte);
        });

        message.textContent = resultats.length === 0
            ? "Aucune vidéo trouvée."
            : "";
    }

    function determinerCategorie(titre) {
        const texte = titre.toLowerCase();

        if (
            texte.includes("résumé") ||
            texte.includes("resume") ||
            texte.includes("highlights")
        ) {
            return {
                categorie: "resumes",
                categorieNom: "Résumé de match"
            };
        }

        if (
            texte.includes("touchdown") ||
            texte.includes("td ")
        ) {
            return {
                categorie: "touchdowns",
                categorieNom: "Touchdowns"
            };
        }

        return {
            categorie: "actions",
            categorieNom: "NFL Extra"
        };
    }

    message.textContent = "Chargement des vidéos NFL Extra...";

    try {
        const reponse = await fetch("videos.json", {
            cache: "no-store"
        });

        if (!reponse.ok) {
            throw new Error("Impossible de charger videos.json");
        }

        const donnees = await reponse.json();

        if (!Array.isArray(donnees)) {
            throw new Error("Format JSON incorrect");
        }

        videos = donnees.map(video => ({
            ...video,
            ...determinerCategorie(video.titre || "")
        }));

        afficherVideos();

    } catch (erreur) {
        console.error(erreur);
        message.textContent =
            "Impossible de charger les vidéos. Vérifie videos.json.";
    }

    recherche.addEventListener("input", afficherVideos);
    filtre.addEventListener("change", afficherVideos);
});

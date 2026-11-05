
document.addEventListener("DOMContentLoaded", () => {

    const recherche = document.getElementById("recherche-video");
    const filtre = document.getElementById("filtre-video");
    const grille = document.getElementById("grille-videos");
    const message = document.getElementById("message-videos");

    const videos = [
        {
    titre: "Top 15 des meilleures actions - Week 8 (2026)",
    categorie: "actions",
    description: "Les 15 meilleures actions de la semaine 8 de NFL.",
    id: "734G0waDRxI"
},
        {
            titre: "1 heure des meilleurs touchdowns NFL",
            categorie: "touchdowns",
            description: "Une compilation des touchdowns de la saison 2025 et des playoffs.",
            id: "apI84QUp7Zs"
        }
    ];

    const nomsCategories = {
        resumes: "Résumé de match",
        touchdowns: "Touchdowns",
        actions: "Meilleures actions"
    };

    function afficherVideos() {

        const texte = recherche.value.toLowerCase().trim();
        const categorie = filtre.value;

        grille.innerHTML = "";

        const videosFiltrees = videos.filter(video => {

            const correspondRecherche =
                video.titre.toLowerCase().includes(texte) ||
                video.description.toLowerCase().includes(texte);

            const correspondCategorie =
                categorie === "tous" ||
                video.categorie === categorie;

            return correspondRecherche && correspondCategorie;
        });

        videosFiltrees.forEach(video => {

            const carte = document.createElement("article");
            carte.className = "carte-video";

            const lecteur = document.createElement("div");
            lecteur.className = "lecteur-video";

            const iframe = document.createElement("iframe");

            iframe.src =
                "https://www.youtube.com/embed/" + video.id;

            iframe.title = video.titre;
            iframe.loading = "lazy";
            iframe.allow =
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;

            lecteur.appendChild(iframe);

            const infos = document.createElement("div");
            infos.className = "infos-video";

            const categorieTexte = document.createElement("span");
            categorieTexte.className = "categorie-video";
            categorieTexte.textContent =
                nomsCategories[video.categorie] || "NFL";

            const titre = document.createElement("h3");
            titre.textContent = video.titre;

            const description = document.createElement("p");
            description.textContent = video.description;

            const lien = document.createElement("a");
            lien.href = "https://www.youtube.com/watch?v=" + video.id;
            lien.target = "_blank";
            lien.rel = "noopener noreferrer";
            lien.textContent = "Regarder sur YouTube";
            lien.style.display = "inline-block";
            lien.style.marginTop = "15px";
            lien.style.color = "#e63946";
            lien.style.fontWeight = "bold";
            lien.style.textDecoration = "none";

            infos.appendChild(categorieTexte);
            infos.appendChild(titre);
            infos.appendChild(description);
            infos.appendChild(lien);

            carte.appendChild(lecteur);
            carte.appendChild(infos);

            grille.appendChild(carte);
        });

        message.textContent = videosFiltrees.length === 0
            ? "Aucune vidéo trouvée dans cette catégorie."
            : "";
    }

    recherche.addEventListener("input", afficherVideos);
    filtre.addEventListener("change", afficherVideos);

    afficherVideos();
});


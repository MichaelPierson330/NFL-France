
document.addEventListener("DOMContentLoaded", async () => {

    const zone = document.getElementById("article-complet");
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        zone.textContent = "Article introuvable.";
        return;
    }

    const articles = JSON.parse(
        localStorage.getItem("nfl_historique") || "[]"
    );

    const article = articles.find(a => String(a.id) === id);
    async function recupererContenu(article) {
    const texteCourt = article.story || article.description || "";

    try {
        const url =
            "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news/" +
            encodeURIComponent(article.id);

        const reponse = await fetch(url);

        if (!reponse.ok) {
            return texteCourt;
        }

        const donnees = await reponse.json();

        const texte = donnees.article?.story ||
                      donnees.story ||
                      donnees.article?.description;

        return texte || texteCourt;

    } catch (erreur) {
        console.error("Détails ESPN indisponibles :", erreur);
        return texteCourt;
    }
}

    if (!article) {
        zone.textContent = "Article introuvable.";
        return;
    }

    async function traduire(texte) {
        if (!texte) {
            return "";
        }

        const cle = "nfl_traduction_" + texte;
        const cache = localStorage.getItem(cle);

        if (cache) {
            return cache;
        }

        try {
            const url =
                "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(texte.slice(0, 450)) +
                "&langpair=en%7Cfr";

            const reponse = await fetch(url);
            const donnees = await reponse.json();

            if (donnees.responseStatus === 200) {
                const resultat = donnees.responseData.translatedText;

                localStorage.setItem(cle, resultat);

                return resultat;
            }

        } catch (erreur) {
            console.error("Traduction indisponible :", erreur);
        }

        return texte;
    }

    zone.innerHTML = "";

    const titre = document.createElement("h2");
    titre.textContent = article.headline;

    const date = document.createElement("p");
    date.className = "date-actualite";

    const dateArticle = new Date(article.published);

    date.textContent = isNaN(dateArticle.getTime())
        ? "Date indisponible"
        : dateArticle.toLocaleDateString("fr-FR");

    zone.appendChild(titre);
    zone.appendChild(date);

    const photo = article.images?.[0]?.url;

    if (photo) {
        const image = document.createElement("img");

        image.src = photo;
        image.alt = article.headline;
        image.className = "photo-article";

        zone.appendChild(image);
    }

    const resume = document.createElement("p");
    resume.className = "resume-article";
    resume.textContent = article.description || "Chargement du résumé...";
    zone.appendChild(resume);

    const lien = document.createElement("a");

    lien.href = article.links?.web?.href ||
        "https://www.espn.com/nfl/";

    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    lien.textContent = "Consulter l'article original sur ESPN";

    zone.appendChild(lien);

    titre.textContent = await traduire(article.headline);

    const contenu = await recupererContenu(article);

if (contenu) {
    resume.textContent = await traduire(contenu);
} else {
    resume.textContent = "Aucun résumé détaillé disponible.";
}
});

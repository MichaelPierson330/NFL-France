
document.addEventListener("DOMContentLoaded", () => {

    const liste = document.getElementById("liste-actualites");
    const message = document.getElementById("message-actualites");

    if (!liste || !message) {
        return;
    }

    const api =
        "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news";

    const accueil =
        location.pathname.endsWith("index.html") ||
        location.pathname.endsWith("/");

    const CACHE_DUREE = 10 * 60 * 1000;

    function lireHistorique() {
        try {
            return JSON.parse(
                localStorage.getItem("nfl_historique") || "[]"
            );
        } catch (erreur) {
            return [];
        }
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

                const traduction =
                    donnees.responseData.translatedText || texte;

                localStorage.setItem(cle, traduction);

                return traduction;
            }

        } catch (erreur) {
            console.error("Traduction indisponible :", erreur);
        }

        return texte;
    }

    function afficherArticles(articles) {

        liste.innerHTML = "";

        const selection = accueil
            ? articles.slice(0, 3)
            : articles;

        selection.forEach((article, index) => {

            const carte = document.createElement("article");
            carte.className = "carte-actualite";

            const photo = article.images?.[0]?.url;

            if (photo) {
                const image = document.createElement("img");

                image.src = photo;
                image.alt = article.headline;
                image.className = "image-actualite";
                image.loading = index < 3 ? "eager" : "lazy";
                image.decoding = "async";

                carte.appendChild(image);
            }

            const contenu = document.createElement("div");
            contenu.className = "contenu-actualite";

            const titre = document.createElement("h3");
            titre.textContent = article.headline;

            const date = document.createElement("p");
            date.className = "date-actualite";

            const dateArticle = new Date(article.published);

            date.textContent = isNaN(dateArticle.getTime())
                ? "Date indisponible"
                : dateArticle.toLocaleDateString("fr-FR");

            const lien = document.createElement("a");

            lien.href =
                "article.html?id=" + encodeURIComponent(article.id);

            lien.textContent = "Lire l'article";

            contenu.appendChild(titre);
            contenu.appendChild(date);
            contenu.appendChild(lien);

            carte.appendChild(contenu);
            liste.appendChild(carte);

            traduire(article.headline).then(traduction => {
                titre.textContent = traduction;
            });

        });
    }

    async function chargerActualites() {

        let historique = lireHistorique();

        if (historique.length > 0) {
            afficherArticles(historique);
            message.textContent = "";
        } else {
            message.textContent = "Chargement des actualités NFL...";
        }

        try {

            let nouveauxArticles = [];

            const cache = JSON.parse(
                localStorage.getItem("nfl_cache_espn") || "null"
            );

            if (
                cache &&
                Date.now() - cache.date < CACHE_DUREE
            ) {
                nouveauxArticles = cache.articles;

            } else {

                const reponse = await fetch(api);

                if (!reponse.ok) {
                    throw new Error("Erreur ESPN");
                }

                const donnees = await reponse.json();

                nouveauxArticles = donnees.articles || [];

                localStorage.setItem(
                    "nfl_cache_espn",
                    JSON.stringify({
                        date: Date.now(),
                        articles: nouveauxArticles
                    })
                );
            }

            const ids = new Set(
                historique.map(article => String(article.id))
            );

            nouveauxArticles.forEach(article => {

                if (!ids.has(String(article.id))) {
                    historique.push(article);
                    ids.add(String(article.id));
                }

            });

            historique.sort((a, b) => {
                return new Date(b.published) - new Date(a.published);
            });

            try {
                localStorage.setItem(
                    "nfl_historique",
                    JSON.stringify(historique)
                );
            } catch (erreur) {
                console.warn("Stockage local plein :", erreur);
            }

            afficherArticles(historique);
            message.textContent = "";

        } catch (erreur) {

            console.error("Erreur NFL :", erreur);

            if (historique.length === 0) {
                message.textContent =
                    "Impossible de charger les actualités NFL.";
            }
        }
    }

    chargerActualites();

});

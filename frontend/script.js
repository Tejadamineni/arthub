const galleryGrid = document.getElementById("galleryGrid");
const exploreBtn = document.getElementById("exploreBtn");

// Scroll button
if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        document.getElementById("gallery").scrollIntoView({ behavior: "smooth" });
    });
}

// Fetch artworks from backend
async function loadArtworks() {
    try {
        const res = await fetch("http://localhost:5000/api/art/all");
        const artworks = await res.json();

        galleryGrid.innerHTML = ""; // clear existing

        artworks.forEach(art => {
            const card = document.createElement("div");
            card.className = "art-card";

            card.innerHTML = `
                <img src="http://localhost:5000/${art.image_url}" alt="${art.title}">
                <h3>${art.title}</h3>
                <p>${art.description}</p>
            `;

            galleryGrid.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading artworks:", err);
    }
}

// Load on page start
loadArtworks();

const navLinks = document.getElementById("navLinks");
const user = JSON.parse(localStorage.getItem("user"));

// Dynamic Navbar
if (navLinks) {
    if (user) {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="dashboard.html">Dashboard</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
        `;
    }
}

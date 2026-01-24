const API_KEY = "e129c3dc381e5d67c606d5bf217d32f8";
const BASE_URL = "https://api.themoviedb.org/3";
let genresList = [];

// --- DASHBOARD ELEMENTS ---
const popularCarousel = document.getElementById('popular-carousel');
const topratedCarousel = document.getElementById('toprated-carousel');
const trendingCarousel = document.getElementById('trending-carousel');
const favoritesSection = document.getElementById('favorites-section');
const favoritesCarousel = document.getElementById('favorites-carousel');
const watchlistSection = document.getElementById('watchlist-section');
const watchlistCarousel = document.getElementById('watchlist-carousel');

const genreListContainer = document.getElementById('genre-list');
const genreSection = document.getElementById('genre-movies-section');
const genreCarousel = document.getElementById('genre-carousel');
const genreTitle = document.getElementById('genre-title');

// --- MODAL ELEMENTS ---
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalGenres = document.getElementById('modal-genres');
const modalRating = document.getElementById('modal-rating');
const modalRelease = document.getElementById('modal-release');
const modalOverview = document.getElementById('modal-overview');
const modalFavBtn = document.getElementById('modal-favorite-btn');
const modalWatchBtn = document.getElementById('modal-watchlist-btn');

// --- SEARCH ELEMENTS ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

let currentMovie = null;

// --- FETCH GENRES ---
async function fetchGenres() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    genresList = data.genres;
}

// --- FETCH MOVIES ---
async function fetchMovies(endpoint) {
    const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await res.json();
    return data.results;
}

// --- CREATE MOVIE CARD ---
function createMovieCard(movie, type = "favorites") {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const imgSrc = movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "";
    card.innerHTML = `
        <img src="${imgSrc}" alt="${movie.title}">
        <div class="movie-overlay">
            <h3>${movie.title}</h3>
            <p>Rating: ${movie.vote_average}</p>
            <button>${type === "favorites" ? "❤" : "📌"}</button>
        </div>
    `;
    card.addEventListener('click', () => openModal(movie));
    card.querySelector('button').addEventListener('click', e => {
        e.stopPropagation();
        if (type === "favorites") saveFavorite(movie);
        else saveWatchlist(movie);
    });
    return card;
}

// --- RENDER CAROUSEL ---
function renderCarousel(container, movies, type = "favorites") {
    container.innerHTML = "";
    movies.forEach(m => container.appendChild(createMovieCard(m, type)));
}

// --- OPEN MODAL ---
function openModal(movie) {
    currentMovie = movie;
    if (!modal) return;
    modal.style.display = "block";
    modalPoster.src = movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "";
    modalTitle.textContent = movie.title;
    modalGenres.textContent = "Genres: " + (movie.genre_ids || []).map(id => genresList.find(g => g.id === id)?.name).filter(Boolean).join(", ");
    modalRating.textContent = "Rating: " + movie.vote_average;
    modalRelease.textContent = "Release: " + movie.release_date;
    modalOverview.textContent = movie.overview || "No description available";
}

if (closeModalBtn) {
    closeModalBtn.onclick = () => modal.style.display = "none";
}
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; }

// --- FAVORITES ---
function saveFavorite(movie) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { alert("Please login first!"); return; }

    let allFavs = JSON.parse(localStorage.getItem('favorites')) || {};
    if (!allFavs[currentUser]) allFavs[currentUser] = [];

    if (!allFavs[currentUser].includes(movie.id)) {
        allFavs[currentUser].push(movie.id);
        localStorage.setItem('favorites', JSON.stringify(allFavs));
        alert(`${movie.title} added to favorites!`);
        renderFavorites();
    } else alert("Already in favorites");
}

function renderFavorites() {
    if (!favoritesSection || !favoritesCarousel) return;
    const currentUser = localStorage.getItem('currentUser');
    let allFavs = JSON.parse(localStorage.getItem('favorites')) || {};
    let userFavs = allFavs[currentUser] || [];

    if (userFavs.length === 0) {
        favoritesSection.style.display = "none";
        favoritesCarousel.innerHTML = "";
        return;
    }

    favoritesSection.style.display = "block";
    favoritesCarousel.innerHTML = "";

    userFavs.forEach(async id => {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const movie = await res.json();
        const card = document.createElement('div');
        card.className = "movie-card";
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-overlay">
                <h3>${movie.title}</h3>
                <p>Rating: ${movie.vote_average}</p>
                <button class="remove-fav-btn">Remove</button>
            </div>
        `;
        card.querySelector('.remove-fav-btn').addEventListener('click', () => {
            userFavs = userFavs.filter(mid => mid !== movie.id);
            allFavs[currentUser] = userFavs;
            localStorage.setItem('favorites', JSON.stringify(allFavs));
            renderFavorites();
        });
        card.addEventListener('click', () => openModal(movie));
        favoritesCarousel.appendChild(card);
    });
}

// --- WATCHLIST ---
function saveWatchlist(movie) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { alert("Please login first!"); return; }

    let allWatch = JSON.parse(localStorage.getItem('watchlist')) || {};
    if (!allWatch[currentUser]) allWatch[currentUser] = [];

    if (!allWatch[currentUser].includes(movie.id)) {
        allWatch[currentUser].push(movie.id);
        localStorage.setItem('watchlist', JSON.stringify(allWatch));
        alert(`${movie.title} added to watchlist!`);
        renderWatchlist();
    } else alert("Already in watchlist");
}

function renderWatchlist() {
    if (!watchlistSection || !watchlistCarousel) return;
    const currentUser = localStorage.getItem('currentUser');
    let allWatch = JSON.parse(localStorage.getItem('watchlist')) || {};
    let userWatch = allWatch[currentUser] || [];

    if (userWatch.length === 0) {
        watchlistSection.style.display = "none";
        watchlistCarousel.innerHTML = "";
        return;
    }

    watchlistSection.style.display = "block";
    watchlistCarousel.innerHTML = "";

    userWatch.forEach(async id => {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const movie = await res.json();
        const card = document.createElement('div');
        card.className = "movie-card";
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-overlay">
                <h3>${movie.title}</h3>
                <p>Rating: ${movie.vote_average}</p>
                <button class="remove-watch-btn">Remove</button>
            </div>
        `;
        card.querySelector('.remove-watch-btn').addEventListener('click', () => {
            userWatch = userWatch.filter(mid => mid !== movie.id);
            allWatch[currentUser] = userWatch;
            localStorage.setItem('watchlist', JSON.stringify(allWatch));
            renderWatchlist();
        });
        card.addEventListener('click', () => openModal(movie));
        watchlistCarousel.appendChild(card);
    });
}

// --- CAROUSEL SCROLLING ---
function initCarouselScroll(carouselId) {
    const wrapper = document.querySelector(`#${carouselId}`)?.parentElement;
    const carousel = document.getElementById(carouselId);
    if (!wrapper || !carousel) return;

    const btnLeft = wrapper.querySelector('.carousel-btn.left');
    const btnRight = wrapper.querySelector('.carousel-btn.right');
    const cardWidth = carousel.querySelector('.movie-card')?.offsetWidth + 20 || 300;

    if (btnLeft) btnLeft.addEventListener('click', () => carousel.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' }));
    if (btnRight) btnRight.addEventListener('click', () => carousel.scrollBy({ left: cardWidth * 2, behavior: 'smooth' }));

    // Drag/Swipe support
    let isDown = false, startX, scrollLeft;
    carousel.addEventListener('mousedown', e => { isDown = true; carousel.classList.add('dragging'); startX = e.pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft; });
    carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mouseup', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); carousel.scrollLeft = scrollLeft - (e.pageX - startX) * 2; });
    carousel.addEventListener('touchstart', e => { isDown = true; startX = e.touches[0].pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft; });
    carousel.addEventListener('touchend', () => { isDown = false; });
    carousel.addEventListener('touchmove', e => { if (!isDown) return; carousel.scrollLeft = scrollLeft - (e.touches[0].pageX - startX) * 2; });
}

// --- SEARCH FUNCTIONALITY ---
function goToSearchPage() {
    const query = searchInput.value.trim();
    if (!query) return;
    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', goToSearchPage);
    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') goToSearchPage(); });
}

// --- GENRE FUNCTIONS ---
function renderGenres() {
    if (!genreListContainer) return;
    genreListContainer.innerHTML = "";
    genresList.forEach(genre => {
        const btn = document.createElement('div');
        btn.className = "genre-btn";
        btn.textContent = genre.name;
        btn.addEventListener('click', () => loadGenreMovies(genre));
        genreListContainer.appendChild(btn);
    });
}

async function loadGenreMovies(genre) {
    if (!genreSection || !genreCarousel || !genreTitle) return;

    genreTitle.textContent = genre.name + " Movies";
    genreSection.style.display = "block";
    genreCarousel.innerHTML = "";

    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}&language=en-US&page=1`);
    const data = await res.json();
    renderCarousel(genreCarousel, data.results, "watchlist");
    initCarouselScroll("genre-carousel");
    genreSection.scrollIntoView({ behavior: "smooth" });
}

// --- MODAL BUTTONS ---
if (modalFavBtn) modalFavBtn.addEventListener('click', () => saveFavorite(currentMovie));
if (modalWatchBtn) modalWatchBtn.addEventListener('click', () => saveWatchlist(currentMovie));

// --- INITIALIZATION ---
(async () => {
    if (!popularCarousel) return; // prevents running on search page

    await fetchGenres();
    renderGenres();

    const popular = await fetchMovies("movie/popular");
    const topRated = await fetchMovies("movie/top_rated");
    const trending = await fetchMovies("trending/movie/week");

    renderCarousel(popularCarousel, popular, "watchlist");
    renderCarousel(topratedCarousel, topRated, "watchlist");
    renderCarousel(trendingCarousel, trending, "watchlist");

    initCarouselScroll("popular-carousel");
    initCarouselScroll("toprated-carousel");
    initCarouselScroll("trending-carousel");

    renderFavorites();
    renderWatchlist();
})();

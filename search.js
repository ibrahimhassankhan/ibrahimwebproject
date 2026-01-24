const homeBtn = document.getElementById('home-btn');
homeBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

// Get query from URL
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q') || "";

const API_KEY = "e129c3dc381e5d67c606d5bf217d32f8";
const BASE_URL = "https://api.themoviedb.org/3";

let genresList = [];
let currentMovie = null;

// Modal Elements
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
<div class="modal-content">
  <span id="close-modal">&times;</span>
  <img id="modal-poster" src="" alt="" />
  <div class="modal-info">
    <h2 id="modal-title"></h2>
    <p id="modal-genres"></p>
    <p id="modal-rating"></p>
    <p id="modal-release"></p>
    <p id="modal-overview"></p>
    <button id="modal-favorite-btn">❤ Add to Favorites</button>
    <button id="modal-watchlist-btn">📌 Add to Watchlist</button>
  </div>
</div>`;
document.body.appendChild(modal);

const closeModalBtn = modal.querySelector('#close-modal');
const modalPoster = modal.querySelector('#modal-poster');
const modalTitle = modal.querySelector('#modal-title');
const modalGenres = modal.querySelector('#modal-genres');
const modalRating = modal.querySelector('#modal-rating');
const modalRelease = modal.querySelector('#modal-release');
const modalOverview = modal.querySelector('#modal-overview');
const modalFavBtn = modal.querySelector('#modal-favorite-btn');
const modalWatchBtn = modal.querySelector('#modal-watchlist-btn');

closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target==modal) modal.style.display="none"; }

// Fetch genres
async function fetchGenres() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    genresList = data.genres;
}

// Fetch search results
async function fetchSearchResults(query) {
    if (!query) return [];
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
    const data = await res.json();
    return data.results;
}

// Create movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''}" alt="${movie.title}">
        <div class="movie-overlay">
            <h3>${movie.title}</h3>
            <p>Rating: ${movie.vote_average}</p>
        </div>
    `;
    card.addEventListener('click', () => openModal(movie));
    return card;
}

// Render search results
async function renderSearchResults() {
    await fetchGenres();
    const movies = await fetchSearchResults(query);
    const searchCarousel = document.getElementById('search-carousel');
    searchCarousel.innerHTML = "";

    if (movies.length === 0) {
        searchCarousel.innerHTML = "<p>No results found.</p>";
        return;
    }

    movies.forEach(movie => {
        searchCarousel.appendChild(createMovieCard(movie));
    });
}

// Open Modal
function openModal(movie) {
    currentMovie = movie;
    modal.style.display = "block";
    modalPoster.src = movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "";
    modalTitle.textContent = movie.title;
    modalGenres.textContent = "Genres: " + (movie.genre_ids || []).map(id => genresList.find(g => g.id === id)?.name).filter(Boolean).join(", ");
    modalRating.textContent = "Rating: " + movie.vote_average;
    modalRelease.textContent = "Release: " + movie.release_date;
    modalOverview.textContent = movie.overview || "No description available";
}

// Favorites / Watchlist
function saveFavorite(movie) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser){ alert("Please login first!"); return; }
    let allFavs = JSON.parse(localStorage.getItem('favorites')) || {};
    if(!allFavs[currentUser]) allFavs[currentUser] = [];
    if(!allFavs[currentUser].includes(movie.id)){
        allFavs[currentUser].push(movie.id);
        localStorage.setItem('favorites', JSON.stringify(allFavs));
        alert(`${movie.title} added to favorites!`);
    } else alert("Already in favorites");
}

function saveWatchlist(movie) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser){ alert("Please login first!"); return; }
    let allWatch = JSON.parse(localStorage.getItem('watchlist')) || {};
    if(!allWatch[currentUser]) allWatch[currentUser] = [];
    if(!allWatch[currentUser].includes(movie.id)){
        allWatch[currentUser].push(movie.id);
        localStorage.setItem('watchlist', JSON.stringify(allWatch));
        alert(`${movie.title} added to watchlist!`);
    } else alert("Already in watchlist");
}

modalFavBtn.addEventListener('click', () => saveFavorite(currentMovie));
modalWatchBtn.addEventListener('click', () => saveWatchlist(currentMovie));

// Initialize
renderSearchResults();


import popArtists from './data/pop_artists.js';
import hipHopArtists from './data/hip_hop_artists.js';
import indieArtists from './data/indie_artists.js';
import rbArtists from './data/rb_artists.js';
import rockArtists from './data/rock_artists.js';

const genres = {
  pop: { name: "Pop", data: popArtists },
  hiphop: { name: "Hip Hop", data: hipHopArtists },
  indie: { name: "Indie", data: indieArtists },
  rb: { name: "R&B", data: rbArtists },
  rock: { name: "Rock", data: rockArtists }
};

let currentGenre = 'pop';

function initializeGenreButtons() {
  const filterBox = document.querySelector('.filter-box');
  const genreSelector = document.createElement('div');
  genreSelector.className = 'genre-selector';
  
  Object.entries(genres).forEach(([key, value]) => {
    const btn = document.createElement('button');
    btn.className = `genre-btn ${key === currentGenre ? 'active' : ''}`;
    btn.textContent = value.name;
    btn.onclick = () => switchGenre(key);
    genreSelector.appendChild(btn);
  });
  
  filterBox.insertBefore(genreSelector, filterBox.firstChild);
}

function switchGenre(genre) {
  currentGenre = genre;
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === genres[genre].name);
  });
  showArtists();
}

function displayResults(artists) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  artists.forEach(artist => {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card';
    artistCard.innerHTML = `
      <h3>${artist.name}</h3>
      <div class="artist-details">
        <span><strong>Genre:</strong> ${genres[currentGenre].name}</span>
        <span><strong>Debut:</strong> ${artist.debut} ↕</span>
        <span><strong>Country:</strong> ${artist.country}</span>
        <span><strong>Gender:</strong> ${artist.gender}</span>
        <span><strong>Type:</strong> ${artist.type}</span>
        <span><strong>Popularity:</strong> #${artist.popularity} ↕</span>
      </div>
    `;
    resultsDiv.appendChild(artistCard);
  });
}

function showArtists() {
  const artists = genres[currentGenre].data;
  displayResults(artists);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGenreButtons();
  showArtists();
  
  const backToTopBtn = document.getElementById('backToTop');
  
  window.onscroll = () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      backToTopBtn.classList.add('visible');
      backToTopBtn.classList.remove('fade-out');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  backToTopBtn.onclick = () => {
    backToTopBtn.classList.add('fade-out');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };
});

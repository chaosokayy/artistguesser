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
  searchArtists();
}

function clearFilters() {
  document.getElementById('genderFilter').value = '';
  document.getElementById('typeFilter').value = '';
  document.getElementById('countryFilter').value = '';
  document.getElementById('debutYear').value = '';
  document.getElementById('popularityRank').value = '';
  searchArtists();
}

function searchArtists() {
  const gender = document.getElementById('genderFilter').value.toLowerCase();
  const type = document.getElementById('typeFilter').value.toLowerCase();
  const country = document.getElementById('countryFilter').value.toUpperCase();
  const debutYear = document.getElementById('debutYear').value;
  const popularityRank = document.getElementById('popularityRank').value;

  const artists = genres[currentGenre].data;

  const results = artists.filter(artist => {
    const matchGender = !gender || artist.gender.toLowerCase() === gender;
    const matchType = !type || artist.type.toLowerCase() === type;
    const matchCountry = !country || artist.country === country;
    const matchDebut = !debutYear || Math.abs(artist.debut - debutYear) <= 5;
    const matchPopularity = !popularityRank || Math.abs(artist.popularity - popularityRank) <= 50;

    return matchGender && matchType && matchCountry && matchDebut && matchPopularity;
  });

  displayResults(results);
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (results.length === 0) {
    results = genres.pop;
  }

  const legend = `
    <div class="legend">
      <div class="legend-title">Game Color Guide:</div>
      <div class="legend-item">
        <div class="color-indicator correct"></div>
        <span>Exact Match</span>
      </div>
      <div class="legend-item">
        <div class="color-indicator close"></div>
        <span>Close Match (±5 years for Debut, ±50 for Popularity)</span>
      </div>
      <div class="legend-item">
        <div class="color-indicator incorrect"></div>
        <span>Incorrect</span>
      </div>
      <div class="legend-item">
        <span>↑ means correct answer is higher/more recent</span>
      </div>
      <div class="legend-item">
        <span>↓ means correct answer is lower/less recent</span>
      </div>
    </div>
  `;

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No matching artists found.</p>' + legend;
    return;
  }

  results.forEach(artist => {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card';
    artistCard.innerHTML = `
      <h3>${artist.name}</h3>
      <div class="artist-details">
        <span><strong>Genre:</strong> ${genres[currentGenre].name}</span>
        <span><strong>Debut:</strong> ${artist.debut} ↕</span>
        <span><strong>Gender:</strong> ${artist.gender}</span>
        <span><strong>Type:</strong> ${artist.type}</span>
        <span><strong>Country:</strong> ${artist.country}</span>
        <span><strong>Popularity:</strong> #${artist.popularity} ↕</span>
      </div>
    `;
    resultsDiv.appendChild(artistCard);
  });

  resultsDiv.innerHTML += legend;
}

window.searchArtists = searchArtists;
window.clearFilters = clearFilters;

document.addEventListener('DOMContentLoaded', () => {
  initializeGenreButtons();
  searchArtists();
});

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

function getArtistGenre(artist) {
  const genreEntry = Object.entries(genres).find(([_, genreData]) => 
    genreData.data.some(a => a.name === artist.name)
  );
  return genreEntry ? genres[genreEntry[0]].name : 'Unknown';
}

let guesses = [];
let currentGenre = 'rb';
let allArtists = [...popArtists, ...hipHopArtists, ...indieArtists, ...rbArtists, ...rockArtists];

function initializeGame() {
  document.getElementById('artistInput').addEventListener('keydown', handleEnterKey);
  document.getElementById('guessButton').addEventListener('click', handleGuess);
  document.getElementById('findMatches').addEventListener('click', (e) => {
    const button = e.currentTarget;
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 200);
    findPossibleMatches();
  });

  const refreshButton = document.querySelector('.refresh-button');
  refreshButton.addEventListener('click', () => {
    refreshButton.classList.add('spinning');
    const guessBoxes = document.querySelectorAll('.guess-box');
    const possibleMatches = document.getElementById('possibleMatches');

    guessBoxes.forEach((box, index) => {
      setTimeout(() => {
        box.classList.add('fade-out');
      }, index * 100);
    });

    const inputSection = document.querySelector('.input-section');
    inputSection.classList.add('slide-down');

    setTimeout(() => {
      guesses = [];
      displayGuesses();
      possibleMatches.classList.add('fade-out');
      refreshButton.classList.remove('spinning');

      setTimeout(() => {
        possibleMatches.innerHTML = '';
        possibleMatches.classList.remove('fade-out');
      }, 500);

      setTimeout(() => {
        inputSection.classList.remove('slide-down');
        inputSection.classList.add('slide-up');
        setTimeout(() => inputSection.classList.remove('slide-up'), 500);
      }, 100);
    }, (guessBoxes.length * 100) + 400);
  });
}

function handleEnterKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleGuess();
  }
}

function handleGuess() {
  const input = document.getElementById('artistInput');
  const artistName = input.value.trim();
  if (artistName) {
    const artist = allArtists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
    if (artist) {
      addGuess(artist.name);
      input.value = '';
    }
  }
}

function addGuess(artistName) {
  const artist = allArtists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
  if (!artist) return;

  const artistGenre = Object.entries(genres).find(([_, data]) => 
    data.data.some(a => a.name === artist.name)
  )[0];

  const guess = {
    name: artist.name,
    genre: { value: genres[artistGenre].name, status: 'gray' },
    debut: { value: artist.debut, status: 'gray' },
    popularity: { value: artist.popularity, status: 'gray' },
    members: { value: artist.type, status: 'gray' },
    country: { value: artist.country, status: 'gray' },
    gender: { value: artist.gender, status: 'gray' }
  };

  guesses.unshift(guess);
  displayGuesses();
}

window.cycleStatus = function(attribute, guessIndex) {
  const guess = guesses[guessIndex];
  const currentStatus = guess[attribute].status;

  const canBeYellow = ['debut', 'popularity', 'country'].includes(attribute);

  if (currentStatus === 'gray') {
    guess[attribute].status = 'green';
  } else if (currentStatus === 'green') {
    guess[attribute].status = canBeYellow ? 'yellow' : 'gray';
  } else {
    guess[attribute].status = 'gray';
  }

  displayGuesses();
};

window.toggleDirection = function(attribute, index, direction) {
  if (guesses.length === 0) return;
  const guess = guesses[guesses.length - 1 - index];

  if (guess[attribute].direction === direction) {
    guess[attribute].direction = null;
    guess[attribute].status = 'gray';
  } else {
    guess[attribute].direction = direction;

    if (guess[attribute].status === 'gray') {
      guess[attribute].status = 'gray';
    } else {
      guess[attribute].status = 'yellow';
    }
  }

  displayGuesses();
};

window.toggleAttribute = function(attribute, direction, index = 0) {
  if (guesses.length === 0) return;
  const currentGuess = guesses[index];

  if (direction === 'match') {
    currentGuess[attribute].status = currentGuess[attribute].status === 'green' ? 'gray' : 'green';
  } else {
    currentGuess[attribute].direction = direction;
    currentGuess[attribute].status = 'yellow';
  }

  displayGuesses();
};

function getBestGuess(possibleArtists) {
  if (possibleArtists.length <= 1) return null;

  const debuts = possibleArtists.map(a => a.debut).sort((a, b) => a - b);
  const popularities = possibleArtists.map(a => a.popularity).sort((a, b) => a - b);
  const medianDebut = debuts[Math.floor(debuts.length / 2)];
  const medianPopularity = popularities[Math.floor(popularities.length / 2)];

  let bestArtist = null;
  let bestScore = Infinity;

  possibleArtists.forEach(artist => {
    const debutDiff = Math.abs(artist.debut - medianDebut);
    const popDiff = Math.abs(artist.popularity - medianPopularity);
    const score = debutDiff + popDiff;
    
    if (score < bestScore) {
      bestScore = score;
      bestArtist = artist;
    }
  });

  return bestArtist;
}

function findPossibleMatches() {
  if (guesses.length === 0) return;

  const matchesDiv = document.getElementById('possibleMatches');

  const missingDirections = guesses.some(guess => 
    (guess.debut.status !== 'green' && !guess.debut.direction) || 
    (guess.popularity.status !== 'green' && !guess.popularity.direction)
  );

  if (missingDirections) {
    matchesDiv.innerHTML = `
      <h3>Missing Information</h3>
      <p>Please specify if the correct values for debut year and popularity rank are higher (↑) or lower (↓) than your guesses.</p>
    `;
    return;
  }

  const possibleArtists = allArtists.filter(artist => {
    return guesses.every(guess => {
      let matches = true;

      const isSameContinent = (country1, country2) => {
        const northAmerica = ['US', 'CA', 'MX'];
        const europe = ['GB', 'FR', 'DE', 'IE', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'PT'];
        const oceania = ['AU', 'NZ'];
        const asia = ['JP', 'KR', 'CN', 'TW', 'TH', 'ID', 'MY', 'SG'];
        const southAmerica = ['BR', 'AR', 'CO', 'CL', 'PE', 'VE'];
        const africa = ['ZA', 'NG', 'KE', 'GH', 'EG'];

        const continents = [northAmerica, europe, oceania, asia, southAmerica, africa];
        return continents.some(continent => continent.includes(country1) && continent.includes(country2));
      };

      for (const [key, value] of Object.entries(guess)) {
        if (key === 'name') continue;

        if (value.status === 'gray') {
          if (key === 'country') {
            const sameContinent = isSameContinent(artist[key], value.value);
            matches = matches && !sameContinent;
          } else if (key === 'members' || key === 'gender') {
            matches = matches && artist[key === 'members' ? 'type' : key] !== value.value;
          } else if (key === 'debut') {
            if (value.direction === 'higher') {
              matches = matches && artist[key] > value.value;
            } else if (value.direction === 'lower') {
              matches = matches && artist[key] < value.value - 5;
            }
          } else if (key === 'popularity') {
            if (value.direction === 'higher') {
              matches = matches && artist[key] < value.value;
            } else if (value.direction === 'lower') {
              matches = matches && artist[key] > value.value + 50;
            }
          } else if (key === 'genre') {
            const artistGenreEntry = Object.entries(genres).find(([_, genreData]) => 
              genreData.data.some(a => a.name === artist.name)
            );
            if (artistGenreEntry) {
              matches = matches && genres[artistGenreEntry[0]].name !== value.value;
            }
          }
        } else if (value.status === 'green') {
          if (key === 'genre') {
            const artistGenreEntry = Object.entries(genres).find(([_, genreData]) => 
              genreData.data.some(a => a.name === artist.name)
            );
            if (artistGenreEntry) {
              matches = matches && genres[artistGenreEntry[0]].name === value.value;
            } else {
              matches = false;
            }
          } else if (key === 'members') {
            matches = matches && artist.type === value.value;
          } else {
            matches = matches && artist[key] === value.value;
          }
        } else if (value.direction || value.status === 'yellow') {
          if (key === 'debut') {
            if (value.status === 'green') {
              matches = matches && artist[key] === value.value;
            } else if (value.status === 'yellow') {
              if (value.direction === 'higher') {
                matches = matches && artist[key] > value.value && Math.abs(artist[key] - value.value) <= 5;
              } else if (value.direction === 'lower') {
                matches = matches && artist[key] < value.value && Math.abs(artist[key] - value.value) <= 5;
              } else {
                matches = matches && Math.abs(artist[key] - value.value) <= 5;
              }
            } else if (value.status === 'gray') {
              if (value.direction === 'higher') {
                matches = matches && artist[key] > value.value;
              } else if (value.direction === 'lower') {
                matches = matches && artist[key] < value.value - 5;
              } else {
                matches = matches && Math.abs(artist[key] - value.value) > 5;
              }
            }
          } else if (key === 'popularity') {
            if (value.status === 'green') {
              matches = matches && artist[key] === value.value;
            } else if (value.status === 'yellow') {
              if (value.direction === 'higher') {
                matches = matches && artist[key] < value.value && Math.abs(artist[key] - value.value) <= 50;
              } else if (value.direction === 'lower') {
                matches = matches && artist[key] > value.value && Math.abs(artist[key] - value.value) <= 50;
              } else {
                matches = matches && Math.abs(artist[key] - value.value) <= 50;
              }
            } else if (value.status === 'gray') {
              if (value.direction === 'higher') {
                matches = matches && artist[key] < value.value;
              } else if (value.direction === 'lower') {
                matches = matches && artist[key] > value.value + 50;
              } else {
                matches = matches && Math.abs(artist[key] - value.value) > 50;
              }
            }
          } else if (key === 'country') {
            if (value.status === 'green') {
              matches = matches && artist[key] === value.value;
            } else if (value.status === 'yellow') {
              matches = matches && isSameContinent(artist[key], value.value) && artist[key] !== value.value;
            } else if (value.status === 'gray') {
              matches = matches && !isSameContinent(artist[key], value.value);
            }
          } else if (key === 'members') {
            if (value.status === 'green') {
              matches = matches && artist.type === value.value;
            } else if (value.status === 'gray') {
              matches = false;
            }
          } else if (key === 'gender') {
            if (value.status === 'green') {
              matches = matches && artist.gender === value.value;
            } else if (value.status === 'gray') {
              matches = false;
            }
          } else if (value.direction) {
            if (value.direction === 'higher') {
              matches = matches && artist[key] > value.value;
            } else if (value.direction === 'lower') {
              matches = matches && artist[key] < value.value;
            }
          }
        }
      }

      return matches;
    });
  });

  if (possibleArtists.length === 0) {
    matchesDiv.innerHTML = `<h3>No matches found based on current criteria</h3>`;
  } else {
    const bestGuess = getBestGuess(possibleArtists);
    const bestGuessHtml = bestGuess ? `
      <div class="best-guess">
        <h3>Recommended Guess:</h3>
        <div class="match-card recommended" onclick="addMatchAsGuess('${bestGuess.name}')">
          <div><strong>${bestGuess.name}</strong></div>
          <div>Debut: ${bestGuess.debut}</div>
          <div>Popularity: #${bestGuess.popularity}</div>
          <div>Members: ${bestGuess.type}</div>
          <div>Genre: ${getArtistGenre(bestGuess)}</div>
          <div>Country: ${bestGuess.country}</div>
          <div>Gender: ${bestGuess.gender}</div>
        </div>
      </div>
    ` : '';
    matchesDiv.innerHTML = `
      ${bestGuessHtml}
      <h3>Possible Matches (${possibleArtists.length}):</h3>
      <div class="matches-list">
        ${possibleArtists.map(artist => {
          return `
            <div class="match-card" onclick="addMatchAsGuess('${artist.name}')">
              <div><strong>${artist.name}</strong></div>
              <div>Debut: ${artist.debut}</div>
              <div>Popularity: #${artist.popularity}</div>
              <div>Members: ${artist.type}</div>
              <div>Genre: ${getArtistGenre(artist)}</div>
              <div>Country: ${artist.country}</div>
              <div>Gender: ${artist.gender}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

function displayGuesses() {
  const container = document.getElementById('guessContainer');
  container.innerHTML = guesses.map((guess, index) => `
    <div class="guess-box">
      <div class="guess-number">Guess #${guesses.length - index}</div>
      <div class="artist-name">${guess.name}</div>
      <div class="stats-row">
        <div class="stat-item">Debut</div>
        <div class="stat-item">Popularity</div>
        <div class="stat-item">Members</div>
      </div>
      <div class="values-row">
        <div class="value-box ${guess.debut.status}" onclick="cycleStatus('debut', ${index})">
          ${guess.debut.value}
          <div class="arrow-controls">
            <button class="arrow-btn ${guess.debut.direction === 'higher' ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleDirection('debut', ${guesses.length - 1 - index}, 'higher')">↑</button>
            <button class="arrow-btn ${guess.debut.direction === 'lower' ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleDirection('debut', ${guesses.length - 1 - index}, 'lower')">↓</button>
          </div>
        </div>
        <div class="value-box ${guess.popularity.status}" onclick="cycleStatus('popularity', ${index})">
          #${guess.popularity.value}
          <div class="arrow-controls">
            <button class="arrow-btn ${guess.popularity.direction === 'higher' ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleDirection('popularity', ${guesses.length - 1 - index}, 'higher')">↑</button>
            <button class="arrow-btn ${guess.popularity.direction === 'lower' ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleDirection('popularity', ${guesses.length - 1 - index}, 'lower')">↓</button>
          </div>
        </div>
        <div class="value-box ${guess.members.status}" onclick="cycleStatus('members', ${index})">
          ${guess.members.value}
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-item">Genre</div>
        <div class="stat-item">Country</div>
        <div class="stat-item">Gender</div>
      </div>
      <div class="values-row">
        <div class="value-box ${guess.genre.status}" onclick="cycleStatus('genre', ${index})">
          ${guess.genre.value}
        </div>
        <div class="value-box ${guess.country.status}" onclick="cycleStatus('country', ${index})">
          ${guess.country.value}
        </div>
        <div class="value-box ${guess.gender.status}" onclick="cycleStatus('gender', ${index})">
          ${guess.gender.value}
        </div>
      </div>
    </div>
  `).join('');
}

window.addMatchAsGuess = function(artistName) {
  const input = document.getElementById('artistInput');
  input.value = artistName;
  handleGuess();
  document.getElementById('possibleMatches').innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => {
  initializeGame();

  document.getElementById('artistInput').addEventListener('keydown', handleEnterKey);
  document.getElementById('guessButton').addEventListener('click', handleGuess);

  const observer = new MutationObserver(() => {
    const findMatchesBtn = document.getElementById('findMatches');
    if (findMatchesBtn) {
      findMatchesBtn.addEventListener('click', findPossibleMatches);
    }
  });

  observer.observe(document.getElementById('guessContainer'), { childList: true, subtree: true });
});
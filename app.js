// app.js – Load JSON data and populate the page
// This script assumes the site is served via a local server (e.g., `npx -y serve .`)

// Utility: fetch JSON and handle errors
async function loadJSON(path) {
  // Artificial delay to show off skeletons (remove in production)
  // await new Promise(r => setTimeout(r, 1000)); 

  const response = await fetch(path);
  if (!response.ok) {
    console.error(`Failed to load ${path}:`, response.status);
    return null;
  }
  return response.json();
}

// Skeleton Loader
function showSkeleton(containerId, itemClass, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const skeletons = Array(count).fill(0).map(() => `
    <div class="${itemClass} skeleton skeleton-card"></div>
  `).join('');

  container.innerHTML = skeletons;
}

// Populate Intro Section
async function populateIntro() {
  const containerId = 'intro-content';
  // Intro works a bit differently, custom skeleton or skip

  const data = await loadJSON('data/intro.json');
  if (!data) return;
  const container = document.getElementById(containerId);

  if (data.content && Array.isArray(data.content)) {
    container.innerHTML = data.content.map(block => `
      <div class="intro-block" data-fade>
        <h3>${block.heading}</h3>
        <p>${block.text}</p>
      </div>
    `).join('');
  } else if (data.description) {
    container.innerHTML = `<p>${data.description}</p>`;
  }
}

// Populate Roles Section
async function populateRoles() {
  showSkeleton('roles-content', 'role-card', 4);
  const data = await loadJSON('data/roles.json');
  if (!data) return;
  const container = document.getElementById('roles-content');
  const html = data.roles.map(role => `
    <div class="role-card" data-fade>
      <h3>${role.name}</h3>
      <p>${role.description}</p>
    </div>
  `).join('');
  container.innerHTML = html;
}

// Populate Modes Section
async function populateModes() {
  showSkeleton('modes-content', 'mode-card', 3);
  const data = await loadJSON('data/modes.json');
  if (!data) return;
  const container = document.getElementById('modes-content');
  container.innerHTML = data.modes.map(mode => `
    <div class="mode-card" data-fade>
      <h3>${mode.name}</h3>
      <span class="mode-players">${mode.players}</span>
      <p>${mode.description}</p>
    </div>
  `).join('');
}

// Populate Spells Section
async function populateSpells() {
  showSkeleton('spells-content', 'spell-card', 2);
  const data = await loadJSON('data/spells.json');
  if (!data) return;
  const container = document.getElementById('spells-content');
  container.innerHTML = data.spells.map(spell => `
    <div class="spell-card" data-fade>
      <div class="spell-header">
        <h3>${spell.name}</h3>
        <span class="spell-cd">${spell.cooldown}</span>
      </div>
      <p>${spell.description}</p>
    </div>
  `).join('');
}

// Populate Regions Section
async function populateRegions() {
  showSkeleton('regions-content', 'region-card', 6); // Note: Regions grid structure handled in HTML now? No, JS wrapped.
  // We need to match the structure manually or just let grid handle children
  // The current JS wraps it in .regions-grid div. Let's fix that.

  const data = await loadJSON('data/regions.json');
  if (!data) return;
  const container = document.getElementById('regions-content');

  // Update: Using grid directly in CSS on #regions-content would be better, but let's stick to current logic
  // Just for skeleton, we will overwrite.

  container.innerHTML = `<div class="regions-grid">` + data.regions.map(region => `
    <div class="region-card" data-fade>
      <h3>${region.name}</h3>
      <p>${region.description}</p>
    </div>
  `).join('') + `</div>`;
}

// Favorites Logic
function getFavorites() {
  const saved = localStorage.getItem('lol-favorites');
  return saved ? JSON.parse(saved) : [];
}

function toggleFavorite(name) {
  const favs = getFavorites();
  const index = favs.indexOf(name);
  if (index === -1) {
    favs.push(name);
  } else {
    favs.splice(index, 1);
  }
  localStorage.setItem('lol-favorites', JSON.stringify(favs));
  return index === -1; // returns true if added
}

// Populate Champion Grid with Favorites
async function populateChampions() {
  showSkeleton('champion-grid', 'champion-card', 8);
  const data = await loadJSON('data/champions.json');
  if (!data) return;
  const grid = document.getElementById('champion-grid');

  // Save data globally for filtering
  window.allChampionsData = data.champions;

  renderChampionsGrid(data.champions);
  initFilters(data.champions);
}

function renderChampionsGrid(champions) {
  const grid = document.getElementById('champion-grid');
  const favorites = getFavorites();

  const html = champions.map(champ => {
    const isFav = favorites.includes(champ.name);
    const favClass = isFav ? 'active' : '';
    // Generate fallback helper
    const fallbackImage = `this.onerror=null;this.parentElement.classList.add('no-image');this.style.display='none';`;

    // Check if in comparison
    const isInCompare = comparisonList.includes(champ.name);
    const compareClass = isInCompare ? 'active' : '';

    return `
    <div class="champion-card visible" data-name="${champ.name}">
      <button class="compare-btn ${compareClass}" aria-label="Porovnat" title="Porovnat">
        ⚔️
      </button>
      <button class="fav-btn ${favClass}" aria-label="Přidat k oblíbeným">
        ❤️
      </button>
      <div class="card-image-container">
        <img src="${champ.image}" alt="${champ.name}" onerror="${fallbackImage}">
        <div class="placeholder-icon">${champ.role.charAt(0)}</div>
      </div>
      <div class="champion-info">
        <h3>${champ.name}</h3>
        <p class="champion-title">${champ.title}</p>
        
        <div class="champion-badges">
          <span class="badge" data-type="role">${champ.role}</span>
          <span class="badge" data-type="difficulty">${champ.difficulty} Obtížnost</span>
          <span class="badge" data-type="region">${champ.region}</span>
        </div>

        <p class="champion-desc">${champ.description}</p>
      </div>
    </div>
  `}).join('');

  if (champions.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#888; width:100%; padding: 2rem;">Žádný šampion nenalezen.</p>';
  } else {
    grid.innerHTML = html;
  }

  // Add listeners for Fav and Compare buttons
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't open modal
      const card = btn.closest('.champion-card');
      const name = card.dataset.name;
      const added = toggleFavorite(name);

      if (added) {
        btn.classList.add('active');
        playSound('success'); // if exists or generic
      } else {
        btn.classList.remove('active');
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter;
        if (currentFilter === 'favorites') {
          document.querySelector('.filter-btn.active').click();
        }
      }
    });
  });

  grid.querySelectorAll('.compare-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.champion-card');
      const name = card.dataset.name;
      const image = card.querySelector('img').src;
      toggleCompare(name, image);
    });
  });
}

// Comparator Logic
let comparisonList = []; // stores names
let comparisonImages = {}; // stores name -> url

function toggleCompare(name, image) {
  const index = comparisonList.indexOf(name);

  if (index === -1) {
    if (comparisonList.length >= 2) {
      // Replace the second one (FIFO style or just block? Let's Shift)
      comparisonList.shift();
    }
    comparisonList.push(name);
    comparisonImages[name] = image;
  } else {
    comparisonList.splice(index, 1);
  }

  updateComparatorUI();
  // Re-render grid icons (a bit heavy but safe, or just toggle class)
  // Optimization: just toggle class
  document.querySelectorAll('.champion-card').forEach(card => {
    const btn = card.querySelector('.compare-btn');
    if (card.dataset.name === name) {
      btn.classList.toggle('active', comparisonList.includes(name));
    } else if (comparisonList.includes(card.dataset.name)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateComparatorUI() {
  const widget = document.getElementById('compare-widget');
  const slot1 = document.getElementById('slot-1');
  const slot2 = document.getElementById('slot-2');
  const trigger = document.getElementById('trigger-compare');

  if (comparisonList.length > 0) {
    widget.classList.add('active');
  } else {
    widget.classList.remove('active');
  }

  // Slot 1
  if (comparisonList[0]) {
    slot1.classList.add('filled');
    slot1.innerHTML = `<img src="${comparisonImages[comparisonList[0]]}">`;
  } else {
    slot1.classList.remove('filled');
    slot1.innerHTML = '?';
  }

  // Slot 2
  if (comparisonList[1]) {
    slot2.classList.add('filled');
    slot2.innerHTML = `<img src="${comparisonImages[comparisonList[1]]}">`;
  } else {
    slot2.classList.remove('filled');
    slot2.innerHTML = '?';
  }

  if (comparisonList.length === 2) {
    trigger.classList.add('ready');
    trigger.disabled = false;
  } else {
    trigger.classList.remove('ready');
    trigger.disabled = true;
  }
}

function initComparator() {
  document.getElementById('clear-compare').addEventListener('click', () => {
    comparisonList = [];
    updateComparatorUI();
    window.applyAppFilters(); // Re-render to clear icons
  });

  document.getElementById('trigger-compare').addEventListener('click', () => {
    if (comparisonList.length === 2) {
      openCompareModal(comparisonList[0], comparisonList[1]);
    }
  });

  // Close modal logic for compare-modal is missing in general closing logic
  // Add it here
  const modal = document.getElementById('compare-modal');
  modal.querySelector('.close-btn').addEventListener('click', () => {
    modal.classList.remove('active');
  });
  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

function getStatsByRole(role) {
  // Mock stats based on role for visualization
  // Attack, Defense, Magic, Difficulty (randomized slightly)
  const base = {
    'Bojovník': { atk: 80, def: 60, mag: 20 },
    'Mág': { atk: 30, def: 30, mag: 95 },
    'Zabiják': { atk: 95, def: 20, mag: 40 },
    'Tank': { atk: 40, def: 90, mag: 30 },
    'Podpora': { atk: 20, def: 50, mag: 70 },
    'Střelec': { atk: 90, def: 20, mag: 10 }
  };

  const stats = base[role] || { atk: 50, def: 50, mag: 50 };
  // Add variance
  return {
    atk: Math.min(100, stats.atk + Math.floor(Math.random() * 10)),
    def: Math.min(100, stats.def + Math.floor(Math.random() * 10)),
    mag: Math.min(100, stats.mag + Math.floor(Math.random() * 10))
  };
}

function openCompareModal(name1, name2) {
  const modal = document.getElementById('compare-modal');
  const left = document.getElementById('compare-left');
  const right = document.getElementById('compare-right');

  const champ1 = window.allChampionsData.find(c => c.name === name1);
  const champ2 = window.allChampionsData.find(c => c.name === name2);

  if (!champ1 || !champ2) return;

  const renderSide = (champ) => {
    const stats = getStatsByRole(champ.role);
    return `
            <img src="${champ.image}" class="comp-img">
            <h2 class="comp-name">${champ.name}</h2>
            <p class="comp-title">${champ.title}</p>
            
            <div class="stat-row">
                <span class="stat-label">Útok</span>
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${stats.atk}%"></div></div>
            </div>
            <div class="stat-row">
                <span class="stat-label">Obrana</span>
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${stats.def}%"></div></div>
            </div>
            <div class="stat-row">
                <span class="stat-label">Magie</span>
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${stats.mag}%"></div></div>
            </div>
            
            <div style="margin-top: 1rem; text-align: left;">
                <span class="badge" data-type="role">${champ.role}</span>
                <span class="badge" data-type="difficulty">${champ.difficulty} Obtížnost</span>
            </div>
        `;
  };

  left.innerHTML = renderSide(champ1);
  right.innerHTML = renderSide(champ2);

  modal.classList.add('active');
}



// Filter Logic
let currentRegionFilter = null; // Global state for region

function initFilters(allChampions) {
  const searchInput = document.getElementById('search-input');
  const suggestionsBox = document.getElementById('search-suggestions');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all'; // Role filter
  let currentSearch = '';

  // Expose applyFilters globally or helper
  window.applyAppFilters = () => {
    const favorites = getFavorites();

    const filtered = allChampions.filter(champ => {
      // 1. Role Filter
      let matchesRole = false;
      if (currentFilter === 'all') {
        matchesRole = true;
      } else if (currentFilter === 'favorites') {
        matchesRole = favorites.includes(champ.name);
      } else {
        matchesRole = champ.role === currentFilter;
      }

      // 2. Search Filter
      const matchesSearch = champ.name.toLowerCase().includes(currentSearch);

      // 3. Region Filter
      let matchesRegion = true;
      if (currentRegionFilter) {
        // Handle complex regions like "Piltover & Zaun"
        if (currentRegionFilter.includes('&')) {
          const parts = currentRegionFilter.split('&').map(s => s.trim());
          matchesRegion = parts.includes(champ.region);
        } else {
          matchesRegion = champ.region === currentRegionFilter;
        }
      }

      return matchesRole && matchesSearch && matchesRegion;
    });

    renderChampionsGrid(filtered);

    // Update UI status for region
    const existingStatus = document.getElementById('region-filter-status');
    if (currentRegionFilter) {
      if (!existingStatus) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'region-filter-status';
        statusDiv.className = 'region-status-badge';
        statusDiv.innerHTML = `Region: <strong>${currentRegionFilter}</strong> <span class="clear-region" title="Zrušit filtr">✖</span>`;
        document.querySelector('.filters').prepend(statusDiv);

        statusDiv.querySelector('.clear-region').addEventListener('click', () => {
          currentRegionFilter = null;
          window.applyAppFilters();
        });
      } else {
        existingStatus.innerHTML = `Region: <strong>${currentRegionFilter}</strong> <span class="clear-region" title="Zrušit filtr">✖</span>`;
        existingStatus.querySelector('.clear-region').addEventListener('click', () => {
          currentRegionFilter = null;
          window.applyAppFilters();
        });
      }
    } else {
      if (existingStatus) existingStatus.remove();
    }
  };

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      currentSearch = val;
      window.applyAppFilters();

      // Suggestions Logic
      if (val.length > 0) {
        const matches = allChampions.filter(c => c.name.toLowerCase().startsWith(val)).slice(0, 5);
        if (matches.length > 0) {
          suggestionsBox.innerHTML = matches.map(c => `
                  <div class="suggestion-item" data-name="${c.name}">
                      <img src="${c.image}" class="s-thumb">
                      <span>${c.name}</span>
                  </div>
              `).join('');
          suggestionsBox.classList.add('active');

          // Click on suggestion
          suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
              searchInput.value = item.dataset.name;
              currentSearch = item.dataset.name.toLowerCase();
              window.applyAppFilters();
              suggestionsBox.classList.remove('active');
            });
          });
        } else {
          suggestionsBox.classList.remove('active');
        }
      } else {
        suggestionsBox.classList.remove('active');
      }
    });

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        suggestionsBox.classList.remove('active');
      }
    });
  }

  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentFilter = btn.dataset.filter;
        window.applyAppFilters();
      });
    });
  }
}


// Simple scroll‑fade observer
function initScrollFade() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-fade]').forEach(el => observer.observe(el));
}

// Modal Logic
function initModal() {
  const modal = document.getElementById('champion-modal');
  const closeBtn = document.querySelector('.close-btn');
  const overlay = document.querySelector('.modal-overlay');
  const grid = document.getElementById('champion-grid');

  // Elements to populate
  const modalImg = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalTitle = document.getElementById('modal-title');
  const modalBadges = document.getElementById('modal-badges');
  const modalDesc = document.getElementById('modal-desc');

  // Skin controls
  const prevSkin = document.getElementById('prev-skin');
  const nextSkin = document.getElementById('next-skin');
  const skinLabel = document.getElementById('skin-name');

  let currentSkinIndex = 0;
  let currentChampionName = '';

  function updateSkinImage() {
    let cleanName = currentChampionName.replace(/[' .]/g, '');
    if (cleanName === 'Wukong') cleanName = 'MonkeyKing';

    const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${cleanName}_${currentSkinIndex}.jpg`;

    modalImg.src = url;

    if (skinLabel) {
      if (currentSkinIndex === 0) {
        skinLabel.textContent = 'Základní';
      } else {
        skinLabel.textContent = `Skin ${currentSkinIndex}`;
      }
    }
  }

  // Handle image load error
  modalImg.onerror = () => {
    if (currentSkinIndex > 0) {
      console.log(`Skin ${currentSkinIndex} not found, reverting`);
      currentSkinIndex = 0;
      updateSkinImage();
    }
  };

  // Open Modal
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.champion-card');
    if (!card) return;

    const name = card.querySelector('h3').textContent;
    const title = card.querySelector('.champion-title').textContent;
    const badgesHtml = card.querySelector('.champion-badges').innerHTML;
    const desc = card.querySelector('.champion-desc').textContent;

    currentChampionName = name;
    currentSkinIndex = 0;

    updateSkinImage();

    modalImg.alt = name;
    modalName.textContent = name;
    modalTitle.textContent = title;
    modalBadges.innerHTML = badgesHtml;
    modalDesc.textContent = desc;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Buttons
  if (prevSkin) {
    prevSkin.addEventListener('click', () => {
      if (currentSkinIndex > 0) {
        currentSkinIndex--;
        updateSkinImage();
      }
    });
  }

  if (nextSkin) {
    nextSkin.addEventListener('click', () => {
      currentSkinIndex++;
      updateSkinImage();
    });
  }

  // Close Logic
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { modalImg.src = ''; }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Contact Form Logic
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.submit-btn');
      const originalText = btn.textContent;

      // Simulate loading
      btn.textContent = 'Odesílání...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        // Simulate success
        status.textContent = 'Zpráva úspěšně odeslána! Brzy se ozveme.';
        status.className = 'form-status success';
        form.reset();

        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';

        // Clear status after 5 seconds
        setTimeout(() => {
          status.textContent = '';
          status.className = 'form-status';
        }, 5000);
      }, 1500);
    });
  }
}

// Quiz Logic
async function initQuiz() {
  const container = document.getElementById('quiz-container');
  const startBtn = document.getElementById('start-quiz-btn');
  if (!container || !startBtn) return;

  const quizData = await loadJSON('data/quiz.json');
  if (!quizData) return;

  let currentQuestionIndex = 0;
  let scores = {}; // role -> score

  startBtn.addEventListener('click', () => {
    renderQuestion();
  });

  function renderQuestion() {
    if (currentQuestionIndex >= quizData.questions.length) {
      showResult();
      return;
    }

    const q = quizData.questions[currentQuestionIndex];
    container.innerHTML = `
      <div class="quiz-question" data-fade>
        <h3>${q.text}</h3>
        <div class="quiz-answers">
          ${q.answers.map((ans, idx) => `
            <button class="answer-btn" data-role="${ans.role}">${ans.text}</button>
          `).join('')}
        </div>
      </div>
    `;

    // Add listeners to new buttons
    const item = container.querySelector('.quiz-question');
    // Force fade in
    setTimeout(() => item.classList.add('visible'), 10);

    container.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        scores[role] = (scores[role] || 0) + 1;
        currentQuestionIndex++;
        renderQuestion();
      });
    });
  }

  function showResult() {
    // Determine winner
    let winnerRole = 'Bojovník'; // default
    let maxScore = -1;

    for (const [role, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winnerRole = role;
      }
    }

    container.innerHTML = `
      <div class="quiz-result visible">
        <h3>Jsi předurčen být: ${winnerRole}!</h3>
        <p>Tvé odpovědi naznačují, že role ${winnerRole} je pro tebe jako stvořená.</p>
        <button class="restart-btn" id="restart-quiz">Zkusit znovu</button>
      </div>
    `;

    document.getElementById('restart-quiz').addEventListener('click', () => {
      currentQuestionIndex = 0;
      scores = {};
      renderQuestion();
    });
  }
}

function initRandomChamp() {
  const btn = document.getElementById('random-champ-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!window.allChampionsData || window.allChampionsData.length === 0) return;

    const randomChamp = window.allChampionsData[Math.floor(Math.random() * window.allChampionsData.length)];

    // Open modal directly
    const modal = document.getElementById('champion-modal');
    const modalImg = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalTitle = document.getElementById('modal-title');
    const modalBadges = document.getElementById('modal-badges');
    const modalDesc = document.getElementById('modal-desc');

    modalImg.src = randomChamp.image;
    modalImg.alt = randomChamp.name;
    modalName.textContent = randomChamp.name;
    modalTitle.textContent = randomChamp.title;

    // Construct badges HTML manually since we have raw data
    modalBadges.innerHTML = `
      <span class="badge" data-type="role">${randomChamp.role}</span>
      <span class="badge" data-type="difficulty">${randomChamp.difficulty} Obtížnost</span>
      <span class="badge" data-type="region">${randomChamp.region}</span>
    `;

    modalDesc.textContent = randomChamp.description;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

function initMusicPlayer() {
  const audio = document.getElementById('bg-music');
  const player = document.getElementById('music-player');
  const btn = document.getElementById('play-pause-btn');
  const status = document.querySelector('.music-status');

  if (!audio || !player || !btn) return;

  // Set initial volume low
  audio.volume = 0.3;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        btn.textContent = '⏸';
        player.classList.add('playing');
        status.textContent = 'Hraje se...';
      }).catch(err => {
        console.error("Audio play failed:", err);
        status.textContent = 'Chyba přehrávání';
      });
    } else {
      audio.pause();
      btn.textContent = '▶';
      player.classList.remove('playing');
      status.textContent = 'Pozastaveno';
    }
  });
}

// Inventory Logic
let currentBuild = [null, null, null, null, null, null];

function updateInventoryUI() {
  const slots = document.querySelectorAll('.inv-slot');
  slots.forEach((slot, index) => {
    const item = currentBuild[index];
    slot.innerHTML = '';
    slot.classList.remove('filled');

    if (item) {
      slot.classList.add('filled');
      // We stored the image URL in the array
      const img = document.createElement('img');
      img.src = item;
      slot.appendChild(img);

      // Remove on click
      slot.onclick = () => {
        currentBuild[index] = null;
        updateInventoryUI();
      };
    } else {
      slot.onclick = null;
    }
  });
}

function addToBuild(itemImage) {
  // Find first empty slot
  const emptyIndex = currentBuild.indexOf(null);
  if (emptyIndex !== -1) {
    currentBuild[emptyIndex] = itemImage;
    updateInventoryUI();
  } else {
    // Inventory full feedback
    const inventory = document.querySelector('.inventory-slots');
    inventory.style.animation = 'shake 0.5s';
    setTimeout(() => inventory.style.animation = '', 500);
  }
}

// Populate Items Section
async function populateItems() {
  showSkeleton('items-content', 'item-card', 6);
  const data = await loadJSON('data/items.json');
  if (!data) return;
  const container = document.getElementById('items-content');

  container.innerHTML = data.items.map(item => `
    <div class="item-card" data-fade data-image="${item.image}">
      <div class="item-header">
        <div class="item-icon" style="background-image: url('${item.image}'); background-size: cover;"></div>
        <div class="item-info-header">
            <h3>${item.name}</h3>
            <span class="item-cost">${item.cost}</span>
        </div>
      </div>
      <div class="item-body">
        <div class="item-stats">${item.stats}</div>
        <p class="item-desc">${item.description}</p>
      </div>
      <div class="item-overlay">
         <span>+ Přidat</span>
      </div>
    </div>
  `).join('');

  // Add click listeners
  container.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      addToBuild(card.dataset.image);
    });
  });

  // Clear button logic
  const clearBtn = document.getElementById('clear-build');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentBuild = [null, null, null, null, null, null];
      updateInventoryUI();
    });
  }
}



// Populate Items Section Ends

// UI Sounds using AudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.log("Audio resume failed", e));
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'hover') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

function initSounds() {
  // Add sounds to buttons and cards
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.champion-card') || e.target.closest('.item-card') || e.target.closest('.region-card') || e.target.closest('.inv-slot.filled')) {
      playSound('hover');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.champion-card')) {
      playSound('click');
    }
  });
}

// Initialize everything
async function init() {
  await Promise.all([populateIntro(), populateModes(), populateSpells(), populateItems(), populateRoles(), populateRegions(), populateChampions()]);
  initScrollFade();
  initModal();
  initContactForm();
  initQuiz();
  initRandomChamp();
  initEasterEgg();
  initMusicPlayer();
  initSounds();
  initComparator();
}

// Easter Egg: Konami Code
function initEasterEgg() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let cursor = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === code[cursor]) {
      cursor++;
      if (cursor === code.length) {
        activateUrfMode();
        cursor = 0;
      }
    } else {
      cursor = 0;
    }
  });
}

function activateUrfMode() {
  alert('🚀 URF MODE ACTIVATED! 🚀\nCooldowny zrušeny! (Jen vizuálně)');
  document.body.style.animation = 'rainbow-bg 5s infinite';

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes rainbow-bg {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }
    .champion-card { transform: rotate(1deg) !important; transition: all 0.1s !important; }
    .champion-card:hover { transform: scale(1.2) rotate(-5deg) !important; }
  `;
  document.head.appendChild(style);

  // Speed up all animations
  document.querySelectorAll('*').forEach(el => {
    el.style.transitionDuration = '0.1s';
  });
}

document.addEventListener('DOMContentLoaded', init);

// Back‑to‑top button logic
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  // Click scroll to top
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


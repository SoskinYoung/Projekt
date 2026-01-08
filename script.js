// script.js - Load JSON data and populate the page

// Utility function to create an element with optional class and innerHTML
function createElement(tag, className, html) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

// Load intro section
fetch('data/intro.json')
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById('intro-content');
    if (container) {
      const p = createElement('p', null, data.description);
      container.appendChild(p);
    }
  })
  .catch((err) => console.error('Failed to load intro JSON:', err));

// Load champion catalog
fetch('data/champions.json')
  .then((res) => res.json())
  .then((champions) => {
    const grid = document.getElementById('champion-grid');
    champions.forEach((champ) => {
      const card = createElement('div', 'card');

      const img = createElement('img');
      img.src = champ.image;
      img.alt = champ.name + ' portrait';
      card.appendChild(img);

      const body = createElement('div', 'card-body');
      const title = createElement('h3', null, champ.name);
      const role = createElement('p', null, `<strong>Role:</strong> ${champ.role}`);
      const desc = createElement('p', null, champ.shortDescription);
      body.appendChild(title);
      body.appendChild(role);
      body.appendChild(desc);
      card.appendChild(body);

      // Simple click interaction – show alert with full description
      card.addEventListener('click', () => {
        alert(`${champ.name}\n\n${champ.fullDescription}`);
      });

      grid.appendChild(card);
    });
  })
  .catch((err) => console.error('Failed to load champions JSON:', err));

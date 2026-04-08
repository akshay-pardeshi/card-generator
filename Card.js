// ── Selectors ──
const form       = document.getElementById('cardForm');
const imgUrl     = document.getElementById('imgUrl');
const nameInput  = document.getElementById('nameInput');
const titleInput = document.getElementById('titleInput');
const descInput  = document.getElementById('descInput');
const socialInput= document.getElementById('socialInput');
const themeSelect= document.getElementById('themeSelect');
const main2      = document.getElementById('main2');
const cardBar    = document.getElementById('cardBar');
const cardCount  = document.getElementById('cardCount');
const clearAllBtn= document.getElementById('clearAll');
const darkToggle = document.getElementById('darkToggle');
const toast      = document.getElementById('toast');

// Preview elements
const prevImg    = document.getElementById('prevImg');
const prevName   = document.getElementById('prevName');
const prevTitle  = document.getElementById('prevTitle');
const prevDesc   = document.getElementById('prevDesc');
const prevLink   = document.getElementById('prevLink');
const previewCard= document.getElementById('previewCard');

let cards = JSON.parse(localStorage.getItem('cards') || '[]');
let editingId = null;

// ── Toast helper ──
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Update card count ──
function updateCount() {
  const n = cards.length;
  cardCount.textContent = n === 0 ? 'No cards yet' : `${n} card${n > 1 ? 's' : ''} created`;
}

// ── Render a single card DOM node ──
function buildCardEl(data) {
  const card = document.createElement('div');
  card.className = `card theme-${data.theme}`;
  card.dataset.id = data.id;

  const imgSrc = data.img || avatarUrl(data.name);

  card.innerHTML = `
    <div class="profile">
      <img src="${imgSrc}" alt="${data.name}" onerror="this.src='${avatarUrl(data.name)}'"/>
    </div>
    <div class="card-body">
      <h3>${data.name}</h3>
      <h5>${data.title}</h5>
      <p>${data.desc || ''}</p>
      ${data.social ? `<a class="card-link" href="${data.social}" target="_blank" rel="noopener">View profile</a>` : ''}
    </div>
    <div class="card-actions">
      <button class="btn-download" title="Download card">&#8659; Save</button>
      <button class="btn-delete" title="Delete card">&#10005; Delete</button>
    </div>
  `;

  card.querySelector('.btn-delete').addEventListener('click', () => deleteCard(data.id));
  card.querySelector('.btn-download').addEventListener('click', () => downloadCard(card, data.name));

  return card;
}

// ── Generate avatar URL as fallback ──
function avatarUrl(name) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4c78af&color=fff&size=120`;
}

// ── Render all cards from array ──
function renderAll() {
  main2.innerHTML = '';
  cards.forEach(data => main2.appendChild(buildCardEl(data)));
  updateCount();
}

// ── Save to localStorage ──
function save() {
  localStorage.setItem('cards', JSON.stringify(cards));
}

// ── Delete card ──
function deleteCard(id) {
  cards = cards.filter(c => c.id !== id);
  save();
  renderAll();
  showToast('Card deleted');
}

// ── Download card as image ──
function downloadCard(cardEl, name) {
  if (typeof html2canvas === 'undefined') {
    showToast('html2canvas not loaded — try again');
    return;
  }
  const actions = cardEl.querySelector('.card-actions');
  actions.style.display = 'none';

  html2canvas(cardEl, { scale: 2, useCORS: true }).then(canvas => {
    actions.style.display = '';
    const link = document.createElement('a');
    link.download = `${name.replace(/\s+/g,'_')}_card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Card downloaded!');
  }).catch(() => {
    actions.style.display = '';
    showToast('Could not download card');
  });
}

// ── Validate form ──
function validate() {
  let ok = true;

  if (!nameInput.value.trim()) {
    document.getElementById('nameInput-err').textContent = 'Name is required.';
    ok = false;
  } else {
    document.getElementById('nameInput-err').textContent = '';
  }

  if (!titleInput.value.trim()) {
    document.getElementById('titleInput-err').textContent = 'Title is required.';
    ok = false;
  } else {
    document.getElementById('titleInput-err').textContent = '';
  }

  return ok;
}

// ── Form submit ──
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validate()) return;

  const data = {
    id:     Date.now().toString(),
    img:    imgUrl.value.trim(),
    name:   nameInput.value.trim(),
    title:  titleInput.value.trim(),
    desc:   descInput.value.trim(),
    social: socialInput.value.trim(),
    theme:  themeSelect.value,
  };

  cards.push(data);
  save();
  main2.appendChild(buildCardEl(data));
  updateCount();

  form.reset();
  resetPreview();
  showToast('Card created!');

  document.getElementById('main2').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Live preview ──
function updatePreview() {
  const name  = nameInput.value.trim()  || 'Your Name';
  const title = titleInput.value.trim() || 'Your Title';
  const desc  = descInput.value.trim()  || 'Your bio will appear here…';
  const img   = imgUrl.value.trim();
  const social= socialInput.value.trim();
  const theme = themeSelect.value;

  prevName.textContent  = name;
  prevTitle.textContent = title;
  prevDesc.textContent  = desc;
  prevImg.src = img || avatarUrl(name);
  prevImg.onerror = () => { prevImg.src = avatarUrl(name); };

  if (social) {
    prevLink.href = social;
    prevLink.style.display = 'inline-block';
  } else {
    prevLink.style.display = 'none';
  }

  previewCard.className = `card theme-${theme}`;
}

function resetPreview() {
  prevName.textContent  = 'Your Name';
  prevTitle.textContent = 'Your Title';
  prevDesc.textContent  = 'Your bio will appear here…';
  prevImg.src = avatarUrl('Your Name');
  prevLink.style.display = 'none';
  previewCard.className = 'card theme-default';
}

[imgUrl, nameInput, titleInput, descInput, socialInput].forEach(el => {
  el.addEventListener('input', updatePreview);
});
themeSelect.addEventListener('change', updatePreview);

// ── Clear all ──
clearAllBtn.addEventListener('click', () => {
  if (!cards.length) return;
  if (!confirm('Delete all cards? This cannot be undone.')) return;
  cards = [];
  save();
  renderAll();
  showToast('All cards cleared');
});

// ── Dark mode ──
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll get back to you soon.');
  this.reset();
});

// ── Init ──
renderAll();
updatePreview();
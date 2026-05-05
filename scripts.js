const itemsContainer = document.querySelector('.items');
const itemsInput = document.getElementById('itemsInput');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');

let allItems = [];
let selectedItems = [];

window.addEventListener('DOMContentLoaded', () => {
  fetch('items.json')
    .then(res => res.json())
    .then(data => {
      allItems = data.items;
      populateCategories();
      renderItems(allItems);
      updateHiddenItems();
    })
    .catch(() => {
      itemsContainer.innerHTML = '<p class="empty">Imeshindikana kupakua mizigo. Jaribu tena baadaye.</p>';
    });

  itemsContainer.addEventListener('change', e => {
    if (!e.target.matches('input[type="checkbox"]')) return;
    const itemName = e.target.dataset.name;
    updateSelection(itemName, e.target.checked);
  });

  searchInput.addEventListener('input', filterItems);
  categoryFilter.addEventListener('change', filterItems);
});

function populateCategories() {
  const categories = [...new Set(allItems.map(i => i.category))];

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function renderItems(items) {
  itemsContainer.innerHTML = "";

  if (items.length === 0) {
    itemsContainer.innerHTML = '<p class="empty">Hakuna bidhaa inayolingana na utafutaji wako.</p>';
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('item-card');

    const isChecked = selectedItems.includes(item.name) ? 'checked' : '';

    div.innerHTML = `
      <label>
        <input type="checkbox" data-name="${item.name}" ${isChecked}>
        ${item.name}
      </label>
    `;

    itemsContainer.appendChild(div);
  });
}

function updateSelection(name, checked) {
  if (checked && !selectedItems.includes(name)) {
    selectedItems.push(name);
  } else if (!checked) {
    selectedItems = selectedItems.filter(item => item !== name);
  }

  updateHiddenItems();
}

function updateHiddenItems() {
  itemsInput.value = selectedItems.join(', ');
}

function filterItems() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(search) &&
    (category === 'all' || item.category === category)
  );

  renderItems(filtered);
}

function getLocation() {
  if (!navigator.geolocation) {
    alert('Utaalamu wa eneo haupatikani kwenye kivinjari chako.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const link = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      document.getElementById('pickup').value = link;
    },
    () => {
      alert('Haikuwezekana kupata eneo lako. Jaribu tena kwa baadaye.');
    }
  );
}

const form = document.querySelector('form');

function buildWhatsAppMessage(data) {
  return `Habari, nimefanya ombi la usafirishaji.` +
    `\nJina: ${data.name}` +
    `\nSimu: ${data.phone}` +
    `\nKutoka: ${data.pickup}` +
    `\nKwenda: ${data.destination}` +
    `\nMizigo: ${data.items}` +
    (data.custom ? `\nMizigo mingine: ${data.custom}` : '');
}

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const pickup = form.pickup.value.trim();
  const destination = form.destination.value.trim();
  const items = itemsInput.value.trim();
  const custom = form.custom_items.value.trim();
  const itemSummary = [items, custom].filter(Boolean).join(' | ');

  const formData = {
    name,
    phone,
    pickup,
    destination,
    items: itemSummary || 'Hakuna mizigo maalum',
    custom
  };

  localStorage.setItem('name', formData.name);
  localStorage.setItem('phone', formData.phone);
  localStorage.setItem('pickup', formData.pickup);
  localStorage.setItem('destination', formData.destination);
  localStorage.setItem('items', formData.items);

  const whatsappUrl = `https://wa.me/255679779669?text=${encodeURIComponent(buildWhatsAppMessage(formData))}`;
  window.open(whatsappUrl, '_blank');

  const netlifyForm = new FormData(form);
  fetch('/', {
    method: 'POST',
    body: netlifyForm
  }).catch(() => {
    // ignore failures on non-Netlify hosts
  }).finally(() => {
    window.location.href = 'thank-you.html';
  });
});
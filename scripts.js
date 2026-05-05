const itemsContainer = document.querySelector('.items');
const itemsInput = document.getElementById('itemsInput');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('search');

let allItems = [];
let selectedItems = [];
let activeCategory = 'all';
let searchText = '';

fetch('items.json')
  .then(res => res.json())
  .then(data => {
    allItems = data.items;
    buildCategoryOptions();
    renderItems();
  });

function buildCategoryOptions() {
  const categories = [...new Set(allItems.map(item => item.category))];
  categoryFilter.innerHTML = '<option value="all">Aina zote</option>' +
    categories.map(category => `<option value="${category}">${category}</option>`).join('');
}

categoryFilter.addEventListener('change', e => {
  activeCategory = e.target.value;
  renderItems();
});

searchInput.addEventListener('input', e => {
  searchText = e.target.value.trim().toLowerCase();
  renderItems();
});

function renderItems() {
  itemsContainer.innerHTML = "";

  const filteredItems = allItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText) || item.category.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });

  if (!filteredItems.length) {
    const empty = document.createElement('div');
    empty.classList.add('empty');
    empty.textContent = 'Hakuna mizigo inayolingana. Badilisha aina au tafuta nyingine.';
    itemsContainer.appendChild(empty);
    return;
  }

  const grouped = {};
  filteredItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.keys(grouped).forEach(category => {
    const section = document.createElement('div');
    section.classList.add('category-block', 'collapsed');

    section.innerHTML = `<h3 class="category-title">${category} <span class="toggle-indicator">+</span></h3>`;
    const box = document.createElement('div');
    box.classList.add('category-items');

    grouped[category].forEach(item => {
      const div = document.createElement('div');
      div.classList.add('item-card');

      div.innerHTML = `
        <label>
          <input type="checkbox" data-name="${item.name}" ${selectedItems.some(i => i.startsWith(item.name)) ? 'checked' : ''}>
          <strong>${item.name}</strong><br>
          <small>💰 ${item.price}</small>
        </label>
      `;

      box.appendChild(div);
    });

    section.appendChild(box);
    itemsContainer.appendChild(section);

    const title = section.querySelector('.category-title');
    title.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      const indicator = title.querySelector('.toggle-indicator');
      indicator.textContent = section.classList.contains('collapsed') ? '+' : '–';
    });
  });
}

itemsContainer.addEventListener('change', e => {
  if (!e.target.matches('input[type="checkbox"]')) return;

  const name = e.target.dataset.name;
  const item = allItems.find(i => i.name === name);
  const formatted = `${item.name} (${item.price})`;

  if (e.target.checked) {
    selectedItems.push(formatted);
  } else {
    selectedItems = selectedItems.filter(i => !i.startsWith(name));
  }

  itemsInput.value = selectedItems.join('\n');
});

function getLocation() {
  const pickupInput = document.getElementById('pickup');
  if (!navigator.geolocation) {
    alert('Kisafiri chako hakina support ya location. Tafadhali ingiza mahali kwa mkono.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      pickupInput.value = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
    },
    error => {
      alert(`Tafadhali ruhusu location au ingiza pickup kwa mkono. Error: ${error.message}`);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function buildWhatsAppMessage(data) {
  return `📦 *OMBI LA USAFIRISHAJI*\n\n` +
    `👤 Jina: ${data.name}\n` +
    `📞 Simu: ${data.phone}\n\n` +
    `📍 Kutoka: ${data.pickup}\n` +
    `📍 Kwenda: ${data.destination}\n\n` +
    `📦 Mizigo:\n${data.items}\n\n` +
    (data.custom ? `📝 Zingine: ${data.custom}\n\n` : '') +
    `💰 Bei itathibitishwa.`;
}

const form = document.querySelector('form');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    pickup: form.pickup.value,
    destination: form.destination.value,
    items: itemsInput.value || "Hakuna",
    custom: form.custom_items.value
  };

  localStorage.setItem('data', JSON.stringify(data));

  const url = `https://wa.me/255679779669?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
  window.open(url, '_blank');

  window.location.href = "thank-you.html";
});
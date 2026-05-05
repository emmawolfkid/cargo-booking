const itemsContainer = document.querySelector('.items');
const itemsInput = document.getElementById('itemsInput');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');

let allItems = [];
let selectedItems = [];

fetch('items.json')
  .then(res => res.json())
  .then(data => {
    allItems = data.items;
    populateCategories();
    renderItems(allItems);
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

  items.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('item-card');

    div.innerHTML = `
      <label>
        <input type="checkbox" data-name="${item.name}">
        ${item.name}
      </label>
    `;

    itemsContainer.appendChild(div);
  });

  attachEvents();
}

function attachEvents() {
  document.querySelectorAll('.items input').forEach(cb => {
    cb.addEventListener('change', () => {
      selectedItems = [];
      document.querySelectorAll('.items input').forEach(i => {
        if (i.checked) selectedItems.push(i.dataset.name);
      });

      itemsInput.value = selectedItems.join(', ');
    });
  });
}

searchInput.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);

function filterItems() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(search) &&
    (category === "all" || item.category === category)
  );

  renderItems(filtered);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const link = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      document.getElementById('pickup').value = link;
    });
  }
}

// SUBMIT HANDLER
const form = document.querySelector('form');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = form.name.value;
  const phone = form.phone.value;
  const pickup = form.pickup.value;
  const destination = form.destination.value;
  const items = itemsInput.value;
  const custom = form.custom_items.value;

  localStorage.setItem('name', name);
  localStorage.setItem('phone', phone);
  localStorage.setItem('pickup', pickup);
  localStorage.setItem('destination', destination);
  localStorage.setItem('items', items + " | " + custom);

  fetch('/', {
    method: 'POST',
    body: new FormData(form)
  }).then(() => {
    window.location.href = 'thank-you.html';
  });
});
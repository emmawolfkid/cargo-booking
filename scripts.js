const itemsContainer = document.querySelector('.items');
const totalDisplay = document.getElementById('total');
const totalInput = document.getElementById('totalInput');
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
        <input type="checkbox" value="${item.price}" data-name="${item.name}">
        <span>${item.name}</span>
        <strong>${item.price} TZS</strong>
      </label>
    `;

    itemsContainer.appendChild(div);
  });

  attachEvents();
}

function attachEvents() {
  const checkboxes = document.querySelectorAll('.items input');

  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateTotal);
  });
}

function updateTotal() {
  const checkboxes = document.querySelectorAll('.items input');

  let total = 0;
  selectedItems = [];

  checkboxes.forEach(i => {
    if (i.checked) {
      total += parseInt(i.value);
      selectedItems.push(i.dataset.name);
    }
  });

  totalDisplay.textContent = total;
  totalInput.value = total;
  itemsInput.value = selectedItems.join(', ');
}

searchInput.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);

function filterItems() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = allItems.filter(item => {
    return (
      item.name.toLowerCase().includes(search) &&
      (category === "all" || item.category === category)
    );
  });

  renderItems(filtered);
}

// Save form data to localStorage before submit
const form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', function(e) {
    // Get the current selected items
    const items = itemsInput.value || '';
    const total = totalInput.value || '0';
    const name = document.querySelector('input[name="name"]')?.value || '';
    const phone = document.querySelector('input[name="phone"]')?.value || '';
    const pickup = document.querySelector('input[name="pickup"]')?.value || '';
    const destination = document.querySelector('input[name="destination"]')?.value || '';
    
    // Store in localStorage
    localStorage.setItem('bookingItems', items);
    localStorage.setItem('bookingTotal', total);
    localStorage.setItem('bookingName', name);
    localStorage.setItem('bookingPhone', phone);
    localStorage.setItem('bookingPickup', pickup);
    localStorage.setItem('bookingDestination', destination);
  });
}
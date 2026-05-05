const itemsContainer = document.querySelector('.items');
const itemsInput = document.getElementById('itemsInput');

let allItems = [];
let selectedItems = [];

fetch('items.json')
  .then(res => res.json())
  .then(data => {
    allItems = data.items;
    renderItems();
  });

function renderItems() {
  itemsContainer.innerHTML = "";

  const grouped = {};

  allItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.keys(grouped).forEach(category => {

    const section = document.createElement('div');
    section.classList.add('category-block');

    section.innerHTML = `<h3>${category}</h3>`;
    const box = document.createElement('div');
    box.classList.add('category-items');

    grouped[category].forEach(item => {

      const div = document.createElement('div');
      div.classList.add('item-card');

      div.innerHTML = `
        <label>
          <input type="checkbox" data-name="${item.name}">
          <strong>${item.name}</strong><br>
          <small>💰 ${item.price}</small>
        </label>
      `;

      box.appendChild(div);
    });

    section.appendChild(box);
    itemsContainer.appendChild(section);
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
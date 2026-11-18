const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const chartCanvas = document.getElementById('expenseChart');

let expenseChart; // for Chart instance store

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  const transaction = {
    id: Math.floor(Math.random() * 100000000),
    text: text.value.trim(),
    amount: +amount.value,
    category: category.value
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateChart(); 
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  
  item.innerHTML = `
    <span>${transaction.text} <small>${transaction.category}</small></span>
    <div>
      <span>${sign}Rs.${Math.abs(transaction.amount)}</span>
      <button class="delete-btn">x</button>
    </div>
  `;

  const deleteBtn = item.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => removeTransaction(transaction.id));

  list.appendChild(item);
}

// Update Balance, Income & Expense
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

  balance.innerText = 'Rs.' + total;
  moneyPlus.innerText = '+Rs.' + income;
  moneyMinus.innerText = '-Rs.' + expense;
}

// Update Doughnut Chart
function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  
  // if there is no expense then chart container hide automatically 
  if (expenses.length === 0) {
    chartCanvas.parentElement.style.display = 'none';
    return;
  } else {
    chartCanvas.parentElement.style.display = 'flex';
  }

  // Category-wise total calculate
  const categoryTotals = {};
  expenses.forEach(t => {
    const cat = t.category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#6366f1', 
          '#f43f5e',
          '#10b981', 
          '#f59e0b',
          '#8b5cf6', 
          '#06b6d4' 
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 11,
              weight: '600'
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

// Update local storage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init app
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateChart();
}

init();
form.addEventListener('submit', addTransaction);
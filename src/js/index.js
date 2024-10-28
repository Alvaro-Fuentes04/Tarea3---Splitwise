// Global Variables
let users = [];
let expenses = [];
let balances = {};

// Navigation and display functions
function showPage(pageID) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageID).classList.add('active');

  if (pageID === 'add-expense') updateUserDropdowns();
  if (pageID === 'balances') showBalances();
  if (pageID === 'users') showUsers();
  if (pageID === 'home') showHomeExpenses();
}

// User functions
function showUsers() {
  const userList = document.getElementById('userList');
  userList.innerHTML = users.map(user => `
    <div class="user-card">
      <img src="${user.icon}" alt="${user.name}" class="user-image">
      <span class="user-name">${user.name}</span>
    </div>`).join('');
}

// Show expenses on the home page
function showHomeExpenses() {
  const homeContent = document.querySelector('#home .content');
  if (!homeContent) return;

  const recentExpensesContainer = document.createElement('div');
  recentExpensesContainer.className = 'recent-expenses';
  recentExpensesContainer.innerHTML = `
    <h3 class="section-title">Recent Expenses</h3>
    ${expenses.length === 0 ?
      '<p class="no-expenses">No expenses recorded yet</p>' :
      `<div class="expenses-list">
        ${[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
        const payer = users.find(u => u.name === expense.payer);
        const receiver = users.find(u => u.name === expense.receiver);
        return `
            <div class="expense-card">
              <div class="expense-header">
                <span class="expense-date">${formatDate(expense.date)}</span>
                <span class="expense-amount">${expense.amount.toFixed(2)} €</span>
              </div>
              <div class="expense-users">
                <div class="expense-user">
                  <img src="${payer?.icon}" alt="${expense.payer}" class="user-image-small">
                  <span>${expense.payer}</span>
                </div>
                <i class='bx bx-right-arrow-alt'></i>
                <div class="expense-user">
                  <img src="${receiver?.icon}" alt="${expense.receiver}" class="user-image-small">
                  <span>${expense.receiver}</span>
                </div>
              </div>
            </div>`;
      }).join('')}
      </div>`
    }
  `;

  homeContent.innerHTML = '';
  homeContent.appendChild(recentExpensesContainer);
}

function updateUserDropdowns() {
  const selectors = document.querySelectorAll('select[name="selectUser"]');
  selectors.forEach(selector => {
    selector.innerHTML = '<option value="">Select user</option>' +
      users.map(user => `<option value="${user.name}">${user.name}</option>`).join('');
  });
}

// Handle user form submission
function handleUserFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const genre = document.querySelector('input[name="genre"]:checked')?.value;
  const selectedIcon = document.querySelector('input[name="userIcon"]:checked')?.value;
  const nameRegex = /^[A-Za-z\s]+$/;

  // Validations
  if (!name || !nameRegex.test(name) || !genre || !selectedIcon) {
    alert('Please fill all fields correctly. The username can only contain letters and spaces.');
    return;
  }

  users.push({ name, genre, icon: selectedIcon });
  balances[name] = 0;

  event.target.reset();
  clearIconSelection();
  showPage('users');
}

// Handle expense form submission
function handleExpenseSubmit(event) {
  event.preventDefault();
  const payer = document.getElementById('payerSelect').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const receiver = document.getElementById('receiverSelect').value;

  if (!payer || !amount || !receiver || payer === receiver) {
    alert('Please fill all fields correctly');
    return;
  }

  const newExpense = { payer, amount, receiver, date: new Date().toISOString(), id: Date.now() };
  expenses.push(newExpense);
  updateBalances(payer, receiver, amount);
  event.target.reset();
  showPage('home');
}

// Update balances
function updateBalances(payer, receiver, amount) {
  balances[payer] = (balances[payer] || 0) + amount;
  balances[receiver] = (balances[receiver] || 0) - amount;
}

// Show balances and expense history
function showBalances() {
  const balancesDiv = document.getElementById('balances');
  balancesDiv.innerHTML = `
    <h2>Balances</h2>
    <div class="balances-list">
      ${Object.entries(balances).map(([userName, balance]) => {
    const user = users.find(u => u.name === userName);
    return user ? `
          <div class="balance-card">
            <img src="${user.icon}" alt="${userName}" class="user-image">
            <span class="balance-name">${userName}</span>
            <span class="balance-amount ${balance >= 0 ? 'positive' : 'negative'}">
              ${balance.toFixed(2)} €
            </span>
          </div>` : '';
  }).join('')}
    </div>
    <div class="expense-history">
      <h3>Expense History</h3>
      ${[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
    const payer = users.find(u => u.name === expense.payer);
    const receiver = users.find(u => u.name === expense.receiver);
    return `
          <div class="expense-card">
            <div class="expense-header">
              <span class="expense-date">${formatDate(expense.date)}</span>
              <span class="expense-amount">${expense.amount.toFixed(2)} €</span>
            </div>
            <div class="expense-users">
              <div class="expense-user">
                <img src="${payer?.icon}" alt="${expense.payer}" class="user-image-small">
                <span>${expense.payer}</span>
              </div>
              <i class='bx bx-right-arrow-alt'></i>
              <div class="expense-user">
                <img src="${receiver?.icon}" alt="${expense.receiver}" class="user-image-small">
                <span>${expense.receiver}</span>
              </div>
            </div>
          </div>`;
  }).join('')}
    </div>
  `;
}

// Utilities
function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

function clearIconSelection() {
  document.querySelectorAll('.icon-label').forEach(label => label.classList.remove('selected'));
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  showUsers();
  showHomeExpenses(); // Show home expenses on page load

  // User form
  document.getElementById('myForm').addEventListener('submit', handleUserFormSubmit);
  // Expense form
  document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);

  // Icon selection
  document.querySelectorAll('input[name="userIcon"]').forEach(radio => {
    radio.addEventListener('change', function () {
      clearIconSelection();
      this.nextElementSibling.classList.add('selected');
    });
  });
});

const categorySelect = document.getElementById('form-category-select');
const amountInput = document.getElementById('form-amount-input');
const dateInput = document.getElementById('form-date-input');
const typeSwitch = document.getElementById('form-switch-select');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const modal = document.getElementById('myModal');
const updateForm = document.getElementById('updateForm');
const cancelBtn = document.getElementById('cancel-btn');
const updateBtn = document.getElementById('update-btn');
const formTitle = document.getElementById('form-title');
const formSwitchSelect = document.getElementById('form-switch-select');

const expenseCategories = [
    'Select Category',
    'Bank Fee',
    'Books & Publications',
    'Business Spends',
    'Cash',
    'Commute',
    'Credit Card & Loan',
    'Crypto',
    'Deposits',
    'Education',
    'Entertainment',
    'Family Care',
    'Fashion',
    'Food & Drinks',
    'Gadget',
    'Gift',
    'Groceries',
    'Housing & Bills',
    'Insurance',
    'Miscellaneous',
    'Money Transfer',
    'Personal Care',
    'Pets',
    'Self Transfer',
    'Shopping',
    'Sports & Games',
    'Stocks & Mutual Funds',
    'Tax',
    'Travel & Vacation',
    'Wallet & Payment'
];

const incomeCategories = [
    'Select Category',
    'Borrowed',
    'Dividend',
    'Income',
    'Interest',
    'Investment Withdrawal',
    'Money Transfer',
    'Refund & Rewards',
    'Self Transfer',
    'Settlement',
];

window.addEventListener('load', load);

addBtn.addEventListener('click', openModal);

typeSwitch.addEventListener('change', setCategories);

function setCategories() {
    categorySelect.innerHTML = '';
    const categories = typeSwitch.checked ? expenseCategories : incomeCategories;
    for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }
}

function load() {
    const expenses = JSON.parse(localStorage.getItem("budget-tracker-entries-dev") || "[]");

    for (const expense of expenses) {
        addExpense(expense);
    }

    updateSummary();
}

function addExpense(expense = {}) {
    const newRow = expensesTableBody.insertRow();

    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const typeCell = newRow.insertCell();
    const updateCell = newRow.insertCell();
    const editBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('danger-btn');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('btn');
    editBtn.classList.add('update-btn');
    editBtn.addEventListener('click', handleEditButtonClick);

    deleteBtn.addEventListener('click', event => {
        event.target.closest('tr').remove();
        save();
    });

    categoryCell.textContent = expense.category;
    amountCell.textContent = formatCurrency(expense.amount);
    dateCell.textContent = expense.date;
    typeCell.textContent = expense.type === true ? 'Expense' : 'Income';
    updateCell.appendChild(editBtn);
    updateCell.appendChild(deleteBtn);
}

let currentRow = null;

function handleEditButtonClick(event) {
    const row = event.target.closest('tr');
    categorySelect.value = row.querySelector('td:nth-child(1)').textContent;
    amountInput.value = revertCurrency(row.querySelector('td:nth-child(2)').textContent);
    dateInput.value = row.querySelector('td:nth-child(3)').textContent;
    typeSwitch.checked = row.querySelector('td:nth-child(4)').textContent === 'Expense' ? true : false;

    currentRow = row;
    openModal();
}

function openModal() {
    modal.style.display = 'block';
    formTitle.textContent = currentRow === null ? 'Add Expense' : 'Update Expense';
    updateBtn.textContent = currentRow === null ? 'Add' : 'Update';
    if (currentRow === null) {
        dateInput.max = new Date().toISOString().split("T")[0];
        dateInput.value = new Date().toISOString().split("T")[0];
    }
    setCategories();
}

function closeModal() {
    modal.style.display = 'none';
    updateForm.reset();
    currentRow = null;
}

function handleSubmit(event) {
    event.preventDefault();

    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeSwitch.checked;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return;
    }
    if (date === '') {
        alert('Please select a date')
        return;
    }
    if (category === '' || category === 'Select Category') {
        alert('Please select a category');
        return;
    }

    if (currentRow === null) {
        addExpense({ category, amount, date, type });
    } else {
        currentRow.querySelector('td:nth-child(1)').textContent = category;
        currentRow.querySelector('td:nth-child(2)').textContent = formatCurrency(amount);
        currentRow.querySelector('td:nth-child(3)').textContent = date;
        currentRow.querySelector('td:nth-child(4)').textContent = type === true ? 'Expense' : 'Income';
    }

    save();
    closeModal();
}

cancelBtn.addEventListener('click', closeModal);
updateForm.addEventListener('submit', handleSubmit);

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function save() {
    const data = getEntryRows().map(row => {
        return {
            category: row.querySelector('td:nth-child(1)').textContent,
            amount: revertCurrency(row.querySelector('td:nth-child(2)').textContent),
            date: row.querySelector('td:nth-child(3)').textContent,
            type: row.querySelector('td:nth-child(4)').textContent === 'Expense' ? true : false,
        };
    });

    localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    updateSummary();
}

// Returns an array of all the rows in the expenses table
function getEntryRows() {
    return Array.from(expensesTableBody.children);
}

function formatCurrency(amount) {
    return Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function revertCurrency(amount) {
    return Number(amount.replace(/[^0-9.-]+/g, ""));
}

function updateSummary() {
    const total = getEntryRows().reduce((total, row) => {
        const amount = revertCurrency(row.querySelector('td:nth-child(2)').textContent);
        const type = row.querySelector('td:nth-child(4)').textContent;
        const modifier = type === 'Expense' ? -1 : 1;
        return total + (amount * modifier);
    }, 0);

    totalAmountCell.textContent = formatCurrency(total);
}

let expenses = [];
let selectedCategory = null;

function setCategory(category) {
    selectedCategory = category;
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(button => button.classList.remove('active'));

    const selectedButton = document.getElementById(category);
    selectedButton.classList.add('active');
}

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (description === '' || isNaN(amount) || selectedCategory === null) {
        alert('Please enter a valid description, amount, and select a category.');
        return;
    }

    expenses.push({ description, amount, category: selectedCategory });
    updateExpenses();
    resetForm();
}

function updateExpenses() {
    const expensesList = document.getElementById('expenses-list');
    const totalElement = document.getElementById('total');

    expensesList.innerHTML = '';
    let total = 0;

    expenses.forEach((expense, index) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `<span class="category">${getCategoryIcon(expense.category)} ${expense.category}</span> ${expense.description}: $${expense.amount.toFixed(2)}`;
        expensesList.appendChild(expenseElement);
        total += expense.amount;
    });

    totalElement.textContent = `Total expenses: $${total.toFixed(2)}`;
}

function getCategoryIcon(category) {
    const icons = {
        'Food': '<span class="material-icons">restaurant</span>',
        'Transport': '<span class="material-icons">directions_car</span>',
        'Entertainment': '<span class="material-icons">movie</span>',
        'Utilities': '<span class="material-icons">bolt</span>',
        'Other': '<span class="material-icons">label</span>'
    };
    return icons[category] || '<span class="material-icons">label</span>';
}

function resetForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    selectedCategory = null;
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(button => button.classList.remove('active'));
}

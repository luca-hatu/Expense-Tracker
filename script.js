let expenses = [];

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (description === '' || isNaN(amount)) {
        alert('Please enter a valid description and amount.');
        return;
    }

    expenses.push({ description, amount });
    updateExpenses();
}

function updateExpenses() {
    const expensesList = document.getElementById('expenses-list');
    const totalElement = document.getElementById('total');

    expensesList.innerHTML = '';
    let total = 0;

    expenses.forEach((expense, index) => {
        const expenseElement = document.createElement('div');
        expenseElement.textContent = `${index + 1}. ${expense.description}: $${expense.amount.toFixed(2)}`;
        expensesList.appendChild(expenseElement);
        total += expense.amount;
    });

    totalElement.textContent = `Total expenses: $${total.toFixed(2)}`;
}

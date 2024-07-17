document.addEventListener('DOMContentLoaded', () => {
    let expenses = [];
    let selectedCategory = null;
    
    flatpickr("#date", { dateFormat: "d/m/Y" });

    function setCategory(category) {
        selectedCategory = category;

        const buttons = document.querySelectorAll('.category-button');
        buttons.forEach(button => button.classList.remove('active'));

        const selectedButton = document.querySelector(`.category-button[data-category="${category}"]`);
        selectedButton.classList.add('active');
    }

    function addExpense() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;

        if (description === '' || isNaN(amount) || selectedCategory === null || date === '') {
            alert('Please enter a valid description, amount, date, and select a category.');
            return;
        }

        expenses.push({ description, amount, category: selectedCategory, date });
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
            expenseElement.innerHTML = `
                <div class="left">
                    ${getCategoryIcon(expense.category)}
                    <div>
                        ${expense.description} on ${expense.date}
                    </div>
                </div>
                <div class="amount">
                    $${expense.amount.toFixed(2)}
                </div>
                <div class="action-buttons">
                    <button class="action-button" onclick="editExpense(${index})"><span class="material-icons">edit</span></button>
                    <button class="action-button" onclick="removeExpense(${index})"><span class="material-icons">delete</span></button>
                </div>`;
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

    function editExpense(index) {
        const expense = expenses[index];
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        setCategory(expense.category);
        removeExpense(index);
    }

    function removeExpense(index) {
        expenses.splice(index, 1);
        updateExpenses();
    }

    function resetForm() {
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('date').value = '';
        selectedCategory = null;
        const buttons = document.querySelectorAll('.category-button');
        buttons.forEach(button => button.classList.remove('active'));
    }

    document.getElementById('add-expense').addEventListener('click', addExpense);

    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => setCategory(button.dataset.category));
    });
});

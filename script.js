document.addEventListener('DOMContentLoaded', () => {
    let expenses = [];
    let selectedCategory = null;
    const limits = {
        'Food': 0,
        'Transport': 0,
        'Entertainment': 0,
        'Utilities': 0,
        'Other': 0
    };
    let conversionRates = {};
    let selectedCurrency = 'USD';
    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹'
    };

    flatpickr("#date", { dateFormat: "d/m/Y" });
    flatpickr("#income-date", { dateFormat: "d/m/Y" });

    const ctxCategory = document.getElementById('category-chart').getContext('2d');
    const ctxMonthly = document.getElementById('monthly-expenses-chart').getContext('2d');

    const categoryChart = new Chart(ctxCategory, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#E6E6E6'
                ],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${currencySymbols[selectedCurrency]}${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    const monthlyExpensesChart = new Chart(ctxMonthly, {
        type: 'line',
        data: {
            labels: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            datasets: [{
                label: 'Monthly Expenses',
                data: Array(12).fill(0), 
                backgroundColor: '#FF6384',
                borderColor: '#FF6384',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `Amount (${selectedCurrency})`
                    },
                    beginAtZero: true
                }
            }
        }
    });

    function setCategory(category) {
        selectedCategory = category;

        const buttons = document.querySelectorAll('.category-button');
        buttons.forEach(button => button.classList.remove('active'));

        const selectedButton = document.querySelector(`.category-button[data-category="${category}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    }

    function addExpense() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const isRecurring = document.getElementById('recurring').checked;
        const interval = document.getElementById('recurring-interval').value;

        if (description === '' || isNaN(amount) || selectedCategory === null || date === '') {
            alert('Please enter a valid description, amount, date, and select a category.');
            return;
        }

        const expense = { description, amount, category: selectedCategory, date, isRecurring, interval };
        expenses.push(expense);
        updateExpenses();
        updateBalance();
        updateBudgetProgress();
        resetForm();
    }

    function updateExpenses() {
        const expensesList = document.getElementById('expenses-list');
        const totalElement = document.getElementById('total');

        expensesList.innerHTML = '';
        let totalExpenses = 0;

        const categoryTotals = {};
        const monthlyTotals = Array(12).fill(0); 

        expenses.forEach((expense, index) => {
            const futureExpenses = expense.isRecurring ? calculateRecurringExpenses(expense) : [expense];
            futureExpenses.forEach(fe => {
                const convertedAmount = convertCurrency(fe.amount, 'USD', selectedCurrency);
                const expenseElement = document.createElement('div');
                expenseElement.className = 'expense-item';
                const categoryIcon = getCategoryIcon(fe.category);
                const limitExceeded = (categoryTotals[fe.category] || 0) + convertedAmount > limits[fe.category];
                expenseElement.innerHTML = `
                    <div class="left">
                        ${categoryIcon}
                        <div>
                            ${fe.description} on ${fe.date}
                        </div>
                    </div>
                    <div class="amount">
                        ${currencySymbols[selectedCurrency]}${convertedAmount.toFixed(2)}
                    </div>
                    <div class="action-buttons">
                        <button class="action-button edit-button" data-index="${index}"><span class="fas fa-edit"></span></button>
                        <button class="action-button delete-button" data-index="${index}"><span class="fas fa-trash"></span></button>
                    </div>
                    ${limitExceeded ? '<div class="limit-warning">Limit exceeded!</div>' : ''}`;
                expensesList.appendChild(expenseElement);
                totalExpenses += convertedAmount;

                if (categoryTotals[fe.category]) {
                    categoryTotals[fe.category] += convertedAmount;
                } else {
                    categoryTotals[fe.category] = convertedAmount;
                }

                const expenseDate = new Date(fe.date);
                const monthIndex = expenseDate.getMonth();
                monthlyTotals[monthIndex] += convertedAmount;
            });
        });

        totalElement.textContent = `Total expenses: ${currencySymbols[selectedCurrency]}${totalExpenses.toFixed(2)} (${selectedCurrency})`;

        updateChart(categoryTotals);
        updateMonthlyExpensesChart(monthlyTotals);
    }

    function calculateRecurringExpenses(expense) {
        const futureExpenses = [];
        const interval = expense.interval;
        let nextDate = parseDate(expense.date);

        for (let i = 0; i < 12; i++) {
            if (interval === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (interval === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (interval === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (interval === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }

            const futureExpense = { ...expense, date: formatDate(nextDate) };
            futureExpenses.push(futureExpense);
        }

        return futureExpenses;
    }

    function formatDate(date) {
        return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
    }

    function parseDate(dateStr) {
        const parts = dateStr.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function getCategoryIcon(category) {
        const icons = {
            'Food': '<i class="fas fa-utensils"></i>',
            'Transport': '<i class="fas fa-car"></i>',
            'Entertainment': '<i class="fas fa-film"></i>',
            'Utilities': '<i class="fas fa-plug"></i>',
            'Other': '<i class="fas fa-box"></i>'
        };
        return icons[category] || '<i class="fas fa-question"></i>';
    }

    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const conversionRate = conversionRates[toCurrency];
        return amount * conversionRate;
    }

    function updateBalance() {
        const totalIncome = 0; 
        const totalExpenses = expenses.reduce((acc, expense) => acc + convertCurrency(expense.amount, 'USD', selectedCurrency), 0);
        const balance = totalIncome - totalExpenses;
        document.getElementById('balance').textContent = `Balance: ${currencySymbols[selectedCurrency]}${balance.toFixed(2)} (${selectedCurrency})`;
    }

    function updateBudgetProgress() {
        const budgetProgressDetails = document.getElementById('budget-progress-details');
        budgetProgressDetails.innerHTML = '';
        
        Object.keys(limits).forEach(category => {
            const totalSpent = expenses
                .filter(expense => expense.category === category)
                .reduce((acc, expense) => acc + convertCurrency(expense.amount, 'USD', selectedCurrency), 0);

            const budgetAmount = limits[category];
            const remainingBudget = budgetAmount - totalSpent;
            const progressPercentage = (totalSpent / budgetAmount) * 100;

            const progressElement = document.createElement('div');
            progressElement.className = 'budget-progress-item';
            progressElement.innerHTML = `
                <div class="budget-category">${category}</div>
                <div class="budget-info">
                    <div class="budget-amount">${currencySymbols[selectedCurrency]}${budgetAmount.toFixed(2)}</div>
                    <div class="spent-amount">${currencySymbols[selectedCurrency]}${totalSpent.toFixed(2)}</div>
                    <div class="remaining-amount">${currencySymbols[selectedCurrency]}${remainingBudget.toFixed(2)}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progressPercentage.toFixed(2)}%;"></div>
                </div>
                <div class="progress-percentage">${progressPercentage.toFixed(2)}% spent</div>
            `;
            budgetProgressDetails.appendChild(progressElement);
        });
    }

    function updateChart(categoryTotals) {
        categoryChart.data.labels = Object.keys(categoryTotals);
        categoryChart.data.datasets[0].data = Object.values(categoryTotals);
        categoryChart.update();
    }

    function updateMonthlyExpensesChart(monthlyTotals) {
        monthlyExpensesChart.data.datasets[0].data = monthlyTotals;
        monthlyExpensesChart.update();
    }

    function resetForm() {
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('date').value = '';
        document.getElementById('recurring').checked = false;
        document.getElementById('recurring-interval').value = 'daily';
        document.getElementById('recurring-interval').disabled = true;
        selectedCategory = null;
    }

    document.getElementById('add-expense').addEventListener('click', addExpense);

    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.currentTarget.getAttribute('data-category');
            setCategory(category);
        });
    });

    updateBalance();
    updateBudgetProgress();
});


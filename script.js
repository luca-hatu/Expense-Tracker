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

    const API_KEY = '7d91d66b1af43e385e105788'; 
    const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

    flatpickr("#date", { dateFormat: "d/m/Y" });

    async function fetchConversionRates() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            conversionRates = data.conversion_rates;
            console.log('Conversion rates:', conversionRates);
        } catch (error) {
            console.error('Error fetching conversion rates:', error);
        }
    }

    fetchConversionRates();

    const ctx = document.getElementById('category-chart').getContext('2d');
    const categoryChart = new Chart(ctx, {
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

        const categoryTotals = {};

        expenses.forEach((expense, index) => {
            const convertedAmount = convertCurrency(expense.amount, 'USD', selectedCurrency);
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            const categoryIcon = getCategoryIcon(expense.category);
            const limitExceeded = (categoryTotals[expense.category] || 0) + convertedAmount > limits[expense.category];
            expenseElement.innerHTML = `
                <div class="left">
                    ${categoryIcon}
                    <div>
                        ${expense.description} on ${expense.date}
                    </div>
                </div>
                <div class="amount">
                    ${currencySymbols[selectedCurrency]}${convertedAmount.toFixed(2)}
                </div>
                <div class="action-buttons">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-icons">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-icons">delete</span></button>
                </div>
                ${limitExceeded ? '<div class="limit-warning">Limit exceeded!</div>' : ''}`;
            expensesList.appendChild(expenseElement);
            total += convertedAmount;
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += convertedAmount;
            } else {
                categoryTotals[expense.category] = convertedAmount;
            }
        });

        totalElement.textContent = `Total expenses: ${currencySymbols[selectedCurrency]}${total.toFixed(2)} (${selectedCurrency})`;

        updateChart(categoryTotals);
        attachButtonEventListeners(); 
    }

    function updateChart(categoryTotals) {
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = data;
        categoryChart.update();
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

    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        const rate = conversionRates[toCurrency] || 1;
        return amount * rate;
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

    function attachButtonEventListeners() {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                editExpense(index);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                removeExpense(index);
            });
        });
    }

    function setLimits() {
        limits['Food'] = parseFloat(document.getElementById('food-limit').value) || 0;
        limits['Transport'] = parseFloat(document.getElementById('transport-limit').value) || 0;
        limits['Entertainment'] = parseFloat(document.getElementById('entertainment-limit').value) || 0;
        limits['Utilities'] = parseFloat(document.getElementById('utilities-limit').value) || 0;
        limits['Other'] = parseFloat(document.getElementById('other-limit').value) || 0;

        updateExpenses();
    }

    function setCurrency(currency) {
        selectedCurrency = currency;
        updateExpenses();
    }

    document.getElementById('add-expense').addEventListener('click', addExpense);

    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => setCategory(button.dataset.category));
    });

    document.querySelectorAll('.limit-inputs input').forEach(input => {
        input.addEventListener('change', setLimits);
    });

    document.getElementById('currency-select').addEventListener('change', (event) => {
        setCurrency(event.target.value);
    });
});



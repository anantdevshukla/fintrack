const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 159.0
};

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
};

let state = {
    transactions: [],
    profileName: 'king',
    currency: 'USD',
    theme: 'light'
};

let cashFlowChartInstance = null;

const DEFAULT_TRANSACTIONS = [];

const els = {
    body: document.body,
    navDashboard: document.querySelector('#nav-dashboard'),
    navSettings: document.querySelector('#nav-settings'),
    pageDashboard: document.querySelector('#page-dashboard'),
    pageSettings: document.querySelector('#page-settings'),
    btnOpenModal: document.querySelector('#btn-open-modal'),
    btnCloseModal: document.querySelector('#btn-close-modal'),
    btnCancelTransaction: document.querySelector('#btn-cancel-transaction'),
    transactionModal: document.querySelector('#transaction-modal'),
    transactionForm: document.querySelector('#transaction-form'),
    btnMobileToggle: document.querySelector('#btn-mobile-toggle'),
    sidebar: document.querySelector('.sidebar'),
    displayUsername: document.querySelector('#display-username'),
    btnLogout: document.querySelector('#btn-logout'),
    
    cardBalance: document.querySelector('#card-balance'),
    cardIncome: document.querySelector('#card-income'),
    cardExpense: document.querySelector('#card-expense'),
    cardTotalCount: document.querySelector('#card-total-count'),
    
    searchInput: document.querySelector('#search-input'),
    filterType: document.querySelector('#filter-type'),
    transactionsBody: document.querySelector('#transactions-body'),
    tableEmptyState: document.querySelector('#table-empty-state'),
    
    settingsUsername: document.querySelector('#settings-username'),
    settingsCurrency: document.querySelector('#settings-currency'),
    themeToggle: document.querySelector('#btn-theme-toggle'),
    themeToggleIcon: document.querySelector('#theme-toggle-icon'),
    themeToggleText: document.querySelector('#theme-toggle-text'),
    btnResetData: document.querySelector('#btn-reset-data'),
    
    modalDescription: document.querySelector('#modal-description'),
    modalAmount: document.querySelector('#modal-amount'),
    modalDate: document.querySelector('#modal-date'),
    modalCategory: document.querySelector('#modal-category'),
    errorDescription: document.querySelector('#error-description'),
    errorAmount: document.querySelector('#error-amount'),
    errorDate: document.querySelector('#error-date'),
    errorCategory: document.querySelector('#error-category')
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.auth-container')) {
        initLoginApp();
    } else {
        initDashboardApp();
    }
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

function initDashboardApp() {
    initAppStorage();
    showPage('dashboard');
    loadSettingsIntoUI();
    refreshDashboard();
    setupEventListeners();
}

function refreshDashboard() {
    calculateTotals();
    renderTransactions();
    renderChart();
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function initAppStorage() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        state.theme = storedTheme;
        if (storedTheme === 'dark') {
            els.body.classList.remove('light-theme');
            els.body.classList.add('dark-theme');
        } else {
            els.body.classList.remove('dark-theme');
            els.body.classList.add('light-theme');
        }
    } else {
        localStorage.setItem('theme', 'light');
    }
    updateThemeToggleUI();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        state.profileName = currentUser.fullName || currentUser.username;
        localStorage.setItem('profile', state.profileName);
    } else {
        const storedProfile = localStorage.getItem('profile');
        if (storedProfile) {
            state.profileName = storedProfile;
        } else {
            state.profileName = 'king';
        }
    }
    const storedCurrency = localStorage.getItem('currency');
    
    if (storedCurrency) {
        state.currency = storedCurrency;
    } else {
        localStorage.setItem('currency', 'USD');
    }

    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        state.transactions = JSON.parse(storedTransactions);
        if (state.transactions.some(t => t.id === 't1' || t.description === 'Monthly Salary')) {
            state.transactions = [];
            localStorage.setItem('transactions', JSON.stringify([]));
        }
    } else {
        state.transactions = [...DEFAULT_TRANSACTIONS];
        localStorage.setItem('transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    }
}

function loadSettingsIntoUI() {
    els.displayUsername.textContent = state.profileName;
    els.settingsUsername.value = state.profileName;
    els.settingsCurrency.value = state.currency;
}

function showPage(pageId) {
    if (pageId === 'dashboard') {
        els.navDashboard.classList.add('active');
        els.navSettings.classList.remove('active');
        els.pageDashboard.classList.add('active');
        els.pageSettings.classList.remove('active');
    } else if (pageId === 'settings') {
        els.navDashboard.classList.remove('active');
        els.navSettings.classList.add('active');
        els.pageDashboard.classList.remove('active');
        els.pageSettings.classList.add('active');
    }
    els.sidebar.classList.remove('show');
}

function calculateTotals() {
    let balanceUSD = 0;
    let incomeUSD = 0;
    let expenseUSD = 0;
    
    state.transactions.forEach(t => {
        const val = parseFloat(t.amount);
        if (t.type === 'income') {
            incomeUSD += val;
            balanceUSD += val;
        } else {
            expenseUSD += val;
            balanceUSD -= val;
        }
    });

    els.cardBalance.textContent = formatCurrency(balanceUSD, state.currency);
    els.cardIncome.textContent = formatCurrency(incomeUSD, state.currency);
    els.cardExpense.textContent = formatCurrency(expenseUSD, state.currency);
    els.cardTotalCount.textContent = state.transactions.length;
}

function formatCurrency(amountUSD, targetCurrency) {
    const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
    const amountTarget = amountUSD * rate;
    const formattedAmount = amountTarget.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
    return `${symbol}${formattedAmount}`;
}

function getFilteredTransactions() {
    const searchVal = els.searchInput.value.toLowerCase().trim();
    const typeVal = els.filterType.value;

    return state.transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(searchVal) ||
                            t.category.toLowerCase().includes(searchVal);
        const matchType = (typeVal === 'all') || (t.type === typeVal);
        return matchSearch && matchType;
    });
}

function renderTransactions() {
    const filtered = getFilteredTransactions();
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    els.transactionsBody.innerHTML = '';
    
    if (filtered.length === 0) {
        els.tableEmptyState.classList.remove('hidden');
    } else {
        els.tableEmptyState.classList.add('hidden');
        
        filtered.forEach(t => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-other';
            const cat = t.category.toLowerCase();
            if (cat.includes('food')) badgeClass = 'badge-food';
            else if (cat.includes('shopping')) badgeClass = 'badge-shopping';
            else if (cat.includes('recharge') || cat.includes('bill')) badgeClass = 'badge-bills';
            else if (cat.includes('petrol') || cat.includes('auto')) badgeClass = 'badge-petrol';
            else if (cat.includes('util')) badgeClass = 'badge-utilities';
            else if (cat.includes('salary')) badgeClass = 'badge-salary';
            else if (cat.includes('entertainment')) badgeClass = 'badge-entertainment';
            
            const displayAmt = formatCurrency(t.amount, state.currency);
            const amtCellClass = t.type === 'income' ? 'color-green' : 'color-red';
            const amtPrefix = t.type === 'income' ? '+' : '-';
            
            const dateObj = new Date(t.date);
            const formattedDate = isNaN(dateObj) ? t.date : dateObj.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td style="font-weight: 500;">${escapeHTML(t.description)}</td>
                <td><span class="badge ${badgeClass}">${escapeHTML(t.category)}</span></td>
                <td class="text-right ${amtCellClass}" style="font-weight: 600;">
                    ${amtPrefix}${displayAmt}
                </td>
                <td class="text-center">
                    <button class="btn-delete-trans" data-id="${t.id}" aria-label="Delete transaction ${escapeHTML(t.description)}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            els.transactionsBody.appendChild(tr);
        });
    }
}

function renderChart() {
    if (cashFlowChartInstance) {
        cashFlowChartInstance.destroy();
    }

    const canvas = document.querySelector('#cashFlowChart');
    if (!canvas) return;

    const dateMap = {};
    state.transactions.forEach(t => {
        if (!dateMap[t.date]) {
            dateMap[t.date] = { income: 0, expense: 0 };
        }
        const val = parseFloat(t.amount);
        if (t.type === 'income') {
            dateMap[t.date].income += val;
        } else {
            dateMap[t.date].expense += val;
        }
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    const rate = EXCHANGE_RATES[state.currency] || 1.0;
    const symbol = CURRENCY_SYMBOLS[state.currency] || '$';

    const incomeData = [];
    const expenseData = [];
    const labels = sortedDates.map(d => {
        const dateObj = new Date(d);
        return isNaN(dateObj) ? d : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    sortedDates.forEach(d => {
        incomeData.push((dateMap[d].income * rate).toFixed(2));
        expenseData.push((dateMap[d].expense * rate).toFixed(2));
    });

    const isDark = state.theme === 'dark';
    const gridColor = isDark ? '#222b40' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const ctx = canvas.getContext('2d');
    cashFlowChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    borderSkipped: false
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: isDark ? '#f87171' : '#ef4444',
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            weight: 500,
                            size: 12
                        },
                        boxWidth: 12,
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#0f172a',
                    titleColor: isDark ? '#f8fafc' : '#ffffff',
                    bodyColor: isDark ? '#cbd5e1' : '#e2e8f0',
                    titleFont: { family: "'Inter', sans-serif", weight: 600 },
                    bodyFont: { family: "'Inter', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: gridColor,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += symbol + parseFloat(context.parsed.y).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: { family: "'Inter', sans-serif", size: 11 }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: { family: "'Inter', sans-serif", size: 11 },
                        callback: function(value) {
                            return symbol + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function addTransaction(type, description, amount, date, category) {
    const rate = EXCHANGE_RATES[state.currency] || 1.0;
    const amountUSD = parseFloat(amount) / rate;

    const newTrans = {
        id: 't_' + Date.now(),
        type: type,
        description: description,
        amount: amountUSD,
        date: date,
        category: category
    };

    state.transactions.push(newTrans);
    saveTransactions();
    refreshDashboard();
}

function deleteTransaction(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    const displayAmt = formatCurrency(transaction.amount, state.currency);
    const confirmDelete = confirm(`Are you sure you want to delete "${transaction.description}" (${displayAmt})?`);
    
    if (confirmDelete) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveTransactions();
        refreshDashboard();
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(state.transactions));
}

function saveSettings() {
    const newName = els.settingsUsername.value.trim() || 'king';
    state.profileName = newName;
    localStorage.setItem('profile', newName);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.fullName = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
            users[idx].fullName = newName;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    state.currency = els.settingsCurrency.value;
    localStorage.setItem('currency', state.currency);
    
    loadSettingsIntoUI();
    refreshDashboard();
}

function toggleDarkMode(isDark) {
    if (isDark) {
        state.theme = 'dark';
        els.body.classList.remove('light-theme');
        els.body.classList.add('dark-theme');
    } else {
        state.theme = 'light';
        els.body.classList.remove('dark-theme');
        els.body.classList.add('light-theme');
    }
    localStorage.setItem('theme', state.theme);
    updateThemeToggleUI();
    renderChart();
}

function updateThemeToggleUI() {
    if (!els.themeToggleIcon || !els.themeToggleText) return;
    
    if (state.theme === 'dark') {
        els.themeToggleIcon.setAttribute('data-lucide', 'sun');
        els.themeToggleText.textContent = 'Light Mode';
    } else {
        els.themeToggleIcon.setAttribute('data-lucide', 'moon');
        els.themeToggleText.textContent = 'Dark Mode';
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function resetApplicationData() {
    const verify = confirm("CAUTION: This will delete ALL transactions and reset profile configurations to default. Proceed?");
    if (verify) {
        localStorage.clear();
        state.transactions = [...DEFAULT_TRANSACTIONS];
        state.profileName = 'king';
        state.currency = 'USD';
        state.theme = 'light';
        
        localStorage.setItem('theme', 'light');
        localStorage.setItem('profile', 'king');
        localStorage.setItem('currency', 'USD');
        localStorage.setItem('transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
        
        els.body.classList.remove('dark-theme');
        els.body.classList.add('light-theme');
        updateThemeToggleUI();
        
        loadSettingsIntoUI();
        showPage('dashboard');
        refreshDashboard();
        
        alert("Application data has been successfully reset.");
    }
}

function openTransactionModal() {
    const today = new Date().toISOString().split('T')[0];
    els.modalDate.value = today;
    clearFormValidation();
    els.transactionModal.classList.remove('hidden');
}

function closeTransactionModal() {
    els.transactionModal.classList.add('hidden');
    els.transactionForm.reset();
}

function clearFormValidation() {
    els.modalDescription.classList.remove('is-invalid');
    els.modalAmount.classList.remove('is-invalid');
    els.modalDate.classList.remove('is-invalid');
    els.modalCategory.classList.remove('is-invalid');
    
    els.errorDescription.style.display = 'none';
    els.errorAmount.style.display = 'none';
    els.errorDate.style.display = 'none';
    els.errorCategory.style.display = 'none';
}

function validateAndSaveTransaction(e) {
    e.preventDefault();
    clearFormValidation();
    
    let isValid = true;
    
    const description = els.modalDescription.value.trim();
    const amountStr = els.modalAmount.value.trim();
    const date = els.modalDate.value;
    const category = els.modalCategory.value;
    
    const typeNode = document.querySelector('input[name="transaction-type"]:checked');
    const type = typeNode ? typeNode.value : 'income';

    if (!description) {
        els.modalDescription.classList.add('is-invalid');
        els.errorDescription.style.display = 'block';
        isValid = false;
    }
    
    const amountVal = parseFloat(amountStr);
    if (isNaN(amountVal) || amountVal <= 0) {
        els.modalAmount.classList.add('is-invalid');
        els.errorAmount.style.display = 'block';
        isValid = false;
    }
    
    if (!date) {
        els.modalDate.classList.add('is-invalid');
        els.errorDate.style.display = 'block';
        isValid = false;
    }
    
    if (!category) {
        els.modalCategory.classList.add('is-invalid');
        els.errorCategory.style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        addTransaction(type, description, amountVal, date, category);
        closeTransactionModal();
    }
}

function setupEventListeners() {
    els.navDashboard.addEventListener('click', () => showPage('dashboard'));
    els.navSettings.addEventListener('click', () => showPage('settings'));
    
    els.btnMobileToggle.addEventListener('click', () => {
        els.sidebar.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!els.sidebar.contains(e.target) && !els.btnMobileToggle.contains(e.target) && els.sidebar.classList.contains('show')) {
                els.sidebar.classList.remove('show');
            }
        }
    });

    els.btnOpenModal.addEventListener('click', openTransactionModal);
    els.btnCloseModal.addEventListener('click', closeTransactionModal);
    els.btnCancelTransaction.addEventListener('click', closeTransactionModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !els.transactionModal.classList.contains('hidden')) {
            closeTransactionModal();
        }
    });
    
    els.transactionModal.addEventListener('click', (e) => {
        if (e.target === els.transactionModal) {
            closeTransactionModal();
        }
    });
    
    els.transactionForm.addEventListener('submit', validateAndSaveTransaction);
    
    els.transactionsBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-trans');
        if (deleteBtn) {
            const transId = deleteBtn.getAttribute('data-id');
            if (transId) {
                deleteTransaction(transId);
            }
        }
    });
    
    els.searchInput.addEventListener('input', () => {
        renderTransactions();
    });
    els.filterType.addEventListener('change', () => {
        renderTransactions();
    });

    els.settingsUsername.addEventListener('input', saveSettings);
    els.settingsCurrency.addEventListener('change', saveSettings);
    els.themeToggle.addEventListener('click', () => {
        const isDark = (state.theme === 'light');
        toggleDarkMode(isDark);
    });
    els.btnResetData.addEventListener('click', resetApplicationData);
    
    els.btnLogout.addEventListener('click', () => {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        }
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function initLoginApp() {
    const storedTheme = localStorage.getItem('theme') || 'light';
    if (storedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    setupLoginEventListeners();
}

function setupLoginEventListeners() {
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const linkToRegister = document.querySelector('#link-to-register');
    const linkToLogin = document.querySelector('#link-to-login');
    const loginView = document.querySelector('#login-view');
    const registerView = document.querySelector('#register-view');
    
    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            clearLoginErrors();
            loginView.classList.remove('active');
            registerView.classList.add('active');
        });
    }
    
    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            clearRegisterErrors();
            registerView.classList.remove('active');
            loginView.classList.add('active');
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    clearRegisterErrors();
    
    const usernameInput = document.querySelector('#register-username');
    const passwordInput = document.querySelector('#register-password');
    const confirmInput = document.querySelector('#register-confirm');
    
    const errUser = document.querySelector('#error-register-username');
    const errPass = document.querySelector('#error-register-password');
    const errConf = document.querySelector('#error-register-confirm');
    
    let isValid = true;
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    if (!username) {
        usernameInput.classList.add('is-invalid');
        errUser.textContent = 'Username is required';
        errUser.style.display = 'block';
        isValid = false;
    } else {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) {
            usernameInput.classList.add('is-invalid');
            errUser.textContent = 'Username already taken';
            errUser.style.display = 'block';
            isValid = false;
        }
    }
    
    
    if (!password) {
        passwordInput.classList.add('is-invalid');
        errPass.textContent = 'Password is required';
        errPass.style.display = 'block';
        isValid = false;
    } else if (password.length < 6) {
        passwordInput.classList.add('is-invalid');
        errPass.textContent = 'Min 6 characters required';
        errPass.style.display = 'block';
        isValid = false;
    }
    
    if (!confirmPassword) {
        confirmInput.classList.add('is-invalid');
        errConf.textContent = 'Please confirm password';
        errConf.style.display = 'block';
        isValid = false;
    } else if (password !== confirmPassword) {
        confirmInput.classList.add('is-invalid');
        errConf.textContent = 'Passwords do not match';
        errConf.style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        const btnRegister = document.querySelector('#btn-register');
        const origText = btnRegister.innerHTML;
        btnRegister.disabled = true;
        btnRegister.innerHTML = '<span>Processing...</span>';
        
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const newUser = {
                id: Date.now(),
                fullName: "",
                username,
                email: "",
                password
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            btnRegister.disabled = false;
            btnRegister.innerHTML = origText;
            
            registerForm.reset();
            
            const loginView = document.querySelector('#login-view');
            const registerView = document.querySelector('#register-view');
            registerView.classList.remove('active');
            loginView.classList.add('active');
            
            const loginUserField = document.querySelector('#login-username');
            const loginPassField = document.querySelector('#login-password');
            loginUserField.value = username;
            loginPassField.focus();
            
            const globalError = document.querySelector('#global-login-error');
            globalError.textContent = 'Registration successful! Please login.';
            globalError.style.color = 'var(--success)';
            globalError.style.display = 'block';
        }, 800);
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    clearLoginErrors();
    
    const usernameInput = document.querySelector('#login-username');
    const passwordInput = document.querySelector('#login-password');
    const errUser = document.querySelector('#error-login-username');
    const errPass = document.querySelector('#error-login-password');
    const globalError = document.querySelector('#global-login-error');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    let isValid = true;
    if (!username) {
        usernameInput.classList.add('is-invalid');
        errUser.style.display = 'block';
        isValid = false;
    }
    if (!password) {
        passwordInput.classList.add('is-invalid');
        errPass.style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        const btnLogin = document.querySelector('#btn-login');
        const origText = btnLogin.innerHTML;
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<span>Verifying...</span>';
        
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const matched = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
            
            if (matched) {
                const sessionUser = {
                    id: matched.id,
                    fullName: matched.fullName,
                    username: matched.username,
                    email: matched.email
                };
                localStorage.setItem('currentUser', JSON.stringify(sessionUser));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('profile', matched.fullName || matched.username);
                window.location.href = 'index.html';
            } else {
                btnLogin.disabled = false;
                btnLogin.innerHTML = origText;
                
                globalError.textContent = 'Invalid Username or Password';
                globalError.style.color = 'var(--danger)';
                globalError.style.display = 'block';
                usernameInput.classList.add('is-invalid');
                passwordInput.classList.add('is-invalid');
            }
        }, 800);
    }
}

function clearLoginErrors() {
    const fields = document.querySelectorAll('#login-form .form-control');
    const errors = document.querySelectorAll('#login-form .validation-error');
    const globalError = document.querySelector('#global-login-error');
    
    fields.forEach(f => f.classList.remove('is-invalid'));
    errors.forEach(e => e.style.display = 'none');
    if (globalError) globalError.style.display = 'none';
}

function clearRegisterErrors() {
    const fields = document.querySelectorAll('#register-form .form-control');
    const errors = document.querySelectorAll('#register-form .validation-error');
    
    fields.forEach(f => f.classList.remove('is-invalid'));
    errors.forEach(e => e.style.display = 'none');
}

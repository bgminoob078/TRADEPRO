// Dashboard JavaScript for TradePro MLM

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!TradePro.requireAuth()) {
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    loadUserData();
    setupEventListeners();
    showSection('overview');
});

function initializeDashboard() {
    const user = TradePro.getUser();
    if (!user) return;

    // Update user info in header
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userPackage').textContent = AuthFunctions.packages[user.package]?.name || 'Basic';
    document.getElementById('welcomeName').textContent = user.fullName.split(' ')[0];
}

function loadUserData() {
    const user = TradePro.getUser();
    if (!user) {
        console.error('No user data found');
        return;
    }

    try {
        // Update stats with safe element checking
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Element with id '${id}' not found`);
            }
        };

        updateElement('totalBalance', formatCurrency(user.balance || 0));
        updateElement('totalEarnings', formatCurrency(user.totalEarnings || 0));
        updateElement('directReferrals', user.directReferrals || 0);
        updateElement('teamSize', user.teamSize || 0);
        updateElement('availableBalance', (user.balance || 0).toFixed(2));

        // Update referral link
        const referralLink = user.referralLink || `https://tradepromlm.com/ref/${user.id}`;
        const referralInput = document.getElementById('referralLink');
        if (referralInput) {
            referralInput.value = referralLink;
        }

        // Calculate and display income breakdown
        const earnings = AuthFunctions.calculateEarnings(user.id);
        updateElement('directIncome', formatCurrency(earnings.direct));
        updateElement('levelIncome', formatCurrency(earnings.level));
        updateElement('matchingIncome', formatCurrency(earnings.matching));
        updateElement('leadershipIncome', formatCurrency(earnings.leadership));

        // Load other sections
        loadProfileForm();
        loadTeamTree();
        loadPackages();
        loadTransactions();
        generatePaymentQR();
        
        console.log('User data loaded successfully');
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function setupEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            updatePageTitle(section);
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateUserProfile();
        });
    }

    // Withdraw form submission
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processWithdrawal();
        });
    }
}

function showSection(sectionName) {
    // Hide all sections with smooth transition
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show target section with animation
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        // Force display first, then add active class for animation
        targetSection.style.display = 'block';
        // Small delay to ensure display is applied before animation
        setTimeout(() => {
            targetSection.classList.add('active');
        }, 10);
        
        // Scroll to top of content
        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.scrollTop = 0;
        }
    }
}

function updatePageTitle(section) {
    const titles = {
        overview: 'Dashboard Overview',
        profile: 'Edit Profile',
        team: 'My Team',
        packages: 'Upgrade Package',
        withdraw: 'Withdraw Funds',
        payment: 'Make Payment',
        transactions: 'Transaction History'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
}

function loadProfileForm() {
    const user = TradePro.getUser();
    if (!user) return;

    document.getElementById('profileName').value = user.fullName || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profileMobile').value = user.mobile || '';
    document.getElementById('profilePackage').value = AuthFunctions.packages[user.package]?.name || 'Basic';
}

function updateUserProfile() {
    const formData = new FormData(document.getElementById('profileForm'));
    const updates = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        mobile: formData.get('mobile')
    };

    // Add password if provided
    const newPassword = formData.get('password');
    if (newPassword && newPassword.trim()) {
        updates.password = newPassword;
    }

    if (AuthFunctions.updateProfile(updates)) {
        // Reload user data
        loadUserData();
        initializeDashboard();
    }
}

function loadTeamTree() {
    const user = TradePro.getUser();
    if (!user) return;

    const treeData = AuthFunctions.generateReferralTree(user.id);
    const treeContainer = document.getElementById('teamTree');
    
    if (treeData) {
        treeContainer.innerHTML = renderTreeNode(treeData);
    } else {
        treeContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 3rem; color: var(--text-light); margin-bottom: 15px;"></i>
                <h3>No Team Members Yet</h3>
                <p>Start referring people to build your network!</p>
            </div>
        `;
    }
}

function renderTreeNode(node) {
    const packageColor = AuthFunctions.packages[node.package]?.color || '#6b7280';
    
    let html = `
        <div class="tree-node">
            <div class="node-card" style="background: ${packageColor};">
                <h4>${node.name}</h4>
                <p>${node.email}</p>
                <p>${AuthFunctions.packages[node.package]?.name || 'Basic'}</p>
                <p>Joined: ${formatDate(node.joinDate)}</p>
            </div>
    `;
    
    if (node.children && node.children.length > 0) {
        html += '<div class="tree-children">';
        node.children.forEach(child => {
            html += renderTreeNode(child);
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function loadPackages() {
    const user = TradePro.getUser();
    const currentPackage = user?.package || 'basic';
    const packagesGrid = document.getElementById('packagesGrid');
    
    let html = '';
    
    Object.entries(AuthFunctions.packages).forEach(([key, pkg]) => {
        const isCurrent = key === currentPackage;
        const isUpgrade = AuthFunctions.packages[key].price > AuthFunctions.packages[currentPackage].price;
        
        html += `
            <div class="package-card ${isCurrent ? 'current' : ''}">
                <div class="package-header" style="background: ${pkg.color};">
                    <div class="package-icon">
                        <i class="${pkg.icon}"></i>
                    </div>
                    <div class="package-name">${pkg.name}</div>
                    <div class="package-price">$${pkg.price}</div>
                </div>
                <div class="package-body">
                    <ul class="package-features">
                        ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    ${isCurrent ? 
                        '<button class="btn btn-outline btn-full" disabled>Current Package</button>' :
                        isUpgrade ? 
                            `<button class="btn btn-primary btn-full" onclick="upgradeToPackage('${key}')">
                                <i class="fas fa-arrow-up"></i>
                                Upgrade Now
                            </button>` :
                            '<button class="btn btn-outline btn-full" disabled>Lower Package</button>'
                    }
                </div>
            </div>
        `;
    });
    
    packagesGrid.innerHTML = html;
}

function upgradeToPackage(packageKey) {
    const user = TradePro.getUser();
    const targetPackage = AuthFunctions.packages[packageKey];
    const currentPackage = AuthFunctions.packages[user.package];
    const upgradeCost = targetPackage.price - currentPackage.price;
    
    if (confirm(`Upgrade to ${targetPackage.name} package for $${upgradeCost}?`)) {
        if (AuthFunctions.upgradePackage(packageKey)) {
            loadUserData();
            loadPackages();
        }
    }
}

function processWithdrawal() {
    const formData = new FormData(document.getElementById('withdrawForm'));
    const amount = parseFloat(formData.get('amount'));
    const method = formData.get('method');
    const details = formData.get('details');
    
    if (AuthFunctions.submitWithdrawalRequest(amount, method, details)) {
        document.getElementById('withdrawForm').reset();
        loadUserData();
    }
}

function loadTransactions() {
    const user = TradePro.getUser();
    if (!user) return;

    const transactions = AuthFunctions.generateTransactionHistory(user.id);
    const tableBody = document.getElementById('transactionsTableBody');
    
    let html = '';
    
    transactions.forEach(transaction => {
        const isPositive = ['deposit', 'commission', 'bonus', 'referral'].includes(transaction.type);
        const amountClass = isPositive ? 'amount-positive' : 'amount-negative';
        const amountPrefix = isPositive ? '+' : '-';
        
        html += `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td style="text-transform: capitalize;">${transaction.type}</td>
                <td>${transaction.description}</td>
                <td class="${amountClass}">${amountPrefix}${formatCurrency(Math.abs(transaction.amount))}</td>
                <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function generatePaymentQR() {
    const qrContainer = document.getElementById('adminQRCode');
    const qrData = 'admin_payment_address_or_info';
    
    // Generate a simple QR code placeholder
    qrContainer.innerHTML = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white" stroke="#ddd" stroke-width="2"/>
            <rect x="20" y="20" width="160" height="160" fill="black"/>
            <rect x="30" y="30" width="140" height="140" fill="white"/>
            <rect x="40" y="40" width="120" height="120" fill="black"/>
            <rect x="50" y="50" width="100" height="100" fill="white"/>
            <text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="12" fill="black">ADMIN</text>
            <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="black">PAYMENT</text>
            <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="black">QR CODE</text>
        </svg>
    `;
}

function copyReferralLink() {
    const referralInput = document.getElementById('referralLink');
    copyToClipboard(referralInput.value);
}

// Animation helper for stats - Fixed for better performance
function animateValue(element, start, end, duration = 800) {
    if (start === end || !element) return;
    
    const startTime = performance.now();
    const startValue = parseFloat(start) || 0;
    const endValue = parseFloat(end) || 0;
    const change = endValue - startValue;
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (change * easeOutQuart);
        
        if (element.id && (element.id.includes('Balance') || element.id.includes('Earnings') || element.id.includes('Income'))) {
            element.textContent = formatCurrency(currentValue);
        } else {
            element.textContent = Math.floor(currentValue).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            // Ensure final value is exact
            if (element.id && (element.id.includes('Balance') || element.id.includes('Earnings') || element.id.includes('Income'))) {
                element.textContent = formatCurrency(endValue);
            } else {
                element.textContent = Math.floor(endValue).toLocaleString();
            }
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Initialize animations when overview section becomes visible - Fixed
function initializeStatsAnimation() {
    const overviewSection = document.getElementById('overview-section');
    if (!overviewSection) return;
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'overview-section') {
                const user = TradePro.getUser();
                if (user) {
                    // Shorter delay and faster animations
                    setTimeout(() => {
                        animateValue(document.getElementById('totalBalance'), 0, user.balance || 0, 600);
                        animateValue(document.getElementById('totalEarnings'), 0, user.totalEarnings || 0, 700);
                        animateValue(document.getElementById('directReferrals'), 0, user.directReferrals || 0, 500);
                        animateValue(document.getElementById('teamSize'), 0, user.teamSize || 0, 650);
                    }, 100);
                }
                // Disconnect observer after first animation
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });
    
    observer.observe(overviewSection);
}

// Initialize stats animation when DOM is ready
setTimeout(initializeStatsAnimation, 500);

// Handle window resize for mobile responsiveness
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
        mainContent.classList.remove('sidebar-collapsed');
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !mobileMenuBtn.contains(e.target) && 
        sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
});

// Utility functions specific to dashboard
window.DashboardUtils = {
    refreshData: function() {
        loadUserData();
    },
    
    showSection: showSection,
    
    exportTransactions: function() {
        const user = TradePro.getUser();
        const transactions = AuthFunctions.generateTransactionHistory(user.id);
        
        // Create CSV content
        let csv = 'Date,Type,Description,Amount,Status\n';
        transactions.forEach(tx => {
            csv += `${formatDate(tx.date)},${tx.type},${tx.description},${tx.amount},${tx.status}\n`;
        });
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        showToast('Transactions exported successfully!');
    }
};

console.log('Dashboard initialized successfully!');

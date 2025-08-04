// Authentication JavaScript for TradePro MLM

// Demo users for testing
const demoUsers = [
    {
        id: 'demo_001',
        fullName: 'Demo User',
        email: 'demo@test.com',
        mobile: '+1234567890',
        password: 'demo123',
        referralId: null,
        registrationDate: '2024-01-15T10:30:00.000Z',
        status: 'active',
        package: 'gold',
        balance: 2500.75,
        totalEarnings: 8750.50,
        directReferrals: 12,
        teamSize: 45,
        referralLink: 'https://tradepromlm.com/ref/demo001'
    },
    {
        id: 'demo_002',
        fullName: 'Sarah Johnson',
        email: 'sarah@test.com',
        mobile: '+1234567891',
        password: 'sarah123',
        referralId: 'demo_001',
        registrationDate: '2024-02-20T14:15:00.000Z',
        status: 'active',
        package: 'platinum',
        balance: 5200.25,
        totalEarnings: 15600.75,
        directReferrals: 8,
        teamSize: 28,
        referralLink: 'https://tradepromlm.com/ref/sarah002'
    },
    {
        id: 'demo_003',
        fullName: 'Michael Chen',
        email: 'michael@test.com',
        mobile: '+1234567892',
        password: 'michael123',
        referralId: 'demo_001',
        registrationDate: '2024-03-10T09:45:00.000Z',
        status: 'active',
        package: 'diamond',
        balance: 8750.00,
        totalEarnings: 25400.30,
        directReferrals: 15,
        teamSize: 67,
        referralLink: 'https://tradepromlm.com/ref/michael003'
    }
];

// Initialize demo users in localStorage if not exists
function initializeDemoUsers() {
    const existingUsers = getFromStorage('users') || [];
    
    if (existingUsers.length === 0) {
        saveToStorage('users', demoUsers);
        console.log('Demo users initialized');
    }
}

// Package configurations
const packages = {
    basic: {
        name: 'Basic',
        price: 100,
        features: ['Basic Trading Tools', 'Email Support', '5% Commission'],
        color: '#6b7280',
        icon: 'fas fa-star'
    },
    silver: {
        name: 'Silver',
        price: 500,
        features: ['Advanced Tools', 'Priority Support', '8% Commission', 'Weekly Reports'],
        color: '#9ca3af',
        icon: 'fas fa-medal'
    },
    gold: {
        name: 'Gold',
        price: 1000,
        features: ['Pro Trading Suite', '24/7 Support', '12% Commission', 'Daily Reports', 'Personal Manager'],
        color: '#f59e0b',
        icon: 'fas fa-crown'
    },
    platinum: {
        name: 'Platinum',
        price: 2500,
        features: ['Elite Tools', 'VIP Support', '15% Commission', 'Real-time Analytics', 'Dedicated Manager', 'Exclusive Webinars'],
        color: '#8b5cf6',
        icon: 'fas fa-gem'
    },
    diamond: {
        name: 'Diamond',
        price: 5000,
        features: ['Ultimate Suite', 'White-glove Service', '20% Commission', 'Custom Analytics', 'Personal Advisor', 'Exclusive Events', 'API Access'],
        color: '#06b6d4',
        icon: 'fas fa-diamond'
    }
};

// Income types and calculations
const incomeTypes = {
    direct: {
        name: 'Direct Commission',
        rate: 0.1, // 10%
        description: 'Earn from direct referrals'
    },
    level: {
        name: 'Level Bonus',
        rates: [0.05, 0.03, 0.02, 0.01, 0.01], // 5%, 3%, 2%, 1%, 1% for levels 1-5
        description: 'Earn from your team levels'
    },
    matching: {
        name: 'Matching Bonus',
        rate: 0.02, // 2%
        description: 'Match earnings of your direct referrals'
    },
    leadership: {
        name: 'Leadership Bonus',
        rate: 0.01, // 1%
        description: 'Bonus for team leaders'
    }
};

// Generate referral tree data
function generateReferralTree(userId, depth = 3) {
    const users = getFromStorage('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user || depth <= 0) return null;
    
    const directReferrals = users.filter(u => u.referralId === userId);
    
    return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        package: user.package,
        earnings: user.totalEarnings,
        joinDate: user.registrationDate,
        children: directReferrals.map(ref => generateReferralTree(ref.id, depth - 1)).filter(Boolean)
    };
}

// Calculate user earnings
function calculateEarnings(userId) {
    const users = getFromStorage('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return { direct: 0, level: 0, matching: 0, leadership: 0, total: 0 };
    
    const directReferrals = users.filter(u => u.referralId === userId);
    const packagePrice = packages[user.package]?.price || 0;
    
    // Calculate direct commission
    const directEarnings = directReferrals.reduce((sum, ref) => {
        const refPackagePrice = packages[ref.package]?.price || 0;
        return sum + (refPackagePrice * incomeTypes.direct.rate);
    }, 0);
    
    // Calculate level bonuses (simplified)
    const levelEarnings = directReferrals.length * 50; // Simplified calculation
    
    // Calculate matching bonus
    const matchingEarnings = directEarnings * incomeTypes.matching.rate;
    
    // Calculate leadership bonus
    const leadershipEarnings = user.teamSize > 10 ? user.teamSize * 10 : 0;
    
    const total = directEarnings + levelEarnings + matchingEarnings + leadershipEarnings;
    
    return {
        direct: directEarnings,
        level: levelEarnings,
        matching: matchingEarnings,
        leadership: leadershipEarnings,
        total: total
    };
}

// Generate dummy transaction history
function generateTransactionHistory(userId) {
    const transactions = [];
    const types = ['deposit', 'withdrawal', 'commission', 'bonus', 'referral'];
    const statuses = ['completed', 'pending', 'processing'];
    
    for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = Math.random() * 500 + 10;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        transactions.push({
            id: 'txn_' + Math.random().toString(36).substr(2, 9),
            type: type,
            amount: amount,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            date: date.toISOString(),
            description: getTransactionDescription(type, amount)
        });
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getTransactionDescription(type, amount) {
    const descriptions = {
        deposit: `Deposit of $${amount.toFixed(2)}`,
        withdrawal: `Withdrawal request of $${amount.toFixed(2)}`,
        commission: `Direct commission earned`,
        bonus: `Level bonus received`,
        referral: `Referral bonus from new signup`
    };
    
    return descriptions[type] || 'Transaction';
}

// Withdrawal request handler
function submitWithdrawalRequest(amount, method, details) {
    const user = TradePro.getUser();
    if (!user) return false;
    
    if (amount > user.balance) {
        showToast('Insufficient balance for withdrawal', 'error');
        return false;
    }
    
    const withdrawal = {
        id: 'wd_' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amount: amount,
        method: method,
        details: details,
        status: 'pending',
        requestDate: new Date().toISOString(),
        processDate: null
    };
    
    // Save withdrawal request
    const withdrawals = getFromStorage('withdrawals') || [];
    withdrawals.push(withdrawal);
    saveToStorage('withdrawals', withdrawals);
    
    // Update user balance (in real app, this would be done after approval)
    user.balance -= amount;
    TradePro.setUser(user);
    
    // Update users array
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveToStorage('users', users);
    }
    
    showToast(`Withdrawal request of $${amount.toFixed(2)} submitted successfully!`);
    return true;
}

// Package upgrade handler
function upgradePackage(newPackage) {
    const user = TradePro.getUser();
    if (!user) return false;
    
    const currentPackage = packages[user.package];
    const targetPackage = packages[newPackage];
    
    if (!targetPackage) {
        showToast('Invalid package selected', 'error');
        return false;
    }
    
    if (targetPackage.price <= currentPackage.price) {
        showToast('You can only upgrade to a higher package', 'error');
        return false;
    }
    
    const upgradeCost = targetPackage.price - currentPackage.price;
    
    if (upgradeCost > user.balance) {
        showToast('Insufficient balance for package upgrade', 'error');
        return false;
    }
    
    // Process upgrade
    user.package = newPackage;
    user.balance -= upgradeCost;
    TradePro.setUser(user);
    
    // Update users array
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveToStorage('users', users);
    }
    
    showToast(`Successfully upgraded to ${targetPackage.name} package!`);
    return true;
}

// Profile update handler
function updateProfile(profileData) {
    const user = TradePro.getUser();
    if (!user) return false;
    
    // Update user data
    Object.assign(user, profileData);
    TradePro.setUser(user);
    
    // Update users array
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveToStorage('users', users);
    }
    
    showToast('Profile updated successfully!');
    return true;
}

// Generate QR code data URL (placeholder)
function generateQRCode(text) {
    // In a real application, you would use a QR code library
    // For demo purposes, we'll return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <rect x="10" y="10" width="180" height="180" fill="black"/>
            <rect x="20" y="20" width="160" height="160" fill="white"/>
            <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="black">QR Code</text>
            <text x="100" y="120" text-anchor="middle" dy=".3em" font-family="Arial" font-size="8" fill="black">${text}</text>
        </svg>
    `)}`;
}

// Admin functions
const AdminFunctions = {
    // Get all users
    getAllUsers: function() {
        return getFromStorage('users') || [];
    },
    
    // Get user statistics
    getUserStats: function() {
        const users = this.getAllUsers();
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const totalInvestment = users.reduce((sum, u) => sum + (packages[u.package]?.price || 0), 0);
        
        const packageStats = {};
        Object.keys(packages).forEach(pkg => {
            packageStats[pkg] = users.filter(u => u.package === pkg).length;
        });
        
        return {
            totalUsers,
            activeUsers,
            totalInvestment,
            packageStats
        };
    },
    
    // Get all withdrawal requests
    getWithdrawals: function() {
        return getFromStorage('withdrawals') || [];
    },
    
    // Approve withdrawal
    approveWithdrawal: function(withdrawalId) {
        const withdrawals = this.getWithdrawals();
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        
        if (withdrawal) {
            withdrawal.status = 'approved';
            withdrawal.processDate = new Date().toISOString();
            saveToStorage('withdrawals', withdrawals);
            return true;
        }
        return false;
    },
    
    // Reject withdrawal
    rejectWithdrawal: function(withdrawalId, reason) {
        const withdrawals = this.getWithdrawals();
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        
        if (withdrawal) {
            withdrawal.status = 'rejected';
            withdrawal.processDate = new Date().toISOString();
            withdrawal.rejectReason = reason;
            
            // Refund amount to user
            const users = this.getAllUsers();
            const user = users.find(u => u.id === withdrawal.userId);
            if (user) {
                user.balance += withdrawal.amount;
                const userIndex = users.findIndex(u => u.id === user.id);
                users[userIndex] = user;
                saveToStorage('users', users);
            }
            
            saveToStorage('withdrawals', withdrawals);
            return true;
        }
        return false;
    },
    
    // Add new user
    addUser: function(userData) {
        const users = this.getAllUsers();
        const newUser = {
            id: generateId(),
            ...userData,
            registrationDate: new Date().toISOString(),
            status: 'active',
            balance: 0,
            totalEarnings: 0,
            directReferrals: 0,
            teamSize: 0,
            referralLink: `https://tradepromlm.com/ref/${userData.email.split('@')[0]}`
        };
        
        users.push(newUser);
        saveToStorage('users', users);
        return newUser;
    },
    
    // Update user
    updateUser: function(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            saveToStorage('users', users);
            return users[userIndex];
        }
        return null;
    },
    
    // Delete user
    deleteUser: function(userId) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        saveToStorage('users', filteredUsers);
        return true;
    }
};

// Initialize demo data on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoUsers();
});

// Export functions for global use
window.AuthFunctions = {
    generateReferralTree,
    calculateEarnings,
    generateTransactionHistory,
    submitWithdrawalRequest,
    upgradePackage,
    updateProfile,
    generateQRCode,
    packages,
    incomeTypes
};

window.AdminFunctions = AdminFunctions;

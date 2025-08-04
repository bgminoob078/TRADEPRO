// Admin Panel JavaScript for TradePro MLM

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    initializeAdminPanel();
    loadAdminData();
    setupAdminEventListeners();
    showAdminSection('dashboard');
});

function initializeAdminPanel() {
    // Check if user is admin (simplified check)
    const user = TradePro.getUser();
    if (!user || user.role !== 'admin') {
        // For demo purposes, allow access but show warning
        console.log('Admin access granted for demo purposes');
    }
}

function loadAdminData() {
    loadAdminStats();
    loadPackageDistribution();
    loadRecentActivity();
    loadUsersTable();
    loadWithdrawalsTable();
    loadPackageAnalytics();
    loadUserSelect();
}

function setupAdminEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showAdminSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            updateAdminPageTitle(section);
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

    // Search functionality
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsersTable();
        });
    }

    // Filter functionality
    const packageFilter = document.getElementById('packageFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (packageFilter) {
        packageFilter.addEventListener('change', filterUsersTable);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterUsersTable);
    }

    // Form submissions
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewUser();
        });
    }

    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateUser();
        });
    }
}

function showAdminSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
    }
}

function updateAdminPageTitle(section) {
    const titles = {
        dashboard: 'Admin Dashboard',
        users: 'User Management',
        packages: 'Package Analytics',
        withdrawals: 'Withdrawal Requests',
        referrals: 'Referral Network',
        reports: 'Reports & Analytics'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Admin Panel';
}

function loadAdminStats() {
    const stats = AdminFunctions.getUserStats();
    const withdrawals = AdminFunctions.getWithdrawals();
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('totalInvestment').textContent = formatCurrency(stats.totalInvestment);
    document.getElementById('pendingWithdrawals').textContent = pendingWithdrawals;
}

function loadPackageDistribution() {
    const stats = AdminFunctions.getUserStats();
    const packageStatsContainer = document.getElementById('packageStats');
    
    let html = '';
    Object.entries(stats.packageStats).forEach(([packageKey, count]) => {
        const packageInfo = AuthFunctions.packages[packageKey];
        if (packageInfo) {
            html += `
                <div class="package-stat-item">
                    <span class="package-stat-name">${packageInfo.name}</span>
                    <span class="package-stat-count">${count}</span>
                </div>
            `;
        }
    });
    
    packageStatsContainer.innerHTML = html;
}

function loadRecentActivity() {
    const users = AdminFunctions.getAllUsers();
    const withdrawals = AdminFunctions.getWithdrawals();
    const activityContainer = document.getElementById('recentActivity');
    
    // Generate recent activity (simplified)
    const activities = [];
    
    // Recent user registrations
    users.slice(-5).forEach(user => {
        activities.push({
            type: 'user-joined',
            icon: 'fas fa-user-plus',
            text: `${user.fullName} joined with ${AuthFunctions.packages[user.package]?.name} package`,
            time: user.registrationDate
        });
    });
    
    // Recent withdrawals
    withdrawals.slice(-3).forEach(withdrawal => {
        const user = users.find(u => u.id === withdrawal.userId);
        activities.push({
            type: 'withdrawal',
            icon: 'fas fa-money-bill-wave',
            text: `${user?.fullName || 'User'} requested withdrawal of ${formatCurrency(withdrawal.amount)}`,
            time: withdrawal.requestDate
        });
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    let html = '';
    activities.slice(0, 10).forEach(activity => {
        html += `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${formatDate(activity.time)}</div>
                </div>
            </div>
        `;
    });
    
    activityContainer.innerHTML = html || '<p>No recent activity</p>';
}

function loadUsersTable() {
    const users = AdminFunctions.getAllUsers();
    const tableBody = document.getElementById('usersTableBody');
    
    let html = '';
    users.forEach(user => {
        const packageInfo = AuthFunctions.packages[user.package];
        html += `
            <tr>
                <td>${user.id.substring(0, 8)}...</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                    <span style="color: ${packageInfo?.color || '#6b7280'}; font-weight: 600;">
                        ${packageInfo?.name || 'Basic'}
                    </span>
                </td>
                <td>${formatCurrency(user.balance || 0)}</td>
                <td>${user.directReferrals || 0}</td>
                <td>
                    <span class="status-badge status-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function loadWithdrawalsTable() {
    const withdrawals = AdminFunctions.getWithdrawals();
    const users = AdminFunctions.getAllUsers();
    const tableBody = document.getElementById('withdrawalsTableBody');
    
    let html = '';
    withdrawals.forEach(withdrawal => {
        const user = users.find(u => u.id === withdrawal.userId);
        html += `
            <tr>
                <td>${withdrawal.id.substring(0, 8)}...</td>
                <td>${user?.fullName || 'Unknown User'}</td>
                <td>${formatCurrency(withdrawal.amount)}</td>
                <td style="text-transform: capitalize;">${withdrawal.method}</td>
                <td>${formatDate(withdrawal.requestDate)}</td>
                <td>
                    <span class="status-badge status-${withdrawal.status}">
                        ${withdrawal.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${withdrawal.status === 'pending' ? `
                            <button class="action-btn approve" onclick="approveWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-check"></i>
                                Approve
                            </button>
                            <button class="action-btn reject" onclick="rejectWithdrawal('${withdrawal.id}')">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        ` : `
                            <span style="color: var(--text-light); font-size: 0.8rem;">
                                ${withdrawal.status === 'approved' ? 'Processed' : 'Rejected'}
                            </span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html || '<tr><td colspan="7" style="text-align: center; color: var(--text-light);">No withdrawal requests</td></tr>';
}

function loadPackageAnalytics() {
    const stats = AdminFunctions.getUserStats();
    const analyticsContainer = document.getElementById('packageAnalytics');
    
    let html = '';
    Object.entries(AuthFunctions.packages).forEach(([packageKey, packageInfo]) => {
        const userCount = stats.packageStats[packageKey] || 0;
        const revenue = userCount * packageInfo.price;
        const percentage = stats.totalUsers > 0 ? ((userCount / stats.totalUsers) * 100).toFixed(1) : 0;
        
        html += `
            <div class="package-analytics-card">
                <h4 style="color: ${packageInfo.color};">
                    <i class="${packageInfo.icon}"></i>
                    ${packageInfo.name}
                </h4>
                <div class="package-users-count" style="color: ${packageInfo.color};">
                    ${userCount}
                </div>
                <div class="package-revenue">
                    ${formatCurrency(revenue)}
                </div>
                <div class="package-percentage">
                    ${percentage}% of total users
                </div>
            </div>
        `;
    });
    
    analyticsContainer.innerHTML = html;
}

function loadUserSelect() {
    const users = AdminFunctions.getAllUsers();
    const userSelect = document.getElementById('userSelect');
    
    if (userSelect) {
        let html = '<option value="">Select a user to view their referral tree</option>';
        users.forEach(user => {
            html += `<option value="${user.id}">${user.fullName} (${user.email})</option>`;
        });
        userSelect.innerHTML = html;
    }
}

function filterUsersTable() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const packageFilter = document.getElementById('packageFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    const users = AdminFunctions.getAllUsers();
    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchesPackage = !packageFilter || user.package === packageFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        
        return matchesSearch && matchesPackage && matchesStatus;
    });
    
    // Re-render table with filtered users
    const tableBody = document.getElementById('usersTableBody');
    let html = '';
    filteredUsers.forEach(user => {
        const packageInfo = AuthFunctions.packages[user.package];
        html += `
            <tr>
                <td>${user.id.substring(0, 8)}...</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                    <span style="color: ${packageInfo?.color || '#6b7280'}; font-weight: 600;">
                        ${packageInfo?.name || 'Basic'}
                    </span>
                </td>
                <td>${formatCurrency(user.balance || 0)}</td>
                <td>${user.directReferrals || 0}</td>
                <td>
                    <span class="status-badge status-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html || '<tr><td colspan="8" style="text-align: center; color: var(--text-light);">No users found</td></tr>';
}

// Modal functions
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function addNewUser() {
    const formData = new FormData(document.getElementById('addUserForm'));
    const userData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        package: formData.get('package'),
        password: formData.get('password')
    };
    
    // Check if email already exists
    const users = AdminFunctions.getAllUsers();
    if (users.find(user => user.email === userData.email)) {
        showToast('Email already exists!', 'error');
        return;
    }
    
    const newUser = AdminFunctions.addUser(userData);
    if (newUser) {
        showToast('User added successfully!');
        closeAddUserModal();
        loadAdminData();
    }
}

function editUser(userId) {
    const users = AdminFunctions.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
        // Populate edit form
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.fullName;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserMobile').value = user.mobile;
        document.getElementById('editUserPackage').value = user.package;
        document.getElementById('editUserBalance').value = user.balance || 0;
        document.getElementById('editUserStatus').value = user.status || 'active';
        
        // Show modal
        document.getElementById('editUserModal').style.display = 'flex';
    }
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

function updateUser() {
    const formData = new FormData(document.getElementById('editUserForm'));
    const userId = formData.get('userId');
    const updates = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        package: formData.get('package'),
        balance: parseFloat(formData.get('balance')) || 0,
        status: formData.get('status')
    };
    
    const updatedUser = AdminFunctions.updateUser(userId, updates);
    if (updatedUser) {
        showToast('User updated successfully!');
        closeEditUserModal();
        loadAdminData();
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        if (AdminFunctions.deleteUser(userId)) {
            showToast('User deleted successfully!');
            loadAdminData();
        }
    }
}

function approveWithdrawal(withdrawalId) {
    if (confirm('Approve this withdrawal request?')) {
        if (AdminFunctions.approveWithdrawal(withdrawalId)) {
            showToast('Withdrawal approved successfully!');
            loadWithdrawalsTable();
            loadAdminStats();
        }
    }
}

function rejectWithdrawal(withdrawalId) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
        if (AdminFunctions.rejectWithdrawal(withdrawalId, reason)) {
            showToast('Withdrawal rejected successfully!');
            loadWithdrawalsTable();
            loadAdminStats();
        }
    }
}

function loadUserReferralTree() {
    const userSelect = document.getElementById('userSelect');
    const selectedUserId = userSelect.value;
    const treeContainer = document.getElementById('referralTree');
    
    if (!selectedUserId) {
        treeContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sitemap"></i>
                <p>Select a user to view their referral network</p>
            </div>
        `;
        return;
    }
    
    const treeData = AuthFunctions.generateReferralTree(selectedUserId);
    if (treeData) {
        treeContainer.innerHTML = renderAdminTreeNode(treeData);
    } else {
        treeContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>This user has no referrals yet</p>
            </div>
        `;
    }
}

function renderAdminTreeNode(node) {
    const packageColor = AuthFunctions.packages[node.package]?.color || '#6b7280';
    
    let html = `
        <div class="tree-node">
            <div class="node-card" style="background: ${packageColor};">
                <h4>${node.name}</h4>
                <p>${node.email}</p>
                <p>${AuthFunctions.packages[node.package]?.name || 'Basic'}</p>
                <p>Earnings: ${formatCurrency(node.earnings)}</p>
                <p>Joined: ${formatDate(node.joinDate)}</p>
            </div>
    `;
    
    if (node.children && node.children.length > 0) {
        html += '<div class="tree-children">';
        node.children.forEach(child => {
            html += renderAdminTreeNode(child);
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function downloadReport(reportType) {
    let csvContent = '';
    let filename = '';
    
    switch(reportType) {
        case 'users':
            const users = AdminFunctions.getAllUsers();
            csvContent = 'ID,Name,Email,Mobile,Package,Balance,Referrals,Status,Registration Date\n';
            users.forEach(user => {
                csvContent += `${user.id},${user.fullName},${user.email},${user.mobile},${user.package},${user.balance || 0},${user.directReferrals || 0},${user.status || 'active'},${formatDate(user.registrationDate)}\n`;
            });
            filename = 'users_report.csv';
            break;
            
        case 'packages':
            const stats = AdminFunctions.getUserStats();
            csvContent = 'Package,Users,Revenue,Percentage\n';
            Object.entries(AuthFunctions.packages).forEach(([key, pkg]) => {
                const userCount = stats.packageStats[key] || 0;
                const revenue = userCount * pkg.price;
                const percentage = stats.totalUsers > 0 ? ((userCount / stats.totalUsers) * 100).toFixed(1) : 0;
                csvContent += `${pkg.name},${userCount},${revenue},${percentage}%\n`;
            });
            filename = 'packages_report.csv';
            break;
            
        case 'withdrawals':
            const withdrawals = AdminFunctions.getWithdrawals();
            const allUsers = AdminFunctions.getAllUsers();
            csvContent = 'ID,User,Amount,Method,Status,Request Date,Process Date\n';
            withdrawals.forEach(withdrawal => {
                const user = allUsers.find(u => u.id === withdrawal.userId);
                csvContent += `${withdrawal.id},${user?.fullName || 'Unknown'},${withdrawal.amount},${withdrawal.method},${withdrawal.status},${formatDate(withdrawal.requestDate)},${withdrawal.processDate ? formatDate(withdrawal.processDate) : 'N/A'}\n`;
            });
            filename = 'withdrawals_report.csv';
            break;
            
        case 'referrals':
            const refUsers = AdminFunctions.getAllUsers();
            csvContent = 'User,Email,Package,Direct Referrals,Team Size,Total Earnings\n';
            refUsers.forEach(user => {
                csvContent += `${user.fullName},${user.email},${user.package},${user.directReferrals || 0},${user.teamSize || 0},${user.totalEarnings || 0}\n`;
            });
            filename = 'referrals_report.csv';
            break;
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`);
}

function refreshData() {
    showLoading();
    setTimeout(() => {
        loadAdminData();
        hideLoading();
        showToast('Data refreshed successfully!');
    }, 1000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
        mainContent.classList.remove('sidebar-collapsed');
    }
});

console.log('Admin panel initialized successfully!');

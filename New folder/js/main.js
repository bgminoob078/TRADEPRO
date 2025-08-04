// Main JavaScript for TradePro MLM Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.service-card, .benefit-card, .testimonial-card, .about-text, .stats-card');
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // Counter Animation for Stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        updateCounter();
    }

    // Animate hero stats when visible
    const heroStats = document.querySelectorAll('.hero-stats .stat h3');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/[^\d]/g, ''));
                if (number) {
                    animateCounter(entry.target, number);
                }
                statsObserver.unobserve(entry.target);
            }
        });
    });

    heroStats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Trading Card Animation
    const tradingCard = document.querySelector('.trading-card');
    if (tradingCard) {
        // Simulate real-time updates
        setInterval(() => {
            const profit = document.querySelector('.profit');
            const percentage = document.querySelector('.percentage');
            
            if (profit && percentage) {
                const randomChange = (Math.random() - 0.5) * 100;
                const currentProfit = 1247.50 + randomChange;
                const currentPercentage = (currentProfit / 10000) * 100;
                
                profit.textContent = `$${currentProfit.toFixed(2)}`;
                percentage.textContent = `${currentPercentage > 0 ? '+' : ''}${currentPercentage.toFixed(2)}%`;
                
                // Update colors based on profit/loss
                if (currentProfit > 1247.50) {
                    profit.className = 'profit positive';
                    percentage.style.background = 'rgba(16, 185, 129, 0.1)';
                    percentage.style.color = '#10b981';
                } else {
                    profit.className = 'profit negative';
                    profit.style.color = '#ef4444';
                    percentage.style.background = 'rgba(239, 68, 68, 0.1)';
                    percentage.style.color = '#ef4444';
                }
            }
        }, 3000);
    }

    // Parallax Effect for Hero Section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Form Validation Helper Functions
    window.validateEmail = function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    window.validatePhone = function(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    };

    window.validatePassword = function(password) {
        return password.length >= 8;
    };

    // Show/Hide Password Toggle
    window.togglePassword = function(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    // Toast Notification System
    window.showToast = function(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    // Loading Spinner
    window.showLoading = function() {
        const loader = document.createElement('div');
        loader.id = 'loading-spinner';
        loader.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Processing...</p>
                </div>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;

        const spinner = loader.querySelector('.spinner');
        spinner.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(loader);
    };

    window.hideLoading = function() {
        const loader = document.getElementById('loading-spinner');
        if (loader) {
            loader.remove();
        }
    };

    // Local Storage Helpers
    window.saveToStorage = function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    };

    window.getFromStorage = function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    };

    // Generate Random ID
    window.generateId = function() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    };

    // Format Currency
    window.formatCurrency = function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format Date
    window.formatDate = function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    };

    // Copy to Clipboard
    window.copyToClipboard = function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Copied to clipboard!');
        }
    };

    // Initialize tooltips (if any)
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });

        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    console.log('TradePro MLM Website Initialized Successfully!');
});

// Global utility functions available throughout the application
window.TradePro = {
    // User session management
    currentUser: null,
    
    // Set current user
    setUser: function(user) {
        this.currentUser = user;
        saveToStorage('currentUser', user);
    },
    
    // Get current user
    getUser: function() {
        if (!this.currentUser) {
            this.currentUser = getFromStorage('currentUser');
        }
        return this.currentUser;
    },
    
    // Logout user
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    },
    
    // Check if user is logged in
    isLoggedIn: function() {
        return this.getUser() !== null;
    },
    
    // Redirect if not logged in
    requireAuth: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Auth Management System for Bean Hotel
// This script manages login state across all pages using localStorage

(function() {
    'use strict';
    
    // Initialize auth system when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Small delay to ensure other scripts load first
        setTimeout(function() {
            initAuthSystem();
        }, 100);
    });
    
    function initAuthSystem() {
        // Only initialize if we're not on index.html (to avoid conflicts)
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (currentPage !== 'index.html' && currentPage !== '') {
            checkLoginState();
        }
        
        // Always setup logout handler for all pages
        setupLogoutHandler();
        
        // Handle login redirection for already logged in users
        handleLoginPageRedirect();
    }
    
    // Handle redirect if user is already logged in and tries to access login/register pages
    function handleLoginPageRedirect() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'Register.html')) {
            showNotification('Bạn đã đăng nhập rồi!');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
    
    // Check login state and update UI accordingly (for non-index pages)
    function checkLoginState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        
        if (isLoggedIn && username) {
            showLoggedInState(username);
        } else {
            showLoggedOutState();
        }
    }
    
    // Show logged in state
    function showLoggedInState(username) {
        // Update account header with the same style as index.html
        updateAccountHeader(username);
        
        // Update any other login links on the page
        updateOtherLoginLinks(username);
    }
    
    // Update account header for logged in state
    function updateAccountHeader(username) {
        const accountHeader = document.querySelector('.account_header');
        if (!accountHeader) return;
        
        // Find register and login items
        let registerItem = null;
        let loginItem = null;
        let separator = null;
        
        const items = accountHeader.querySelectorAll('li');
        items.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                if (link.getAttribute('href') === 'Register.html' || link.getAttribute('href') === 'register.html') {
                    registerItem = item;
                } else if (link.getAttribute('href') === 'login.html') {
                    loginItem = item;
                }
            }
        });
        
        // Find separator between register and login
        if (registerItem && loginItem) {
            const nextSibling = registerItem.nextElementSibling;
            if (nextSibling && nextSibling.innerHTML.includes('|')) {
                separator = nextSibling;
            }
        }
        
        if (registerItem && loginItem) {
            // Don't create new separator, just reuse existing one after login if it exists
            let reuseableSeparator = null;
            const loginNextSibling = loginItem.nextElementSibling;
            if (loginNextSibling && loginNextSibling.innerHTML.includes('|')) {
                reuseableSeparator = loginNextSibling;
            }
            
            // Create user account element exactly like index.html
            const userAccount = document.createElement('li');
            userAccount.className = 'user-account-container';
            // Convert username to uppercase like in index.html
            const displayUsername = username.toUpperCase();
            
            userAccount.innerHTML = `
                <a href="#" class="user-account-link">
                  <i class="fas fa-user user-icon"></i>
                  <span class="username-display">${displayUsername}</span>
                  <i class="fas fa-chevron-down dropdown-arrow"></i>
                </a>
                <div class="user-dropdown">
                  <ul>
                    <li><a href="#"><i class="fas fa-user-cog"></i> Thông tin tài khoản</a></li>
                    <li><a href="#"><i class="fas fa-history"></i> Lịch sử đặt phòng</a></li>
                    <li class="logout-item">
                      <a href="javascript:void(0);" class="logout-btn" style="cursor: pointer !important;">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                      </a>
                    </li>
                  </ul>
                </div>
            `;
            
            // Remove register and login items
            registerItem.parentNode.removeChild(registerItem);
            loginItem.parentNode.removeChild(loginItem);
            
            // Remove separator between register and login if exists
            if (separator) {
                separator.parentNode.removeChild(separator);
            }
            
            // Insert user account at the beginning
            if (accountHeader.firstChild) {
                accountHeader.insertBefore(userAccount, accountHeader.firstChild);
                // Only add separator if we don't already have one that we can reuse
                if (reuseableSeparator) {
                    accountHeader.insertBefore(reuseableSeparator, userAccount.nextSibling);
                } else {
                    const newSeparator = document.createElement('li');
                    newSeparator.innerHTML = '<span>&nbsp;|&nbsp;</span>';
                    accountHeader.insertBefore(newSeparator, userAccount.nextSibling);
                }
            } else {
                accountHeader.appendChild(userAccount);
                if (!reuseableSeparator) {
                    const newSeparator = document.createElement('li');
                    newSeparator.innerHTML = '<span>&nbsp;|&nbsp;</span>';
                    accountHeader.appendChild(newSeparator);
                }
            }
            
            // Add click event for user account link to toggle dropdown
            const userAccountLink = userAccount.querySelector('.user-account-link');
            userAccountLink.addEventListener('click', function(e) {
                e.preventDefault();
                userAccount.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!userAccount.contains(e.target)) {
                    userAccount.classList.remove('active');
                }
            });
        }
    }
    
    // Update other login links (not in account header)
    function updateOtherLoginLinks(username) {
        const loginLinks = document.querySelectorAll('a[href="login.html"]:not(.user-account-link)');
        loginLinks.forEach(function(link) {
            if (!link.closest('.account_header') && !link.closest('.user-dropdown')) {
                link.innerHTML = '<i class="fa fa-user"></i> ' + username;
                link.href = '#';
                link.classList.add('logged-in-user');
            }
        });
    }
    
    // Show logged out state
    function showLoggedOutState() {
        // Remove user account container if exists
        const userAccountContainer = document.querySelector('.user-account-container');
        if (userAccountContainer) {
            // Remove the separator after it too
            const nextSeparator = userAccountContainer.nextElementSibling;
            if (nextSeparator && nextSeparator.innerHTML.includes('|')) {
                nextSeparator.remove();
            }
            userAccountContainer.remove();
        }
        
        // Restore original register and login links
        const accountHeader = document.querySelector('.account_header');
        if (accountHeader && !accountHeader.querySelector('a[href="Register.html"]')) {
            // Create register link
            const registerLi = document.createElement('li');
            registerLi.innerHTML = '<a href="Register.html" title="Đăng ký">Đăng ký</a>';
            
            // Create separator
            const separatorLi = document.createElement('li');
            separatorLi.innerHTML = '<span>&nbsp;|&nbsp;</span>';
            
            // Create login link
            const loginLi = document.createElement('li');
            loginLi.innerHTML = '<a href="login.html" title="Đăng nhập">Đăng nhập</a>';
            
            // Insert at the beginning
            if (accountHeader.firstChild) {
                accountHeader.insertBefore(registerLi, accountHeader.firstChild);
                accountHeader.insertBefore(separatorLi, registerLi.nextSibling);
                accountHeader.insertBefore(loginLi, separatorLi.nextSibling);
            } else {
                accountHeader.appendChild(registerLi);
                accountHeader.appendChild(separatorLi);
                accountHeader.appendChild(loginLi);
            }
        }
        
        // Remove any other legacy user elements
        const legacyUserLinks = document.querySelectorAll('.logged-in-user');
        legacyUserLinks.forEach(function(link) {
            link.innerHTML = 'Đăng nhập';
            link.href = 'login.html';
            link.classList.remove('logged-in-user');
        });
    }
    
    // Setup logout handler
    function setupLogoutHandler() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('logout-btn') || e.target.closest('.logout-btn')) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            }
        });
    }
    
    // Logout function
    function logout() {
        // Clear localStorage (same as index.html)
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // Simply reload the page like index.html does
        window.location.reload();
    }
    
    // Show notification
    function showNotification(message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(function(notification) {
            notification.remove();
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#auth-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Global functions for external use
    window.BeanHotelAuth = {
        checkLoginState: checkLoginState,
        logout: logout,
        isLoggedIn: function() {
            return localStorage.getItem('isLoggedIn') === 'true';
        },
        getUsername: function() {
            return localStorage.getItem('username');
        },
        showNotification: showNotification
    };
})();

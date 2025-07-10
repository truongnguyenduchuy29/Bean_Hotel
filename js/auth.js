// Bean Hotel - Authentication System
// Quản lý trạng thái đăng nhập đồng bộ trên tất cả các trang

(function () {
    'use strict';

    // Khởi tạo hệ thống xác thực khi DOM được tải
    document.addEventListener('DOMContentLoaded', function () {
        // Đợi một chút để đảm bảo các script khác đã tải xong
        setTimeout(function () {
            initAuthSystem();
        }, 100);
    });

    /**
     * Khởi tạo hệ thống xác thực trên tất cả các trang
     */
    function initAuthSystem() {
        console.log('Khởi tạo hệ thống xác thực Bean Hotel');

        // Kiểm tra trạng thái đăng nhập và cập nhật giao diện
        checkLoginState();

        // Thiết lập xử lý đăng xuất
        setupLogoutHandler();

        // Xử lý chuyển hướng cho trang đăng nhập/đăng ký nếu người dùng đã đăng nhập
        handleLoginPageRedirect();
    }

    /**
     * Xử lý chuyển hướng nếu người dùng đã đăng nhập và truy cập trang đăng nhập/đăng ký
     */
    function handleLoginPageRedirect() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'Register.html')) {
            showNotification('Bạn đã đăng nhập rồi!');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    /**
     * Kiểm tra trạng thái đăng nhập và cập nhật giao diện tương ứng
     */
    function checkLoginState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username');

        if (isLoggedIn && username) {
            console.log('Người dùng đã đăng nhập:', username);
            showLoggedInState(username);
        } else {
            console.log('Chưa đăng nhập');
            showLoggedOutState();
        }
    }

    /**
     * Hiển thị trạng thái đã đăng nhập
     */
    function showLoggedInState(username) {
        // Cập nhật header tài khoản
        updateAccountHeader(username);

        // Cập nhật các liên kết đăng nhập khác trên trang
        updateOtherLoginLinks(username);
    }

    /**
     * Cập nhật header tài khoản cho trạng thái đã đăng nhập
     */
    function updateAccountHeader(username) {
        const accountHeader = document.querySelector('.account_header');
        if (!accountHeader) {
            console.warn('Không tìm thấy phần tử .account_header');
            return;
        }

        // Tìm các phần tử đăng ký và đăng nhập
        let registerItem = null;
        let loginItem = null;
        let separator = null;

        const items = accountHeader.querySelectorAll('li');
        items.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href === 'Register.html' || href === 'register.html') {
                    registerItem = item;
                } else if (href === 'login.html') {
                    loginItem = item;
                }
            }
        });

        // Tìm dấu phân cách giữa đăng ký và đăng nhập
        if (registerItem && loginItem) {
            const nextSibling = registerItem.nextElementSibling;
            if (nextSibling && nextSibling.innerHTML.includes('|')) {
                separator = nextSibling;
            }
        }

        // Nếu đã tìm thấy các phần tử cần thiết
        if (registerItem && loginItem) {
            // Tìm dấu phân cách sau phần đăng nhập để tái sử dụng
            let reuseableSeparator = null;
            const loginNextSibling = loginItem.nextElementSibling;
            if (loginNextSibling && loginNextSibling.innerHTML.includes('|')) {
                reuseableSeparator = loginNextSibling;
            }

            // Tạo phần tử tài khoản người dùng
            const userAccount = document.createElement('li');
            userAccount.className = 'user-account-container';
            // Chuyển tên người dùng thành chữ hoa
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

            // Xóa phần tử đăng ký và đăng nhập
            if (registerItem.parentNode) {
                registerItem.parentNode.removeChild(registerItem);
            }
            if (loginItem.parentNode) {
                loginItem.parentNode.removeChild(loginItem);
            }

            // Xóa dấu phân cách giữa đăng ký và đăng nhập nếu có
            if (separator && separator.parentNode) {
                separator.parentNode.removeChild(separator);
            }

            // Chèn phần tử tài khoản người dùng vào đầu
            if (accountHeader.firstChild) {
                accountHeader.insertBefore(userAccount, accountHeader.firstChild);
                // Chỉ thêm dấu phân cách nếu không có sẵn
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

            // Thêm sự kiện click cho liên kết tài khoản người dùng để hiển thị dropdown
            const userAccountLink = userAccount.querySelector('.user-account-link');
            if (userAccountLink) {
                userAccountLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    userAccount.classList.toggle('active');
                });
            }

            // Đóng dropdown khi click bên ngoài
            document.addEventListener('click', function (e) {
                if (userAccount && !userAccount.contains(e.target)) {
                    userAccount.classList.remove('active');
                }
            });
        }
    }

    /**
     * Cập nhật các liên kết đăng nhập khác (không nằm trong header tài khoản)
     */
    function updateOtherLoginLinks(username) {
        const loginLinks = document.querySelectorAll('a[href="login.html"]:not(.user-account-link)');
        loginLinks.forEach(function (link) {
            if (!link.closest('.account_header') && !link.closest('.user-dropdown')) {
                link.innerHTML = '<i class="fa fa-user"></i> ' + username;
                link.href = '#';
                link.classList.add('logged-in-user');
            }
        });
    }

    /**
     * Hiển thị trạng thái chưa đăng nhập
     */
    function showLoggedOutState() {
        // Xóa container tài khoản người dùng nếu có
        const userAccountContainer = document.querySelector('.user-account-container');
        if (userAccountContainer) {
            // Xóa dấu phân cách sau nó
            const nextSeparator = userAccountContainer.nextElementSibling;
            if (nextSeparator && nextSeparator.innerHTML.includes('|')) {
                nextSeparator.remove();
            }
            userAccountContainer.remove();
        }

        // Khôi phục liên kết đăng ký và đăng nhập ban đầu
        const accountHeader = document.querySelector('.account_header');
        if (accountHeader && !accountHeader.querySelector('a[href="Register.html"]')) {
            // Tạo liên kết đăng ký
            const registerLi = document.createElement('li');
            registerLi.innerHTML = '<a href="Register.html" title="Đăng ký">Đăng ký</a>';

            // Tạo dấu phân cách
            const separatorLi = document.createElement('li');
            separatorLi.innerHTML = '<span>&nbsp;|&nbsp;</span>';

            // Tạo liên kết đăng nhập
            const loginLi = document.createElement('li');
            loginLi.innerHTML = '<a href="login.html" title="Đăng nhập">Đăng nhập</a>';

            // Chèn vào đầu
            if (accountHeader.firstChild) {
                accountHeader.insertBefore(loginLi, accountHeader.firstChild);
                accountHeader.insertBefore(separatorLi, loginLi.nextSibling);
                accountHeader.insertBefore(registerLi, loginLi);
            } else {
                accountHeader.appendChild(registerLi);
                accountHeader.appendChild(separatorLi);
                accountHeader.appendChild(loginLi);
            }
        }

        // Xóa các phần tử người dùng khác
        const legacyUserLinks = document.querySelectorAll('.logged-in-user');
        legacyUserLinks.forEach(function (link) {
            link.innerHTML = 'Đăng nhập';
            link.href = 'login.html';
            link.classList.remove('logged-in-user');
        });
    }

    /**
     * Thiết lập xử lý đăng xuất
     */
    function setupLogoutHandler() {
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('logout-btn') || e.target.closest('.logout-btn')) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            }
        });
    }

    /**
     * Hàm đăng xuất
     */
    function logout() {
        // Xóa dữ liệu trong localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');

        // Hiển thị thông báo
        showNotification('Đã đăng xuất thành công!');

        // Tải lại trang
        setTimeout(function () {
            window.location.reload();
        }, 1000);
    }

    /**
     * Hiển thị thông báo
     */
    function showNotification(message, type = 'success') {
        // Xóa thông báo hiện có
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(function (notification) {
            notification.remove();
        });

        // Tạo phần tử thông báo
        const notification = document.createElement('div');
        notification.className = 'auth-notification';

        // Thêm class tương ứng với loại thông báo
        if (type === 'error') {
            notification.classList.add('error');
        } else if (type === 'warning') {
            notification.classList.add('warning');
        } else if (type === 'info') {
            notification.classList.add('info');
        }

        notification.textContent = message;

        document.body.appendChild(notification);

        // Xóa thông báo sau 3 giây
        setTimeout(function () {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function () {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Hàm toàn cục để sử dụng từ bên ngoài
    window.BeanHotelAuth = {
        checkLoginState: checkLoginState,
        logout: logout,
        isLoggedIn: function () {
            return localStorage.getItem('isLoggedIn') === 'true';
        },
        getUsername: function () {
            return localStorage.getItem('username');
        },
        showNotification: showNotification
    };
})();

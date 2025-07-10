/**
 * BEAN HOTEL - Quản lý hiển thị số lượng giỏ hàng
 * 
 * Script này chịu trách nhiệm hiển thị số lượng sản phẩm trong giỏ hàng
 * trên tất cả các trang của website một cách độc lập.
 */

// Thực thi ngay lập tức khi tài liệu được phân tích
(function () {
    // Hàm khởi tạo - chạy ngay khi script được tải
    function initCartCount() {
        // Đặt sự kiện để cập nhật ngay khi DOM được tải
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateAllCartCountDisplays);
        } else {
            updateAllCartCountDisplays();
        }

        // Đặt sự kiện để cập nhật mỗi khi storage thay đổi (nếu từ tab khác)
        window.addEventListener('storage', function (e) {
            if (e.key === 'beanHotelCart') {
                updateAllCartCountDisplays();
            }
        });

        // Đặt interval để kiểm tra và cập nhật định kỳ (phòng trường hợp có sự thay đổi không bắt được)
        setInterval(updateAllCartCountDisplays, 2000);
    }

    // Hàm cập nhật số lượng hiển thị trên tất cả các phần tử
    function updateAllCartCountDisplays() {
        // Lấy số lượng sản phẩm từ giỏ hàng
        const itemCount = calculateCartItemCount();

        // Ghi log để debug
        console.log('Cập nhật số lượng giỏ hàng:', itemCount);

        // Cập nhật tất cả các phần tử hiển thị số lượng giỏ hàng
        const countElements = document.querySelectorAll('.count_item_pr');
        if (countElements.length > 0) {
            countElements.forEach(element => {
                element.textContent = itemCount;
            });
            console.log('Đã cập nhật', countElements.length, 'phần tử hiển thị số lượng giỏ hàng');
        } else {
            console.warn('Không tìm thấy phần tử nào có class .count_item_pr');
            // Thử tìm các phần tử khác có thể chứa số lượng giỏ hàng
            setTimeout(findAndUpdateAlternativeElements, 500, itemCount);
        }
    }

    // Hàm tìm và cập nhật các phần tử thay thế nếu không tìm thấy .count_item_pr
    function findAndUpdateAlternativeElements(itemCount) {
        // Danh sách các class/selector có thể chứa số lượng giỏ hàng
        const possibleSelectors = [
            '.cart-count',
            '.header-cart-count',
            '.cart-quantity',
            '.cart-item-count',
            'a[href*="cart"] span',
            'a[href*="cart.html"] span'
        ];

        for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(element => {
                    // Kiểm tra nếu phần tử này có vẻ như hiển thị số lượng
                    if (element.textContent.trim().match(/^\d+$/) || element.textContent.trim() === '') {
                        element.textContent = itemCount;
                        console.log('Đã cập nhật phần tử thay thế:', selector);
                    }
                });
            }
        }
    }

    // Hàm tính tổng số lượng sản phẩm trong giỏ hàng
    function calculateCartItemCount() {
        try {
            // Lấy dữ liệu giỏ hàng từ localStorage
            const cartData = localStorage.getItem('beanHotelCart');

            // Nếu không có dữ liệu giỏ hàng, trả về 0
            if (!cartData) {
                return 0;
            }

            // Chuyển đổi dữ liệu giỏ hàng từ JSON sang object
            const cart = JSON.parse(cartData);

            // Nếu không phải array hoặc array rỗng, trả về 0
            if (!Array.isArray(cart) || cart.length === 0) {
                return 0;
            }

            // Tính tổng số lượng sản phẩm
            return cart.reduce((total, item) => {
                // Đảm bảo số lượng là số nguyên dương
                const quantity = parseInt(item.quantity);
                return total + (isNaN(quantity) ? 0 : quantity);
            }, 0);
        } catch (error) {
            console.error('Lỗi khi tính toán số lượng giỏ hàng:', error);
            return 0;
        }
    }

    // Ghi đè hàm thêm vào giỏ hàng ban đầu để đảm bảo cập nhật số lượng
    const originalAddToCart = window.addToCart;
    if (typeof originalAddToCart === 'function') {
        window.addToCart = function () {
            // Gọi hàm gốc
            const result = originalAddToCart.apply(this, arguments);
            // Cập nhật số lượng
            updateAllCartCountDisplays();
            return result;
        };
    }

    // Ghi đè hàm cập nhật giỏ hàng ban đầu để đảm bảo cập nhật số lượng
    const originalUpdateCart = window.updateCart;
    if (typeof originalUpdateCart === 'function') {
        window.updateCart = function () {
            // Gọi hàm gốc
            const result = originalUpdateCart.apply(this, arguments);
            // Cập nhật số lượng
            updateAllCartCountDisplays();
            return result;
        };
    }

    // Bắt đầu thực thi
    initCartCount();

    // Xuất hàm để có thể gọi từ bên ngoài nếu cần
    window.beanHotelCartCount = {
        update: updateAllCartCountDisplays,
        getCount: calculateCartItemCount
    };
})(); 
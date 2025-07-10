// Đảm bảo chạy code sau khi DOM đã load xong
document.addEventListener('DOMContentLoaded', function () {
    console.log('food-detail.js đã được tải');

    // Lấy button "Thêm vào giỏ hàng"
    const addToCartBtn = document.querySelector('.btn_add_cart');

    if (addToCartBtn) {
        console.log('Đã tìm thấy nút thêm vào giỏ hàng');

        // Thêm sự kiện click cho nút "Thêm vào giỏ hàng"
        addToCartBtn.addEventListener('click', function (e) {
            // Ngăn chặn hành vi gửi form mặc định
            e.preventDefault();

            // Lấy ID sản phẩm từ URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            if (!productId) {
                console.error('Không tìm thấy ID sản phẩm trong URL');
                alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!');
                return;
            }

            // Lấy thông tin sản phẩm từ trang
            const productName = document.querySelector('.title-product')?.textContent.trim();
            const productPrice = document.querySelector('.price.product-price')?.textContent.trim();
            const productImage = document.querySelector('.gallery-top img')?.src;

            // Lấy số lượng từ input - LƯU Ý: Đảm bảo lấy chính xác số lượng từ #qtym
            const quantityInput = document.getElementById('qtym');

            // Đảm bảo số lượng là số nguyên dương
            let quantity = 1;

            if (quantityInput) {
                quantity = parseInt(quantityInput.value);
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                }
            }

            console.log(`Thêm sản phẩm: ${productName}, Số lượng: ${quantity}`);

            // Tạo đối tượng sản phẩm
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: quantity  // Gán chính xác số lượng người dùng đã chọn
            };

            // Lấy giỏ hàng hiện tại từ localStorage
            let cart = JSON.parse(localStorage.getItem('beanHotelCart')) || [];

            // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
            const existingProductIndex = cart.findIndex(item => item.id === productId);

            if (existingProductIndex > -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, THAY THẾ số lượng cũ bằng số lượng mới
                cart[existingProductIndex].quantity = quantity;
                console.log(`Cập nhật số lượng sản phẩm ID ${productId} thành ${quantity}`);
            } else {
                // Thêm sản phẩm mới vào giỏ hàng
                cart.push(product);
                console.log(`Thêm sản phẩm mới ID ${productId} với số lượng ${quantity}`);
            }

            // Lưu giỏ hàng vào localStorage
            localStorage.setItem('beanHotelCart', JSON.stringify(cart));

            // Cập nhật số lượng hiển thị trong header
            updateCartCount(cart);

            // Hiển thị thông báo thành công
            showAddToCartMessage(product.name, quantity);

            // Chuyển đến trang giỏ hàng sau 1 giây
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
        });
    } else {
        console.warn('Không tìm thấy nút thêm vào giỏ hàng');
    }

    // Hàm cập nhật số lượng hiển thị trên header
    function updateCartCount(cart) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const countElements = document.querySelectorAll('.count_item_pr');
        countElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    // Hàm hiển thị thông báo sau khi thêm vào giỏ hàng
    function showAddToCartMessage(productName, quantity) {
        let notification = document.getElementById('add-to-cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'add-to-cart-notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#cd9a2b';
            notification.style.color = 'white';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(notification);
        }

        notification.textContent = `Đã thêm ${quantity} ${productName} vào giỏ hàng`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}); 
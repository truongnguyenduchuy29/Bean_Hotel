document.addEventListener('DOMContentLoaded', function () {
    // Get food ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id');

    if (foodId) {
        loadFoodDetail(foodId);
        setupAddToCartHandler(foodId);
    } else {
        console.error('No food ID specified in URL');
    }
});

// Thiết lập xử lý sự kiện thêm vào giỏ hàng
function setupAddToCartHandler(foodId) {
    const addToCartBtn = document.querySelector('.add_to_cart_detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Lấy số lượng từ input
            const quantityInput = document.getElementById('quantity-detail');
            let quantity = 1;

            if (quantityInput && !isNaN(parseInt(quantityInput.value))) {
                quantity = parseInt(quantityInput.value);
                console.log('Số lượng từ input quantity-detail:', quantity);
            } else {
                // Tìm kiếm các input số lượng khác
                const altQuantityInputs = document.querySelectorAll('input[type="number"], input.quantity-input, input.prd_quantity');
                for (const input of altQuantityInputs) {
                    if (input.value && !isNaN(parseInt(input.value))) {
                        quantity = parseInt(input.value);
                        console.log('Số lượng từ input thay thế:', quantity, 'từ', input.className);
                        break;
                    }
                }
            }
            
            console.log('Số lượng cuối cùng sẽ thêm vào giỏ hàng:', quantity);

            // Lấy thông tin sản phẩm
            fetch('data/food.json')
                .then(response => response.json())
                .then(data => {
                    const product = data.find(item => item.id === foodId);
                    if (product) {
                        // Thêm vào giỏ hàng
                        addToCart(product, quantity);
                    } else {
                        console.error('Không tìm thấy sản phẩm với ID:', foodId);
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
                });
        });
    }
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(product, quantity) {
    // Đảm bảo quantity là số
    const qtyToAdd = parseInt(quantity) || 1;
    console.log(`Thêm sản phẩm: ${product.name}, số lượng: ${qtyToAdd}`);

    // Lấy giỏ hàng hiện tại
    const cart = JSON.parse(localStorage.getItem('beanHotelCart')) || [];

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
        // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
        const currentQty = parseInt(cart[existingItemIndex].quantity) || 0;
        cart[existingItemIndex].quantity = currentQty + qtyToAdd;
        console.log(`Cập nhật sản phẩm hiện có, số lượng mới: ${cart[existingItemIndex].quantity}`);
    } else {
        // Thêm sản phẩm mới vào giỏ hàng
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || null,
            image: product.image && product.image.length > 0 ? product.image[0] : '',
            quantity: qtyToAdd
        });
        console.log('Đã thêm sản phẩm mới vào giỏ hàng');
    }

    // Lưu giỏ hàng đã cập nhật
    localStorage.setItem('beanHotelCart', JSON.stringify(cart));
    console.log('Giỏ hàng sau khi cập nhật:', cart);

    // Cập nhật hiển thị số lượng sản phẩm
    updateCartCount();

    // Hiển thị thông báo thành công
    alert('Đã thêm sản phẩm vào giỏ hàng!');

    // Chuyển đến trang giỏ hàng
    window.location.href = 'cart.html';
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('beanHotelCart')) || [];
    
    // Đảm bảo tất cả số lượng là số
    cart.forEach(item => {
        item.quantity = parseInt(item.quantity) || 1;
    });
    
    // Lưu lại giỏ hàng đã chuẩn hóa
    localStorage.setItem('beanHotelCart', JSON.stringify(cart));
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    // Cập nhật số lượng hiển thị trên giao diện nếu có
    const countElements = document.querySelectorAll('.count_item_pr, .cart-count');
    if (countElements) {
        countElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    console.log('Tổng số sản phẩm trong giỏ hàng sau chuẩn hóa:', totalItems);
}

function loadFoodDetail(foodId) {
    fetch('data/food.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Find the food item with matching ID
            const foodItem = data.find(item => item.id === foodId);
            if (foodItem) {
                displayFoodDetail(foodItem);
                updatePageTitle(foodItem.name);
                updateBreadcrumb(foodItem.name);
            } else {
                console.error('Food item not found with ID:', foodId);
            }
        })
        .catch(error => {
            console.error('Error loading food data:', error);
        });
}

function updatePageTitle(foodName) {
    document.title = foodName;
    // Update meta tags if needed
    const metaTags = document.querySelectorAll('meta[property^="og:"]');
    metaTags.forEach(tag => {
        if (tag.getAttribute('property') === 'og:title') {
            tag.setAttribute('content', foodName);
        }
    });
}

function updateBreadcrumb(foodName) {
    // Update breadcrumb display if it exists
    const breadcrumbItem = document.querySelector('.breadcrumb_last');
    if (breadcrumbItem) {
        breadcrumbItem.textContent = foodName;
    }
}

function displayFoodDetail(food) {
    // Update product title
    const productTitle = document.querySelector('.product-title h1');
    if (productTitle) {
        productTitle.textContent = food.name;
    }

    // Update product price
    const productPrice = document.querySelector('.product-price span.price');
    if (productPrice) {
        productPrice.textContent = food.price;
    }

    // Update old price if exists
    const oldPrice = document.querySelector('.product-price del');
    if (oldPrice) {
        if (food.oldPrice) {
            oldPrice.textContent = food.oldPrice;
            oldPrice.style.display = 'inline-block';
        } else {
            oldPrice.style.display = 'none';
        }
    }

    // Update product description
    const productDesc = document.querySelector('.product-summary');
    if (productDesc) {
        productDesc.innerHTML = food.shortDescription;
    }

    // Update product detail description
    const detailDesc = document.querySelector('.tab-content .product-description');
    if (detailDesc) {
        detailDesc.innerHTML = food.description.replace(/\n/g, '<br>');
    }

    // Update main image
    const mainImage = document.querySelector('.product-image-feature');
    if (mainImage && food.image && food.image.length > 0) {
        mainImage.src = food.image[0];
        mainImage.setAttribute('data-zoom-image', food.image[0]);
    }

    // Update thumbnail images
    const thumbnailContainer = document.querySelector('.product-thumb');
    if (thumbnailContainer && food.image && food.image.length > 0) {
        thumbnailContainer.innerHTML = '';

        food.image.forEach((img, index) => {
            const li = document.createElement('li');
            li.className = index === 0 ? 'active' : '';
            li.innerHTML = `
                <a href="#" data-image="${img}" data-zoom-image="${img}">
                    <img src="${img}" alt="${food.name}">
                </a>
            `;
            thumbnailContainer.appendChild(li);
        });

        // Add click event to thumbnails
        const thumbnails = thumbnailContainer.querySelectorAll('li a');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function (e) {
                e.preventDefault();
                const imgUrl = this.getAttribute('data-image');
                const zoomImgUrl = this.getAttribute('data-zoom-image');

                // Update main image
                if (mainImage) {
                    mainImage.src = imgUrl;
                    mainImage.setAttribute('data-zoom-image', zoomImgUrl);
                }

                // Update active state
                thumbnailContainer.querySelectorAll('li').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentNode.classList.add('active');
            });
        });
    }
} 
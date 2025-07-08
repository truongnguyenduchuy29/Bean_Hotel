// JavaScript to fetch and render food items from food.json
document.addEventListener('DOMContentLoaded', function () {
    // This script will only handle the initial loading of food items
    // The filtering functionality will be handled by food-filter.js
    console.log('Initializing food list loading...');

    // Check if food-filter.js is included on the page
    // If it is, it will take over loading, so don't proceed
    if (typeof window.foodFilterInitialized === 'undefined') {
        // Fetch the food.json data
        fetch('data/food.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Process the data
                renderFoodItems(data);
            })
            .catch(error => {
                console.error('Error fetching food data:', error);
            });
    } else {
        console.log('Food filter system detected, letting it handle loading and filtering');
    }

    // Function to render food items to the page
    function renderFoodItems(foodItems) {
        // Find the container where we want to display food items
        const productsContainer = document.querySelector('.products-view-grid.list_hover_pro .row');

        // Clear existing content
        productsContainer.innerHTML = '';

        // Loop through each food item and create HTML
        foodItems.forEach(item => {
            const discountPercent = item.oldPrice ? calculateDiscountPercent(item.price, item.oldPrice) : null;

            // Create HTML for the food item
            const itemHtml = `
                <div class="col-6 col-xs-6 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                    <div class="item_product_main">
                        <form action="/cart/add" method="post" class="variants product-action" enctype="multipart/form-data">
                            <div class="product-thumbnail">
                                <a class="image_thumb" href="food_detail.html?id=${item.id}" title="${item.name}">
                                    <img width="480" height="360" class="lazyload" 
                                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
                                        data-src="${formatImageUrl(item.image[0])}"
                                        alt="${item.name}"
                                        onerror="this.onerror=null;this.src='${item.image[0]}'"
                                    />
                                </a>
                                
                                ${discountPercent ? `
                                <div class="sale-label">
                                    <span class="smart">- ${discountPercent}% </span>
                                </div>
                                ` : ''}

                                <div class="group_action">
                                    <input type="hidden" name="variantId" value="${item.id}" />
                                    <button class="btn-anima hidden-xs btn-buy btn-cart btn-left btn btn-views left-to add_to_cart active" title="Mua ngay">
                                        <img width="24" height="24" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/cart-add.svg?1749443141671" alt="Mua ngay" />
                                    </button>
                                    
                                    <a title="Xem nhanh" href="food_detail.html?id=${item.id}" data-handle="${item.id}" class="btn-anima hidden-xs xem_nhanh btn-circle btn-views btn_view btn right-to quick-view">
                                        <img width="24" height="24" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/view.svg?1749443141671" alt="Xem nhanh" />
                                    </a>
                                </div>
                            </div>
                            <div class="product-info">
                                <h3 class="product-name">
                                    <a href="food_detail.html?id=${item.id}" title="${item.name}">${item.name}</a>
                                </h3>
                                <div class="price-box">
                                    <span class="price">${item.price}</span>
                                    ${item.oldPrice ? `<span class="compare-price">${item.oldPrice}</span>` : ''}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            // Add the item HTML to the container
            productsContainer.innerHTML += itemHtml;
        });

        // Re-initialize lazyload for images
        if (typeof window.awe_lazyloadImage === 'function') {
            window.awe_lazyloadImage();
        } else if (typeof Bizweb !== 'undefined' && typeof Bizweb.initLazyLoading === 'function') {
            Bizweb.initLazyLoading();
        } else {
            // Fallback if none of the above functions exist - implement a basic lazyloading
            const lazyImages = document.querySelectorAll('.lazyload');

            // Remove loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const image = entry.target;
                            if (image.dataset.src) {
                                image.src = image.dataset.src;
                                image.classList.remove('lazyload');
                                image.classList.add('lazyloaded');
                            }
                            imageObserver.unobserve(image);
                        }
                    });
                });

                lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                lazyImages.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                });
            }
        }
    }

    // Helper function to calculate discount percentage
    function calculateDiscountPercent(currentPrice, oldPrice) {
        // Remove currency symbols and convert to numbers
        const current = parseFloat(currentPrice.replace(/[^\d]/g, ''));
        const old = parseFloat(oldPrice.replace(/[^\d]/g, ''));

        if (isNaN(current) || isNaN(old) || old <= current) {
            return null;
        }

        const discount = Math.round(((old - current) / old) * 100);
        return discount;
    }

    // Helper function to format image URLs for thumbnails
    function formatImageUrl(url) {
        if (!url) {
            console.warn('Empty URL provided to formatImageUrl');
            return '';
        }

        // If the URL already has thumb/large, return as is
        if (url.includes('/thumb/large/')) {
            return url;
        }

        // If URL starts with https://bizweb.dktcdn.net/100/472/947/products/
        if (url.includes('bizweb.dktcdn.net/')) {
            // Convert the full URL to thumbnail format
            const urlParts = url.split('bizweb.dktcdn.net/');
            if (urlParts.length === 2) {
                return '//bizweb.dktcdn.net/thumb/large/' + urlParts[1];
            }
        }

        // If it's a relative URL, make sure it has the correct prefix
        if (url.startsWith('/')) {
            return `//bizweb.dktcdn.net/thumb/large/100/472/947/products${url}`;
        }

        // Return the original URL if we can't process it
        return url;
    }

    // Export helper functions for use in food-filter.js
    window.foodHelpers = {
        calculateDiscountPercent: calculateDiscountPercent,
        formatImageUrl: formatImageUrl,
        renderFoodItems: renderFoodItems
    };
});

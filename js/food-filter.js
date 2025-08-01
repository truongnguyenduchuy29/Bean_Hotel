$(document).ready(function () {
    // Mark that the filter system is initialized so food-list.js doesn't duplicate loading
    window.foodFilterInitialized = true;
    console.log("Setting window.foodFilterInitialized = true to prevent food-list.js from loading");

    // Global variables to store all food items and current filter
    let allFoodItems = [];
    let currentFilter = '';
    let itemsPerPage = 12; // Items per page for pagination
    let currentPage = 1;

    // Initialize the filtering system if we're on the food.html page
    if (window.location.pathname.includes('food.html') || window.location.pathname.includes('am-thuc')) {
        // Sử dụng timeout nhỏ để đảm bảo các thành phần khác đã được tải
        setTimeout(function () {
            initializeFoodFilter();
        }, 50);
    }

    // Thêm sự kiện khi trang đã tải hoàn toàn
    $(window).on('load', function () {
        if (window.location.pathname.includes('food.html') || window.location.pathname.includes('am-thuc')) {
            console.log("Window fully loaded - reinitializing filter if needed");
            // Kiểm tra xem URL có tham số type không
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('type')) {
                currentFilter = urlParams.get('type');
                console.log('Window.onload - Filter detected in URL:', currentFilter);
                // Gọi lại hàm lọc để đảm bảo kết quả hiển thị đúng
                if (allFoodItems.length > 0) {
                    filterFoodItems(currentFilter);
                    initializeMenuHighlighting();
                }
            }
        }
    });

    function initializeFoodFilter() {
        console.log('Initializing food filter system...');

        // Check URL parameters for filter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('type')) {
            currentFilter = urlParams.get('type');
            console.log('Filter detected in URL:', currentFilter);
        }

        // Load food data
        loadFoodData();

        // Setup filter click events for food categories in the menu
        setupFilterEvents();
    }

    function loadFoodData() {
        console.log('Loading food data...');

        // Show loading indicator
        const productsContainer = $('.products-view-grid .row');
        productsContainer.html('<div id="loading-indicator" class="text-center w-100"><p>Đang tải dữ liệu...</p></div>');

        // Lưu lại URL hiện tại để kiểm tra sau khi tải dữ liệu
        const currentUrl = window.location.href;
        console.log('Current URL when loading data:', currentUrl);

        // Fetch food data from JSON with fallback
        function loadFoodData() {
            const endpoints = [
                'data/food.json',
                './data/food.json',
                '../data/food.json'
            ];
            
            let currentEndpoint = 0;
            
            function tryNext() {
                if (currentEndpoint >= endpoints.length) {
                    console.error('All endpoints failed to load food data');
                    productsContainer.html('<div class="col-12 text-center"><p>Không thể tải dữ liệu món ăn</p></div>');
                    return;
                }
                
                console.log('Trying to load from:', endpoints[currentEndpoint]);
                $.getJSON(endpoints[currentEndpoint])
                    .done(function(data) {
                        allFoodItems = data;
                        console.log('Food data loaded successfully:', allFoodItems.length, 'items');
                        
                        // Đảm bảo rằng URL hiện tại vẫn giống với URL khi bắt đầu tải
                        if (window.location.href === currentUrl) {
                            // Đặt timeout nhỏ để đảm bảo không có script nào khác ghi đè
                            setTimeout(function () {
                                // Apply filter if URL has type parameter
                                applyFilterIfNeeded();

                                // Initialize menu highlighting
                                initializeMenuHighlighting();

                                console.log('Filter applied after data load, currentFilter:', currentFilter);
                            }, 100);
                        }
                    })
                    .fail(function(error) {
                        console.warn('Failed to load from:', endpoints[currentEndpoint], error);
                        currentEndpoint++;
                        tryNext();
                    });
            }
            
            tryNext();
        }
        
        loadFoodData();
    }

    function applyFilterIfNeeded() {
        // Đảm bảo container được xóa sạch trước khi áp dụng bộ lọc
        const productsContainer = $('.products-view-grid .row');
        productsContainer.empty();
        console.log('Container cleared before filtering');

        if (currentFilter) {
            console.log('Applying filter:', currentFilter);
            // Gọi ngay lập tức để tránh bị script khác ghi đè
            filterFoodItems(currentFilter);
        } else {
            console.log('No filter applied, showing all food items');
            // If no filter specified, show all food items
            renderFoodItems(allFoodItems);
        }

        // Đảm bảo menu được highlight đúng
        initializeMenuHighlighting();
    }

    function filterFoodItems(type) {
        if (!type) {
            renderFoodItems(allFoodItems);
            return;
        }

        console.log('Filtering food items by type:', type);
        let filteredItems = [];

        // Map the Vietnamese filter names to the type values in the JSON
        switch (type) {
            case 'mon-an':
                // Filter for food type
                filteredItems = allFoodItems.filter(item => item.type === 'food');
                console.log('Filtered food items:', filteredItems.length, 'items');
                break;

            case 'do-uong':
                // Filter for drink type
                filteredItems = allFoodItems.filter(item => item.type === 'drink');
                console.log('Filtered drink items:', filteredItems.length, 'items');
                break;

            case 'banh-ngot':
                // Filter for dessert/pastry type
                filteredItems = allFoodItems.filter(item => item.type === 'dessert');
                console.log('Filtered dessert items:', filteredItems.length, 'items');
                break;

            default:
                // If none of the above, show all items
                filteredItems = allFoodItems;
                console.log('Unknown filter type, showing all items');
                break;
        }

        renderFoodItems(filteredItems);
    }

    function renderFoodItems(foodItems) {
        // Calculate pagination
        const totalPages = Math.ceil(foodItems.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, foodItems.length);

        // Get items for current page
        const itemsToShow = foodItems.slice(startIndex, endIndex);

        // Find the container where we want to display food items
        const productsContainer = $('.products-view-grid .row');

        // Clear existing content
        productsContainer.empty();

        // If no items to show
        if (itemsToShow.length === 0) {
            productsContainer.html('<div class="col-12 text-center"><p>Không tìm thấy món ăn phù hợp</p></div>');
            updatePagination(totalPages);
            return;
        }

        // Loop through each food item and create HTML
        itemsToShow.forEach(item => {
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
            productsContainer.append(itemHtml);
        });

        // Update pagination
        updatePagination(totalPages);

        // Initialize lazy loading for images
        if (typeof window.awe_lazyloadImage === 'function') {
            window.awe_lazyloadImage();
        }
    }

    function updatePagination(totalPages) {
        // Update the pagination controls
        const paginationContainer = $('.pagination');
        if (paginationContainer.length > 0) {
            let paginationHTML = '';

            // Previous button
            paginationHTML += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="javascript:;" ${currentPage > 1 ? 'onclick="changePage(' + (currentPage - 1) + ')"' : ''}>&laquo;</a>
                </li>
            `;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active disabled' : ''}">
                        <a class="page-link" href="javascript:;" ${i !== currentPage ? 'onclick="changePage(' + i + ')"' : 'style="pointer-events: none"'}>${i}</a>
                    </li>
                `;
            }

            // Next button
            paginationHTML += `
                <li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
                    <a class="page-link link-next-pre" href="javascript:;" ${currentPage < totalPages ? 'onclick="changePage(' + (currentPage + 1) + ')"' : ''} title="${currentPage < totalPages ? currentPage + 1 : ''}">&raquo;</a>
                </li>
            `;

            paginationContainer.html(paginationHTML);
        }
    }

    // Global function to change page
    window.changePage = function (pageNumber) {
        currentPage = pageNumber;
        applyFilterIfNeeded();
        // Scroll to top of results
        $('html, body').animate({
            scrollTop: $('.products-view-grid').offset().top - 100
        }, 500);
    };

    function setupFilterEvents() {
        // Add click handlers for food type filters
        $('.nav-item-lv2 a').click(function (e) {
            const href = $(this).attr('href');

            // Only intercept clicks on food.html links
            if (href && (href === 'food.html' || href.includes('food.html?type='))) {
                e.preventDefault();

                // Extract the type parameter if it exists
                let type = '';
                if (href.includes('?type=')) {
                    type = href.split('?type=')[1];
                }

                console.log('Filter clicked:', type);

                // Update active state
                $('.nav-item-lv2 a').removeClass('active');
                $(this).addClass('active');

                // Apply the filter
                currentPage = 1; // Reset to first page
                currentFilter = type;
                filterFoodItems(type);

                // Update URL without reloading
                const newUrl = type ? `food.html?type=${type}` : 'food.html';
                history.pushState({}, '', newUrl);
            }
        });

        // Add click handlers for sorting options
        $('#sortBy li a').click(function (e) {
            e.preventDefault();
            const sortOption = $(this).attr('onclick').match(/'([^']+)'/)[1];

            console.log('Sort option clicked:', sortOption);

            // Update the displayed sort text
            $('#sortBy > li > span').text($(this).text());

            // Apply sorting
            sortFoodItems(sortOption);
        });
    }

    function sortFoodItems(sortOption) {
        // Create a copy of the filtered items
        let filteredItems = currentFilter ?
            allFoodItems.filter(item => {
                switch (currentFilter) {
                    case 'mon-an': return item.type === 'food';
                    case 'do-uong': return item.type === 'drink';
                    case 'banh-ngot': return item.type === 'dessert';
                    default: return true;
                }
            }) :
            [...allFoodItems];

        // Apply sorting
        switch (sortOption) {
            case 'alpha-asc': // A -> Z
                filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                break;

            case 'alpha-desc': // Z -> A
                filteredItems.sort((a, b) => b.name.localeCompare(a.name));
                break;

            case 'price-asc': // Price: Low to High
                filteredItems.sort((a, b) => {
                    const priceA = parseFloat(a.price.replace(/[^\d]/g, ''));
                    const priceB = parseFloat(b.price.replace(/[^\d]/g, ''));
                    return priceA - priceB;
                });
                break;

            case 'price-desc': // Price: High to Low
                filteredItems.sort((a, b) => {
                    const priceA = parseFloat(a.price.replace(/[^\d]/g, ''));
                    const priceB = parseFloat(b.price.replace(/[^\d]/g, ''));
                    return priceB - priceA;
                });
                break;

            default: // Default sorting (original order)
                // No sorting needed, already using the original order
                break;
        }

        // Render the sorted items
        currentPage = 1; // Reset to first page
        renderFoodItems(filteredItems);
    }

    function initializeMenuHighlighting() {
        // Remove active class from all menu items
        $('.nav-item-lv2 a').removeClass('active');

        if (currentFilter) {
            // Add active class to the corresponding menu item
            $(`.nav-item-lv2 a[href="food.html?type=${currentFilter}"]`).addClass('active');
            console.log('Highlighted menu for food type:', currentFilter);
        } else {
            // If no filter, highlight the "All Food" option if it exists
            $('.nav-item-lv2 a[href="food.html"]').addClass('active');
            console.log('No filter, highlighting "All Food" menu');
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
            return 'img/placeholder.jpg'; // fallback image
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

        // If it's a relative URL starting with '/', convert to relative path
        if (url.startsWith('/')) {
            // Remove leading slash and use relative path
            return url.substring(1);
        }

        // If it's already a relative path or absolute URL, return as is
        return url;
    }
});

// Global scope for pagination function to be accessible
window.changePage = function (pageNumber) {
    // This will be overridden in the document ready function
    console.log('Page changed to:', pageNumber);
};

// Thêm mã vô hiệu hóa script inline trong food.html
(function () {
    // Thiết lập biến trước khi bất kỳ script nào khác chạy
    window.foodFilterInitialized = true;
    console.log("food-filter.js loaded and set foodFilterInitialized = true");

    // Khi trang tải xong, đảm bảo rằng food-filter.js có quyền ưu tiên
    window.addEventListener('load', function () {
        // Nếu có một script inline đã render items, xóa chúng để render lại
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('type')) {
            console.log('Window fully loaded - detected type parameter, ensuring filter has priority');
            // Xóa nội dung container để tránh hiển thị trùng lặp
            const productsContainer = document.querySelector('.products-view-grid .row');
            if (productsContainer) {
                // Lưu lại tham chiếu đến container gốc
                const parentContainer = productsContainer.parentNode;
                // Xóa container cũ
                productsContainer.remove();
                // Tạo container mới với cùng class
                const newContainer = document.createElement('div');
                newContainer.className = 'row';
                // Thêm lại vào DOM
                parentContainer.appendChild(newContainer);

                console.log('Reset products container to ensure clean rendering');
            }
        }
    });
})();

// Global scope for pagination function to be accessible
window.changePage = function (pageNumber) {
    // This will be overridden in the document ready function
    console.log('Page changed to:', pageNumber);
}; 
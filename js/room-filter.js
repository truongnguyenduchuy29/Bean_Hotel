$(document).ready(function () {
    // Load rooms data from JSON file
    let allRooms = [];
    let currentFilter = '';
    
    // Pagination variables
    let currentPage = 1;
    const itemsPerPage = 12;
    let totalPages = 1;
    let currentRooms = [];

    // Check if we're on the product page or any room category page
    if (window.location.pathname === '/phong' ||
        window.location.pathname === '/product.html' ||
        window.location.pathname === '/phong-don' ||
        window.location.pathname === '/phong-doi' ||
        window.location.pathname === '/phong-vip') {
        loadRooms();
    }

    // Check URL parameters for filter or extract from pathname
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('type')) {
        currentFilter = urlParams.get('type');
        console.log('Đã phát hiện tham số type trong URL:', currentFilter);
    } else {
        // Check if we're on a specific room type page
        const pathname = window.location.pathname;
        if (pathname === '/phong-don' || pathname === '/phong-doi' || pathname === '/phong-vip') {
            currentFilter = pathname.substring(1); // Remove the leading slash
            console.log('Đã phát hiện loại phòng từ pathname:', currentFilter);
        }
    }

    function loadRooms() {
        const roomContainer = $('.room-container');
        roomContainer.addClass('loading');
        roomContainer.empty().append('<div class="col-12 text-center"><h3>Đang tải dữ liệu phòng...</h3></div>');

        $.getJSON('data/room.json', function (data) {
            allRooms = data;
            console.log('Đã tải dữ liệu phòng:', allRooms.length, 'phòng');
            applyFilterIfNeeded();
            initializeMenuHighlighting();
            roomContainer.removeClass('loading');
        }).fail(function () {
            // Try alternative paths
            $.getJSON('./data/room.json', function (data) {
                allRooms = data;
                console.log('Đã tải dữ liệu phòng:', allRooms.length, 'phòng');
                applyFilterIfNeeded();
                initializeMenuHighlighting();
                roomContainer.removeClass('loading');
            }).fail(function () {
                console.error('Error loading room data');
                roomContainer.removeClass('loading');
                roomContainer.html('<div class="col-12 text-center"><h3>Không thể tải dữ liệu phòng</h3></div>');
            });
        });
    }

    // Apply filter if URL has type parameter or if we're on a specific room type page
    function applyFilterIfNeeded() {
        if (currentFilter) {
            console.log('Áp dụng bộ lọc:', currentFilter);
            filterRooms(currentFilter);
        } else {
            console.log('Không có bộ lọc, hiển thị tất cả phòng');
            // If no filter is specified, show all rooms
            renderRooms(allRooms);
        }
    }

    // Filter rooms based on type
    function filterRooms(type) {
        if (!type) {
            renderRooms(allRooms, true); // Scroll when showing all rooms
            return;
        }

        console.log('Lọc phòng theo loại:', type);
        let filteredRooms = [];

        // Map the Vietnamese filter names from the menu to the type values in the JSON
        switch (type) {
            case 'phong-don':
                // Filter for single room types
                filteredRooms = allRooms.filter(room => room.type === 'single');
                console.log('Đã lọc phòng đơn:', filteredRooms.length, 'phòng');
                break;

            case 'phong-doi':
                // Filter for double room types
                filteredRooms = allRooms.filter(room => room.type === 'double');
                console.log('Đã lọc phòng đôi:', filteredRooms.length, 'phòng');
                break;

            case 'phong-vip':
                // Filter for VIP room types
                filteredRooms = allRooms.filter(room => room.type === 'vip');
                console.log('Đã lọc phòng vip:', filteredRooms.length, 'phòng');
                break;

            default:
                // If none of the above, show all rooms
                filteredRooms = allRooms;
                console.log('Loại không xác định, hiển thị tất cả phòng');
                break;
        }

        renderRooms(filteredRooms, true); // Scroll when filtering
    }

    // Render rooms with pagination
    function renderRooms(rooms, shouldScroll = false) {
        currentRooms = rooms;
        totalPages = Math.ceil(rooms.length / itemsPerPage);
        
        // Ensure currentPage is valid
        if (currentPage > totalPages) {
            currentPage = 1;
        }
        
        // Scroll to top when filtering
        if (shouldScroll) {
            scrollToTop();
        }
        
        renderRoomsByPage(currentPage, true); // Pass true to indicate this is initial render
        updatePagination();
    }

    // Render rooms for a specific page
    function renderRoomsByPage(pageNumber, isInitialRender = false) {
        currentPage = pageNumber;
        
        // Scroll to top when changing pages (not on initial render)
        if (!isInitialRender) {
            scrollToTop();
        }
        
        const roomContainer = $('.room-container');
        if (!roomContainer.length) {
            console.error('Không tìm thấy .room-container');
            return;
        }
        
        roomContainer.empty();

        if (currentRooms.length === 0) {
            roomContainer.html('<div class="col-12 text-center"><h3>Không tìm thấy phòng phù hợp</h3></div>');
            updateRoomCount(0);
            return;
        }

        // Calculate start and end indices for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, currentRooms.length);
        const roomsToShow = currentRooms.slice(startIndex, endIndex);

        console.log(`Hiển thị trang ${currentPage}: phòng từ ${startIndex + 1} đến ${endIndex} (tổng ${currentRooms.length} phòng)`);

        // Update room count display
        updateRoomCount(currentRooms.length);

        roomsToShow.forEach(room => {
            // Xử lý các features cho icons
            const featuresHtml = room.features && Array.isArray(room.features) ?
                room.features.slice(0, 5).map((feature, index) => `
                    <li>
                        <img width="32" height="32"
                            src="img/tag_icon_${index + 1}.svg"
                            alt="${feature}" />
                    </li>
                `).join('') : '';

            // Tạo thông tin capacity và size từ room.details
            const capacity = room.adults ? `${room.adults} Khách` : (room.details && room.details[0] ? room.details[0] : '');
            const size = room.size || (room.details && room.details[1] ? room.details[1] : '');

            // Tạo đường dẫn động
            const dynamicUrl = `room_detail.html?id=${room.id}`;
            
            // Xử lý đường dẫn hình ảnh
            let imageUrl = room.image[0];
            // Nếu image URL là từ bizweb, thay thế bằng local image
            if (imageUrl.includes('bizweb.dktcdn.net')) {
                // Sử dụng hình ảnh mặc định local
                imageUrl = 'img/anh1.jpg';
            }

            // Tạo HTML theo cấu trúc product.html
            let roomHtml = `
                <div class="col-6 col-xs-6 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                    <div class="item_product_main" data-room-id="${room.id}">
                        <div class="alper-product-item">
                            <div class="item-product-img">
                                <a class="image_thumb" href="${dynamicUrl}" title="${room.name}">
                                    <img width="480" height="272" class="lazyload"
                                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
                                        data-src="${room.image[0]}"
                                        alt="${room.name}" />
                                </a>
                            </div>
                            <div class="info-room clearfix">
                                <h3 class="name-room">
                                    <a href="${dynamicUrl}" title="${room.name}">${room.name}</a>
                                </h3>
                                <div class="tag-room">
                                    <ul class="list_tag_room">
                                        ${featuresHtml}
                                    </ul>
                                </div>
                                <div class="tag-rivew">
                                    <ul class="list_tag_review">
                                        <li>${capacity}</li>
                                        <li>${size}</li>
                                    </ul>
                                </div>
                                <div class="product-info-room">
                                    <div class="price-room">
                                        <span class="price">${room.price}</span>
                                    </div>
                                    <div class="booking-room">
                                        <a href="${dynamicUrl}" title="Đặt phòng" class="btn-booking">ĐẶT PHÒNG</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            roomContainer.append(roomHtml);
        });

        // Khởi tạo lại lazy load cho các hình ảnh
        if (window.awe_lazyloadImage && typeof window.awe_lazyloadImage === 'function') {
            window.awe_lazyloadImage();
        }
        
        updatePagination();
    }

    // Update pagination UI
    function updatePagination() {
        let paginationContainer = document.getElementById('pagination-container');
        
        // Create pagination container if it doesn't exist
        if (!paginationContainer) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'pagination';
            paginationDiv.innerHTML = `<div id="pagination-container" class="pagination-links"></div>`;
            
            const productsContainer = document.querySelector('.products-view');
            if (productsContainer) {
                productsContainer.appendChild(paginationDiv);
                paginationContainer = document.getElementById('pagination-container');
            }
        }
        
        if (!paginationContainer) return;
        
        // Clear existing pagination
        paginationContainer.innerHTML = '';
        
        // Don't show pagination if only 1 page or no rooms
        if (totalPages <= 1) return;
        
        // Previous button
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.className = 'pagination-link prev-page' + (currentPage === 1 ? ' disabled' : '');
        prevButton.innerHTML = '&laquo;';
        prevButton.onclick = function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                renderRoomsByPage(currentPage - 1);
            }
        };
        paginationContainer.appendChild(prevButton);
        
        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = '#';
            pageButton.className = 'pagination-link page-number' + (i === currentPage ? ' active' : '');
            pageButton.textContent = i;
            pageButton.onclick = function(e) {
                e.preventDefault();
                renderRoomsByPage(i);
            };
            paginationContainer.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.className = 'pagination-link next-page' + (currentPage === totalPages ? ' disabled' : '');
        nextButton.innerHTML = '&raquo;';
        nextButton.onclick = function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                renderRoomsByPage(currentPage + 1);
            }
        };
        paginationContainer.appendChild(nextButton);
    }

    // Update the room count display
    function updateRoomCount(count) {
        // Update count in the title if it exists
        let titleElement = $('.title-page');
        if (titleElement.length > 0) {
            let title = "Danh sách phòng";
            if (currentFilter === 'phong-don') {
                title = "Phòng đơn";
            } else if (currentFilter === 'phong-doi') {
                title = "Phòng đôi";
            } else if (currentFilter === 'phong-vip') {
                title = "Phòng vip";
            }

            titleElement.text(`${title} (${count} phòng)`);
        }
    }

    // Initialize menu highlighting based on current filter
    function initializeMenuHighlighting() {
        // Remove active class from all menu items first
        $('.nav-item-lv2 a').removeClass('active');

        if (currentFilter) {
            // Add active class to the corresponding menu item - phải tìm href có dạng product.html?type=phong-xxx
            $(`.nav-item-lv2 a[href="product.html?type=${currentFilter}"]`).addClass('active');
            console.log('Đã highlight menu cho loại phòng:', currentFilter);
        } else {
            // If no filter, highlight the "All Rooms" option if it exists
            $('.nav-item-lv2 a[href="product.html"]').addClass('active');
            console.log('Không có bộ lọc, highlight menu "Tất cả phòng"');
        }
    }

    // Handle navigation menu item clicks for filtering
    $('.nav-item-lv2 a').click(function (e) {
        const hrefPath = $(this).attr('href');
        console.log('Click menu với href:', hrefPath);

        // Check if we're already on the product page
        if (window.location.pathname === '/product.html' || window.location.pathname === '/phong') {
            // Kiểm tra xem href có chứa tham số type không
            if (hrefPath && hrefPath.includes('product.html?type=')) {
                e.preventDefault();
                // Trích xuất loại phòng từ tham số URL
                const urlParams = new URLSearchParams(hrefPath.split('?')[1]);
                const type = urlParams.get('type');

                console.log('Đã click menu lọc phòng:', type);

                // Update active state for menu items
                $('.nav-item-lv2 a').removeClass('active');
                $(this).addClass('active');

                filterRooms(type);
                currentFilter = type;
                currentPage = 1; // Reset to page 1 when filtering

                // Update URL without reloading the page
                const newUrl = window.location.pathname + '?type=' + type;
                history.pushState({}, '', newUrl);
            } else if (hrefPath === 'product.html' || hrefPath === '/phong') {
                // Show all rooms
                e.preventDefault();

                console.log('Đã click menu "Tất cả phòng"');

                // Update active state for menu items
                $('.nav-item-lv2 a').removeClass('active');
                $(this).addClass('active');

                filterRooms('');
                currentFilter = '';
                currentPage = 1; // Reset to page 1

                // Update URL without reloading the page to remove the type parameter
                const newUrl = window.location.pathname;
                history.pushState({}, '', newUrl);
            }
        }
    });

    // Add handler for "Tất cả phòng" or any "All Rooms" option if it exists
    $('.all-rooms-link').click(function (e) {
        e.preventDefault();

        console.log('Đã click "Tất cả phòng"');

        // Update active state for menu items
        $('.nav-item-lv2 a').removeClass('active');
        $(this).addClass('active');

        filterRooms('');
        currentFilter = '';
        currentPage = 1; // Reset to page 1

        // Update URL without reloading the page
        const newUrl = window.location.pathname;
        history.pushState({}, '', newUrl);
    });

    // Scroll to top function
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

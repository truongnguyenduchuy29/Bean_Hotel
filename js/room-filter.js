$(document).ready(function () {
    // Load rooms data from JSON file
    let allRooms = [];
    let currentFilter = '';

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
    } else {
        // Check if we're on a specific room type page
        const pathname = window.location.pathname;
        if (pathname === '/phong-don' || pathname === '/phong-doi' || pathname === '/phong-vip') {
            currentFilter = pathname.substring(1); // Remove the leading slash
        }
    }

    function loadRooms() {
        const roomContainer = $('.room-container');
        roomContainer.addClass('loading');
        roomContainer.empty().append('<div class="col-12 text-center"><h3>Đang tải dữ liệu phòng...</h3></div>');

        $.getJSON('/data/room.json', function (data) {
            allRooms = data;
            applyFilterIfNeeded();
            initializeMenuHighlighting();
            roomContainer.removeClass('loading');
        }).fail(function () {
            console.error('Error loading room data');
            roomContainer.removeClass('loading');
            roomContainer.html('<div class="col-12 text-center"><h3>Không thể tải dữ liệu phòng</h3></div>');
        });
    }

    // Apply filter if URL has type parameter or if we're on a specific room type page
    function applyFilterIfNeeded() {
        if (currentFilter) {
            filterRooms(currentFilter);
        } else {
            // If no filter is specified, show all rooms
            renderRooms(allRooms);
        }
    }

    // Filter rooms based on type
    function filterRooms(type) {
        if (!type) {
            renderRooms(allRooms);
            return;
        }

        let filteredRooms = [];

        // Map the Vietnamese filter names from the menu to the type values in the JSON
        switch (type) {
            case 'phong-don':
                // Filter for single room types
                filteredRooms = allRooms.filter(room => room.type === 'single');
                break;

            case 'phong-doi':
                // Filter for double room types
                filteredRooms = allRooms.filter(room => room.type === 'double');
                break;

            case 'phong-vip':
                // Filter for VIP room types
                filteredRooms = allRooms.filter(room => room.type === 'vip');
                break;

            default:
                // If none of the above, show all rooms
                filteredRooms = allRooms;
                break;
        }

        renderRooms(filteredRooms);
    }

    // Render rooms to the page
    function renderRooms(rooms) {
        const roomContainer = $('.room-container');
        roomContainer.empty();

        if (rooms.length === 0) {
            roomContainer.html('<div class="col-12 text-center"><h3>Không tìm thấy phòng phù hợp</h3></div>');
            updateRoomCount(0);
            return;
        }

        // Update room count display
        updateRoomCount(rooms.length);

        rooms.forEach(room => {
            let roomHtml = `
                <div class="col-6 col-xs-6 col-sm-6 col-md-4 col-lg-4 col-xl-4">
                    <div class="evo-product-block-item">
                        <a href="room_detail.html?id=${room.id}" title="${room.name}" class="product__box-image">
                            <img class="lazy loaded" src="${room.image[0]}" alt="${room.name}" />
                        </a>
                        <div class="product-meta">
                            <h3 class="product-title"><a href="room_detail.html?id=${room.id}" title="${room.name}">${room.name}</a></h3>
                            <div class="product-price">
                                <span class="price">${room.price}</span>
                            </div>
                            <ul class="room-highlights">
                                ${room.details.map(detail => `<li><i class="fa fa-check"></i> ${detail}</li>`).join('')}
                            </ul>
                            <ul class="product-features">
                                ${room.freeServices ? room.freeServices.map(service => `<li>${service}</li>`).join('') : ''}
                            </ul>
                            <div class="product-actions">
                                <a href="room_detail.html?id=${room.id}" class="btn btn-primary btn-view-detail" title="Xem chi tiết">
                                    Xem chi tiết
                                </a>
                                <a href="/dat-phong?room=${room.id}" class="btn btn-outline-primary btn-book" title="Đặt ngay">
                                    Đặt ngay
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            roomContainer.append(roomHtml);
        });
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
            // Add active class to the corresponding menu item
            $(`.nav-item-lv2 a[href="/${currentFilter}"]`).addClass('active');
        } else {
            // If no filter, highlight the "All Rooms" option if it exists
            $('.nav-item-lv2 a[href="/phong"]').addClass('active');
        }
    }

    // Handle navigation menu item clicks for filtering
    $('.nav-item-lv2 a').click(function (e) {
        const hrefPath = $(this).attr('href');

        // Check if we're already on the product page
        if (window.location.pathname === '/phong' || window.location.pathname === '/product.html') {
            if (hrefPath === '/phong-don' || hrefPath === '/phong-doi' || hrefPath === '/phong-vip') {
                e.preventDefault();
                const type = hrefPath.replace('/', '');

                // Update active state for menu items
                $('.nav-item-lv2 a').removeClass('active');
                $(this).addClass('active');

                filterRooms(type);
                currentFilter = type;

                // Update URL without reloading the page
                const newUrl = window.location.pathname + '?type=' + type;
                history.pushState({}, '', newUrl);
            } else if (hrefPath === '/phong') {
                // Show all rooms
                e.preventDefault();

                // Update active state for menu items
                $('.nav-item-lv2 a').removeClass('active');
                $(this).addClass('active');

                filterRooms('');
                currentFilter = '';

                // Update URL without reloading the page to remove the type parameter
                const newUrl = window.location.pathname;
                history.pushState({}, '', newUrl);
            }
        }
    });

    // Add handler for "Tất cả phòng" or any "All Rooms" option if it exists
    $('.all-rooms-link').click(function (e) {
        e.preventDefault();

        // Update active state for menu items
        $('.nav-item-lv2 a').removeClass('active');
        $(this).addClass('active');

        filterRooms('');
        currentFilter = '';

        // Update URL without reloading the page
        const newUrl = window.location.pathname;
        history.pushState({}, '', newUrl);
    });
});

$(document).ready(function () {
    // Lấy id phòng từ URL
    function getRoomIdFromUrl() {
        // Kiểm tra tham số URL trước tiên
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('id')) {
            return urlParams.get('id');
        }

        // Nếu không có tham số, thử lấy từ pathname
        const pathname = window.location.pathname;

        // Trường hợp đặc biệt: nếu đang ở trang room_detail.html mà không có tham số id
        if (pathname.includes('room_detail.html')) {
            // Sử dụng ID mặc định cho demo
            console.log('Không tìm thấy ID phòng trong URL, sử dụng ID mặc định');
            return 'phong-don-tieu-chuan';
        }

        // Xử lý đường dẫn kiểu /phong-don-tieu-chuan
        const segments = pathname.split('/');
        // Lấy phần cuối cùng không rỗng của URL
        for (let i = segments.length - 1; i >= 0; i--) {
            if (segments[i] && segments[i].length > 0) {
                if (segments[i].startsWith('phong-') ||
                    segments[i].includes('-don') ||
                    segments[i].includes('-doi') ||
                    segments[i].includes('-vip')) {
                    console.log('Tìm thấy ID phòng từ pathname:', segments[i]);
                    return segments[i];
                }
            }
        }

        // Trường hợp không tìm thấy, trả về ID mặc định
        console.log('Không tìm thấy ID phòng phù hợp, sử dụng ID mặc định');
        return 'phong-don-tieu-chuan';
    }

    // Tải thông tin chi tiết phòng từ room.json
    function loadRoomDetail() {
        const roomId = getRoomIdFromUrl();
        console.log('ID phòng được xác định:', roomId);

        if (!roomId) {
            showErrorMessage("Không tìm thấy mã phòng. Vui lòng kiểm tra lại URL.");
            return;
        }

        console.log('Đang tải dữ liệu phòng từ file JSON...');
        // Đảm bảo đường dẫn tương đối với vị trí file HTML
        $.getJSON('/data/room.json', function (data) {
            console.log('Đã tải dữ liệu thành công, số lượng phòng:', data.length);
            const room = data.find(r => r.id === roomId);

            if (room) {
                console.log('Tìm thấy thông tin phòng:', room.name);
                updateRoomDetails(room);
            } else {
                console.error('Không tìm thấy phòng với ID:', roomId);
                showErrorMessage("Không tìm thấy thông tin phòng với mã: " + roomId);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Lỗi khi tải file JSON:', textStatus, errorThrown);
            showErrorMessage("Không thể tải dữ liệu phòng từ máy chủ. Lỗi: " + textStatus);
        });
    }

    // Hiển thị thông báo lỗi
    function showErrorMessage(message) {
        $('.product-detail-wrapper').html(`
            <div class="alert alert-danger" role="alert">
                <h4>Có lỗi xảy ra</h4>
                <p>${message}</p>
                <a href="/product.html" class="btn btn-primary">Quay lại danh sách phòng</a>
            </div>
        `);
    }

    // Cập nhật thông tin chi tiết phòng trên trang
    function updateRoomDetails(room) {
        console.log('Bắt đầu cập nhật thông tin phòng:', room.name);

        // Cập nhật tiêu đề trang
        document.title = room.name + ' - Bean Hotel';

        // Cập nhật tên phòng
        $('.product-title').text(room.name);
        $('.title-product').text(room.name);

        // Cập nhật giá phòng
        $('.special-price .price').text(room.price);

        // Cập nhật hình ảnh phòng
        updateRoomImages(room);

        // Cập nhật thông tin cơ bản (số người, kích thước)
        updateRoomBasicInfo(room);

        // Cập nhật mô tả phòng
        $('.product-summary').html(`<div class="rte"><p>${room.description}</p></div>`);
        $('#content').html(`
            <p>${room.description}</p>
            <p><strong>Dịch vụ miễn phí:</strong> ${room.freeServices ? room.freeServices.join(', ') : ''}</p>
            <p><strong>Giờ trả phòng:</strong> ${room.checkoutTime || '12h00 hàng ngày'}</p>
            <p><strong>Hình thức Thanh toán:</strong> ${room.paymentMethods ? room.paymentMethods.join(', ') : ''}</p>
        `);

        // Cập nhật thông tin dịch vụ miễn phí
        updateFreeServices(room);

        // Cập nhật thông tin thanh toán
        updatePaymentInfo(room);

        // Cập nhật các tiện nghi khác
        updateAdditionalAmenities(room);

        // Cập nhật meta tags
        updateMetaTags(room);

        // Cập nhật link đặt phòng
        updateBookingLinks(room);

        console.log('Hoàn tất cập nhật thông tin phòng');
    }

    // Cập nhật hình ảnh phòng
    function updateRoomImages(room) {
        if (!room.image || room.image.length === 0) return;

        // Xóa các hình ảnh hiện tại
        const swiperWrapper = $('#slide_pro_room .swiper-wrapper');
        swiperWrapper.empty();

        // Thêm tất cả hình ảnh vào swiper
        room.image.forEach((imgSrc, index) => {
            const slide = `
                <div class="swiper-slide">
                    <img src="${imgSrc}" alt="${room.name} - Ảnh ${index + 1}" class="img-responsive center-block">
                </div>
            `;
            swiperWrapper.append(slide);
        });

        // Thêm phần tử pagination nếu chưa có
        if ($('#slide_pro_room .swiper-pagination').length === 0) {
            $('#slide_pro_room').append('<div class="swiper-pagination"></div>');
        }

        // Thêm CSS tùy chỉnh cho slider
        const customCSS = `
            /* Cấu hình hiển thị nhiều ảnh trên slider */
            @media (min-width: 768px) {
                #slide_pro_room .swiper-slide {
                    width: 33.33% !important;
                }
                
                #slide_pro_room .swiper-slide img {
                    height: 300px;
                    object-fit: cover;
                }
            }
            
            /* Thêm pagination cho slider */
            #slide_pro_room .swiper-pagination {
                position: absolute;
                bottom: 10px;
                left: 0;
                width: 100%;
                text-align: center;
            }
            
            #slide_pro_room .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                display: inline-block;
                border-radius: 50%;
                background: #000;
                opacity: 0.2;
                margin: 0 5px;
            }
            
            #slide_pro_room .swiper-pagination-bullet-active {
                opacity: 1;
                background: #cd9a2b;
            }
        `;

        // Thêm CSS vào trang nếu chưa có
        if ($('#room-detail-custom-css').length === 0) {
            $('<style id="room-detail-custom-css">').html(customCSS).appendTo('head');
        }

        // Khởi tạo lại Swiper nếu cần
        if (typeof Swiper !== 'undefined') {
            // Nếu đã có swiper instance, hủy nó trước
            if (window.gallerySlide) {
                window.gallerySlide.destroy(true, true);
            }

            // Khởi tạo Swiper mới với cấu hình hiển thị nhiều ảnh
            window.gallerySlide = new Swiper("#slide_pro_room", {
                speed: 400,
                spaceBetween: 10,
                initialSlide: 0,
                autoHeight: false,
                direction: "horizontal",
                loop: room.image.length > 1,
                autoplay: room.image.length > 1 ? { delay: 5000 } : false,
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true
                },
                effect: "slide",
                slidesPerView: 1,
                grabCursor: true,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                breakpoints: {
                    // Khi màn hình >= 768px, hiển thị 3 ảnh
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 15
                    }
                }
            });
        }
    }

    // Khởi tạo slider cho hình ảnh nếu cần
    function initializeImageSlider() {
        // Kiểm tra xem có thư viện slider không
        if (typeof Swiper !== 'undefined') {
            new Swiper('.product-thumb-image', {
                slidesPerView: 4,
                spaceBetween: 10,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        }
    }

    // Cập nhật thông tin cơ bản về phòng (số người, kích thước)
    function updateRoomBasicInfo(room) {
        const basicInfoContainer = $('.room-basic-info');
        basicInfoContainer.empty();

        // Thêm thông tin về số người lớn
        if (room.adults) {
            const adultInfo = `
                <div class="item_tag_info">
                    <img width="32" height="32" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/people.png?1749443141671" alt="Số người lớn" />
                    ${room.adults} Người lớn
                </div>
            `;
            basicInfoContainer.append(adultInfo);
        }

        // Thêm thông tin về số trẻ em
        if (room.children) {
            const childrenInfo = `
                <div class="item_tag_info">
                    <img width="32" height="32" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/people.png?1749443141671" alt="Số trẻ em" />
                    ${room.children} Trẻ em
                </div>
            `;
            basicInfoContainer.append(childrenInfo);
        }

        // Thêm thông tin về diện tích
        if (room.size) {
            const sizeInfo = `
                <div class="item_tag_info">
                    <img width="32" height="32" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/metter.png?1749443141671" alt="Diện tích phòng" />
                    Phòng ${room.size}
                </div>
            `;
            basicInfoContainer.append(sizeInfo);
        }
        // Lưu ý: Phần hiển thị freeServices đã được loại bỏ
    }

    // Cập nhật thông tin dịch vụ miễn phí
    function updateFreeServices(room) {
        const freeServicesContainer = $('.free-services-list');
        freeServicesContainer.empty();

        // Thêm CSS để hiển thị dịch vụ phòng thành nhiều cột
        const servicesCss = `
            .free-services-list {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 15px;
            }
            
            @media (min-width: 576px) {
                .free-services-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (min-width: 992px) {
                .free-services-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            .free-services-list li {
                margin-bottom: 10px;
            }
            
            .item_ser {
                display: flex;
                align-items: center;
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            
            .item_ser:hover {
                background-color: #f0f0f0;
                transform: translateY(-2px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            
            .item_ser img {
                margin-right: 10px;
            }
        `;

        // Thêm CSS vào trang nếu chưa có
        if ($('#services-custom-css').length === 0) {
            $('<style id="services-custom-css">').html(servicesCss).appendTo('head');
        }

        if (room.freeServices && room.freeServices.length > 0) {
            room.freeServices.forEach((service) => {
                // Chọn icon phù hợp với từng loại dịch vụ
                let iconIndex = 1; // Mặc định

                if (service.toLowerCase().includes('ăn sáng') || service.toLowerCase().includes('cafe')) {
                    iconIndex = 1; // Icon cà phê/ăn sáng
                } else if (service.toLowerCase().includes('đồ ăn') || service.toLowerCase().includes('phòng')) {
                    iconIndex = 2; // Icon đồ ăn tại phòng
                } else if (service.toLowerCase().includes('bếp') || service.toLowerCase().includes('nấu')) {
                    iconIndex = 3; // Icon bếp nấu
                } else if (service.toLowerCase().includes('tắm') || service.toLowerCase().includes('hoa sen')) {
                    iconIndex = 4; // Icon bồn tắm
                } else if (service.toLowerCase().includes('wifi') || service.toLowerCase().includes('internet')) {
                    iconIndex = 5; // Icon internet
                } else if (service.toLowerCase().includes('nước') || service.toLowerCase().includes('khoáng')) {
                    iconIndex = 2; // Icon nước khoáng
                } else if (service.toLowerCase().includes('đón') || service.toLowerCase().includes('sân bay')) {
                    iconIndex = 3; // Icon đón tiễn
                }

                const serviceHtml = `
                    <li>
                        <div class="item_ser">
                            <img width="32" height="32" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/tag_icon_${iconIndex}.svg?1749443141671" alt="${service}" />
                            ${service}
                        </div>
                    </li>
                `;
                freeServicesContainer.append(serviceHtml);
            });
        }
    }

    // Cập nhật thông tin thanh toán
    function updatePaymentInfo(room) {
        // Cập nhật giờ trả phòng
        if (room.checkoutTime) {
            $('.checkout-time').text(room.checkoutTime);
        }

        // Cập nhật phương thức thanh toán
        const paymentMethodsContainer = $('.payment-methods-list');
        paymentMethodsContainer.empty();

        // Thêm CSS cho phương thức thanh toán
        const paymentCss = `
            .payment-methods-list {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 8px;
            }
            
            @media (min-width: 576px) {
                .payment-methods-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (min-width: 992px) {
                .payment-methods-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            .payment-methods-list li {
                margin-bottom: 5px;
                background-color: #f9f9f9;
                padding: 8px 12px;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            
            .payment-methods-list li:hover {
                background-color: #f0f0f0;
            }
            
            .payment-methods-list li i {
                color: #cd9a2b;
                margin-right: 5px;
            }
        `;

        // Thêm CSS vào trang nếu chưa có
        if ($('#payment-custom-css').length === 0) {
            $('<style id="payment-custom-css">').html(paymentCss).appendTo('head');
        }

        if (room.paymentMethods && room.paymentMethods.length > 0) {
            room.paymentMethods.forEach(method => {
                const methodHtml = `<li><i class="fa fa-check"></i> ${method}</li>`;
                paymentMethodsContainer.append(methodHtml);
            });
        }

        // Cập nhật giá phòng
        $('.special-price .price').text(room.price);
        $('.bost-price').text(room.priceValue);
        $('meta[itemprop="price"]').attr('content', room.priceValue);

        // Cập nhật giá trị trong form đặt phòng
        $('input[name="contact[Tên phòng]"]').val(room.name);
        $('input[name="contact[Giá phòng]"]').val(room.price);
        $('#myprice').val(room.priceValue);
    }

    // Cập nhật các tiện nghi bổ sung
    function updateAdditionalAmenities(room) {
        const amenitiesContainer = $('.additional-amenities-list');
        amenitiesContainer.empty();

        // Thêm CSS để hiển thị tiện nghi thành 3 cột
        const customCSS = `
            .additional-amenities-list {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 8px;
            }
            
            @media (min-width: 576px) {
                .additional-amenities-list {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (min-width: 992px) {
                .additional-amenities-list {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            
            .additional-amenities-list li {
                margin-bottom: 5px;
            }
        `;

        // Thêm CSS vào trang nếu chưa có
        if ($('#amenities-custom-css').length === 0) {
            $('<style id="amenities-custom-css">').html(customCSS).appendTo('head');
        }

        // Kiểm tra cấu trúc additionalAmenities, có thể là mảng đối tượng hoặc mảng chuỗi
        if (room.additionalAmenities) {
            if (Array.isArray(room.additionalAmenities)) {
                if (room.additionalAmenities.length > 0) {
                    if (typeof room.additionalAmenities[0] === 'object') {
                        // Trường hợp additionalAmenities là mảng các đối tượng có name và items
                        room.additionalAmenities.forEach(category => {
                            if (category.items && Array.isArray(category.items)) {
                                category.items.forEach(item => {
                                    const amenityHtml = `<li><i class="fa fa-check"></i> ${item}</li>`;
                                    amenitiesContainer.append(amenityHtml);
                                });
                            }
                        });
                    } else {
                        // Trường hợp additionalAmenities là mảng chuỗi
                        room.additionalAmenities.forEach(amenity => {
                            const amenityHtml = `<li><i class="fa fa-check"></i> ${amenity}</li>`;
                            amenitiesContainer.append(amenityHtml);
                        });
                    }
                }
            }
        }

        // Nếu không có tiện nghi nào được thêm vào, hiển thị thông báo
        if (amenitiesContainer.children().length === 0) {
            amenitiesContainer.append(`<li>Đang cập nhật thông tin tiện nghi</li>`);
        }
    }

    // Cập nhật meta tags
    function updateMetaTags(room) {
        // Cập nhật meta title
        $('meta[property="og:title"]').attr('content', room.name);

        // Cập nhật meta description
        const description = room.description ?
            (room.description.substring(0, 150) + '...') :
            `Phòng ${room.name} tại Bean Hotel với giá ${room.price}`;

        $('meta[name="description"]').attr('content', description);
        $('meta[property="og:description"]').attr('content', description);

        // Cập nhật meta image
        if (room.image && room.image.length > 0) {
            $('meta[property="og:image"]').attr('content', room.image[0]);
            $('meta[property="og:image:secure_url"]').attr('content', room.image[0]);
        }

        // Cập nhật meta price
        if (room.priceValue) {
            $('meta[property="og:price:amount"]').attr('content', (room.priceValue / 1000).toFixed(3));
        }
    }

    // Cập nhật link đặt phòng
    function updateBookingLinks(room) {
        // Cập nhật link "Đặt phòng ngay"
        $('.a-dat-phong').attr('href', `/dat-phong?room=${room.id}`);
    }

    // Xác định có đang ở trang chi tiết phòng hay không
    function isRoomDetailPage() {
        const pathname = window.location.pathname;
        const isRoomDetail = pathname.includes('/phong-') ||
            pathname.includes('room_detail.html');

        console.log('Đường dẫn hiện tại:', pathname);
        console.log('Là trang chi tiết phòng?', isRoomDetail);
        return isRoomDetail;
    }

    // Khởi tạo trang
    console.log('Khởi tạo trang chi tiết phòng...');
    loadRoomDetail();

    // In ra thông báo để debug
    console.log('Script room-detail.js đã được tải và thực thi');
});
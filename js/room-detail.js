$(document).ready(function() {
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
        $.getJSON('/data/room.json', function(data) {
            console.log('Đã tải dữ liệu thành công, số lượng phòng:', data.length);
            const room = data.find(r => r.id === roomId);
            
            if (room) {
                console.log('Tìm thấy thông tin phòng:', room.name);
                updateRoomDetails(room);
            } else {
                console.error('Không tìm thấy phòng với ID:', roomId);
                showErrorMessage("Không tìm thấy thông tin phòng với mã: " + roomId);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
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
        
        // Thêm hình ảnh mới vào swiper
        room.image.forEach((imgSrc, index) => {
            const slide = `
                <div class="swiper-slide">
                    <img height="600" width="340" src="${imgSrc}" alt="${room.name} - Ảnh ${index + 1}" class="img-responsive center-block">
                </div>
            `;
            swiperWrapper.append(slide);
        });
        
        // Khởi tạo lại Swiper nếu cần
        if (typeof Swiper !== 'undefined') {
            // Nếu đã có swiper instance, hủy nó trước
            if (window.gallerySlide) {
                window.gallerySlide.destroy(true, true);
            }
            
            // Khởi tạo Swiper mới
            window.gallerySlide = new Swiper("#slide_pro_room", {
                speed: 400,
                spaceBetween: 10,
                initialSlide: 0,
                autoHeight: false,
                direction: "horizontal",
                loop: room.image.length > 1,
                autoplay: room.image.length > 1 ? 5000 : false,
                pagination: ".swiper-pagination",
                effect: "slide",
                slidesPerView: 1,
                grabCursor: true,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
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
        
        // Thêm các tính năng đặc biệt nếu cần
        if (room.features && room.features.length > 0) {
            room.features.forEach((feature, index) => {
                if (index < 3) { // Giới hạn số lượng feature hiển thị ở phần này
                    const featureInfo = `
                        <div class="item_tag_info">
                            <img width="32" height="32" src="//bizweb.dktcdn.net/100/472/947/themes/888072/assets/tag_icon_${(index % 5) + 1}.svg?1749443141671" alt="${feature}" />
                            ${feature}
                        </div>
                    `;
                    basicInfoContainer.append(featureInfo);
                }
            });
        }
    }

    // Cập nhật thông tin dịch vụ miễn phí
    function updateFreeServices(room) {
        const freeServicesContainer = $('.free-services-list');
        freeServicesContainer.empty();
        
        if (room.freeServices && room.freeServices.length > 0) {
            room.freeServices.forEach((service, index) => {
                // Tạo icon khác nhau cho mỗi dịch vụ
                const iconIndex = (index % 5) + 1;
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

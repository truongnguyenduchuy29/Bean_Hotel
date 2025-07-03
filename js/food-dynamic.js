document.addEventListener('DOMContentLoaded', function () {
    // Lấy ID món ăn từ URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id') || 'mi-xao-bo'; // Mặc định là 'mi-xao-bo'

    // Load và render dữ liệu món ăn
    loadFoodData(foodId);
});

async function loadFoodData(foodId) {
    try {
        // Fetch dữ liệu từ food.json
        const response = await fetch('data/food.json');
        const foodData = await response.json();

        // Tìm món ăn theo ID
        const food = foodData.find(item => item.id === foodId);

        if (food) {
            // Render dữ liệu lên trang
            renderFoodDetail(food);
        } else {
            console.error('Không tìm thấy món ăn với ID:', foodId);
            // Fallback về món đầu tiên
            if (foodData.length > 0) {
                renderFoodDetail(foodData[0]);
            }
        }
    } catch (error) {
        console.error('Lỗi khi load dữ liệu:', error);
    }
}

function renderFoodDetail(food) {
    // 1. Cập nhật meta tags
    updateMetaTags(food);

    // 2. Cập nhật title và breadcrumb
    updateTitleAndBreadcrumb(food);

    // 3. Cập nhật hình ảnh sản phẩm
    updateProductImages(food);

    // 4. Cập nhật thông tin sản phẩm
    updateProductInfo(food);

    // 5. Cập nhật mô tả và chính sách
    updateProductDescription(food);

    // 6. Cập nhật sản phẩm liên quan
    updateRelatedProducts(food);

    // 7. Đảm bảo tất cả các thành phần đã được cập nhật trước khi tái khởi tạo
    setTimeout(() => {
        // Đảm bảo Swiper và LightGallery được khởi tạo lại sau khi DOM được cập nhật
        if (typeof reinitializeSwiper === 'function') {
            reinitializeSwiper();
        }

        // Kích hoạt tab đầu tiên để đảm bảo UI hiển thị đúng
        const firstTab = document.querySelector('.product-tab ul li:first-child');
        if (firstTab) {
            firstTab.click();
        }
    }, 100);
}

function updateMetaTags(food) {
    // Cập nhật title
    document.title = food.name;

    // Cập nhật meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', food.shortDescription || food.description || '');
    }

    // Cập nhật meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && food.tags) {
        metaKeywords.setAttribute('content', food.tags.join(', '));
    }

    // Cập nhật Open Graph tags
    updateOGTag('og:title', food.name);
    updateOGTag('og:description', food.shortDescription || food.description || '');
    updateOGTag('og:image', food.image[0]);
    updateOGTag('og:price:amount', food.price.replace(/[^\d]/g, ''));

    // Cập nhật canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.setAttribute('href', `${window.location.origin}/${food.url}`);
    }
}

function updateOGTag(property, content) {
    const tag = document.querySelector(`meta[property="${property}"]`);
    if (tag) {
        tag.setAttribute('content', content);
    }
}

function updateTitleAndBreadcrumb(food) {
    // Cập nhật breadcrumb - tìm text "Mì xào bò" và thay thế
    const breadcrumbItems = document.querySelectorAll('.bread-crumb strong span');
    breadcrumbItems.forEach(item => {
        if (item.textContent.includes('Mì xào bò')) {
            item.textContent = food.name;
        }
    });
}

function updateProductImages(food) {
    // Cập nhật hình ảnh chính trong slide show
    const slideContainer = document.querySelector('.gallery-top .swiper-wrapper');
    if (slideContainer && food.image) {
        slideContainer.innerHTML = '';

        food.image.forEach((imageUrl, index) => {
            const slideDiv = document.createElement('a');
            slideDiv.className = 'swiper-slide';
            slideDiv.setAttribute('data-hash', index);

            // Xử lý URL cho href
            let fullSizeUrl = '';
            if (imageUrl.includes('bizweb.dktcdn.net/')) {
                const urlParts = imageUrl.split('bizweb.dktcdn.net/');
                fullSizeUrl = `//bizweb.dktcdn.net/thumb/1024x1024/${urlParts[1]}`;
            } else {
                fullSizeUrl = imageUrl;
            }

            slideDiv.setAttribute('href', fullSizeUrl);
            slideDiv.setAttribute('title', 'Click để xem');
            slideDiv.innerHTML = `
                <img 
                    height="716"
                    width="930"
                    src="${formatImageUrl(imageUrl)}"
                    alt="${food.name}"
                    data-image="${formatImageUrl(imageUrl)}"
                    class="img-responsive mx-auto d-block swiper-lazy"
                />
            `;
            slideContainer.appendChild(slideDiv);
        });
    }

    // Cập nhật thumbnail images
    const thumbContainer = document.querySelector('.gallery-thumbs .swiper-wrapper');
    if (thumbContainer && food.image) {
        thumbContainer.innerHTML = '';

        food.image.forEach((imageUrl, index) => {
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'swiper-slide';
            thumbDiv.setAttribute('data-hash', index);

            // Xử lý URL cho thumbnail
            let thumbnailUrl = '';
            if (imageUrl.includes('bizweb.dktcdn.net/')) {
                const urlParts = imageUrl.split('bizweb.dktcdn.net/');
                thumbnailUrl = `//bizweb.dktcdn.net/thumb/medium/${urlParts[1]}`;
            } else {
                thumbnailUrl = imageUrl;
            }

            thumbDiv.innerHTML = `
                <div class="p-100">
                    <img
                        height="80"
                        width="80"
                        src="${thumbnailUrl}"
                        alt="${food.name}"
                        data-image="${thumbnailUrl}"
                        class="swiper-lazy"
                    />
                </div>
            `;
            thumbContainer.appendChild(thumbDiv);
        });
    }

    // Cập nhật hình ảnh đơn lẻ nếu có
    const singleImages = document.querySelectorAll('.product-image img, .product-thumbnail img');
    singleImages.forEach(img => {
        if (food.image && food.image[0]) {
            img.src = formatImageUrl(food.image[0]);
            img.alt = food.name;
        }
    });

    // Cập nhật lightgallery container ID nếu cần
    const lightGalleryContainer = document.querySelector('.gallery-top .swiper-wrapper');
    if (lightGalleryContainer) {
        lightGalleryContainer.id = 'lightgallery';
    }

    // Tái khởi tạo Swiper nếu cần
    reinitializeSwiper();
}

// Hàm để khởi tạo lại Swiper sau khi cập nhật hình ảnh
function reinitializeSwiper() {
    // Nếu đã có các instance swiper, hủy chúng trước
    if (window.galleryThumbs) {
        window.galleryThumbs.destroy(true, true);
    }

    if (window.galleryTop) {
        window.galleryTop.destroy(true, true);
    }

    // Khởi tạo lại các swiper với cấu hình giống như trong food_detail.html
    window.galleryThumbs = new Swiper(".gallery-thumbs", {
        spaceBetween: 5,
        slidesPerView: 10,
        freeMode: true,
        lazy: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        hashNavigation: true,
        slideToClickedSlide: true,
        breakpoints: {
            260: {
                slidesPerView: 3,
                spaceBetween: 10,
            },
            300: {
                slidesPerView: 4,
                spaceBetween: 10,
            },
            500: {
                slidesPerView: 4,
                spaceBetween: 10,
            },
            640: {
                slidesPerView: 4,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 10,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 10,
            },
            1199: {
                slidesPerView: 5,
                spaceBetween: 10,
            },
        },
        navigation: {
            nextEl: ".gallery-thumbs .swiper-button-next",
            prevEl: ".gallery-thumbs .swiper-button-prev",
        },
    });

    window.galleryTop = new Swiper(".gallery-top", {
        spaceBetween: 0,
        lazy: true,
        hashNavigation: true,
        thumbs: {
            swiper: window.galleryThumbs,
        },
    });

    // Khởi tạo lại lightGallery nếu nó đã tồn tại
    if ($.fn.lightGallery && $('#lightgallery').length) {
        $('#lightgallery').lightGallery({
            thumbnail: false
        });
    }
}

function updateProductInfo(food) {
    // Cập nhật tên sản phẩm
    const productNames = document.querySelectorAll('h1.title-product, .product-name h3, .product-title');
    productNames.forEach(element => {
        element.textContent = food.name;
    });

    // Cập nhật SKU
    const skuElements = document.querySelectorAll('.variant-sku, .sku-number');
    skuElements.forEach(element => {
        const skuSpan = element.querySelector('.a-sku') || element;
        skuSpan.textContent = food.id;
    });

    // Cập nhật giá
    const priceElements = document.querySelectorAll('.special-price .price, .product-price');
    priceElements.forEach(element => {
        element.textContent = food.price;
    });

    // Cập nhật giá cũ
    const oldPriceElements = document.querySelectorAll('.old-price .price, .product-price-old');
    oldPriceElements.forEach(element => {
        if (food.oldPrice) {
            element.textContent = food.oldPrice;
            element.closest('.old-price').style.display = 'inline';
        } else {
            element.closest('.old-price').style.display = 'none';
        }
    });

    // Cập nhật trạng thái
    const statusElements = document.querySelectorAll('.status_name');
    statusElements.forEach(element => {
        element.textContent = food.status || 'Còn hàng';
    });

    // Cập nhật mô tả ngắn
    const shortDescElements = document.querySelectorAll('.product-summary .rte p, .short-description p');
    shortDescElements.forEach(element => {
        element.textContent = food.shortDescription || 'Món ăn ngon tại Bean Hotel';
    });

    // Cập nhật variant ID trong form
    const variantInputs = document.querySelectorAll('input[name="variantId"]');
    variantInputs.forEach(input => {
        input.value = food.id;
    });

    // Cập nhật tags
    updateTags(food);
}

function updateTags(food) {
    const tagContainers = document.querySelectorAll('.tags-product .tags, .product-tags ul');
    tagContainers.forEach(container => {
        if (food.tags && food.tags.length > 0) {
            container.innerHTML = '';
            food.tags.forEach(tag => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="food.html?tag=${encodeURIComponent(tag)}" title="${tag}">${tag}</a>`;
                container.appendChild(li);
            });
        }
    });
}

function updateProductDescription(food) {
    // Cập nhật tab mô tả sản phẩm
    const descriptionTabs = document.querySelectorAll('#tab-1 .rte, .product-description .content');
    descriptionTabs.forEach(tab => {
        let descriptionHTML = '';

        if (food.description) {
            descriptionHTML += `<div class="product-description">${food.description.replace(/\n/g, '<br>')}</div>`;
        }

        if (food.nutritionalInfo) {
            descriptionHTML += '<div class="nutritional-info"><h4>Thông tin dinh dưỡng:</h4>';
            if (food.nutritionalInfo.calories) {
                descriptionHTML += `<p><strong>Calo:</strong> ${food.nutritionalInfo.calories}</p>`;
            }
            if (food.nutritionalInfo.servingSize) {
                descriptionHTML += `<p><strong>Khẩu phần:</strong> ${food.nutritionalInfo.servingSize}</p>`;
            }
            if (food.nutritionalInfo.nutrients) {
                descriptionHTML += '<ul>';
                food.nutritionalInfo.nutrients.forEach(nutrient => {
                    descriptionHTML += `<li>${nutrient}</li>`;
                });
                descriptionHTML += '</ul>';
            }
            descriptionHTML += '</div>';
        }

        if (food.healthNotes) {
            descriptionHTML += `<div class="health-notes"><h4>Lưu ý sức khỏe:</h4><p>${food.healthNotes}</p></div>`;
        }

        if (food.cookingTip) {
            descriptionHTML += `<div class="cooking-tip"><h4>Mẹo chế biến:</h4><p>${food.cookingTip}</p></div>`;
        }

        tab.innerHTML = descriptionHTML;
    });

    // Cập nhật tab chính sách đổi trả
    const policyTabs = document.querySelectorAll('#tab-2 .rte, .return-policy .content');
    policyTabs.forEach(tab => {
        let policyHTML = '';

        if (food.returnPolicy) {
            if (Array.isArray(food.returnPolicy)) {
                // Nếu returnPolicy là array
                policyHTML += '<div class="return-conditions"><h4>Chính sách đổi trả:</h4><ul>';
                food.returnPolicy.forEach(policy => {
                    policyHTML += `<li>${policy}</li>`;
                });
                policyHTML += '</ul></div>';
            } else if (typeof food.returnPolicy === 'object') {
                // Nếu returnPolicy là object
                if (food.returnPolicy.timeFrame) {
                    policyHTML += `<div class="return-timeframe"><h4>Thời gian đổi trả:</h4><p>${food.returnPolicy.timeFrame}</p></div>`;
                }

                if (food.returnPolicy.conditions) {
                    policyHTML += '<div class="return-conditions"><h4>Điều kiện đổi trả:</h4><ul>';
                    food.returnPolicy.conditions.forEach(condition => {
                        policyHTML += `<li>${condition}</li>`;
                    });
                    policyHTML += '</ul></div>';
                }

                if (food.returnPolicy.requirements) {
                    policyHTML += '<div class="return-requirements"><h4>Yêu cầu đổi trả:</h4><ul>';
                    food.returnPolicy.requirements.forEach(requirement => {
                        policyHTML += `<li>${requirement}</li>`;
                    });
                    policyHTML += '</ul></div>';
                }
            }
        } else {
            policyHTML = '<p>Vui lòng liên hệ với chúng tôi để biết thêm chi tiết về chính sách đổi trả.</p>';
        }

        tab.innerHTML = policyHTML;
    });
}

function updateRelatedProducts(food) {
    // Fetch lại dữ liệu để lấy sản phẩm liên quan
    fetch('data/food.json')
        .then(response => response.json())
        .then(foodData => {
            const relatedProducts = getRelatedProducts(food, foodData, 4);

            const relatedContainers = document.querySelectorAll('.productRelate .swiper-wrapper, .related-products .product-list');
            relatedContainers.forEach(container => {
                container.innerHTML = '';

                relatedProducts.forEach(product => {
                    // Calculate discount percentage if oldPrice exists
                    let discountHtml = '';
                    if (product.oldPrice) {
                        const newPrice = parseInt(product.price.replace(/[^\d]/g, ''));
                        const oldPrice = parseInt(product.oldPrice.replace(/[^\d]/g, ''));
                        if (oldPrice > newPrice) {
                            const discountPercent = Math.round((oldPrice - newPrice) / oldPrice * 100);
                            discountHtml = `
                                <div class="sale-label">
                                    <span class="smart">- ${discountPercent}% </span>
                                </div>
                            `;
                        }
                    }

                    const productHTML = `
                        <div class="swiper-slide">
                            <div class="item_product_main">
                                <div class="product-thumbnail">
                                    <a href="food_detail.html?id=${product.id}" title="${product.name}">
                                        <img src="${formatImageUrl(product.image[0])}" alt="${product.name}" />
                                    </a>
                                    ${discountHtml}
                                </div>
                                <div class="product-info">
                                    <h3 class="product-name">
                                        <a href="food_detail.html?id=${product.id}" title="${product.name}">${product.name}</a>
                                    </h3>
                                    <div class="price-box">
                                        <span class="price">${product.price}</span>
                                        ${product.oldPrice ? `<span class="compare-price">${product.oldPrice}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += productHTML;
                });
            });

            // Reinitialize the product slider if needed
            if (typeof Swiper !== 'undefined') {
                if (window.productRelateSwiper) {
                    window.productRelateSwiper.destroy(true, true);
                }

                window.productRelateSwiper = new Swiper(".product-relate-swiper", {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    navigation: {
                        nextEl: ".product-relate-swiper .swiper-button-next",
                        prevEl: ".product-relate-swiper .swiper-button-prev",
                    },
                    breakpoints: {
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 10
                        },
                        480: {
                            slidesPerView: 2,
                            spaceBetween: 15
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 15
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Lỗi khi load sản phẩm liên quan:', error));
}

function getRelatedProducts(currentFood, allFoods, count = 4) {
    // Lọc ra các sản phẩm khác và ưu tiên cùng loại
    const otherFoods = allFoods.filter(food => food.id !== currentFood.id);
    const sameTypeFoods = otherFoods.filter(food => food.type === currentFood.type);

    // Nếu có đủ sản phẩm cùng loại thì dùng, không thì trộn với loại khác
    const relatedFoods = sameTypeFoods.length >= count ? sameTypeFoods : otherFoods;

    // Shuffle và lấy số lượng cần thiết
    const shuffled = relatedFoods.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatImageUrl(url) {
    if (!url) return '';

    // Nếu là local image, trả về nguyên vẹn
    if (url.startsWith('img/')) {
        return url;
    }

    // Nếu đã có thumb/large, trả về nguyên vẹn
    if (url.includes('/thumb/large/') || url.includes('/thumb/medium/')) {
        return url;
    }

    // Convert bizweb URLs thành thumbnail format
    if (url.includes('bizweb.dktcdn.net/')) {
        // Kiểm tra xem URL đã có thumb hay chưa
        if (url.includes('/thumb/')) {
            return url;
        }

        const urlParts = url.split('bizweb.dktcdn.net/');
        if (urlParts.length === 2) {
            return '//bizweb.dktcdn.net/thumb/large/' + urlParts[1];
        }
    }

    return url;
}

// Hàm để thay đổi món ăn (có thể gọi từ bên ngoài)
window.changeFoodItem = function (foodId) {
    // Cập nhật URL
    const newUrl = `${window.location.pathname}?id=${foodId}`;
    window.history.pushState({ foodId }, '', newUrl);

    // Load dữ liệu mới
    loadFoodData(foodId);
};

// Xử lý nút back/forward của browser
window.addEventListener('popstate', function (event) {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id') || 'mi-xao-bo';
    loadFoodData(foodId);
});

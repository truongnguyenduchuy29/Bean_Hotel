// JavaScript để thay đổi dữ liệu trong food_detail.html dựa trên JSON
document.addEventListener('DOMContentLoaded', function() {
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
    const slideContainer = document.querySelector('.product-images-slide .swiper-wrapper');
    if (slideContainer && food.image) {
        slideContainer.innerHTML = '';
        
        food.image.forEach((imageUrl, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'swiper-slide';
            slideDiv.innerHTML = `
                <div class="item-img">
                    <img src="${formatImageUrl(imageUrl)}" alt="${food.name}" />
                </div>
            `;
            slideContainer.appendChild(slideDiv);
        });
    }
    
    // Cập nhật thumbnail images
    const thumbContainer = document.querySelector('.product-images-thumb .swiper-wrapper');
    if (thumbContainer && food.image) {
        thumbContainer.innerHTML = '';
        
        food.image.forEach((imageUrl, index) => {
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'swiper-slide';
            thumbDiv.innerHTML = `
                <div class="item-img">
                    <img src="${formatImageUrl(imageUrl)}" alt="${food.name}" />
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
                    const productHTML = `
                        <div class="swiper-slide">
                            <div class="item_product_main">
                                <div class="product-thumbnail">
                                    <a href="food_detail.html?id=${product.id}" title="${product.name}">
                                        <img src="${formatImageUrl(product.image[0])}" alt="${product.name}" />
                                    </a>
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
    if (url.includes('/thumb/large/')) {
        return url;
    }
    
    // Convert bizweb URLs thành thumbnail format
    if (url.includes('bizweb.dktcdn.net/')) {
        const urlParts = url.split('bizweb.dktcdn.net/');
        if (urlParts.length === 2) {
            return '//bizweb.dktcdn.net/thumb/large/' + urlParts[1];
        }
    }
    
    return url;
}

// Hàm để thay đổi món ăn (có thể gọi từ bên ngoài)
window.changeFoodItem = function(foodId) {
    // Cập nhật URL
    const newUrl = `${window.location.pathname}?id=${foodId}`;
    window.history.pushState({ foodId }, '', newUrl);
    
    // Load dữ liệu mới
    loadFoodData(foodId);
};

// Xử lý nút back/forward của browser
window.addEventListener('popstate', function(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id') || 'mi-xao-bo';
    loadFoodData(foodId);
});

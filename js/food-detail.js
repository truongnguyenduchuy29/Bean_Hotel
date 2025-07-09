document.addEventListener('DOMContentLoaded', function () {
    // Get food ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('id');

    if (foodId) {
        loadFoodDetail(foodId);
    } else {
        console.error('No food ID specified in URL');
    }
});

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
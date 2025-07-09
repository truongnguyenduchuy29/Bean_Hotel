// JavaScript to fetch and render food items from food.json
document.addEventListener('DOMContentLoaded', function () {
    loadFoodItems();
});

function loadFoodItems() {
    fetch('data/food.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayFoodItems(data);
        })
        .catch(error => {
            console.error('Error loading food data:', error);
        });
}

function displayFoodItems(foodData) {
    // Get the container where food items should be displayed
    const foodContainer = document.querySelector('.section_am_thuc .tab-content.tab-1 .row');
    if (!foodContainer) return;

    // Clear existing content
    foodContainer.innerHTML = '';

    // Display only the first 8 items (or less if there aren't 8 items)
    const itemsToShow = foodData.slice(0, 8);

    itemsToShow.forEach(food => {
        const foodElement = createFoodItemElement(food);
        foodContainer.appendChild(foodElement);
    });
}

function createFoodItemElement(food) {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3 product-col';

    // Format HTML for each food item
    const saleLabel = food.oldPrice ?
        `<div class="sale-label">
      <span class="smart">- ${calculateDiscount(food.price, food.oldPrice)} </span>
    </div>` : '';

    const comparePrice = food.oldPrice ?
        `<span class="compare-price">${food.oldPrice}</span>` : '';

    col.innerHTML = `
    <div class="item_product_main">
      <form action="/cart/add" method="post" class="variants product-action"
        data-id="product-actions-${food.id}" enctype="multipart/form-data">
        <div class="product-thumbnail">
          <a class="image_thumb" href="${food.url}" title="${food.name}">
            <img width="480" height="360" class="lazyload"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
              data-src="${food.image[0]}"
              alt="${food.name}" />
          </a>
          
          ${saleLabel}

          <div class="group_action">
            <input type="hidden" name="variantId" value="${food.id}" />
            <button
              class="btn-anima hidden-xs btn-buy btn-cart btn-left btn btn-views left-to add_to_cart active"
              title="Mua ngay">
              <img width="24" height="24" src="img/cart-add.svg" alt="Mua ngay" />
            </button>

            <a title="Xem nhanh" href="food.html?type=mon-an" data-handle="${food.id}"
              class="btn-anima hidden-xs xem_nhanh btn-circle btn-views btn_view btn right-to quick-view">
              <img width="24" height="24" src="img/view.svg" alt="Xem nhanh" />
            </a>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">
            <a href="food.html?type=mon-an&id=${food.id}" title="${food.name}">${food.name}</a>
          </h3>
          <div class="price-box">
            <span class="price">${food.price}</span>
            ${comparePrice}
          </div>
        </div>
      </form>
    </div>
  `;

    return col;
}

function calculateDiscount(currentPrice, oldPrice) {
    // Extract numeric values
    const current = parseFloat(currentPrice.replace(/[^\d]/g, ''));
    const old = parseFloat(oldPrice.replace(/[^\d]/g, ''));

    if (isNaN(current) || isNaN(old) || current >= old) {
        return '0%';
    }

    // Calculate discount percentage
    const discountPercent = Math.round((1 - current / old) * 100);
    return discountPercent + '%';
}

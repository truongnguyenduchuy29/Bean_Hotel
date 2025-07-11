/**
 * Bean Hotel - Chức năng tìm kiếm độc lập
 * Tác giả: Lập trình viên nhiều năm kinh nghiệm
 * Phiên bản: 1.0
 */

document.addEventListener('DOMContentLoaded', function () {
    // Dữ liệu sản phẩm (phòng và thức ăn)
    let allProducts = [];

    // Lịch sử tìm kiếm
    const MAX_SEARCH_HISTORY = 5; // Số lượng từ khóa tìm kiếm gần đây tối đa

    // Xử lý các từ khóa phổ biến
    const popularSearchItems = document.querySelectorAll('.popular-search-item');
    popularSearchItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Không ngăn chặn hành vi mặc định để cho phép chuyển hướng đến URL trong href
            // e.preventDefault();

            const searchTerm = this.getAttribute('data-search');

            // Lưu từ khóa vào lịch sử tìm kiếm
            saveSearchHistory(searchTerm);

            // Nếu có thuộc tính data-product-id, sử dụng nó để tạo URL chi tiết sản phẩm
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                // Xác định loại sản phẩm (phòng hoặc thức ăn)
                if (productId.includes('phong')) {
                    // Chuyển hướng đến trang chi tiết phòng
                    window.location.href = `room_detail.html?id=${productId}`;
                    e.preventDefault(); // Ngăn chặn hành vi mặc định để sử dụng URL mới
                } else {
                    // Chuyển hướng đến trang chi tiết thức ăn
                    window.location.href = `food_detail.html?id=${productId}`;
                    e.preventDefault(); // Ngăn chặn hành vi mặc định để sử dụng URL mới
                }
            }
            // Nếu không có data-product-id, sử dụng href mặc định
        });
    });

    // Tải dữ liệu phòng
    fetch('data/room.json')
        .then(response => response.json())
        .then(roomData => {
            // Thêm loại sản phẩm vào mỗi phòng
            roomData.forEach(room => {
                room.productType = 'room';
                room.displayUrl = `room_detail.html?id=${room.id}`;
            });

            allProducts = allProducts.concat(roomData);
            console.log('Đã tải dữ liệu phòng:', roomData.length);

            // Sau khi tải dữ liệu phòng, tiếp tục tải dữ liệu thức ăn
            return fetch('data/food.json');
        })
        .then(response => response.json())
        .then(foodData => {
            // Thêm loại sản phẩm vào mỗi món ăn
            foodData.forEach(food => {
                food.productType = 'food';
                food.displayUrl = `food_detail.html?id=${food.id}`;
            });

            allProducts = allProducts.concat(foodData);
            console.log('Đã tải dữ liệu thức ăn:', foodData.length);
            console.log('Tổng số sản phẩm:', allProducts.length);

            // Khởi tạo chức năng tìm kiếm sau khi đã tải xong dữ liệu
            initializeSearch();
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
        });

    // Khởi tạo chức năng tìm kiếm
    function initializeSearch() {
        // Lấy các phần tử DOM
        const searchForms = document.querySelectorAll('.alper-search-form');
        const searchInputs = document.querySelectorAll('.search-auto');

        // Hiển thị thông báo console
        console.log('Khởi tạo chức năng tìm kiếm với', searchForms.length, 'form và', searchInputs.length, 'ô tìm kiếm');

        // Tạo container kết quả tìm kiếm cho mỗi form
        searchForms.forEach((form, index) => {
            // Tạo container kết quả
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results-container';
            resultsContainer.style.display = 'none';
            resultsContainer.style.position = 'absolute';
            resultsContainer.style.top = 'calc(100% + 5px)';
            resultsContainer.style.left = '0';
            resultsContainer.style.width = '100%';
            resultsContainer.style.maxHeight = '400px';
            resultsContainer.style.overflowY = 'auto';
            resultsContainer.style.zIndex = '1050';

            // Thêm container vào form
            form.style.position = 'relative';
            form.appendChild(resultsContainer);

            // Xử lý sự kiện input cho ô tìm kiếm
            const searchInput = searchInputs[index];
            if (searchInput) {
                // Xử lý sự kiện focus vào ô tìm kiếm
                searchInput.addEventListener('focus', function () {
                    const query = this.value.trim().toLowerCase();

                    // Nếu ô tìm kiếm trống, hiển thị lịch sử tìm kiếm
                    if (query.length === 0) {
                        const hasHistory = showSearchHistory(this, resultsContainer);
                        if (!hasHistory) {
                            resultsContainer.style.display = 'none';
                        }
                    }
                });

                // Xử lý sự kiện input
                searchInput.addEventListener('input', function (e) {
                    const query = e.target.value.trim().toLowerCase();

                    // Ẩn kết quả nếu query trống
                    if (query.length === 0) {
                        // Hiển thị lịch sử tìm kiếm nếu có
                        const hasHistory = showSearchHistory(this, resultsContainer);
                        if (!hasHistory) {
                            resultsContainer.style.display = 'none';
                        }
                        return;
                    }

                    // Tìm kiếm sản phẩm
                    const results = searchProducts(query);

                    // Hiển thị kết quả
                    displayResults(results, resultsContainer);
                });

                // Xử lý sự kiện click bên ngoài để ẩn kết quả
                document.addEventListener('click', function (e) {
                    if (!form.contains(e.target)) {
                        resultsContainer.style.display = 'none';
                    }
                });

                // Ngăn form submit mặc định
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const query = searchInput.value.trim();

                    if (query.length > 0) {
                        // Tìm kết quả phù hợp
                        const results = searchProducts(query);
                        if (results.length > 0) {
                            // Lưu từ khóa tìm kiếm vào localStorage để hiển thị lịch sử tìm kiếm sau này
                            saveSearchHistory(query);

                            // Chuyển hướng đến sản phẩm đầu tiên tìm thấy
                            console.log('Chuyển hướng đến:', results[0].displayUrl);
                            window.location.href = results[0].displayUrl;
                        } else {
                            // Hiển thị thông báo không tìm thấy kết quả
                            resultsContainer.innerHTML = '<div class="no-results">Không tìm thấy sản phẩm phù hợp với từ khóa "' + query + '"</div>';
                            resultsContainer.style.display = 'block';
                        }
                    }
                });

                // Xử lý sự kiện khi người dùng nhấn Enter trong ô tìm kiếm
                searchInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const query = searchInput.value.trim();

                        if (query.length > 0) {
                            const results = searchProducts(query);
                            if (results.length > 0) {
                                saveSearchHistory(query);
                                window.location.href = results[0].displayUrl;
                            }
                        }
                    }
                });
            }
        });
    }

    // Hàm lưu lịch sử tìm kiếm
    function saveSearchHistory(query) {
        if (!query || query.length < 2) return;

        // Lấy lịch sử tìm kiếm từ localStorage
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

        // Kiểm tra xem từ khóa đã tồn tại chưa
        const index = searchHistory.indexOf(query);
        if (index !== -1) {
            // Nếu đã tồn tại, xóa đi để thêm lại vào đầu danh sách
            searchHistory.splice(index, 1);
        }

        // Thêm từ khóa mới vào đầu danh sách
        searchHistory.unshift(query);

        // Giới hạn số lượng từ khóa
        if (searchHistory.length > MAX_SEARCH_HISTORY) {
            searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
        }

        // Lưu lại vào localStorage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Hàm lấy lịch sử tìm kiếm
    function getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }

    // Hàm hiển thị lịch sử tìm kiếm
    function showSearchHistory(input, resultsContainer) {
        const searchHistory = getSearchHistory();

        if (searchHistory.length === 0) return false;

        // Tạo danh sách lịch sử tìm kiếm với tiêu đề nổi bật
        const historyList = document.createElement('div');
        historyList.className = 'search-history';
        historyList.innerHTML = '<div class="history-title">Lịch sử tìm kiếm</div>';

        const historyItems = document.createElement('ul');
        historyItems.className = 'history-items';

        searchHistory.forEach(term => {
            const item = document.createElement('li');
            item.className = 'history-item';

            const link = document.createElement('a');
            link.href = 'javascript:void(0)';

            // Tạo nội dung với span để có thể tùy chỉnh style
            const textSpan = document.createElement('span');
            textSpan.textContent = term;
            textSpan.style.fontWeight = '500';
            textSpan.style.color = '#333';

            link.appendChild(textSpan);

            link.addEventListener('click', function (e) {
                e.preventDefault();
                input.value = term;

                // Hiệu ứng khi click vào mục lịch sử
                textSpan.style.color = '#cd9a2b';
                setTimeout(() => {
                    // Kích hoạt sự kiện input để hiển thị kết quả
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }, 100);
            });

            item.appendChild(link);
            historyItems.appendChild(item);
        });

        historyList.appendChild(historyItems);
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(historyList);
        resultsContainer.style.display = 'block';

        return true;
    }

    // Hàm tìm kiếm sản phẩm
    function searchProducts(query) {
        if (!query || query.length < 2) return [];

        // Tìm kiếm trong tất cả sản phẩm
        const results = allProducts.filter(product => {
            // Tìm trong tên sản phẩm (ưu tiên cao nhất)
            const nameMatch = product.name.toLowerCase().includes(query);
            if (nameMatch) {
                product.matchScore = 100;
                return true;
            }

            // Tìm trong ID sản phẩm
            const idMatch = product.id.toLowerCase().includes(query);
            if (idMatch) {
                product.matchScore = 80;
                return true;
            }

            // Tìm trong tags (nếu có) - ưu tiên cao hơn mô tả
            if (product.tags && Array.isArray(product.tags)) {
                const tagMatch = product.tags.some(tag => tag.toLowerCase().includes(query));
                if (tagMatch) {
                    product.matchScore = 70;
                    return true;
                }
            }

            // Tìm trong mô tả (nếu có)
            if (product.description && product.description.toLowerCase().includes(query)) {
                product.matchScore = 50;
                return true;
            }

            return false;
        });

        // Sắp xếp kết quả theo độ phù hợp
        results.sort((a, b) => {
            // Sắp xếp theo điểm phù hợp
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }

            // Nếu cùng điểm, ưu tiên phòng hơn thức ăn
            if (a.productType !== b.productType) {
                return a.productType === 'room' ? -1 : 1;
            }

            // Nếu cùng loại, sắp xếp theo tên
            return a.name.localeCompare(b.name);
        });

        // Giới hạn kết quả
        return results.slice(0, 10);
    }

    // Hàm hiển thị kết quả tìm kiếm
    function displayResults(results, container) {
        // Xóa kết quả cũ
        container.innerHTML = '';

        // Nếu không có kết quả
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#999"/>
                        <path d="M10 7H9V9H7V10H9V12H10V10H12V9H10V7Z" fill="#999"/>
                    </svg>
                    <p>Không tìm thấy kết quả phù hợp</p>
                    <span>Vui lòng thử lại với từ khóa khác</span>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        // Hiển thị tiêu đề kết quả tìm kiếm với hiệu ứng nổi bật
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'results-header';
        resultsHeader.innerHTML = `<span>Tìm thấy <strong>${results.length}</strong> kết quả</span>`;
        container.appendChild(resultsHeader);

        // Tạo danh sách kết quả
        const resultsList = document.createElement('ul');
        resultsList.className = 'search-results-list';
        resultsList.style.listStyle = 'none';
        resultsList.style.padding = '0';
        resultsList.style.margin = '0';

        // Thêm từng kết quả vào danh sách
        results.forEach(product => {
            const listItem = document.createElement('li');
            listItem.className = 'search-result-item';
            listItem.style.borderBottom = '1px solid #eee';
            listItem.style.cursor = 'pointer';

            // Thêm sự kiện click cho cả li
            listItem.addEventListener('click', function () {
                window.location.href = product.displayUrl;
            });

            // Tạo nội dung cho mỗi kết quả
            const productLink = document.createElement('a');
            productLink.href = product.displayUrl;
            productLink.className = 'product-link';
            productLink.style.display = 'flex';
            productLink.style.alignItems = 'center';
            productLink.style.textDecoration = 'none';
            productLink.style.color = '#333';

            // Ngăn sự kiện click lan truyền để tránh xung đột
            productLink.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            // Thêm ảnh sản phẩm (nếu có)
            if (product.image && product.image.length > 0) {
                const productImage = document.createElement('img');
                productImage.src = product.image[0];
                productImage.alt = product.name;
                productImage.className = 'product-image';

                // Xử lý lỗi ảnh
                productImage.onerror = function () {
                    this.onerror = null;
                    this.src = 'img/sp21.webp'; // Ảnh mặc định nếu không tải được
                };

                productLink.appendChild(productImage);
            } else {
                // Thêm ảnh mặc định nếu không có ảnh
                const productImage = document.createElement('img');
                productImage.src = 'img/sp21.webp';
                productImage.alt = product.name;
                productImage.className = 'product-image';
                productLink.appendChild(productImage);
            }

            // Thêm thông tin sản phẩm
            const productInfo = document.createElement('div');
            productInfo.className = 'product-info';

            // Tên sản phẩm
            const productName = document.createElement('div');
            productName.textContent = product.name;
            productName.className = 'product-name';
            productInfo.appendChild(productName);

            // Giá sản phẩm (nếu có)
            if (product.price) {
                const productPrice = document.createElement('div');
                productPrice.textContent = product.price;
                productPrice.className = 'product-price';
                productInfo.appendChild(productPrice);
            }

            // Loại sản phẩm
            const productType = document.createElement('div');
            productType.textContent = product.productType === 'room' ? 'Phòng' : 'Thức ăn';
            productType.className = 'product-type';
            productInfo.appendChild(productType);

            productLink.appendChild(productInfo);
            listItem.appendChild(productLink);

            // Xử lý sự kiện hover
            listItem.addEventListener('mouseover', function () {
                this.style.backgroundColor = '#f9f9f9';
            });

            listItem.addEventListener('mouseout', function () {
                this.style.backgroundColor = 'transparent';
            });

            resultsList.appendChild(listItem);
        });

        container.appendChild(resultsList);
        container.style.display = 'block';
    }

    // Thêm CSS cho tìm kiếm
    const style = document.createElement('style');
    style.textContent = `
    .search-results-container {
      border: 1px solid #e0e0e0;
      background-color: #fff;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      border-radius: 10px;
      overflow: hidden;
    }
    
    .results-header {
      padding: 12px 15px;
      background-color: #f0f0f0;
      background: linear-gradient(to right, #f0f0f0, #f8f8f8);
      border-bottom: 2px solid #cd9a2b;
      font-size: 14px;
      color: #333;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .no-results {
      padding: 30px 15px;
      text-align: center;
      color: #555;
      background-color: #f9f9f9;
      background: linear-gradient(to bottom, #ffffff, #f5f5f5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    
    .no-results svg {
      margin-bottom: 15px;
      opacity: 0.8;
      width: 48px;
      height: 48px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }
    
    .no-results p {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .no-results span {
      font-size: 14px;
      color: #666;
      font-style: italic;
      padding: 5px 15px;
      background-color: #f0f0f0;
      border-radius: 20px;
      display: inline-block;
      margin-top: 5px;
    }
    
    .search-results-list {
      margin: 0;
      padding: 0;
      max-height: 350px;
      overflow-y: auto;
    }
    
    .search-result-item {
      transition: all 0.2s ease;
      border-bottom: 1px solid #eee;
      padding: 0;
    }
    
    .search-result-item:last-child {
      border-bottom: none;
    }
    
    .search-result-item:hover {
      background-color: #f5f5f5;
    }
    
    .product-link {
      padding: 12px 15px;
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    
    .search-results-list .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .search-results-list .product-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
      font-size: 14px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .search-results-list .product-price {
      color: #cd9a2b;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .search-results-list .product-type {
      display: inline-block;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      margin-top: 2px;
      color: #fff;
      background-color: #cd9a2b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    
    .search-results-list .product-image {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 8px;
      margin-right: 15px;
      border: 1px solid #eee;
      transition: transform 0.2s ease;
    }
    
    .search-result-item:hover .product-image {
      transform: scale(1.05);
    }
    
    .top-search {
      position: relative;
      margin: 15px 0;
    }
    
    .top-search .input-group {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .top-search .form-control {
      border-radius: 8px 0 0 8px;
      border: 1px solid #e0e0e0;
      border-right: none;
      padding: 12px 15px;
      transition: all 0.3s ease;
      box-shadow: none;
      font-size: 14px;
      color: #333;
      height: auto;
    }
    
    .top-search .form-control::placeholder {
      color: #999;
      font-style: italic;
      font-size: 13px;
    }
    
    .top-search .form-control:focus {
      border-color: #cd9a2b;
      box-shadow: 0 0 0 2px rgba(205, 154, 43, 0.15);
      outline: none;
    }
    
    .top-search .btn-default {
      background-color: #cd9a2b;
      border: none;
      border-radius: 0 8px 8px 0;
      padding: 12px 20px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .top-search .btn-default:hover {
      background-color: #b88a25;
    }
    
    .top-search .btn-default:active {
      transform: translateY(1px);
    }
    
    .key_word_popular {
      margin-top: 15px;
      padding: 0 5px;
    }
    
    .title_keyword {
      font-size: 13px;
      font-weight: 600;
      color: #555;
      margin-bottom: 10px;
      position: relative;
      padding-left: 20px;
    }
    
    .title_keyword:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cd9a2b'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    
    .ul_list_keyword {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 5px;
    }
    
    .ul_list_keyword {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 8px;
    }
    
    .ul_list_keyword li {
      margin: 0;
    }
    
    .ul_list_keyword li a {
      display: inline-flex;
      align-items: center;
      padding: 6px 15px;
      background-color: #f5f5f5;
      border-radius: 20px;
      color: #555;
      font-size: 12px;
      transition: all 0.25s ease;
      text-decoration: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .ul_list_keyword li a:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #cd9a2b;
      border-radius: 20px;
      transform: translateX(-100%);
      transition: all 0.3s ease;
      z-index: -1;
    }
    
    .ul_list_keyword li a:hover {
      color: #fff;
      text-decoration: none;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .ul_list_keyword li a:hover:before {
      transform: translateX(0);
    }
    
    /* CSS cho lịch sử tìm kiếm */
    .search-history {
      padding: 15px;
      background-color: #fff;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.03);
    }
    
    .history-title {
      font-size: 14px;
      font-weight: 700;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #cd9a2b;
      position: relative;
      padding-left: 26px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .history-title:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 18px;
      height: 18px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cd9a2b'%3E%3Cpath d='M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    
    .history-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .history-item {
      margin-bottom: 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    
    .history-item:last-child {
      margin-bottom: 0;
    }
    
    .history-item:hover {
      background-color: #f9f9f9;
      border-color: #eee;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .history-item a {
      display: flex;
      align-items: center;
      color: #333;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 10px 12px;
      border-radius: 8px;
    }
    
    .history-item a:before {
      content: '';
      display: inline-block;
      min-width: 18px;
      width: 18px;
      height: 18px;
      margin-right: 12px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      opacity: 0.8;
      flex-shrink: 0;
    }
    
    .history-item a:hover {
      color: #cd9a2b;
      font-weight: 600;
    }
    
    .history-item a:hover:before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cd9a2b'%3E%3Cpath d='M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'/%3E%3C/svg%3E");
      opacity: 1;
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
    
    @media (max-width: 768px) {
      .search-results-container {
        position: fixed;
        top: auto;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 60vh;
        z-index: 1050;
      }
      
      .search-results-list .product-image {
        width: 50px;
        height: 50px;
      }
    }
  `;
    document.head.appendChild(style);
}); 
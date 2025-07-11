/**
 * Bean Hotel - Đồng bộ hóa chức năng tìm kiếm
 * Tác giả: Lập trình viên nhiều năm kinh nghiệm
 * Phiên bản: 1.0
 */

document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra xem script search-function.js đã được thêm vào chưa
    const isSearchScriptAdded = Array.from(document.scripts).some(script =>
        script.src && script.src.includes('search-function.js')
    );

    // Nếu chưa có, thêm vào
    if (!isSearchScriptAdded) {
        const searchScript = document.createElement('script');
        searchScript.src = 'js/search-function.js';
        searchScript.async = false;
        document.body.appendChild(searchScript);
    }

    // Kiểm tra xem form tìm kiếm đã tồn tại chưa
    const searchFormExists = document.querySelector('.alper-search-form');

    // Nếu không có form tìm kiếm, thêm vào header
    if (!searchFormExists) {
        // Tìm header hoặc vị trí thích hợp để thêm form tìm kiếm
        const headerElement = document.querySelector('header') || document.querySelector('.header') || document.querySelector('.main-header');

        if (headerElement) {
            // Kiểm tra xem đã có .top-search chưa
            let topSearchElement = headerElement.querySelector('.top-search');

            if (!topSearchElement) {
                // Tạo phần tử .top-search
                topSearchElement = document.createElement('div');
                topSearchElement.className = 'top-search';

                // Tạo HTML cho form tìm kiếm
                topSearchElement.innerHTML = `
          <form class="alper-search-form" role="search">
            <div class="input-group">
              <input type="text" id="keyPopular" aria-label="Nhập từ khóa tìm kiếm" name="query"
                class="search-auto form-control" placeholder="Nhập từ khóa tìm kiếm" autocomplete="off" />
              <span class="input-group-append">
                <button class="btn btn-default" type="submit" aria-label="Tìm kiếm">
                  <svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512"
                    style="enable-background: new 0 0 512 512" xml:space="preserve">
                    <g>
                      <g>
                        <path
                          d="M141.367,116.518c-7.384-7.39-19.364-7.39-26.748,0c-27.416,27.416-40.891,65.608-36.975,104.79 c0.977,9.761,9.2,17.037,18.803,17.037c0.631,0,1.267-0.032,1.898-0.095c10.398-1.04,17.983-10.316,16.943-20.707 c-2.787-27.845,6.722-54.92,26.079-74.278C148.757,135.882,148.757,123.901,141.367,116.518z" />
                      </g>
                    </g>
                    <g>
                      <g>
                        <path
                          d="M216.276,0C97.021,0,0,97.021,0,216.276s97.021,216.276,216.276,216.276s216.276-97.021,216.276-216.276 S335.53,0,216.276,0z M216.276,394.719c-98.396,0-178.443-80.047-178.443-178.443S117.88,37.833,216.276,37.833 c98.39,0,178.443,80.047,178.443,178.443S314.672,394.719,216.276,394.719z" />
                      </g>
                    </g>
                    <g>
                      <g>
                        <path
                          d="M506.458,479.71L368.999,342.252c-7.39-7.39-19.358-7.39-26.748,0c-7.39,7.384-7.39,19.364,0,26.748L479.71,506.458 c3.695,3.695,8.531,5.542,13.374,5.542c4.843,0,9.679-1.847,13.374-5.542C513.847,499.074,513.847,487.094,506.458,479.71z" />
                      </g>
                    </g>
                  </svg>
                </button>
              </span>
            </div>
          </form>
          <div class="key_word_popular">
            <p class="title_keyword">TỪ KHÓA PHỔ BIẾN</p>
            <ul class="ul_list_keyword">
              <li>
                <a href="javascript:void(0)" data-search="Phòng đơn" class="popular-search-item" title="Phòng đơn">Phòng đơn</a>
              </li>
              <li>
                <a href="javascript:void(0)" data-search="Phòng đôi" class="popular-search-item" title="Phòng đôi">Phòng đôi</a>
              </li>
              <li>
                <a href="javascript:void(0)" data-search="Phòng vip" class="popular-search-item" title="Phòng vip">Phòng vip</a>
              </li>
              <li>
                <a href="javascript:void(0)" data-search="Hội nghị" class="popular-search-item" title="Hội nghị">Hội nghị</a>
              </li>
              <li>
                <a href="javascript:void(0)" data-search="Dịch vụ spa" class="popular-search-item" title="Dịch vụ spa">Dịch vụ spa</a>
              </li>
              <li>
                <a href="javascript:void(0)" data-search="Ẩm thực khách sạn" class="popular-search-item" title="Ẩm thực khách sạn">Ẩm thực khách sạn</a>
              </li>
            </ul>
          </div>
        `;

                // Thêm vào header
                const headerContainer = headerElement.querySelector('.container') || headerElement;
                headerContainer.appendChild(topSearchElement);

                // Thêm CSS cho phần tìm kiếm
                const style = document.createElement('style');
                style.textContent = `
          .top-search {
            position: relative;
            margin: 10px 0;
          }
          
          .top-search .input-group {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            width: 100%;
          }
          
          .top-search .form-control {
            position: relative;
            flex: 1 1 auto;
            width: 1%;
            min-width: 0;
            margin-bottom: 0;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px 0 0 4px;
          }
          
          .top-search .input-group-append {
            display: flex;
          }
          
          .top-search .btn-default {
            padding: 10px 15px;
            background-color: #cd9a2b;
            border: none;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
          }
          
          .top-search .btn-default svg {
            fill: #fff;
          }
          
          .key_word_popular {
            margin-top: 10px;
          }
          
          .title_keyword {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .ul_list_keyword {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
          }
          
          .ul_list_keyword li {
            margin-right: 10px;
            margin-bottom: 5px;
          }
          
          .ul_list_keyword li a {
            font-size: 13px;
            color: #666;
            text-decoration: none;
          }
          
          .ul_list_keyword li a:hover {
            color: #cd9a2b;
            text-decoration: underline;
          }
        `;
                document.head.appendChild(style);
            }
        }
    }
}); 
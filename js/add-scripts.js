/**
 * Bean Hotel - Thêm script vào tất cả các trang
 * Tác giả: Lập trình viên nhiều năm kinh nghiệm
 * Phiên bản: 1.0
 */

// Thêm các script cần thiết ngay khi tập lệnh được thực thi
(function () {
    // Danh sách các script cần thêm
    const scriptsToAdd = [
        { src: 'js/auth.js', id: 'auth-js', priority: 'high' },
        { src: 'js/add-user-css.js', id: 'user-css-js', priority: 'high' }
    ];

    // Thêm Font Awesome CDN trước
    const fontAwesomeElements = document.querySelectorAll('link[href*="font-awesome"]');
    if (fontAwesomeElements.length === 0) {
        const fontAwesomeCss = document.createElement('link');
        fontAwesomeCss.rel = 'stylesheet';
        fontAwesomeCss.type = 'text/css';
        fontAwesomeCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeCss);
    }

    // Kiểm tra và thêm các script nếu chưa có
    scriptsToAdd.forEach(scriptInfo => {
        const scriptId = scriptInfo.id;

        // Kiểm tra xem script đã được thêm chưa
        if (!document.getElementById(scriptId) && !document.querySelector(`script[src="${scriptInfo.src}"]`)) {
            const script = document.createElement('script');
            script.src = scriptInfo.src;
            script.id = scriptId;
            script.type = 'text/javascript';

            // Thêm các script ưu tiên cao vào head để tải sớm hơn
            if (scriptInfo.priority === 'high') {
                document.head.appendChild(script);
            } else {
                // Script không ưu tiên cao thì thêm vào body khi DOM sẵn sàng
                if (document.body) {
                    document.body.appendChild(script);
                } else {
                    document.addEventListener('DOMContentLoaded', function () {
                        document.body.appendChild(script);
                    });
                }
            }
        }
    });

    // Đảm bảo CSS user-account cũng được thêm sớm
    const userAccountCssElements = document.querySelectorAll('link[href*="user-account.css"]');
    if (userAccountCssElements.length === 0) {
        const userAccountCss = document.createElement('link');
        userAccountCss.rel = 'stylesheet';
        userAccountCss.type = 'text/css';
        userAccountCss.href = 'css/user-account.css';
        document.head.appendChild(userAccountCss);
    }
})(); 
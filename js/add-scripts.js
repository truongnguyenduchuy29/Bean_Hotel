/**
 * Bean Hotel - Thêm script vào tất cả các trang
 * Tác giả: Lập trình viên nhiều năm kinh nghiệm
 * Phiên bản: 1.0
 */

// Danh sách các script cần thêm vào tất cả các trang
const scriptsToAdd = [
    'js/search-function.js',
    'js/add-search-function.js'
];

// Thêm các script vào trang
function addScripts() {
    scriptsToAdd.forEach(scriptSrc => {
        // Kiểm tra xem script đã được thêm vào chưa
        const isScriptAdded = Array.from(document.scripts).some(script =>
            script.src && script.src.includes(scriptSrc.split('/').pop())
        );

        // Nếu chưa có, thêm vào
        if (!isScriptAdded) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = false;
            document.body.appendChild(script);
        }
    });
}

// Thực thi khi DOM đã tải xong
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addScripts);
} else {
    addScripts();
} 
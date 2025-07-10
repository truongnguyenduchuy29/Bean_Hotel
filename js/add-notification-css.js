/**
 * Script tự động thêm notifications.css vào tất cả các trang HTML
 * Chạy script này bằng Node.js: node add-notification-css.js
 */

const fs = require('fs');
const path = require('path');

// Đường dẫn thư mục gốc
const rootDir = path.resolve(__dirname, '..');

// Tìm tất cả các file HTML trong thư mục gốc và các thư mục con
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.html') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Kiểm tra xem file HTML đã có notifications.css chưa và thêm vào nếu chưa có
function checkAndAddNotificationsCSS(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Kiểm tra xem file đã có notifications.css chưa
        if (!content.includes('notifications.css')) {
            // Tìm vị trí để chèn link CSS
            let insertPosition;

            // Tìm sau user-account.css nếu có
            if (content.includes('user-account.css')) {
                const userAccountCssPosition = content.indexOf('user-account.css');
                const closingTagPosition = content.indexOf('>', userAccountCssPosition);

                if (closingTagPosition !== -1) {
                    insertPosition = closingTagPosition + 1;

                    // Thêm link CSS sau user-account.css
                    const cssLink = '\n  <!-- Notifications CSS -->\n  <link rel="stylesheet" href="css/notifications.css">';
                    content = content.slice(0, insertPosition) + cssLink + content.slice(insertPosition);

                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Đã thêm notifications.css vào file: ${filePath}`);
                    return true;
                }
            } else {
                // Tìm sau các link CSS khác
                const cssPattern = /<link[^>]*\.css[^>]*>/i;
                const lastCssMatch = content.match(new RegExp(cssPattern, 'g'));

                if (lastCssMatch && lastCssMatch.length > 0) {
                    const lastCssTag = lastCssMatch[lastCssMatch.length - 1];
                    insertPosition = content.indexOf(lastCssTag) + lastCssTag.length;

                    // Thêm link CSS sau thẻ CSS cuối cùng
                    const cssLink = '\n  <!-- Notifications CSS -->\n  <link rel="stylesheet" href="css/notifications.css">';
                    content = content.slice(0, insertPosition) + cssLink + content.slice(insertPosition);

                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Đã thêm notifications.css vào file: ${filePath}`);
                    return true;
                } else {
                    // Nếu không tìm thấy CSS nào, thêm trước </head>
                    const headEndPosition = content.indexOf('</head>');
                    if (headEndPosition !== -1) {
                        const cssLink = '\n  <!-- Notifications CSS -->\n  <link rel="stylesheet" href="css/notifications.css">\n  ';
                        content = content.slice(0, headEndPosition) + cssLink + content.slice(headEndPosition);

                        fs.writeFileSync(filePath, content, 'utf8');
                        console.log(`Đã thêm notifications.css vào file: ${filePath}`);
                        return true;
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý file ${filePath}:`, error);
    }

    return false;
}

// Hàm chính
function main() {
    console.log('Bắt đầu thêm notifications.css vào các file HTML...');

    // Tìm tất cả các file HTML
    const htmlFiles = findHtmlFiles(rootDir);
    console.log(`Đã tìm thấy ${htmlFiles.length} file HTML.`);

    // Biến đếm số file đã được cập nhật
    let updatedCount = 0;

    // Thêm CSS vào từng file
    htmlFiles.forEach(file => {
        if (checkAndAddNotificationsCSS(file)) {
            updatedCount++;
        }
    });

    console.log(`Hoàn tất! Đã cập nhật ${updatedCount}/${htmlFiles.length} file HTML.`);
}

// Chạy hàm chính
main(); 
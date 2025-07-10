/**
 * Script tự động thêm user-account.css vào tất cả các trang HTML
 * Chạy script này bằng Node.js: node add-user-css.js
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
        } else if (path.extname(file).toLowerCase() === '.css') {
            // Do nothing, we only care about HTML files
        }
    });

    return fileList;
}

// Kiểm tra xem file HTML đã có user-account.css chưa và thêm vào nếu chưa có
function checkAndAddUserAccountCSS(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Kiểm tra xem file đã có user-account.css chưa
        if (!content.includes('user-account.css')) {
            // Tìm vị trí để chèn link CSS
            let insertPosition;

            // Tìm sau các link CSS khác
            const cssPattern = /<link[^>]*\.css[^>]*>/i;
            const lastCssMatch = content.match(new RegExp(cssPattern, 'g'));

            if (lastCssMatch && lastCssMatch.length > 0) {
                const lastCssTag = lastCssMatch[lastCssMatch.length - 1];
                insertPosition = content.indexOf(lastCssTag) + lastCssTag.length;

                // Thêm link CSS sau thẻ CSS cuối cùng
                const cssLink = '\n  <!-- User Account CSS -->\n  <link rel="stylesheet" href="css/user-account.css">';
                content = content.slice(0, insertPosition) + cssLink + content.slice(insertPosition);

                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Đã thêm user-account.css vào file: ${filePath}`);
                return true;
            } else {
                // Nếu không tìm thấy CSS nào, thêm trước </head>
                const headEndPosition = content.indexOf('</head>');
                if (headEndPosition !== -1) {
                    const cssLink = '\n  <!-- User Account CSS -->\n  <link rel="stylesheet" href="css/user-account.css">\n  ';
                    content = content.slice(0, headEndPosition) + cssLink + content.slice(headEndPosition);

                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Đã thêm user-account.css vào file: ${filePath}`);
                    return true;
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
    console.log('Bắt đầu thêm user-account.css vào các file HTML...');

    // Tìm tất cả các file HTML
    const htmlFiles = findHtmlFiles(rootDir);
    console.log(`Đã tìm thấy ${htmlFiles.length} file HTML.`);

    // Biến đếm số file đã được cập nhật
    let updatedCount = 0;

    // Thêm CSS vào từng file
    htmlFiles.forEach(file => {
        if (checkAndAddUserAccountCSS(file)) {
            updatedCount++;
        }
    });

    console.log(`Hoàn tất! Đã cập nhật ${updatedCount}/${htmlFiles.length} file HTML.`);
}

// Chạy hàm chính
main(); 
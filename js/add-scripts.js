/**
 * Script tự động thêm auth.js và cart-count.js vào tất cả các trang HTML
 * Chạy script này bằng Node.js: node add-scripts.js
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

// Kiểm tra xem file HTML đã có script auth.js và cart-count.js chưa
function checkAndAddScripts(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Kiểm tra xem file đã có scripts chưa
    const hasAuthJs = content.includes('auth.js');
    const hasCartCountJs = content.includes('cart-count.js');

    // Nếu chưa có scripts, thêm vào trước </head>
    if (!hasAuthJs || !hasCartCountJs) {
        let scriptsToAdd = '';

        if (!hasAuthJs) {
            scriptsToAdd += '    <!-- Auth Management System -->\n';
            scriptsToAdd += '    <script src="js/auth.js" type="text/javascript"></script>\n';
        }

        if (!hasCartCountJs) {
            if (scriptsToAdd) scriptsToAdd += '    \n';
            scriptsToAdd += '    <!-- Script hiển thị số lượng giỏ hàng -->\n';
            scriptsToAdd += '    <script src="js/cart-count.js"></script>\n';
        }

        // Thêm scripts vào trước </head>
        if (scriptsToAdd) {
            content = content.replace('</head>', scriptsToAdd + '</head>');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Đã thêm scripts vào file: ${filePath}`);
            return true;
        }
    }

    return false;
}

// Hàm chính
function main() {
    console.log('Bắt đầu thêm scripts vào các file HTML...');

    // Tìm tất cả các file HTML
    const htmlFiles = findHtmlFiles(rootDir);
    console.log(`Đã tìm thấy ${htmlFiles.length} file HTML.`);

    // Biến đếm số file đã được cập nhật
    let updatedCount = 0;

    // Thêm scripts vào từng file
    htmlFiles.forEach(file => {
        if (checkAndAddScripts(file)) {
            updatedCount++;
        }
    });

    console.log(`Hoàn tất! Đã cập nhật ${updatedCount}/${htmlFiles.length} file HTML.`);
}

// Chạy hàm chính
main(); 
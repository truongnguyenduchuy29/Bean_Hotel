// Add user-account CSS to all pages
(function () {
    // Check if the user-account.css is already loaded
    const linkElements = document.querySelectorAll('link[href*="user-account.css"]');
    if (linkElements.length === 0) {
        // Create link element for user-account.css
        const userAccountCss = document.createElement('link');
        userAccountCss.rel = 'stylesheet';
        userAccountCss.type = 'text/css';
        userAccountCss.href = 'css/user-account.css';

        // Add the link element to the head
        document.head.appendChild(userAccountCss);
    }

    // Ensure Font Awesome is loaded
    const fontAwesomeElements = document.querySelectorAll('link[href*="font-awesome"]');
    if (fontAwesomeElements.length === 0) {
        const fontAwesomeCss = document.createElement('link');
        fontAwesomeCss.rel = 'stylesheet';
        fontAwesomeCss.type = 'text/css';
        fontAwesomeCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeCss);
    }
})(); 
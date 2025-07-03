// Fix navigation links on all pages
$(document).ready(function () {
    console.log('Running fix-links.js to update navigation links...');

    // Fix navigation links in the header
    $('a.nav-link[href="/"]').attr('href', 'index.html');
    $('a.nav-link[href="/"]:not([href="index.html"])').attr('href', 'index.html');

    $('a.nav-link[href="/ve-chung-toi"]').attr('href', 'about.html');
    $('a.nav-link[href="/about"]').attr('href', 'about.html');

    $('a.nav-link[href="/phong"]').attr('href', 'product.html');
    $('a.nav-link[href="/product"]').attr('href', 'product.html');

    $('a.nav-link[href="/thu-vien-anh"]').attr('href', 'img.html');
    $('a.nav-link[href="/img"]').attr('href', 'img.html');

    $('a.nav-link[href="/lien-he"]').attr('href', 'contact.html');
    $('a.nav-link[href="/contact"]').attr('href', 'contact.html');

    $('a.nav-link[href="/dich-vu"]').attr('href', 'index.html#services');
    $('a.nav-link[href="/am-thuc"]').attr('href', 'index.html#restaurant');
    $('a.nav-link[href="dat-phong"]').attr('href', 'booking.html');

    // Fix breadcrumb links
    $('ul.breadcrumb a[href="/"]').attr('href', 'index.html');
    $('ul.breadcrumb .home a').attr('href', 'index.html');

    // Fix dropdown menu links
    $('a.nav-link[href="/mon-an"]').attr('href', 'index.html#restaurant');
    $('a.nav-link[href="/do-uong"]').attr('href', 'index.html#restaurant');
    $('a.nav-link[href="/banh-ngot"]').attr('href', 'index.html#restaurant');

    // Fix room category links
    $('a.nav-link[href="/phong-don"]').attr('href', 'product.html?type=phong-don');
    $('a.nav-link[href="/phong-doi"]').attr('href', 'product.html?type=phong-doi');
    $('a.nav-link[href="/phong-vip"]').attr('href', 'product.html?type=phong-vip');

    // Fix footer links
    $('footer a[href="/"]').attr('href', 'index.html');
    $('footer a[href="/ve-chung-toi"]').attr('href', 'about.html');
    $('footer a[href="/phong"]').attr('href', 'product.html');
    $('footer a[href="/thu-vien-anh"]').attr('href', 'img.html');
    $('footer a[href="/lien-he"]').attr('href', 'contact.html');

    // Fix logo links
    $('.logo-wrapper').attr('href', 'index.html');
    $('.logo-footer').attr('href', 'index.html');

    console.log('Navigation links fixed');
}); 
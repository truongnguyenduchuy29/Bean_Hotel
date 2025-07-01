var selectedSortby;
var tt = "Thứ tự";

var filter = new Bizweb.SearchFilter();

if (colId > 0) {
    filter.addValue("collection", "collections", colId, "AND");
}
function toggleFilter(e) {
    _toggleFilter(e);
    renderFilterdItems();
    resortby(selectedSortby);
    doSearch(1);
}
function _toggleFilterdqdt(e) {
    var $element = $(e);
    var group = "Khoảng giá";
    var field = "price_min";
    var operator = "OR";
    var value = $element.attr("data-value");

    filter.deleteValuedqdt(group, field, value, operator);
    filter.addValue(group, field, value, operator);
    renderFilterdItems();
    doSearch(1);
}

function _toggleFilter(e) {
    var $element = $(e);
    var group = $element.attr("data-group");
    var field = $element.attr("data-field");
    var text = $element.attr("data-text");
    var value = $element.attr("value");
    var operator = $element.attr("data-operator");
    var filterItemId = $element.attr("id");

    if (!$element.is(":checked")) {
        filter.deleteValue(group, field, value, operator);
    } else {
        filter.addValue(group, field, value, operator);
    }

    $(".catalog_filters li[data-handle='" + filterItemId + "']").toggleClass(
        "active"
    );
}

function renderFilterdItems() {
    var $container = $(".filter-container__selected-filter-list ul");
    $container.html("");

    $(".filter-container input[type=checkbox]").each(function (index) {
        if ($(this).is(":checked")) {
            var id = $(this).attr("id");
            var name = $(this).closest("label").text();

            addFilteredItem(name, id);
        }
    });

    if ($(".filter-container input[type=checkbox]:checked").length > 0)
        $(".filter-container__selected-filter").show();
    else $(".filter-container__selected-filter").hide();
}
function addFilteredItem(name, id) {
    var filteredItemTemplate =
        "<li class='filter-container__selected-filter-item' for='{3}'><a href='javascript:void(0)' onclick=\"{0}\"><i class='fa fa-close'></i> {1}</a></li>";
    filteredItemTemplate = filteredItemTemplate.replace(
        "{0}",
        "removeFilteredItem('" + id + "')"
    );
    filteredItemTemplate = filteredItemTemplate.replace("{1}", name);
    filteredItemTemplate = filteredItemTemplate.replace("{3}", id);
    var $container = $(".filter-container__selected-filter-list ul");
    $container.append(filteredItemTemplate);
}
function removeFilteredItem(id) {
    $(".filter-container #" + id).trigger("click");
}

function doSearch(page, options) {
    if (!options) options = {};
    //NProgress.start();
    $(".aside.aside-mini-products-list.filter").removeClass("active");
    awe_showPopup(".loading");
    filter.search({
        view: selectedViewData,
        page: page,
        sortby: selectedSortby,
        success: function (html) {
            var $html = $(html);
            // Muốn thay thẻ DIV nào khi filter thì viết như này
            var $categoryProducts = $($html[0]);

            $(".category-products").html($categoryProducts.html());
            pushCurrentFilterState({ sortby: selectedSortby, page: page });
            awe_hidePopup(".loading");
            awe_lazyloadImage();
            if (window.BPR) return window.BPR.initDomEls(), window.BPR.loadBadges();
            if (window.ABProdStats) {
                window.ABProdStats.abInitProductStats();
            }
            $(".add_to_cart").click(function (e) {
                e.preventDefault();
                var $this = $(this);
                var form = $this.parents("form");
                $.ajax({
                    type: "POST",
                    url: "/cart/add.js",
                    async: false,
                    data: form.serialize(),
                    dataType: "json",
                    beforeSend: function () { },
                    success: function (line_item) {
                        ajaxCart.load();
                        $(".popup-cart-mobile, .backdrop__body-backdrop___1rvky").addClass(
                            "active"
                        );
                        AddCartMobile(line_item);
                    },
                    cache: false,
                });
            });
            $("html, body").animate(
                {
                    scrollTop: $(".block-collection").offset().top,
                },
                0
            );
            $("#open-filters").removeClass("openf");
            $(".dqdt-sidebar").removeClass("openf");
            $(".opacity_sidebar").removeClass("openf");
            resortby(selectedSortby);
            $(document).ready(function () {
                var modal = $(".quickview-product");
                var btn = $(".quick-view");
                var span = $(".quickview-close");

                btn.click(function () {
                    modal.show();
                });

                span.click(function () {
                    modal.hide();
                });
                $(window).on("click", function (e) {
                    if ($(e.target).is(".modal")) {
                        modal.hide();
                    }
                });
            });
        },
    });
}

function sortby(sort) {
    switch (sort) {
        case "price-asc":
            selectedSortby = "price_min:asc";
            break;
        case "price-desc":
            selectedSortby = "price_min:desc";
            break;
        case "alpha-asc":
            selectedSortby = "name:asc";
            break;
        case "alpha-desc":
            selectedSortby = "name:desc";
            break;
        case "created-desc":
            selectedSortby = "created_on:desc";
            break;
        case "created-asc":
            selectedSortby = "created_on:asc";
            break;
        default:
            selectedSortby = "";
            break;
    }

    doSearch(1);
}

function resortby(sort) {
    switch (sort) {
        case "price_min:asc":
            tt = "Giá tăng dần";
            $(".sort-cate-left .price-asc").addClass("active");
            break;
        case "price_min:desc":
            tt = "Giá giảm dần";
            $(".sort-cate-left .price-desc").addClass("active");
            break;
        case "name:asc":
            tt = "Tên A → Z";
            $(".sort-cate-left .alpha-asc").addClass("active");
            break;
        case "name:desc":
            tt = "Tên Z → A";
            $(".sort-cate-left .alpha-desc").addClass("active");
            break;
        case "created_on:desc":
            tt = "Hàng mới nhất";
            $(".sort-cate-left .position-desc").addClass("active");
            break;
        case "created_on:asc":
            tt = "Hàng cũ nhất";
            break;
        default:
            tt = "Mặc định";
            break;
    }
    $("#sort-by > ul > li > span").html(tt);
}

function _selectSortby(sort) {
    resortby(sort);
    switch (sort) {
        case "price-asc":
            selectedSortby = "price_min:asc";
            break;
        case "price-desc":
            selectedSortby = "price_min:desc";
            break;
        case "alpha-asc":
            selectedSortby = "name:asc";
            break;
        case "alpha-desc":
            selectedSortby = "name:desc";
            break;
        case "created-desc":
            selectedSortby = "created_on:desc";
            break;
        case "created-asc":
            selectedSortby = "created_on:asc";
            break;
        default:
            selectedSortby = sort;
            break;
    }
}

function toggleCheckbox(id) {
    $(id).click();
}

function pushCurrentFilterState(options) {
    resortby(selectedSortby);
    if (!options) options = {};
    var url = filter.buildSearchUrl(options);
    var queryString = url.slice(url.indexOf("?"));
    if (selectedViewData == "data_list") {
        queryString = queryString + "&view=list";
        $('.filter-content button span[data-view="list"]').parent().addClass("active");
    } else {
        queryString = queryString + "&view=grid";
        $('.filter-content button span[data-view="grid"]').parent().addClass("active");
    }

    pushState(url);
}

function pushState(url) {
    window.history.pushState({
        turbolinks: true,
        url: url
    }, null, url)
}

function switchView(view) {
    switch (view) {
        case "list":
            selectedViewData = "data_list";
            break;
        default:
            selectedViewData = "data";
            break;
    }
    var url = window.location.href;
    var page = getParameter(url, "page");
    if (page != '' && page != null) {
        doSearch(page);
    } else {
        doSearch(1);
    }
}

function selectFilterByCurrentQuery() {
    var isFilter = false;
    var url = window.location.href;
    var queryString = decodeURI(window.location.search);
    var filters = queryString.match(/\?(.*)/);
    var page = 0;
    if (queryString) {
        isFilter = true;
        $.urlParam = function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            return results[1] || 0;
        }
        page = $.urlParam('page');
    }
    if (filters && filters.length > 1) {
        var urlValues = filters[1].split('&');
        $.each(urlValues, function (i, filter) {
            var filterValues = filter.split('=');
            if (filterValues[0] == 'page') {
                page = filterValues[1];
            }
            if (filterValues[0] == 'sortby') {
                if (filterValues[1] == 'price-asc') {
                    selectedSortby = 'price_min:asc';
                    resortby(selectedSortby);
                } else if (filterValues[1] == 'price-desc') {
                    selectedSortby = 'price_min:desc';
                    resortby(selectedSortby);
                } else if (filterValues[1] == 'alpha-asc') {
                    selectedSortby = 'name:asc';
                    resortby(selectedSortby);
                } else if (filterValues[1] == 'alpha-desc') {
                    selectedSortby = 'name:desc';
                    resortby(selectedSortby);
                } else if (filterValues[1] == 'created-desc') {
                    selectedSortby = 'created_on:desc';
                    resortby(selectedSortby);
                } else if (filterValues[1] == 'created-asc') {
                    selectedSortby = 'created_on:asc';
                    resortby(selectedSortby);
                } else {
                    selectedSortby = '';
                    resortby(selectedSortby);
                }
            }
        });
    }
    if (page == 0) {
        page = 1;
    }
    if (isFilter) {
        doSearch(page);
        renderFilterdItems();
    }
}

function getParameter(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$('.filter-group ul.filter-color li.filter-item').each(function (e) {
    var color = $(this).find('label').data('color');
    $this = $(this);
    $(this).find('span.fa').css({ 'background': '' + color + '' });
});

$('.filter-group ul.filter-size li.filter-item').each(function (e) {
    var size = $(this).find('label').data('size');
    $this = $(this);
    $(this).find('span.filter-icon').html('' + size + '');
});

$('.filter-group ul.filter-type li.filter-item').each(function (e) {
    var type = $(this).find('label').data('type');
    $this = $(this);
    $(this).find('span.filter-icon').html('' + type + '');
});

function filterItemInList(object) {
    q = object.val().toLowerCase();
    object.parent().next().find('.content-item').each(function () {
        var dataItem = $(this).data('item').toLowerCase();
        if (dataItem.indexOf(q) != -1)
            $(this).show();
        else
            $(this).hide();
    });
} 
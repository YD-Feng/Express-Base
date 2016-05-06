var wrapMod = {
    clickY: 0,
    mainScroll: null,

    //模块初始化
    init: function () {
        var _this = this;

        _this.setContMinHeight();
        _this.getMenuData();

        $(window).on('resize', function () {
            _this.setContMinHeight();
        });

        _this.bindEvents();
    },

    //设置内容区的最小高度
    setContMinHeight: function () {
        var _this = this,
            h = $(window).height() - $('#J-header').outerHeight() - $('#J-footer').outerHeight();

        $('#J-sidebar, #J-container, #J-submenu-wrap').height(h);
        _this.mainScroll && _this.mainScroll.refresh();
    },

    //菜单数据获取
    getMenuData: function () {
        var _this = this;
        $.ajax({
            type: 'get',
            dataType: 'json',
            url: 'dist/data/menu.json',
            success: function (re) {
                _this.createMenu(_this.processData(re.data));
            },
            error: function () {
                console.log('获取用户菜单列表失败');
            }
        });
    },

    //菜单数据处理
    processData: function (data) {
        var result = [],
            process = function (pid, list, targetList) {
                $.each(list, function (i, item) {

                    if (typeof item.submenu == 'undefined') {
                        item.submenu = [];
                    }

                    if (item.parent_id == pid) {
                        targetList.push(item);
                        process(item.id, list, item.submenu);
                    }

                });
            };

        process(0, data, result);

        return result;
    },

    //菜单生成
    createMenu: function (data) {
        var menuHtml = H.template($('#J-menu-tpl').html(), {
            items: data
        });
        $('#J-sidebar').html(menuHtml);

        this.mainScroll = new iScroll('J-sidebar', {
            snap: 'li',
            bounce: false, //是否超过实际位置反弹
            bounceLock: false, //当内容少于滚动是否可以反弹，这个实际用处不大
            momentum: true, //动量效果，拖动惯性
            hideScrollbar: true, //隐藏滚动条
            onBeforeScrollStart: function (e) {
                e.preventDefault();
            }
        });
    },

    //事件绑定
    bindEvents: function () {
        $(document)
            .on('click', '#J-s-menu-cls-one div.J-item-cls-one-inner', function (e) {
                var $this = $(this),
                    $sidebar = $('#J-sidebar'),
                    $parentLi = $(this).parent();

                if ($parentLi.hasClass('active')) {
                    $parentLi
                        .removeClass('active')
                        .find('ul.J-s-menu-cls-two')
                        .slideUp(100, function () {
                            wrapMod.mainScroll && wrapMod.mainScroll.refresh();
                        });
                } else {
                    $parentLi
                        .addClass('active')
                        .find('ul.J-s-menu-cls-two')
                        .slideDown(100, function () {
                            wrapMod.mainScroll && wrapMod.mainScroll.refresh();
                        })
                        .end()
                        .siblings()
                        .removeClass('active')
                        .find('ul.J-s-menu-cls-two')
                        .hide();
                }
            })
            .on('click', '#J-submenu-wrap div.J-can-open', function (e) {
                var $this = $(this),
                    callBack = function () {
                        wrapMod.subScroll && wrapMod.subScroll.refresh();
                    };
                if ($this.hasClass('active')) {
                    $this.removeClass('active').next().slideUp(50, callBack);
                } else {
                    $this.addClass('active').next().slideDown(50, callBack);
                }
            })
            .on('click', '#J-sidebar a, #J-submenu-wrap a', function (e) {
                if (e.target.target != '_blank') {
                    e.preventDefault();
                }
            })
            .on('mousedown', '#J-sidebar a, #J-submenu-wrap a', function (e) {
                wrapMod.clickY = e.pageY;
            })
            .on('mouseup', '#J-sidebar a, #J-submenu-wrap a', function (e) {
                if (Math.abs(wrapMod.clickY - e.pageY) < 50) {
                    if (e.target.target != '_blank') {
                        window.frames[e.target.target].location.href = e.target.href + '?token=' + H.Cookie.get('userToken');
                    }
                }
            });
    }
};

$(function () {
    wrapMod.init();
});


'use strict';

var wrapMod = {
    clickY: 0,
    mainScroll: null,
    tabScroll: null,

    //模块初始化
    init: function () {
        var _this = this;

        _this.setContMinHeight();
        _this.getMenuData();

        _this.tabScroll = new iScroll('J-frame-tab', {
            snap: 'li',
            bounce: false, //是否超过实际位置反弹
            bounceLock: false, //当内容少于滚动是否可以反弹，这个实际用处不大
            momentum: true, //动量效果，拖动惯性
            hideScrollbar: true, //隐藏滚动条
            hScroll: true, //是否水平滚动
            vScroll: false, //是否垂直滚动
            hScrollbar: false, //是否显示水平滚动条
            vScrollbar: false, //是否显示垂直滚动条
            onBeforeScrollStart: function (e) {
                e.preventDefault();
            }
        });

        _this.bindEvents();
    },

    //设置内容区的最小高度
    setContMinHeight: function () {
        var _this = this,
            h = $(window).height() - $('#J-header').outerHeight() - $('#J-footer').outerHeight(),
            containerH = h - $('#J-frame-tab').outerHeight();

        $('#J-sidebar, #J-submenu-wrap').height(h);
        $('#J-container').height(containerH);
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

    //展示页面
    showPage: function (opts) {
        var _this = this;

        if (!window.frames[opts.target]) {
            var frame = document.createElement('iframe'),
                $frameTabUl = $('#J-frame-tab').find('ul.inner'),
                v = H.Storage.get('version');

            frame.className = 'iframe';
            frame.frameborder = 0;
            frame.scrolling = 'auto';
            frame.name = opts.target;
            frame.src = opts.href + '?token=' + H.Cookie.get('userToken') + '&v=' + v;

            $('#J-container').append(frame);

            $frameTabUl.find('li').removeClass('active');
            $frameTabUl
                .append('<li class="item active" data-name="' + opts.target + '">' + opts.name + '</li>')
                .width($frameTabUl.find('li').length * $frameTabUl.find('li').outerWidth());
            _this.tabScroll && _this.tabScroll.refresh();
            _this.tabScroll && _this.tabScroll.scrollToElement($frameTabUl.find('li').last()[0]);
        } else {
            var $li = $('#J-frame-tab').find('li[data-name=' + opts.target + ']');
            $li.addClass('active').siblings().removeClass('active');
            _this.tabScroll && _this.tabScroll.scrollToElement($li[0]);

            window.frames[opts.target].location.href = opts.href + '?token=' + H.Cookie.get('userToken');
        }

        $('#J-container').find('iframe').hide();
        $('#J-container').find('iframe[name=' + opts.target + ']').show();
    },

    //事件绑定
    bindEvents: function () {
        var _this = this;

        $(window).on('resize', function () {
            _this.setContMinHeight();
        });

        $(document)
            .on('mouseover', '#J-sidebar li', function (e) {
                var $this = $(this);

                $this.addClass('active');

                if ($this.hasClass('J-has-submenu')) {
                    $('#J-submenu-wrap')
                        .show()
                        .html($this.find('ul.J-submenu').clone());

                    wrapMod.subScroll = null;
                    wrapMod.subScroll = new iScroll('J-submenu-wrap', {
                        snap: 'li',
                        bounce: false, //是否超过实际位置反弹
                        bounceLock: false, //当内容少于滚动是否可以反弹，这个实际用处不大
                        momentum: true, //动量效果，拖动惯性
                        hideScrollbar: true, //隐藏滚动条
                        onBeforeScrollStart: function (e) {
                            e.preventDefault();
                        }
                    });

                } else {
                    $('#J-submenu-wrap').hide();
                }
            })
            .on('mouseleave', '#J-sidebar li', function (e) {
                var $this = $(this),
                    $toElement = e.toElement ? $(e.toElement) : $(e.relatedTarget);

                $this.removeClass('active');

                if ($toElement.closest('#J-submenu-wrap').length < 1) {
                    $('#J-submenu-wrap').hide();
                }
            })
            .on('mouseleave', '#J-submenu-wrap', function (e) {
                var $toElement = $(e.toElement);
                if ($toElement.closest('#J-sidebar li.J-has-submenu').length < 1) {
                    $(this).hide();
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
            .on('mouseup', '#J-sidebar a, #J-submenu-wrap a, #J-link-change-pwd', function (e) {
                if (Math.abs(wrapMod.clickY - e.pageY) < 50) {
                    if (e.target.target != '_blank') {
                        _this.showPage({
                            target: e.target.target,
                            href: e.target.href,
                            name: e.target.name
                        });
                    }
                }
            })
            .on('mousedown', '#J-frame-tab li', function (e) {
                wrapMod.clickX = e.pageX;
            })
            .on('mouseup', '#J-frame-tab li', function (e) {
                if (Math.abs(wrapMod.clickX - e.pageX) < 50) {
                    var $target = $(e.target);
                    if (!$target.hasClass('active')) {
                        $target.addClass('active').siblings().removeClass('active');

                        $('#J-container').find('iframe').hide();
                        $('#J-container').find('iframe[name=' + $target.data('name') + ']').show();
                    }
                }
            })
            .on('dblclick', '#J-frame-tab li', function (e) {
                var $target = $(e.target),
                    $ul = $target.parent();

                if ($target.data('name') != 'home') {
                    $target
                        .prev().addClass('active')
                        .end().remove();

                    $ul.width($ul.find('li').length * $ul.find('li').outerWidth());

                    $('#J-container')
                        .find('iframe[name=' + $target.data('name') + ']')
                        .prev().show()
                        .end().remove();

                    _this.tabScroll && _this.tabScroll.refresh();
                }
            });

        $(window).on('resize', function () {
            wrapMod.setContMinHeight();
        });
    }
};

$(function () {
    wrapMod.init();
});


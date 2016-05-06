(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.app = {
    modules: {
        import: require('./../modules/attendance/overtime/import'),
        edit: require('./../modules/attendance/overtime/edit')
    },

    //初始化
    init: function () {
        var _this = this;
        _this.$document = $(document);

        $('#J-table-wrap').css({
            'height': $(window).height() - 170
        });

        $.each(_this.modules, function (key, module) {
            module.init(_this);
        });
    }
};

$(function () {
    app.init();
});

},{"./../modules/attendance/overtime/edit":2,"./../modules/attendance/overtime/import":3}],2:[function(require,module,exports){
'use strict';

module.exports = {
    data: null,

    init: function (parent) {
        var _this = this;
        _this.parent = parent;

        _this.bindEvents();
    },

    //绑定事件
    bindEvents: function () {
        var _this = this;

        $('#J-update-btn').on('click', function () {
            $('#J-list').find('tr.J-employee').each(function () {
                var $this = $(this),
                    work_day_total = 0,
                    holiday_total = 0;

                $this.find('td.J-item').each(function () {
                    if ($(this).hasClass('status-holiday')) {
                        holiday_total += $(this).find('input[name=list_item]').val() * 1;
                    } else {
                        work_day_total += $(this).find('input[name=list_item]').val() * 1;
                    }
                });

                $this.find('input[name=work_day_total]').val(work_day_total);
                $this.find('input[name=holiday_total]').val(holiday_total);
                $this.find('input[name=total]').val(work_day_total + holiday_total);
            });
        });

        _this.parent.$document
            .on('click', 'th.J-set-holiday', function (e) {
                $('#J-list').find('td.J-item-' + $(this).data('index')).toggleClass('status-holiday')
            });
    }
};

},{}],3:[function(require,module,exports){
'use strict';

module.exports = {
    dayName: ['日', '一', '二', '三', '四', '五', '六'],

    init: function (parent) {
        var _this = this;
        _this.parent = parent;

        _this.bindEvents();
    },

    importData: function () {
        var _this = this,
            formData = new FormData(document.getElementById('J-form'));

        $.ajax({
            url: '/attendanceMod/overtime/import' ,
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function () {
                H.Loading.show();
            },
            success: function (re) {
                if (re.code == 0) {
                    _this.renderList(re.data)
                } else {
                    H.alert(re.msg);
                }
            },
            error: function () {
            },
            complete: function () {
                H.Loading.hide();
            }
        });
    },

    renderList: function (data) {
        var _this = this,
            maxDay = 30,
            th = [],
            isWeekendList = [],
            html = '';

        if (data.month == 2) {
            if (_this.isSpYear(data.year)) {
                maxDay = 29;
            } else {
                maxDay = 28;
            }
        } else if ($.inArray(data.month, [1, 3, 5, 7, 8, 10, 12]) != -1) {
            maxDay = 31;
        }

        //当月所有的日期数据
        for (var i = 0; i < maxDay; i++) {
            var time = new Date(data.year + '-' + data.month + '-' + (i + 1)),
                day = time.getDay(),
                date = time.getDate();

            if (day == 0 || day == 6) {
                isWeekendList.push(i);
            }

            th.push({
                date: date > 10 ? date.toString() : '0' + date,
                dayName: _this.dayName[day]
            });
        }

        //当月不足31天，根据缺多少天补足
        for (var i = 0, len = 31 - maxDay; i < len; i++) {
            var time = new Date(data.year + '-' + (data.month + 1) + '-' + (i + 1)),
                day = time.getDay(),
                date = time.getDate();

            if (day == 0 || day == 6) {
                isWeekendList.push(maxDay + i);
            }

            th.push({
                date: date > 10 ? date.toString : '0' + date,
                dayName: _this.dayName[day]
            });
        }

        _this.parent.modules.edit.data = {
            isWeekendList: isWeekendList,
            th: th,
            year: data.year,
            month: data.month,
            detail: data.detail
        };

        html = H.template($('#J-list-tpl').html(), _this.parent.modules.edit.data);

        $('#J-table-wrap').html(html);
    },

    isSpYear: function (year) {
        if ((year % 100 == 0 && year % 400 == 0) || (year % 100 != 0 && year % 4 == 0)) {
            return true;
        }
        return false;
    },

    //绑定事件
    bindEvents: function () {
        var _this = this;

        $('#J-upload-btn').on('click', function () {
            _this.importData();
        });

        $('#J-form').find('input[type=file]').on('change', function (e) {
            $(this).next().text(e.currentTarget.files[0].name);
        });
    }
};

},{}]},{},[1])
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

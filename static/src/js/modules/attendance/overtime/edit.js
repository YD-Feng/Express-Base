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

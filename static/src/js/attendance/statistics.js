'use strict';

window.app = {
    modules: {
        import: require('./../modules/attendance/statistics/import'),
        edit: require('./../modules/attendance/statistics/edit')
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

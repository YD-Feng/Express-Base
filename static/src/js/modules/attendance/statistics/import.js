'use strict';

module.exports = {
    init: function (parent) {
        var _this = this;
        _this.parent = parent;

        _this.bindEvents();
    },

    importData: function () {
        var _this = this,
            formData = new FormData(document.getElementById('J-form'));

        $.ajax({
            url: '/attendanceMod/import' ,
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
            total = {},
            html = '';

        $.each(data, function (i, department) {
            $.each(department, function (key, value) {
                if (key != 'list' && key != 'per' && key != 'department_name') {
                    if (!total[key]) {
                        total[key] = 0;
                    }
                    total[key] += value;
                }
            });
        });
        total.per = (total.actual_arrive / total.should_arrive * 100).toFixed(1) * 1;

        _this.parent.modules.edit.data = {
            list: data,
            total: total
        };

        html = H.template($('#J-list-tpl').html(), _this.parent.modules.edit.data);

        $('#J-table-wrap').html(html);
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

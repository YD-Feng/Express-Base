(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./../modules/attendance/statistics/edit":2,"./../modules/attendance/statistics/import":3}],2:[function(require,module,exports){
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

        _this.parent.$document
            .on('input', '#J-list input', function (e) {
                var $this = $(this),
                    name = $this.attr('name'),
                    index = $this.data('index'),
                    subIndex = $this.data('subIndex'),
                    total = _this.data.total,
                    curDepartment = _this.data.list[index],
                    curEmployee = curDepartment['list'][subIndex];

                if (isNaN($this.val() * 1) || $this.val() * 1 < 0) {
                    $this.val(0);
                }

                if ($this.val().length > 1 && $this.val().indexOf('0') == 0 && $this.val().indexOf('.') == 0) {
                    $this.val($this.val() * 1);
                }

                if (name == 'name') {
                    curEmployee[name] = $this.val();
                } else {
                    curDepartment[name] = curDepartment[name] - curEmployee[name] + $this.val() * 1;
                    total[name] = total[name] - curEmployee[name] + $this.val() * 1;
                    curEmployee[name] = $this.val();

                    $('#J-list').find('tr.J-sub-total').eq(index).find('input[name=' + name + ']').val(curDepartment[name]);
                    $('#J-list').find('tr.J-total').find('input[name=' + name + ']').val(total[name]);

                    if ($.inArray(name, ['should_arrive', 'actual_arrive']) != -1) {
                        curEmployee.per = (curEmployee.actual_arrive / curEmployee.should_arrive * 100).toFixed(1) * 1;
                        curDepartment.per = (curDepartment.actual_arrive / curDepartment.should_arrive * 100).toFixed(1) * 1;
                        total.per = (total.actual_arrive / total.should_arrive * 100).toFixed(1) * 1;
                        $('#J-employee-' + index + '-' + subIndex).find('input[name=per]').val(curEmployee.per);
                        $('#J-list').find('tr.J-sub-total').eq(index).find('input[name=per]').val(curDepartment.per);
                        $('#J-list').find('tr.J-total').find('input[name=per]').val(total.per);
                    }

                }
            });
    }
};

},{}],3:[function(require,module,exports){
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

},{}]},{},[1])
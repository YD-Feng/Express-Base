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

'use strict';
var loginMod = {
    hideErrMsgTimeout: null,
    init: function () {
        var _this = this;

        $('html').css({
            'height': '100%'
        });

        _this.bindEvents();
    },

    login: function (opts) {
        var _this = this;

        $.ajax({
            method: 'GET',
            url: '/auth/login/',
            dataType: 'json',
            data: {
                username: opts.userName,
                password: opts.password
            }
        }).success(function (re) {
            if (re.code == 0) {
                location.href = '/template/index.html';
            } else {
                _this.showErrMsg(re.msg);
            }
        }).error(function () {
            _this.showErrMsg('登录失败！');
        });
    },

    showErrMsg: function (msg) {
        var _this = this;

        $('#J-err-msg')
            .html(msg)
            .parent()
            .removeClass('hidden');

        clearTimeout(_this.hideErrMsgTimeout);
        _this.hideErrMsgTimeout = setTimeout(function () {
            $('#J-err-msg').parent().addClass('hidden');
        }, 3000);
    },

    bindEvents: function () {
        var _this = this;

        $('#J-form').on('submit', function (e) {
            e.preventDefault();

            var userName = $(this).find('input[name=userName]').val(),
                password = $(this).find('input[name=password]').val();

            if (userName == '') {
                _this.showErrMsg('请输入用户名！');
                return;
            }

            if (password == '') {
                _this.showErrMsg('请输入密码！');
                return;
            }

            _this.login({
                userName: userName,
                password: password
            });
        });
    }
};

$(function () {
    loginMod.init();
});

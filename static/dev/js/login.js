(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
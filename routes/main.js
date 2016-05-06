var _ = require('underscore'),//引入 underscore 模块
    userMod = require('./modules/userMod'),//引入 user 模块
    menuMod = require('./modules/menuMod'),//引入 menu 模块
    attendanceMod = require('./modules/attendanceMod'),//引入 attendance 模块
    config = {
        get: {
            '/user/list': userMod.getUserList,
            '/user/status': userMod.checkStatus,
            '/menu/list': menuMod.getMenuList,
            '/attendanceMod/export': attendanceMod.export
        },
        post: {
            '/user/login': userMod.login,
            '/user/save': userMod.save,
            '/menu/save': menuMod.save,
            '/attendanceMod/import': attendanceMod.import,
            '/attendanceMod/overtime/import': attendanceMod.importOvertimeTable
        }
    };//路由配置



module.exports = function (app) {

    //分析路由配置对象，逐一处理
    _.each(config, function (subConfig, method) {

        _.each(subConfig, function (func, url) {

            app[method](url, func);

        });

    });

};

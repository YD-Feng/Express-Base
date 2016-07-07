var validateEngine = function () {
        return function (req, res, next) {
            var _ = require('underscore'),
                validateConfig = require('./validateConfig'),
                validateField = require('./validateField'),
                field,
                result,
                params = typeof req.query == 'undefined' ? req.body : req.query,
                flag = true,
                path = req.path;

            if (_.indexOf(validateConfig.mustLoginList, path) != -1) {
                if (!req.cookies.userToken) {
                    if (req.method == 'GET' && typeof params.callback != 'undefined') {
                        res.jsonp({
                            code: 1000,
                            data: null,
                            msg: '接口验证失败，请先登录'
                        });
                    } else {
                        res.send({
                            code: 1000,
                            data: null,
                            msg: '接口验证失败，请先登录'
                        });
                    }

                    flag = false;
                }
            }

            if (flag && validateConfig[path]) {
                for (field in validateConfig[path]) {
                    var arr = validateConfig[path][field].split('@');

                    result = validateField(params[field], arr[0], field, arr[1], params, validateConfig[path]);
                    if (result.code != 0) {
                        res.send(result);
                        flag = false;
                        break;
                    }
                }
            }

            if (flag) {
                next();
            }
        };
    };

module.exports = validateEngine;

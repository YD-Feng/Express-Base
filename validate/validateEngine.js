var validateConfig = require('./validateConfig'),
    validateField = require('./validateField'),
    validateEngine = function () {
        return function (req, res, next) {
             var field,
                 result,
                 params = typeof req.query == 'undefined' ? req.body : req.query,
                 flag = true,
                 path = req.path;

            if (validateConfig[path]) {
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

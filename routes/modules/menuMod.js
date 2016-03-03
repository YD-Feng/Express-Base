var menuSrv = require('../../data/modules/menuSrv'),
    menuMod = {
        //获取菜单列表
        getMenuList: function (req, res) {
            menuSrv.getMenuList(function (result) {
                if (result.length > 0) {
                    res.send({
                        code: 1,
                        data: result,
                        msg: 'success'
                    });
                } else {
                    res.send({
                        code: 0,
                        data: null,
                        msg: 'error'
                    });
                }
            });
        },

        //保存菜单信息
        save: function (req, res) {
            var code = 1,
                msg = '',
                sendData = null;

            if (req.body.pid == '') {
                code = 0;
                msg = '操作失败，pid不能为空！';
            }

            if (typeof req.body.name == 'undefined' || req.body.name == '') {
                code = 0;
                msg = '操作失败，菜单名不能为空！';
            }

            if (code == 0) {
                sendData = {
                    code: code,
                    data: null,
                    msg: msg
                };
                res.send(sendData);
                return;
            }

            menuSrv.save(req.body, function (result) {

                if (result.affectedRows > 0) {

                    sendData = {
                        code: 1,
                        data: result,
                        msg: '操作成功！'
                    };

                } else {

                    sendData = {
                        code: 0,
                        data: result,
                        msg: '操作失败！'
                    };

                }

                res.send(sendData);
            });
        },

        //删除菜单
        delete: function (req, res) {
            menuSrv.delete(req.body.ids, function (result) {
                var sendData = null;

                if (result.affectedRows > 0) {

                    sendData = {
                        code: 1,
                        data: result,
                        msg: '菜单删除成功！'
                    };

                } else {

                    sendData = {
                        code: 0,
                        data: result,
                        msg: '菜单删除失败！'
                    };

                }

                res.send(sendData);
            });
        }
    };

module.exports = menuMod;

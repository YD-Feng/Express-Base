var userSrv = require('../../data/modules/userSrv'),
    userMod = {
    getUserList: function (req, res) {
        if (req.cookies.userToken) {

            userSrv.getUserList(req.query, function (result) {
                res.send({
                    code: 1,
                    data: result,
                    msg: 'success'
                });
            });

        } else {

            res.send({
                code: 0,
                data: null,
                msg: 'login please'
            });

        }
    },
    checkStatus: function (req, res) {
        res.send('userStatus');
    },
    save: function (req, res) {
        res.send('userSave');
    }
};

module.exports = userMod;

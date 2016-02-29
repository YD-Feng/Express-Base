var userMod = {
    getList: function (req, res) {
        res.send('userList');
    },
    checkStatus: function (req, res) {
        res.send('userStatus');
    },
    save: function (req, res) {
        res.send('userSave');
    }
};

module.exports = userMod;

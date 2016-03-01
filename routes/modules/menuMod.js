var menuMod = {
    getMenuList: function (req, res) {
        req.session.userName = 'admin';
        res.send(req.session.userName);
    },
    save: function (req, res) {
        res.send('menuSave');
    }
};

module.exports = menuMod;

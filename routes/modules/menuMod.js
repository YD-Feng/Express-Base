var menuMod = {
    getMenuList: function (req, res) {
        res.send('menuList');
    },
    save: function (req, res) {
        res.send('menuSave');
    }
};

module.exports = menuMod;

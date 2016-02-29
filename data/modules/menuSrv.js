var connPool = require('../connPool'),
    menuSrv = {
        getMenuList: function (callback) {
            connPool.getConnection(function (err, connection) {
                var sql = 'select * from user';
                connection.query(sql, function (err, data) {
                    if (err) throw err;
                    callback(data);
                    connection.release();//释放链接
                });
            });
        }
    };

module.exports = menuSrv;

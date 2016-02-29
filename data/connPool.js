var settings = require('./settings'),
    mysql = require('mysql'),

    //使用连接池的连接方式
    pool  = mysql.createPool(settings);

module.exports = pool;

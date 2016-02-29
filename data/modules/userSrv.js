var connPool = require('../connPool'),
    userSrv = {
        getUserList: function (opts, callback) {
            connPool.getConnection(function (err, connection) {
                var flag = 0,
                    str = '',
                    countSQL = 'select count(*) from user',
                    listSQL = 'select * from user';

                if (!!opts.userName) {
                    str = (flag == 0 ? ' where ' : ' and ') + 'name=' + connPool.escape(opts.userName);
                    countSQL += str;
                    listSQL += str;
                    flag++;
                }

                if (!!opts.createTimeStart && typeof !!opts.createTimeEnd) {
                    str = (flag == 0 ? ' where ' : ' and ') + 'createTime between TIMESTAMP(' + connPool.escape(opts.createTimeStart + ' 00:00:00') + ') and TIMESTAMP(' + connPool.escape(opts.createTimeEnd + ' 23:59:59') + ')';
                    countSQL += str;
                    listSQL += str;
                    flag++;
                } else if (!!opts.createTimeStart && !opts.createTimeEnd) {
                    str = (flag == 0 ? ' where ' : ' and ') + 'createTime >= TIMESTAMP(' + connPool.escape(opts.createTimeStart + ' 00:00:00') + ')';
                    countSQL += str;
                    listSQL += str;
                    flag++;
                } else if (!opts.createTimeStart && typeof !!opts.createTimeEnd) {
                    str = (flag == 0 ? ' where ' : ' and ') + 'createTime <= TIMESTAMP(' + connPool.escape(opts.createTimeEnd + ' 23:59:59') + ')';
                    countSQL += str;
                    listSQL += str;
                    flag++;
                }

                if (!!opts.roleId) {
                    str = (flag == 0 ? ' where ' : ' and ') + 'roleId=' + connPool.escape(opts.roleId);
                    countSQL += str;
                    listSQL += str;
                    flag++;
                }

                if (!opts.pageSize) {
                    opts.pageSize = 30;
                }

                if (!opts.currentPage) {
                    opts.currentPage = 1;
                }

                str = ' order by id limit ' + (opts.pageSize * (opts.currentPage - 1)) + ',' + opts.pageSize

                listSQL += str;

                connection.query(countSQL, function (err, countResult) {
                    if (err) throw err;

                    connection.query(listSQL, function (err, listResult) {
                        if (err) throw err;
                        callback({
                            totalCount: countResult[0]['count(*)'],
                            currentPage: opts.currentPage,
                            pageSize: opts.pageSize,
                            list: listResult
                        });
                        connection.release();//释放链接
                    });
                });
            });
        }
    };

module.exports = userSrv;

/*userServ.getUserList = function (opts, callback) {

};*/

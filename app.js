var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes/main'),
    mysql = require('mysql'),
    settings = require('./dataSrv/settings'),
    session = require('express-session'),
    SessionStore = require('express-mysql-session'),
    log4js = require('log4js'),
    validateEngine = require('./validate/validateEngine'),

    //生成一个 SessionStore 实例
    sessionStore = new SessionStore({
        host: settings.host,
        port: settings.port,
        user: settings.user,
        password: settings.password,
        database: settings.database,
        schema: {
            tableName: 'session',
            columnNames: {
                session_id: 'id',
                expires: 'expires',
                data: 'data'
            }
        }
    }, mysql.createConnection(settings)),

    //生成一个 express 实例
    app = express();


//日志记录相关配置
log4js.configure({
    appenders: [
        {
            type: 'console'
        },//控制台输出
        {
            type: 'dateFile',
            filename: 'logs/logInfo',
            pattern: '-yyyy-MM-dd.log',
            maxLogSize: 20480,
            alwaysIncludePattern: true,
            backups: 4
        }//日期文件格式
    ],
    replaceConsole: true
});

//指定 web 应用的标题栏小图标的路径为：/static/favicon.ico
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));
//加载日志中间件
app.use(logger('dev'));
//加载解析 json 的中间件
app.use(bodyParser.json());
//加载解析 urlencoded 请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));
//加载解析 cookie 的中间件
app.use(cookieParser());
//设置 static 文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'static')));
//加载解析 session 的中间件
app.use(session({
    key: settings.sessionKey,
    secret: settings.sessionSecret,
    cookie: {
        maxAge: 6 * 60 * 60 * 1000
    },
    store: sessionStore,
    rolling: true,
    resave: false,
    saveUninitialized: false
}));
//加载日志记录的中间件
app.use(log4js.connectLogger(log4js.getLogger(), {
    level: log4js.levels.INFO
}));

app.use(validateEngine());

//配置路由
routes(app);

//捕获404错误，并转发到错误处理器
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//错误处理器
if (app.get('env') === 'development') {
    //开发环境下的错误处理器
    app.use(function (err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.send('error', {
            code: err.status || 500,
            msg: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    //生产环境下的错误处理器
    console.log(err);
    res.status(err.status || 500);
    res.send('error', {
        code: err.status || 500,
        msg: err.message
    });
});

//导出 app 实例供其他模块调用
module.exports = app;

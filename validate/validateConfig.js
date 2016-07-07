var validateConfig = {
    'mustLoginList': [
        '/user/list'
    ],
    '/user/list': require('./modules/userList')
};

module.exports = validateConfig;

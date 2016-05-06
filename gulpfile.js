var q = require('q'),
    gulp = require('gulp'),

    gulpIf = require('gulp-if'),
    gulpWatch = require('gulp-watch'),

    rename = require('gulp-rename'),
    copy = require('gulp-copy'),
    clean = require('gulp-clean'),

    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),

    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),

    util = require('gulp-util'),
    notify = require('gulp-notify'),

    argv = require('minimist')(process.argv.slice(2)),

    path = require('path'),
    fs = require('fs');

//【内部调用函数】控制台错误处理
function handleErrors () {
    var args = Array.prototype.slice.call(arguments);

    notify.onError({
        title : 'compile error',
        message : '<%=error.message %>'
    }).apply(this, args);//替换为当前对象

    this.emit();//提交
}

/*
 * 任务：将 less 编译成 css
 * */
gulp.task('less', function () {
    var stream = gulp.src('static/src/less/*.less')
        .pipe(less())
        .on("error", handleErrors)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .on('error', handleErrors)
        .pipe(minifycss())
        .pipe(gulp.dest('static/dist/css'));

    return stream;
});

/*
 * 任务：browserify 对模块化的代码进行编译合并
 * */
gulp.task('browserify', function () {
    var mainDef = q.defer(),
        readDirDef = q.defer(),
        arr = [];

    mainDef.promise.then(function () {
        console.log('browserify 任务执行完毕');
    }, function (reason) {
        console.log(reason);
    });

    readDirDef.promise.then(function (data) {
        var func = function (folderName) {
            var deferred = q.defer(),
                srcPath = typeof folderName == 'undefined' ? 'static/src/js/*.js' : 'static/src/js/' + folderName + '/*.js',
                destPath = typeof folderName == 'undefined' ? 'static/dev/js/' : 'static/dev/js/' + folderName;

            gulp.src(srcPath)
                .pipe(browserify({
                    insertGlobals : false,
                    debug : false
                }))
                .on('error', handleErrors)
                .pipe(gulp.dest(destPath))
                .on('error', function () {
                    deferred.reject();
                })
                .on('finish', function () {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        for (var i = 0, len = data.length; i < len; i++) {
            var curData = data[i];

            if (path.extname(curData) != '.js' && curData != 'modules') {
                arr.push(func(curData));
            }
        }

        arr.push(func());

        q.all(arr).then(function () {
            mainDef.resolve();
        }, function () {
            mainDef.reject('文件编译合并过程出错');
        })
    }, function () {
        mainDef.reject('遍历目录过程出错');
    });

    fs.readdir('static/src/js/', function (err, data) {
        if (err) {
            readDirDef.reject(err);
        } else {
            readDirDef.resolve(data);
        }
    });

    return mainDef.promise;
});

/*
 * 任务：script 编译、合并、压缩 js
 * */
gulp.task('script', ['browserify'], function () {
    var stream = gulp.src('static/dev/js/**/*.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .on("error", handleErrors)
        .pipe(gulp.dest('static/dist/js'));

    return stream;
});

/*
 * 任务：dist 任务的子任务，用来复制必要文件到 dist 目录
 * */
gulp.task('copy', function () {
    var stream = gulp.src(['static/src/img/**/*', 'static/src/lib/**/*', 'static/src/font/**/*', 'static/src/data/**/*'])
        .pipe(copy('static/dist', {
            prefix : 2
        }));

    return stream;
});

/*
 * 任务：clean 清除生成文件
 * */
gulp.task('clean', function(){
    var stream = gulp.src(['static/dev', 'static/dist'])
        .pipe(clean({
            force: true
        }));
    return stream;
});

/*
 * 任务：dist 构建
 * */
gulp.task('dist', function () {
    gulp.start('script', 'less', 'copy');
});

gulp.task('watch:js', function () {
    gulpWatch('static/src/js/**/*.js', function (file) {
        console.time('编译&压缩任务完成，任务耗时');

        var dirname = file.dirname,
            basename = file.basename,
            extname = file.extname,
            srcPath = '',
            devPath = 'static/dev/js/',
            distPath = 'static/dist/js/';

        if (dirname.indexOf('\\modules') != -1) {
            srcPath = dirname.replace('\\modules', '') + extname;
        } else {
            srcPath = path.join(dirname, basename);
        }

        if (file.relative.split(path.sep).length > 1) {
            devPath += path.relative('static/src/js/', srcPath).split(path.sep)[0];
            distPath += path.relative('static/src/js/', srcPath).split(path.sep)[0];
        }

        console.info(file.path);
        console.info('发生变动，触发执行编译&压缩任务...');

        gulp.src(srcPath)
            .pipe(browserify({
                insertGlobals : false,
                debug : false
            }))
            .on('error', handleErrors)
            .pipe(gulp.dest(devPath))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .on("error", handleErrors)
            .pipe(gulp.dest(distPath))
            .on("finish", function () {
                console.timeEnd('编译&压缩任务完成，任务耗时');
                console.info('\r');
            });
    });
});

gulp.task('watch:less', function () {
    gulp.watch('static/src/less/**/*.less', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running less tasks...');
        gulp.start('less');
    });
});

gulp.task('watch', function () {
    gulp.start('watch:js', 'watch:less');
});


/*
 * 任务：自定义任务
 * 描述：可根据自己需要自定义常用任务
 * */
gulp.task('default', function () {
    gulp.start('dist');
});



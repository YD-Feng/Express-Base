var xlsx = require('node-xlsx'),
    attendanceMod = {
        //导入考勤总表
        import: function (req, res) {
            var _ = require('underscore'),
                cheerio = require('cheerio'),
                formidable = require('formidable'),
                fs = require('fs'),
                iconV = require('iconv-lite'),
                form = new formidable.IncomingForm(); //创建上传表单

            form.keepExtensions = true; //保留后缀
            form.maxFieldsSize = 20 * 1024 * 1024; //文件大小

            form.parse(req, function(err, fields, files) {
                if (err) throw err;

                var file = _.values(files)[0];

                if (file.name != '') {
                    var content = iconV.decode(fs.readFileSync(file.path), 'GBK'),
                        $ = cheerio.load(content),
                        $div = $('div').filter(function () {
                            var flag = false,
                                $this = $(this),
                                cssFont = $this.css('font');

                            if (cssFont) {
                                if (
                                    (cssFont.indexOf('9pt 黑体') != -1 && !isNaN($this.text() * 1)) ||
                                    cssFont.indexOf('9pt 宋体') != -1
                                ) {
                                    flag = true;
                                }
                            }

                            return flag;
                        }),
                        topList = [],
                        result = [],
                        index = -1;

                    $div.each(function () {
                        topList = _.union(topList, [$(this).css('top')]);
                    });

                    _.each(topList, function (top) {
                        var $line = $div.filter(function () {
                            return $(this).css('top') == top;
                        });

                        if ($line.length > 1) {
                            var firstElText = $line.eq(0).text();

                            if ((isNaN(firstElText * 1) || firstElText * 1 > 2e7) &&
                                firstElText.indexOf('小计 ') == -1 &&
                                firstElText.indexOf('总计 ') == -1 &&
                                firstElText.indexOf('-\r\n') == -1) {

                                var obj = {
                                    id: '',
                                    name: '',
                                    should_arrive: '',
                                    actual_arrive: '',
                                    absenteeism: '',
                                    be_late: '',
                                    be_early: '',
                                    over_time: '',
                                    ask_for_leave: '',
                                    out_for_business: '',
                                    has_not_sign_in: '',
                                    has_not_sign: '',
                                    should_arrive_sp: '',
                                    ask_for_leave_illness: '',
                                    should_arrive_matter: '',
                                    out_for_business_sp: '',
                                    work_time: '',
                                    per: ''
                                };

                                $line.each(function () {
                                    var $this = $(this),
                                        left = $this.css('left').replace('px', '') * 1,
                                        text = $this.text().replace('\n', '');

                                    if (left == 74) {
                                        obj.name = text;//姓名
                                    } else if (left == 162) {
                                        obj.id = text;//考勤号码
                                    } else if (left < 275) {
                                        obj.should_arrive = text;//应到
                                    } else if (left < 313) {
                                        obj.actual_arrive = text;//实到
                                    } else if (left < 351) {
                                        obj.absenteeism = text;//旷工
                                    } else if (left < 388) {
                                        obj.be_late = text;//迟到
                                    } else if (left < 428) {
                                        obj.be_early = text;//早到
                                    } else if (left < 466) {
                                        obj.over_time = text;//加班
                                    } else if (left < 508) {
                                        obj.ask_for_leave = text;//请假
                                    } else if (left < 549) {
                                        obj.out_for_business = text;//公出
                                    } else if (left < 594) {
                                        obj.has_not_sign_in = text;//未签到
                                    } else if (left < 639) {
                                        obj.has_not_sign = text;//未签
                                    } else if (left < 684) {
                                        obj.should_arrive_sp = text;//应到
                                    } else if (left < 729) {
                                        obj.ask_for_leave_illness = text;//病假
                                    } else if (left < 774) {
                                        obj.should_arrive_matter = text;//事假
                                    } else if (left < 819) {
                                        obj.out_for_business_sp = text;//公出
                                    } else if (left < 960) {
                                        obj.work_time = text;//工作时间
                                    } else {
                                        obj.per = text;//出勤率
                                    }
                                });

                                result[index] && result[index].list.push(obj);

                            }
                        } else {
                            if ($line.eq(0).css('left') == '74px') {
                                index++;
                                result.push({
                                    department_name: $line.eq(0).text(),
                                    list: []
                                });
                            }
                        }

                    });

                    _.each(result, function (department, i) {
                        var obj = {
                            count: 0,
                            should_arrive: 0,
                            actual_arrive: 0,
                            absenteeism: 0,
                            be_late: 0,
                            be_early: 0,
                            over_time: 0,
                            ask_for_leave: 0,
                            out_for_business: 0,
                            has_not_sign_in: 0,
                            has_not_sign: 0,
                            should_arrive_sp: 0,
                            ask_for_leave_illness: 0,
                            should_arrive_matter: 0,
                            out_for_business_sp: 0,
                            work_time: 0,
                            per: 0
                        };

                        _.each(department.list, function (person) {
                            _.each(obj, function (value, key) {
                                if (key != 'per' && key != 'count') {
                                    obj[key] += person[key] * 1;
                                }
                            });
                            obj.count++;
                        });

                        obj.per = (obj.actual_arrive / obj.should_arrive * 100).toFixed(1) * 1;

                        result[i] = _.extend(department, obj);
                    });

                    res.send({
                        code: 0,
                        data: result,
                        msg: ''
                    });
                } else {
                    res.send({
                        code: 9999,
                        data: null,
                        msg: '请选择上传文件'
                    });
                }
            });
        },

        //导入加班表
        importOvertimeTable: function (req, res) {
            var _ = require('underscore'),
                cheerio = require('cheerio'),
                formidable = require('formidable'),
                fs = require('fs'),
                iconV = require('iconv-lite'),
                form = new formidable.IncomingForm(); //创建上传表单

            form.keepExtensions = true; //保留后缀
            form.maxFieldsSize = 20 * 1024 * 1024; //文件大小

            form.parse(req, function(err, fields, files) {
                if (err) throw err;

                var file = _.values(files)[0];

                if (file.name != '') {
                    var content = iconV.decode(fs.readFileSync(file.path), 'GBK'),
                        $ = cheerio.load(content),
                        $div = $('div').filter(function () {
                            var flag = false,
                                $this = $(this),
                                cssFont = $this.css('font');

                            if (cssFont) {
                                if (
                                    (cssFont.indexOf('8pt Arial') != -1 && !isNaN($this.text() * 1)) ||
                                    (cssFont.indexOf('9pt Arial') != -1 && !isNaN($this.text() * 1)) ||
                                    cssFont.indexOf('9pt 宋体') != -1
                                ) {
                                    flag = true;
                                }
                            }

                            return flag;
                        }),
                        topList = [],
                        result = [],
                        year = 0,
                        month = 1;

                    $div.each(function () {
                        topList = _.union(topList, [$(this).css('top')]);
                    });

                    _.each(topList, function (top) {
                        var $line = $div.filter(function () {
                            return $(this).css('top') == top;
                        });

                        if ($line.length > 1) {
                            var firstElText = $line.eq(0).text();

                            if (firstElText * 1 > 2e7) {

                                var list = new Array(31),
                                    obj = {
                                        id: '',
                                        name: '',
                                        list: null,
                                        work_day_total: '',
                                        holiday_total: '',
                                        total: ''
                                    };

                                $line.each(function () {
                                    var $this = $(this),
                                        left = $this.css('left').replace('px', '') * 1,
                                        text = $this.text().replace('\n', '');

                                    if (left > 0 && left < 100) {
                                        obj.id = text;//考勤号码
                                    } else if (left > 100 && left < 173) {
                                        obj.name = text;//姓名
                                    } else if (left > 173 && left < 793) {
                                        list[Math.floor((left - 173) / 20)] = text;
                                    } else if (left < 873) {
                                        obj.work_day_total = text;//平时加班
                                    } else if (left < 953) {
                                        obj.holiday_total = text;//假期加班
                                    } else {
                                        obj.total = text;//加班合计
                                    }
                                });

                                obj.list = list;

                                result.push(obj);

                            }
                        } else {
                            var firstElText = $line.eq(0).text();

                            if (firstElText.match(/(\S+)-(\S+)-(\S+)/)) {
                                var arr = firstElText.split('-');
                                year = arr[0] * 1;
                                month = arr[1] * 1;
                            }
                        }

                    });

                    res.send({
                        code: 0,
                        data: {
                            year: year,
                            month: month,
                            detail: result
                        },
                        msg: ''
                    });
                } else {
                    res.send({
                        code: 9999,
                        data: null,
                        msg: '请选择上传文件'
                    });
                }
            });
        },

        //导出excel
        export: function (req, res) {
            var data = [
                [1,2,3],
                [true, false, null, 'sheetjs'],
                ['foo','bar',new Date('2014-02-19'), '0.4'],
                ['baz', null, 'qux']
            ];

            var fs = require('fs'),
                buffer = xlsx.build([{name: "mySheetName", data: data}]),
                filePath = './files/' + new Date().valueOf().toString() + Math.floor(Math.random() * 1e5) + '.xlsx';

            fs.writeFileSync(filePath, buffer);

            res.sendfile(filePath, function () {
                fs.unlink(filePath);
            });
        }
    };

module.exports = attendanceMod;

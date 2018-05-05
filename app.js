// 加载express模板
var express = require('express');
// 加载模板处理模块
var swig = require('swig');
// 加载数据库模块
// var mongoose = require('mongoose');
var mysql = require('mysql');
// 加载bodyParser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
// 加载cookies模块
var Cookies = require('cookies');
//websocket module
var ws = require('ws');
var http = require('http');
// 创建app应用 => Node.JS Http.createServer()
var app = express();
var ws_sever = require('./utils/websocket_server_side');
var winston = require('winston');								//logger module

// --- Get Our Modules --- //
var logger = new (winston.Logger)({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({ colorize: true })
    ]
});


// 设置静态文件托管
// 当用户访问的url以/public开始，那么直接返回对应__dirname + '/public'下的文件
app.use('/public', express.static( __dirname + '/public' ));

// 配置应用模板
// 定义当前应用所使用的模板引擎
// 第一个参数：模板引擎的名称，同时也是模板文件的后缀
// 第二个参数：表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);
//设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views', './views');
// 注册所使用的模板引擎，第一个参数必须是view engine，
// 第二个参数和app.engine方法中敌营模板引擎的名称（即第一个参数）是一致的
app.set('view engine', 'html');
// 开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

// bodyParser设置
app.use( bodyParser.urlencoded({extended: true}) );

// 设置cookie
app.use( function (req, res, next) {
    req.cookies = new Cookies(req, res);
    // console.log(req.cookies.get('userInfo'));
    // 解析登录用户的cookie信息
    req.userInfo = {};
    if( req.cookies.get('userInfo') ){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //获取当前登录用户的类型，是否是管理员
    //         User.findById(req.userInfo._id).then(function (userInfo) {
    //             req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
    //             next();
    //         });
        }catch(e){
    //         next();
        }
    } else {
    //
    }
    next();
} );

app.use('/', require('./routes/site_router'));

var server = http.createServer(app).listen(6661, function() {
    // setupWebSocket(server);
});

// var conn = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'',
//     port:3306,
//     database:'info'
// });
//
// conn.connect(function(err){
//     console.log('=================CONNECT INFORMATION=================');
//     if(err){
//         console.error("数据库连接失败:" + err.stack);
//         return;
//     }
//     console.log('数据库连接成功');
//     // 监听http请求
//
//
//     console.log('====================================================\n\n');
// });

// ============================================================================================================================
// 												WebSocket Communication Madness
// ============================================================================================================================
function setupWebSocket(server) {
    console.log('------------------------------------------ Websocket Up ------------------------------------------');
    wss = new ws.Server({ server: server });								//start the websocket now
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log(' ');
            console.log('-------------------------------- Incoming WS Msg --------------------------------');
            logger.debug('[ws] received ws msg:', message);
            var data = null;
            try {
                data = JSON.parse(message);
                ws_sever.process_msg(conn , ws, data, logger);
            }
            catch (e) {
                logger.debug('[ws] message error', message, e.stack);
            }
        });

        ws.on('error', function (e) { logger.debug('[ws] error', e); });
        ws.on('close', function () { logger.debug('[ws] closed'); });
    });

    // --- Send To All Connected Clients --- //
    wss.broadcast = function broadcast(data) {
        var i = 0;
        wss.clients.forEach(function each(client) {
            try {
                logger.debug('[ws] broadcasting to clients. ', (++i), data.msg);
                client.send(JSON.stringify(data));
            }
            catch (e) {
                logger.debug('[ws] error broadcast ws', e);
            }
        });
    };
}
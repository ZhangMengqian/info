'use strict';
/* global process */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 *******************************************************************************/
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require("moment");
var async = require('async');

// 上传图片用到的
var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/img');
    },
    filename: function(req, file, cb) {
        cb(null, `${req.userInfo.username}_${Date.now()}_${file.originalname}`)
    }
});

// ============================================================================================================================
// Database
// ============================================================================================================================
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    port:3306,
    database:'info'
});

connection.connect(function(err){
    console.log('=================CONNECT INFORMATION=================');
    if(err){
        console.error("数据库连接失败:" + err.stack);
        return;
    }
    console.log('数据库连接成功');
    console.log('====================================================\n\n');
});

// 统一返回格式
var responseData;
// 初始化
router.use( function (req, res, next) {
    responseData = {
        code : 0,
        message: ''
    };
    next();
} );

// ============================================================================================================================
// Register
// ============================================================================================================================
/*
* 用户注册
*   注册逻辑
*   1、用户名不能为空
*   2、密码不能为空
*   3、两次输入密码必须一致
*   4、用户是否已经被注册了 -》 数据库查询
* */
router.post('/register', function (req, res, next) {
    var username = req.body.username;
    var type = req.body.type;                   // 1->发布  2->审核  3->运输  4->顾客
    var password = req.body.password;
    var repassword = req.body.repassword;

    // 用户名是否为空
    if ( username == '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    // 密码不能为空
    if ( password == '' ) {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    // 两次输入的密码必须一致
    if ( password!=repassword ) {
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    // 用户名是否已经被注册
    var selectSQL = 'SELECT * FROM users WHERE `username` = \'' + username +'\'';
    connection.query( selectSQL, function (err, rows){
        if (err) throw err;
        if (rows.length > 0) {
            // 表示数据库中有该记录
            // 表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        } else{
            var  accountAddSql = 'INSERT INTO users( username, password, type ) VALUES (?,?,?)';
            var  accountAddSql_Params = [username, password, type];
            connection.query(accountAddSql,accountAddSql_Params,function (err, result) {
                console.log('================= 注册用户 -> 数据库 =================');
                if(err){
                    console.log('[INSERT ERROR] - ',err.message);
                    responseData.code = 5;
                    responseData.message = '注册失败';
                    res.json(responseData);
                }else{
                    console.log('[INSERT SUCCESS] - INSERT ID:',result);
                    responseData.message = '注册成功';
                    res.json(responseData);
                }
                console.log('=====================================================\n\n');
                return;
            });
        }
    });
});

// ============================================================================================================================
// Login
// ============================================================================================================================
router.route('/login').get(function (req, res) {
    return res.render('login');
});

router.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    console.log(username+password);

    if( username == '' || password == '' ){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    // 查询数据库中相同用户名和密码的记录是否存在，如果存在，则登录成功
    var selectSQL = 'SELECT * FROM users WHERE `username` = \'' + username +'\' AND `password` = \'' + password +'\'';
    connection.query( selectSQL, function (err, rows){
        if (err) throw err;
        if (rows.length <= 0) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }

        // 用户名和密码是正确的
        responseData.code = 0;
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: rows[0].id,
            username:rows[0].username,
            type: rows[0].type
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: rows[0].id,
            username:rows[0].username,
            type: rows[0].type
        }));
        console.log(responseData);
        res.json(responseData);
        return;
    });
});

// ============================================================================================================================
// Logout
// ============================================================================================================================
router.get('/logout', function (req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
    return;
});


// ============================================================================================================================
// Home
// ============================================================================================================================
router.route('/home').get(function (req, res) {
	// 先检查是否登录
    if (!req.userInfo || !req.userInfo.username) {
        return res.render('login');
    }else{
        switch(req.userInfo.type)
        {
            case 0:
            case 1:
                return res.render("produce", {
                    userInfo: req.userInfo
                });
                break;
            case 2:
                return res.render("check", {
                    userInfo: req.userInfo
                });
                break;
            case 3:
                return res.render("trans", {
                    userInfo: req.userInfo
                });
                break;
            case 4:
            default:
                return res.render("sale", {
                    userInfo: req.userInfo
                });
        }
    }
});

// ============================================================================================================================
// Produce
// ============================================================================================================================
router.route('/produce').get(function (req, res) {
	// 先检查是否登录
    if (!req.userInfo || !req.userInfo.username || (req.userInfo.type!=0 && req.userInfo.type!=1) ) {
        return res.redirect('/login');
    }else{
        return res.render("produce", {
            userInfo: req.userInfo
        });
    }
});

var upload = multer({ storage: storage }).single('pro_img');
router.post('/produce', function(req, res) {
    var pro_name = '';
    var pro_num = '';
    var pro_price = '';
    var pro_desc = '';
    var pro_img = '';
    var username = req.userInfo.username;

    // 上传图片
    upload(req, res, function (err) {
        if (err) {
            console.log('[INSERT ERROR] - ',err.message);
            responseData.code = 7;
            responseData.message = '图片上传失败';
            res.json(responseData);
        }
        // 一切都好
        console.log(req.body);
        pro_name = req.body.pro_name;
        pro_num = req.body.pro_num;
        pro_price = req.body.pro_price;
        pro_desc = req.body.pro_desc;
        pro_img = req.file.filename;

        var  accountAddSql = 'INSERT INTO product( pro_name, pro_num, pro_price, pro_desc, pro_img, username, createTime ) VALUES (?,?,?,?,?,?,?)';
        var  accountAddSql_Params = [ pro_name, pro_num, pro_price, pro_desc, pro_img, username, moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')];
        connection.query( accountAddSql, accountAddSql_Params, function (err, result) {
            console.log('================= 发布 -> 数据库 =================');
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                responseData.code = 6;
                responseData.message = '发布商品失败';
                res.json(responseData);
            }else{
                console.log('[INSERT SUCCESS] - INSERT ID:',result);
                responseData.code = 0;
                responseData.message = '发布成功';
                responseData.filePath = '../uploads/' + pro_img;
                console.log(responseData);
                res.json(responseData);
            }
            console.log('=====================================================\n\n');
            return;
        });
    });
});

// ============================================================================================================================
// Check
// ============================================================================================================================
router.route('/check').get(function (req, res) {
    if (!req.userInfo || !req.userInfo.username || (req.userInfo.type!=0 && req.userInfo.type!=2) ) {
        console.log("if=========================");
        return res.render('login');
    }
    // route_me(req, res);
    //
    var page = Number ( req.query.page || 1 );
    var limit = 6;          //每页读取的数目
    var pages = 0;          //总页数

    var selectSQL = 'select * FROM product where flag = 1';
    connection.query( selectSQL, function (err, rows){
        console.log('================= 审核 <- 数据库 =================');
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }

        var count = rows.length;
        // 计算总页数
        pages = Math.ceil( count / limit );     // 向上取整
        // 取值不能超过总页数
        page = Math.min( page, pages );
        // 取值不能小于1
        page = Math.max( page, 1);
        var skip =  (page-1) * limit;           // offset 起点
        var select = 'SELECT * FROM product where flag = 1 LIMIT ' + skip + ' , ' + limit ;
        connection.query( select, function (err, products) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
            }
            return res.render('check',{
                userInfo: req.userInfo,
                products: products,
                count: count,       // 记录数目
                page: page,         // 当前第几页
                pages: pages        // 总页数
            });
        });
        console.log('=====================================================\n\n');
    });
});

// 填充模态框
router.route('/details').post(function (req, res) {
    var pro_id = req.body.pro_id;
    console.log(req.body);

    var selectSQL = 'select * FROM product where id = ' + pro_id;
    console.log(selectSQL);
    connection.query( selectSQL, function (err, rows){
        console.log('================= 模态框商品信息 <- 数据库 =================');
        if (err) throw err;
        // 数据库中查不到此商品
        if (rows.length <= 0) {
            responseData.code = 13;
            responseData.message = '查无此记录';
            res.json(responseData);
            return;
        }

        responseData.code = 0;
        responseData.message = '查到啦!';
        responseData.userInfo = {
            product: rows[0]
        };
        res.json(responseData);
        console.log('=====================================================\n\n');
        return;
    });
});

// 同意商品发布
router.route('/accept').post(function (req, res) {
    var pro_id = req.body.pro_id;
    var updateSQL = 'update product set flag = 2 where id = ' + pro_id;
    connection.query(updateSQL, function (err, result) {
        console.log('================= 通过商品 -> 数据库 =================');
        if (err){
            console.log(err);
            throw err;
        }
        console.log("UPDATE Return ==> ");
        console.log(result);
        console.log('====================================================');

        responseData.code = 0;
        responseData.message = '审核通过！商品编号 -> '+ pro_id;
        res.json(responseData);

        return;
    });
});

// 拒绝商品发布
router.route('/decline').post(function (req, res) {
    var pro_id = req.body.pro_id;
    var updateSQL = 'update product set flag = 0 where id = ' + pro_id;
    connection.query(updateSQL, function (err, result) {
        console.log('================= 拒绝商品 -> 数据库 =================');
        if (err){
            console.log(err);
            throw err;
        }
        console.log("UPDATE Return ==> ");
        console.log(result);
        console.log('====================================================');

        responseData.code = 0;
        responseData.message = '审核拒绝！商品编号 -> '+ pro_id;
        res.json(responseData);
        return;
    });
});

// ============================================================================================================================
// Sale
// ============================================================================================================================
router.route('/sale').get(function (req, res) {
    // 先检查是否登录
    // 只要有账号就可以登录商城
    if (!req.userInfo || !req.userInfo.username) {
        return res.redirect('/login');
    }var page = Number ( req.query.page || 1 );
    var limit = 4;          //每页读取的数目
    var pages = 0;          //总页数

    var selectSQL = 'select * FROM product where flag = 2 AND left_num>0';
    connection.query( selectSQL, function (err, rows){
        if (err) throw err;
        var count = rows.length;
        // 计算总页数
        pages = Math.ceil( count / limit );     // 向上取整
        // 取值不能超过总页数
        page = Math.min( page, pages );
        // 取值不能小于1
        page = Math.max( page, 1);
        var skip =  (page-1) * limit;           // offset 起点
        var select = 'SELECT * FROM product where flag = 2 AND left_num>0 LIMIT ' + skip + ' , ' + limit ;
        console.log(select);
        connection.query( select, function (err, products) {
            console.log('================= 展示商品 <- 数据库 =================');
            if (err) throw err;
            return res.render('sale',{
                userInfo: req.userInfo,
                products: products,
                count: count,       // 记录数目
                page: page,         // 当前第几页
                pages: pages        // 总页数
            });
            console.log('===================================================');
        });
    });
});

router.route('/buy').post(function (req, res) {
    var buyer = req.userInfo.username;
    var pro_id = req.body.pro_id;
    var city = req.body.city;
    console.log(buyer+pro_id+city);

    var updateSQL = 'update product set left_num=left_num-1 where id = ' + pro_id;
    connection.query(updateSQL, function (err, result) {
        console.log('================= 购买商品 -> 数据库 =================');
        if (err){
            console.log(err);
            throw err;
        }

        var  accountAddSql = 'INSERT INTO trading( buyer, pro_id, city, tradingTime ) VALUES (?,?,?,?)';
        var  accountAddSql_Params = [ buyer, pro_id, city, moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')];
        connection.query( accountAddSql, accountAddSql_Params, function (err, result) {
            console.log('============== 购买记录 -> 数据库 ==============');
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                responseData.code = 8;
                responseData.message = '购买失败，请再次尝试';
                res.json(responseData);
            }else{
                console.log('[INSERT SUCCESS] - INSERT ID:',result);
                responseData.code = 0;
                responseData.message = '购买成功';
                console.log(responseData);
                res.json(responseData);
            }
            console.log('===============================================\n\n');
            return;
        });

        console.log('====================================================');
        return;
    });
});

// ============================================================================================================================
// Transportation
// ============================================================================================================================
router.route('/trans').get(function (req, res) {
    // 先检查是否登录
    if (!req.userInfo || !req.userInfo.username || (req.userInfo.type!=0 && req.userInfo.type!=3) ) {
        return res.redirect('/login');
    }
    var page = Number ( req.query.page || 1 );
    var limit = 4;          //每页读取的数目
    var pages = 0;          //总页数

    var selectSQL = 'select * FROM trading where flag = 1';
    connection.query( selectSQL, function (err, rows){
        if (err) throw err;
        var count = rows.length;
        // 计算总页数
        pages = Math.ceil( count / limit );     // 向上取整
        // 取值不能超过总页数
        page = Math.min( page, pages );
        // 取值不能小于1
        page = Math.max( page, 1);
        var skip =  (page-1) * limit;           // offset 起点
        var select = 'SELECT * FROM trading where flag = 1 LIMIT ' + skip + ' , ' + limit ;
        console.log(select);
        connection.query( select, function (err, tradings) {
            console.log('================= 运输信息 <- 数据库 =================');
            if (err) throw err;
            return res.render('trans',{
                userInfo: req.userInfo,
                tradings: tradings,
                count: count,       // 记录数目
                page: page,         // 当前第几页
                pages: pages        // 总页数
            });
            console.log('===================================================');
        });
    });
});

router.route('/trans').post(function (req, res) {
    var tra_id = req.body.tra_id;
    var updateSQL = 'update trading set flag = 2 ,transTime = "'
        + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '" where id = ' + tra_id;
    console.log(updateSQL);
    connection.query(updateSQL, function (err, result) {
        console.log('================= 安排运输 -> 数据库 =================');
        if (err){
            console.log(err);
            throw err;
        }
        console.log("UPDATE Return ==> ");
        console.log(result);
        console.log('====================================================');

        responseData.code = 0;
        responseData.message = '已成功安排运输！';
        res.json(responseData);
        return;
    });
});

// ============================================================================================================================
// Personal
// ============================================================================================================================
router.route('/personal').get(function (req, res) {
    // 先检查是否登录
    if (!req.userInfo || !req.userInfo.username ) {
        return res.redirect('/login');
    }
    var mypro = [];      // 存储购买商品的详细信息

    var page = Number ( req.query.page || 1 );
    var limit = 4;          // 每页读取的数目
    var pages = 0;          // 总页数
    var count = 0;          // 总记录条数
    async.waterfall([
        function(callback){
            var selectSQL = 'select * FROM trading where buyer = "' + req.userInfo.username +'"';
            connection.query( selectSQL, function (err, rows) {
                if (err) throw err;
                callback(null, rows);
            });
        },
        function( rows, callback){
            count = rows.length;
            // 计算总页数
            pages = Math.ceil( count / limit );     // 向上取整
            // 取值不能超过总页数
            page = Math.min( page, pages );
            // 取值不能小于1
            page = Math.max( page, 1);
            var skip =  (page-1) * limit;           // offset 起点
            var select = 'SELECT * FROM trading where buyer = "' + req.userInfo.username + '" LIMIT ' + skip + ' , ' + limit ;
            connection.query(select, function (err, tradings) {
                if (err) throw err;
                callback(null, tradings);
            });
        },
        function(tradings, callback){
            for(var i=0, len=tradings.length; i<len; i++){
                var id = tradings[i].pro_id;
                var sel = 'select * from product where id = ' + id;
                connection.query( sel, function (err, pro) {
                    if(err) throw err;
                    var data = JSON.stringify({
                        name: pro[0].pro_name,
                        price: pro[0].pro_price,
                        desc: pro[0].pro_desc
                    });
                    console.log(data);
                    // mypro.push(data);
                    mypro[i] = data;
                });
            }
            callback(null, mypro, tradings);
        }
    ], function (err, mypro, tradings) {
        console.log(mypro);
        return res.render('personal',{
            userInfo: req.userInfo,
            tradings: tradings,
            products: mypro,
            href: "#"+tradings[0].id,
            count: count,       // 记录数目
            page: page,         // 当前第几页
            pages: pages        // 总页数
        });
    });
});


function route_me(req, res) {
	if (!req.userInfo || !req.userInfo.username) {
        return res.render('login');
    }
    return;
}

module.exports = router;
// ==================================
// Websocket Server Side Code 
// ==================================
//var async = require('async');
var path = require('path');

module.exports.process_msg = function(connection, ws, data, logger){
	// create new product
	if (data.type === 'create') {
        logger.info('[ws] create products req');

        var  accountAddSql = 'INSERT INTO product(pro_name,pro_num,pro_price,pro_desc) VALUES (?,?,?,?)';
        var  accountAddSql_Params = [data.pro_name, data.pro_num, data.pro_price, data.pro_desc];

        connection.query(accountAddSql,accountAddSql_Params,function (err, result) {
            console.log('================= 发布商品 -> 数据库 =================');
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
            }else{
                console.log('[INSERT SUCCESS] - INSERT ID:',result);
                var res = {msg: 'create_success'};
                ws.send(JSON.stringify(res));
            }
            console.log('=====================================================\n\n');
        });
    }
    else if(data.type === 'register'){
        logger.info('[ws] someone register req');

        // 用户名是否已经被注册
        var selectSQL = 'SELECT * FROM users WHERE `username` = \'' + data.username +'\'';
        connection.query( selectSQL, function (err, rows){
            if (err) throw err;
            if (rows.length > 0) {
                // 表示数据库中有该记录
                var res = {msg: 'register_fail'};
                ws.send(JSON.stringify(res));
            } else{
                var  accountAddSql = 'INSERT INTO users( username, password ) VALUES (?,?)';
                var  accountAddSql_Params = [data.username, data.password];
                connection.query(accountAddSql,accountAddSql_Params,function (err, result) {
                    console.log('================= 注册用户 -> 数据库 =================');
                    if(err){
                        console.log('[INSERT ERROR] - ',err.message);
                    }else{
                        console.log('[INSERT SUCCESS] - INSERT ID:',result);
                        var res = {msg: 'register_success'};
                        ws.send(JSON.stringify(res));
                    }
                    console.log('=====================================================\n\n');
                });
            }
        });
    }
};
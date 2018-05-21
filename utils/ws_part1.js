// ==================================
// Part 1 - incoming messages, look for type
// ==================================
var ibc = {};
var chaincode = {};
var async = require('async');
var async2 = require('async');
var mysql = require('mysql');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database', function(err){
    console.log('--------------------------CONNECT INFORMATION-------------------------------------');
    if(err){
        console.error("database connection failed:" + err.stack);
        return;
    }
    console.log("database connection success!!!");
    console.log('---------------------------------------------------------------------------------\n\n');
});

var jsSHA=require('jssha');
module.exports.setup = function(sdk, cc){
    ibc = sdk;
    chaincode = cc;
};

module.exports.process_msg = function(ws, data, io){

    if(data.type == 'produce'){
        var value = data.pro_name + data.pro_num + data.pro_price + data.pro_desc;
        var sha = new jsSHA("SHA-256","TEXT");
        sha.update(value);
        var sha_value = sha.getHash("HEX");
        chaincode.invoke.produce([ sha_value, data.pro_name, data.pro_num, data.pro_price, data.pro_desc], function(err, data){
            console.log('New Product Response:', data, err);
        });
        ibc.block_stats(function(e, stats){
            console.log('got some stats', stats);
        });
    }
    else if(data.type == 'create_account'){
        console.log('----------------------------------Create Account!--------------------------------------');
        var value=data.ac_id+data.ac_short_name+data.ac_status+data.term_date+data.inception_date+data.ac_region+data.ac_sub_region+data.cod_country_domicile+data.liq_method+data.contracting_entity+data.mgn_entity+data.ac_legal_name+data.manager_name+data.cod_ccy_base+data.long_name+data.mandate_id+data.client_id+data.custodian_name+data.sub_mandate_id+data.transfer_agent_name+data.trust_bank+data.re_trust_bank+data.last_updated_by+data.last_approved_by+data.last_update_date;
        console.log("------FROM PAGE----"+value);
        var sha=new jsSHA("SHA-256","TEXT");
        sha.update(value);
        var sha_value=sha.getHash("HEX");
        console.log("SHA-VALUE: " + sha_value);
        db.serialize(function () {
            //  Database#run(sql, [param, ...], [callback])
            db.run('INSERT INTO account(sha_value, ac_id,ac_short_name,status,term_date,inception_date,ac_region,' +
                'ac_sub_region,cod_country_domicile,liq_method,contracting_entity,mgn_entity,ac_legal_name,manager_name,' +
                'cod_ccy_base,longname,mandate_id,client_id,custodian_name,sub_mandate_id,transfer_agent_name,trust_bank,' +
                're_trust_bank,last_updated_by,last_approved_by,last_update_date) ' +
                'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [sha_value, data.ac_id, data.ac_short_name, data.ac_status, data.term_date,
                    data.inception_date, data.ac_region, data.ac_sub_region, data.cod_country_domicile, data.liq_method,
                    data.contracting_entity, data.mgn_entity, data.ac_legal_name, data.manager_name, data.cod_ccy_base,
                    data.long_name, data.mandate_id, data.client_id, data.custodian_name, data.sub_mandate_id,
                    data.transfer_agent_name, data.trust_bank, data.re_trust_bank, data.last_updated_by,
                    data.last_approved_by, data.last_update_date],
                function(err){
                    if(err){
                        console.log('--------------------------FAIL INSERT Account----------------------------');
                        console.log('[INSERT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                    }else{
                        console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        console.log('Last Inserted Row ID: ' + this.lastID);
                        console.log('Number of Rows Affected: ' + this.changes);
                        chaincode.invoke.create_account([data.ac_id, data.ac_short_name, data.ac_status, data.term_date,
                            data.inception_date, data.ac_region, data.ac_sub_region, data.cod_country_domicile, data.liq_method,
                            data.contracting_entity, data.mgn_entity, data.ac_legal_name, data.manager_name, data.cod_ccy_base,
                            data.long_name, data.mandate_id, data.client_id, data.custodian_name, data.sub_mandate_id,
                            data.transfer_agent_name, data.trust_bank, data.re_trust_bank, data.last_updated_by,
                            data.last_approved_by, data.last_update_date, sha_value], cb_invoked);
                        console.log('--------------------------------------------------------------------\n\n');
                    }
                });
        });
    }
    else if(data.type == 'ac_trade_setup'){
        console.log('----------------------------------Create ac_trade!--------------------------------------');

        var value=data.ac_id+data.lvts+data.calypso+data.aladdin+data.trade_start_date+data.equity+data.fixed_income;
        console.log("------FROM PAGE----"+value);
        var sha=new jsSHA("SHA-256","TEXT");
        sha.update(value);
        var sha_value=sha.getHash("HEX");
        console.log("SHA-VALUE: " + sha_value);

        db.serialize(function () {
            //  Database#run(sql, [param, ...], [callback])
            db.run('INSERT INTO ac_trade(sha_value,ac_id,lvts,calypso,aladdin,trade_start_date,equity,fixed_income) ' +
                'VALUES(?,?,?,?,?,?,?,?)',
                [ sha_value, data.ac_id, data.lvts, data.calypso,
                    data.aladdin, data.trade_start_date, data.equity, data.fixed_income],
                function(err){
                    if(err){
                        console.log('--------------------------FAIL INSERT Account----------------------------');
                        console.log('[INSERT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                    }else{
                        console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        console.log('Last Inserted Row ID: ' + this.lastID);
                        console.log('Number of Rows Affected: ' + this.changes);
                        chaincode.invoke.ac_trade_setup([ data.ac_id, data.lvts, data.calypso,
                            data.aladdin, data.trade_start_date, data.equity, data.fixed_income, sha_value], cb_invoked);
                        console.log('--------------------------------------------------------------------\n\n');
                    }
                });
        });
    }
    else if(data.type == 'ac_benchmark'){
        console.log('----------------------------------Create ac_benchmark!--------------------------------------');

        var value=data.ac_id+data.benchmark_id+data.source+data.name+data.currency+data.primary_flag+data.start_date+data.end_date+data.benchmark_reference_id+data.benchmark_reference_id_source;
        console.log("------FROM PAGE----"+value);
        var sha=new jsSHA("SHA-256","TEXT");
        sha.update(value);
        var sha_value=sha.getHash("HEX");
        console.log("SHA-VALUE: " + sha_value);

        db.serialize(function () {
            //  Database#run(sql, [param, ...], [callback])
            db.run('INSERT INTO ac_benchmark( sha_value,ac_id,benchmark_id,source,name,currency,primary_flag,' +
                'start_date,end_date,benchmark_reference_id,benchmark_reference_id_source) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                [sha_value, data.ac_id, data.benchmark_id, data.source, data.name,
                    data.currency, data.primary_flag, data.start_date, data.end_date, data.benchmark_reference_id,
                    data.benchmark_reference_id_source],
                function(err){
                    if(err){
                        console.log('--------------------------FAIL INSERT Account----------------------------');
                        console.log('[INSERT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                    }else{
                        console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        console.log('Last Inserted Row ID: ' + this.lastID);
                        console.log('Number of Rows Affected: ' + this.changes);
                        chaincode.invoke.ac_benchmark([data.ac_id, data.benchmark_id, data.source, data.name,
                            data.currency, data.primary_flag, data.start_date, data.end_date, data.benchmark_reference_id,
                            data.benchmark_reference_id_source, sha_value], cb_invoked);
                        console.log('--------------------------------------------------------------------\n\n');
                    }
                });
        });
    }
    else if(data.type == 'benchmarks'){
        console.log('----------------------------------Create benchmarks!--------------------------------------');

        var value=data.benchmark_id+data.id_source+data.name+data.currency+data.benchmark_reference_id+data.benchmark_reference_id_source;
        console.log("------FROM PAGE-------");

        var sha=new jsSHA("SHA-256","TEXT");
        sha.update(value);
        var sha_value=sha.getHash("HEX");
        console.log("SHA-VALUE: " + sha_value);

        db.serialize(function () {
            //  Database#run(sql, [param, ...], [callback])
            db.run('INSERT INTO benchmarks(sha_value,benchmark_id,id_source,name,currency,benchmark_reference_id,' +
                'benchmark_reference_id_source) VALUES(?,?,?,?,?,?,?)',
                [ sha_value, data.benchmark_id, data.id_source, data.name, data.currency,
                    data.benchmark_reference_id, data.benchmark_reference_id_source],
                function(err){
                    if(err){
                        console.log('--------------------------FAIL INSERT Account----------------------------');
                        console.log('[INSERT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                    }else{
                        console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        console.log('Last Inserted Row ID: ' + this.lastID);
                        console.log('Number of Rows Affected: ' + this.changes);
                        chaincode.invoke.benchmarks([data.benchmark_id, data.id_source, data.name, data.currency,
                            data.benchmark_reference_id, data.benchmark_reference_id_source, sha_value], cb_invoked);
                        console.log('--------------------------------------------------------------------\n\n');
                    }
                });
        });
    }
    else if (data.type == 'data_view') {
        console.log('view data');
        if (data.data_type == 'account'){
            var selectSQL = 'select * from `account`';
            var arr = [];
            connection.query(selectSQL, function(err, rows) {
                if (err) throw err;
                for (var i = 0; i < rows.length; i++) {
                    arr[i] = rows[i];
                    console.log(arr[i]);
                    sendMsg({msg: 'account', sha_value:arr[i].sha_value, ac_id:arr[i].ac_id, ac_short_name:arr[i].ac_short_name, status:arr[i].status, term_date:arr[i].term_date,
                        inception_date:arr[i].inception_date, ac_region: arr[i].ac_region, ac_sub_region:arr[i].ac_sub_region, cod_country_domicile:arr[i].cod_country_domicile, liq_method:arr[i].liq_method,
                        contracting_entity:arr[i].contracting_entity, mgn_entity:arr[i].mgn_entity, ac_legal_name:arr[i].ac_legal_name, manager_name:arr[i].manager_name, cod_ccy_base:arr[i].cod_ccy_base,
                        long_name:arr[i].long_name, mandate_id:arr[i].mandate_id, client_id:arr[i].client_id, custodian_name:arr[i].custodian_name, sub_mandate_id:arr[i].sub_mandate_id,
                        transfer_agent_name:arr[i].transfer_agent_name, trust_bank:arr[i].trust_bank, re_trust_bank:arr[i].re_trust_bank, last_updated_by:arr[i].last_updated_by,
                        last_approved_by:arr[i].last_approved_by, last_update_date:arr[i].last_update_date});
                }
            });
        }
        else if (data.data_type == 'ac_trade') {
            var selectSQL = 'select * from `ac_trade`';
            var arr = [];
            connection.query(selectSQL, function(err, rows) {
                if (err) throw err;
                for (var i = 0; i < rows.length; i++) {
                    arr[i] = rows[i];
                    console.log(arr[i]);
                    sendMsg({msg: 'ac_trade', sha_value:arr[i].sha_value, ac_id:arr[i].ac_id, lvts:arr[i].lvts, calypso:arr[i].calypso,
                        aladdin:arr[i].aladdin, trade_start_date:arr[i].trade_start_date, equity:arr[i].equity, fixed_income:arr[i].fixed_income});
                }
            });
        }
        else if (data.data_type == 'ac_benchmark') {
            var selectSQL = 'select * from `ac_benchmark`';
            var arr = [];
            connection.query(selectSQL, function(err, rows) {
                if (err) throw err;
                for (var i = 0; i < rows.length; i++) {
                    arr[i] = rows[i];
                    console.log(arr[i]);
                    sendMsg({msg: 'ac_benchmark', sha_value:arr[i].sha_value, ac_id:arr[i].ac_id, benchmark_id:arr[i].benchmark_id, source:arr[i].source, name:arr[i].name, currency:arr[i].currency,
                        primary_flag:arr[i].primary_flag, start_date:arr[i].start_date, end_date:arr[i].end_date, benchmark_reference_id:arr[i].benchmark_reference_id, benchmark_reference_id_source:arr[i].benchmark_reference_id_source});
                }
            });
        }
        else if (data.data_type == 'benchmarks') {
            var selectSQL = 'select * from `benchmarks`';
            var arr = [];
            connection.query(selectSQL, function(err, rows) {
                if (err) throw err;
                for (var i = 0; i < rows.length; i++) {
                    arr[i] = rows[i];
                    console.log(arr[i]);
                    sendMsg({msg: 'benchmarks', sha_value:arr[i].sha_value, benchmark_id:arr[i].benchmark_id, id_source:arr[i].id_source, name:arr[i].name, currency:arr[i].currency,
                        benchmark_reference_id:arr[i].benchmark_reference_id, benchmark_reference_id_source:arr[i].benchmark_reference_id_source});
                }
            });
        }
    }
    else if (data.type == 'untreated') {				// recheck first
        console.log('--------------get untreated account now--------------------------');
        if (data.table_name == 'account'){
            console.log('----------------------------recheck account first-------------------------------');
            ibc.chain_stats(get_accountHash);
            // get untreated record
            var selectSQL = 'select * from `account` where flag = 0';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                var selectSQL = 'select * from `account` where flag = 0';
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT Account----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({
                        msg: 'untreated_account',
                        sha_value: row.sha_value,
                        ac_id: row.ac_id,
                        ac_short_name: row.ac_short_name,
                        status: row.status,
                        term_date: row.term_date,
                        inception_date: row.inception_date,
                        ac_region: row.ac_region,
                        ac_sub_region: row.ac_sub_region,
                        cod_country_domicile: row.cod_country_domicile,
                        liq_method: row.liq_method,
                        contracting_entity: row.contracting_entity,
                        mgn_entity: row.mgn_entity,
                        ac_legal_name: row.ac_legal_name,
                        manager_name: row.manager_name,
                        cod_ccy_base: row.cod_ccy_base,
                        long_name: row.longname,
                        mandate_id: row.mandate_id,
                        client_id: row.client_id,
                        custodian_name: row.custodian_name,
                        sub_mandate_id: row.sub_mandate_id,
                        transfer_agent_name: row.transfer_agent_name,
                        trust_bank: row.trust_bank,
                        re_trust_bank: row.re_trust_bank,
                        last_updated_by: row.last_updated_by,
                        last_approved_by: row.last_approved_by,
                        last_update_date: row.last_update_date
                    });
                })
            });
        }
        else if (data.table_name == 'ac_trade') {
            console.log('----------------------------recheck account trade first-------------------------------');
            ibc.chain_stats(get_actraHash);

            var selectSQL = 'select * from `ac_trade` where flag = 0';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT Account_Trade----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'untreated_ac_trade', sha_value:row.sha_value, ac_id:row.ac_id, lvts:row.lvts, calypso:row.calypso,
                        aladdin:row.aladdin, trade_start_date:row.trade_start_date, equity:row.equity, fixed_income:row.fixed_income});
                })
            });
        }
        else if (data.table_name == 'ac_benchmark'){
            console.log('----------------------------recheck account benchmark first-------------------------------');
            ibc.chain_stats(get_acbenHash);

            var selectSQL = 'select * from `ac_benchmark` where flag = 0';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT Account_Benchmark----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'untreated_ac_benchmark', sha_value:row.sha_value, ac_id:row.ac_id, benchmark_id:row.benchmark_id, source:row.source, name:row.name, currency:row.currency,
                        primary_flag:row.primary_flag, start_date:row.start_date, end_date:row.end_date, benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                })
            });
        }
        else if (data.table_name == 'benchmarks'){
            console.log('----------------------------recheck benchmarks first-------------------------------');
            ibc.chain_stats(get_benchHash);

            var selectSQL = 'select * from `benchmarks` where flag = 0';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT Benchmarks----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'untreated_benchmarks', sha_value:row.sha_value, benchmark_id:row.benchmark_id, id_source:row.id_source, name:row.name, currency:row.currency,
                        benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                })
            });
        }

    }
    else if (data.type == 'new') {
        console.log('-----------------get new accepted account now---------------------');
        if(data.table_name == 'account') {
            var selectSQL = 'select * from `account` where flag = 1';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT New_Accepted_Account----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'newAccepted_account', sha_value:row.sha_value, ac_id:row.ac_id, ac_short_name:row.ac_short_name, status:row.status, term_date:row.term_date,
                        inception_date:row.inception_date, ac_region: row.ac_region, ac_sub_region:row.ac_sub_region, cod_country_domicile:row.cod_country_domicile, liq_method:row.liq_method,
                        contracting_entity:row.contracting_entity, mgn_entity:row.mgn_entity, ac_legal_name:row.ac_legal_name, manager_name:row.manager_name, cod_ccy_base:row.cod_ccy_base,
                        long_name:row.longname, mandate_id:row.mandate_id, client_id:row.client_id, custodian_name:row.custodian_name, sub_mandate_id:row.sub_mandate_id,
                        transfer_agent_name:row.transfer_agent_name, trust_bank:row.trust_bank, re_trust_bank:row.re_trust_bank, last_updated_by:row.last_updated_by,
                        last_approved_by:row.last_approved_by, last_update_date:row.last_update_date});
                })
            });
        }
        else if (data.table_name == 'ac_trade'){
            var selectSQL = 'select * from `ac_trade` where flag = 1';

            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT New_Accepted_Account_Trade----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'newAccepted_actrade', sha_value:row.sha_value, ac_id:row.ac_id, lvts:row.lvts, calypso:row.calypso,
                        aladdin:row.aladdin, trade_start_date:row.trade_start_date, equity:row.equity, fixed_income:row.fixed_income});
                })
            });
        }
        else if (data.table_name == 'ac_benchmark'){
            var selectSQL = 'select * from `ac_benchmark` where flag = 1';
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){
                        console.log('--------------------------FAIL SELECT New_Accepted_ACBEN----------------------------');
                        console.log('[SELECT ERROR] - ',err.stack);
                        console.log('--------------------------------------------------------------------\n\n');
                        throw err;
                    }
                    console.log(row);
                    sendMsg({msg: 'newAccepted_acben', sha_value:row.sha_value, ac_id:row.ac_id, benchmark_id:row.benchmark_id, source:row.source, name:row.name, currency:row.currency,
                        primary_flag:row.primary_flag, start_date:row.start_date, end_date:row.end_date, benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                })
            });
        }
    }
    else if (data.type == 'know_new_record') {
        console.log('-----------------know new record----------------------');
        console.log(data.id);
        if (data.table_name == 'account') {
            var updateSQL = 'update account set flag = 2 where ac_id = ' + '"' + data.id + '"';
            db.serialize(function(){
                db.run(updateSQL, function(err){
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    console.log("UPDATE Return ==> ");
                    console.log('Number of Rows Affected: ' + this.changes);
                })
            });
        }
        else if (data.table_name == 'ac_trade'){
            var updateSQL = 'update ac_trade set flag = 2 where ac_id = ' + '"' +data.id + '"';
            db.serialize(function(){
                db.run(updateSQL, function(err){
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    console.log("UPDATE Return ==> ");
                    console.log('Number of Rows Affected: ' + this.changes);
                })
            });
        }
        else if (data.table_name == 'ac_benchmark'){
            var updateSQL = 'update ac_benchmark set flag = 2 where ac_id = ' + '"' +data.id + '"';
            db.serialize(function(){
                db.run(updateSQL, function(err){
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    console.log("UPDATE Return ==> ");
                    console.log('Number of Rows Affected: ' + this.changes);
                })
            });
        }
    }
    else if(data.type == 'ac_accept') {
        console.log('------------------------------accept the account now---------------------------------');
        console.log(data.ac_id);		// success
        var updateSQL = 'update account set flag = 1 where ac_id = ' + '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Account", "accept"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });

    }
    else if (data.type == 'actra_accept') {
        console.log('------------------------------accept the account trade now---------------------------------');
        console.log(data.ac_id);
        var updateSQL = 'update ac_trade set flag = 1 where ac_id = ' +  '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Ac_trades_setup", "accept"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if(data.type == 'acben_accept') {
        console.log('------------------------------accept the account benchmark now---------------------------------');
        console.log(data.ac_id);
        var updateSQL = 'update ac_benchmark set flag = 1 where ac_id = ' + '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Ac_benchmark", "accept"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if(data.type == 'bench_accept') {
        console.log('------------------------------accept the benchmarks now---------------------------------');
        console.log(data.id);
        var updateSQL = 'update benchmarks set flag = 1 where benchmark_id = ' + '"' + data.id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Benchmarks", "accept"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if(data.type == 'ac_decline') {
        console.log('---------------------------decline the account now--------------------------------');
        console.log(data.ac_id);
        var updateSQL = 'update account set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Account", "decline"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if(data.type == 'actra_decline') {
        console.log('---------------------------decline the account trade now--------------------------------');
        console.log(data.ac_id);
        var updateSQL = 'update ac_trade set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Ac_trades_setup", "decline"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if (data.type == 'acben_decline') {
        console.log('---------------------------decline the account benchmark now--------------------------------');
        console.log(data.ac_id);
        var updateSQL = 'update ac_benchmark set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Ac_benchmark", "decline"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if (data.type == 'bench_decline') {
        console.log('---------------------------decline the benchmarks now--------------------------------');
        console.log(data.id);
        var updateSQL = 'update benchmarks set flag = -1 where benchmark_id = ' + '"' +data.id + '"';
        db.serialize(function(){
            db.run(updateSQL, function(err){
                if(err){
                    console.log(err);
                    throw err;
                }
                chaincode.invoke.check_decide(["Benchmarks", "decline"]);
                console.log("UPDATE Return ==> ");
                console.log('Number of Rows Affected: ' + this.changes);
            })
        });
    }
    else if(data.type == 'get'){
        console.log('get user msg');
        chaincode.query.read(['_allStr'], cb_got_index);
    }
    else if(data.type == 'remove'){
        console.log('removing msg');
        if(data.name){
            chaincode.invoke.delete([data.name]);
        }
    }
    else if(data.type == 'recheck'){
        console.log("------[recheck now]-------");
        var chain_hash = data.chain_hash;
        var table = data.table_name;
        console.log(data.chain_hash.length);
        console.log("--------[someone recheck the "+table+" now------]");

        async.eachLimit(chain_hash, 1, function (hash, cb) {
            var selectSQL = 'SELECT * FROM '+ table +' WHERE `sha_value` = \'' + hash+'\'';
            console.log(selectSQL);

            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                db.each(selectSQL, function(err,row){
                    if(err){throw err;}
                    console.log(row);
                    var value = "";
                    if( table == 'account' ) {
                        value = row.ac_id + row.ac_short_name + row.status + row.term_date + row.inception_date + row.ac_region
                            + row.ac_sub_region + row.cod_country_domicile + row.liq_method + row.contracting_entity + row.mgn_entity
                            + row.ac_legal_name + row.manager_name + row.cod_ccy_base + row.longname + row.mandate_id + row.client_id
                            + row.custodian_name + row.sub_mandate_id + row.transfer_agent_name + row.trust_bank + row.re_trust_bank
                            + row.last_updated_by + row.last_approved_by + row.last_update_date;
                        console.log("-----[从数据库取出来的]-----"+value);
                    }
                    else if (table == 'ac_trade') {
                        value = row.ac_id + row.lvts + row.calypso + row.aladdin + row.trade_start_date + row.equity + row.fixed_income;
                        console.log("-----[从数据库取出来的]-----"+value);
                    }
                    else if(table == 'ac_benchmark') {
                        value = row.ac_id + row.benchmark_id + row.source + row.name + row.currency + row.primary_flag + row.start_date
                            + row.end_date + row.benchmark_reference_id + row.benchmark_reference_id_source;
                        console.log("-----[从数据库取出来的]-----"+value);
                    }
                    else if(table == 'benchmarks') {
                        value = row.benchmark_id + row.id_source + row.name + row.currency + row.benchmark_reference_id +
                            row.benchmark_reference_id_source;
                    }
                    else{
                        console.log("----[Table `" + table + "` does not exist!]-----");
                    }
                    var sha = new jsSHA("SHA-256", "TEXT");
                    sha.update(value);
                    var sha_value = sha.getHash("HEX");		// new hash
                    console.log("SHA-VALUE: "+sha_value);

                    if (sha_value !== hash) {			// data change
                        console.log("[HASH IN INDEXING] "+hash);
                        console.log("[HASH IN ACCOUNT] "+ sha_value);
                        sendMsg({msg: 'validity', table_name: table, sha_value: hash});
                        console.log("SHA-VALUE: " + sha_value);
                    }
                    else {
                        console.log("MATCH! NO PROBLEM!");
                    }
                }, function(err, number){
                    if(number==0){// can not find the hash value from the table
                        console.log('---fail---CAN NOT FOUND HASH in table '+table);
                        sendMsg({
                            msg: 'validity',
                            table_name: 'unknown',
                            show_location: table,
                            sha_value: hash
                        });
                    }
                })
            });
            cb(null);
        }, function (err) {
            if (err) {
                console.error("error");
            }
        });
    }
    else if(data.type == 're_validity'){
        console.log('----------------[here!!re_validity]---------------------')
        data['msg'] = 're_validity';
        console.log(data);
        sendMsg(JSON.stringify(data));
    }
    else if(data.type == 'chainstats'){
        console.log('chainstats msg');
        ibc.chain_stats(cb_chainstats);
        console.log(ibc);
    } else if(data.type == 'check_decide'){

        chaincode.invoke.check_decide([data.checktype, data.checkcont]);
    }


    //got the marble index, lets get each marble
    function cb_got_index(e, index){
        if(e != null) console.log('[ws error] did not get user index:', e);
        else{
            try{
                var json = JSON.parse(index);
                var keys = Object.keys(json);
                var concurrency = 1;

                //serialized version
                async.eachLimit(keys, concurrency, function(key, cb) {
                    console.log('!', json[key]);
                    chaincode.query.read([json[key]], function(e, marble) {
                        if(e != null) console.log('[ws error] did not get marble:', e);
                        else {
                            // console.log("------------------------------------------------------------------");
                            // console.log(marble);
                            if(marble) sendMsg({msg: 'marbles', e: e, marble: JSON.parse(marble)});
                            cb(null);
                        }
                    });
                }, function() {
                    sendMsg({msg: 'action', e: e, status: 'finished'});
                });
            }
            catch(e){
                console.log('[ws error] could not parse response', e);
            }
        }
    }

    function cb_invoked(e, a){
        console.log('response: ', e, a);
    }

    //call back for getting the blockchain stats, lets get the block stats now
    function cb_chainstats(e, chain_stats){
        if(chain_stats && chain_stats.height){
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            var list = [];
            for(var i = chain_stats.height; i >= 1; i--){								//create a list of heights we need
                list.push(i);
                if(list.length >= 16) break;
            }
            list.reverse();																//flip it so order is correct in UI
            async.eachLimit(list, 1, function(block_height, cb) {						//iter through each one, and send it
                ibc.block_stats(block_height, function(e, stats){
                    if(e == null){
                        stats.height = block_height;
                        sendMsg({msg: 'chainstats', e: e, chainstats: chain_stats, blockstats: stats});
                    }
                    cb(null);
                });
            }, function() {
            });
        }
    }

    function formatCCID(i, uuid, ccid){								//flip uuid and ccid if deploy, weird i know
        if(i == 1) return uuid;
        return ccid;
    }

    function atb(r) {
        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o = String(r).replace(/=+$/, "");
        if (o.length % 4 == 1)throw new t("'atob' failed: The string to be decoded is not correctly encoded.");
        for (var n, a, i = 0, c = 0, d = ""; a = o.charAt(c++); ~a && (n = i % 4 ? 64 * n + a : a, i++ % 4) ? d += String.fromCharCode(255 & n >> (-2 * i & 6)) : 0)a = e.indexOf(a);
        return String(d);
    }

    function formatPayload(str, ccid, flag){								//create a sllliiiggghhhtttlllllyyy better payload name from decoded payload
        var func = ['init', 'delete', 'write', 'create_account','ac_trade_setup', 'ac_benchmark', 'benchmarks', 'check_decide'];
        str =  str.substring(str.indexOf(ccid) + ccid.length + 4);
        if(str.indexOf(func[flag]) >= 0){
            return str.substr(func[flag].length);
        }
        var none='0';
        return none;
    }

    function execute(someFunction, value1) {
        someFunction(value1);
    }

    function get_accountHash(e, chain_stats) {
        console.log('----------FUNCTION get_accountHash-------');
        var data = [];
        if (chain_stats && chain_stats.height) {
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            console.log("----CHAIN HEIGHT-----" + chain_stats.height);
            var list = [];
            for (var i = chain_stats.height; i >= 1; i--) {								//create a list of heights we need
                list.push(i);
                if (list.length >= 40) break;
            }
            list.reverse();//flip it so order is correct in UI
            var count = 0;
            async.eachLimit(list, 1, function (block_height, cb) {						//iter through each one, and send it
                count++;
                ibc.block_stats(block_height, function (e, stats) {
                    if (e == null) {
                        stats.height = block_height;
                        if (stats.transactions) {
                            var flag=3;             // only get create_account block from chain
                            console.log(stats.height);
                            var ccid = formatCCID(stats.transactions[0].type, stats.transactions[0].uuid, atb(stats.transactions[0].chaincodeID));
                            var payload = atb(stats.transactions[0].payload);
                            if (ccid) {
                                var chaindata = formatPayload(payload, ccid, flag);
                                if (chaindata!='0'){
                                    var mydata = chaindata.split(" ");
                                    data.push(chaindata.slice(-64));
                                    console.log("NO." + data.length + "   " + chaindata.slice(-64));
                                }

                            }
                        }
                    }
                    cb(null);
                });
            }, function (err) {
                if (err) {
                    console.error("error");
                }
                sendMsg({msg: 'hash', chain_hash: data, table_name: "account"});
                console.log('---RETURN HASH ARR---length:' + data.length);
                console.log("[COUNT]  "+count);
                console.log("[LIST.length]  "+list.length);
                // return data;
            });
        }
    }
    function get_actraHash (e, chain_stats) {
        console.log('----------FUNCTION get_chainstats-------');
        var data = [];
        if (chain_stats && chain_stats.height) {
            console.log("------IF NOW-----");
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            console.log("----CHAIN HEIGHT-----" + chain_stats.height);
            var list = [];
            for (var i = chain_stats.height; i >= 1; i--) {								//create a list of heights we need
                list.push(i);
                if (list.length >= 40) break;
            }
            list.reverse();//flip it so order is correct in UI
            var count = 0;
            async.eachLimit(list, 1, function (block_height, cb) {						//iter through each one, and send it
                count++;
                ibc.block_stats(block_height, function (e, stats) {
                    if (e == null) {
                        stats.height = block_height;
                        if (stats.transactions) {
                            var flag=4;
                            console.log(stats.height);
                            var ccid = formatCCID(stats.transactions[0].type, stats.transactions[0].uuid, atb(stats.transactions[0].chaincodeID));
                            var payload = atb(stats.transactions[0].payload);
                            if (ccid) {
                                var chaindata = formatPayload(payload, ccid,flag);
                                if (chaindata!='0'){
                                    var mydata = chaindata.split(" ");
                                    data.push(chaindata.slice(-64));
                                    console.log("NO." + data.length + "   " + chaindata.slice(-64));
                                }

                            }
                        }
                    }
                    cb(null);
                });
            }, function (err) {
                if (err) {
                    console.error("error");
                }
                sendMsg({msg: 'hash', chain_hash: data, table_name: "ac_trade"});
                console.log('---RETURN HASH ARR---length:' + data.length);
                console.log("[COUNT]  "+count);
                console.log("[LIST.length]  "+list.length);
                // return data;
            });
        }
    }

    function get_acbenHash (e, chain_stats) {
        console.log('----------FUNCTION get_chainstats-------');
        var data = [];
        if (chain_stats && chain_stats.height) {
            console.log("------IF NOW-----");
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            console.log("----CHAIN HEIGHT-----" + chain_stats.height);
            var list = [];
            for (var i = chain_stats.height; i >= 1; i--) {								//create a list of heights we need
                list.push(i);
                if (list.length >= 40) break;
            }
            list.reverse();//flip it so order is correct in UI
            var count = 0;
            async.eachLimit(list, 1, function (block_height, cb) {						//iter through each one, and send it
                count++;
                ibc.block_stats(block_height, function (e, stats) {
                    if (e == null) {
                        stats.height = block_height;
                        if (stats.transactions) {
                            var flag=5;
                            console.log(stats.height);
                            var ccid = formatCCID(stats.transactions[0].type, stats.transactions[0].uuid, atb(stats.transactions[0].chaincodeID));
                            var payload = atb(stats.transactions[0].payload);
                            if (ccid) {
                                var chaindata = formatPayload(payload, ccid,flag);
                                if (chaindata!='0'){
                                    var mydata = chaindata.split(" ");
                                    data.push(chaindata.slice(-64));
                                    console.log("NO." + data.length + "   " + chaindata.slice(-64));
                                }

                            }
                        }
                        // if(count == list.length){
                        //     sendMsg({msg: 'hash', chain_hash:data});
                        //     console.log('---RETURN HASH ARR---length:' + data.length);
                        // }
                    }
                    cb(null);
                });
            }, function (err) {
                if (err) {
                    console.error("error");
                }
                sendMsg({msg: 'hash', chain_hash: data, table_name: "ac_benchmark"});
                console.log('---RETURN HASH ARR---length:' + data.length);
                console.log("[COUNT]  "+count);
                console.log("[LIST.length]  "+list.length);
                // return data;
            });
        }
    }

    function get_benchHash (e, chain_stats) {
        console.log('----------FUNCTION get_chainstats-------');
        var data = [];
        if (chain_stats && chain_stats.height) {
            console.log("------IF NOW-----");
            chain_stats.height = chain_stats.height - 1;								//its 1 higher than actual height
            console.log("----CHAIN HEIGHT-----" + chain_stats.height);
            var list = [];
            for (var i = chain_stats.height; i >= 1; i--) {								//create a list of heights we need
                list.push(i);
                if (list.length >= 40) break;
            }
            list.reverse();//flip it so order is correct in UI
            var count = 0;
            async.eachLimit(list, 1, function (block_height, cb) {						//iter through each one, and send it
                count++;
                ibc.block_stats(block_height, function (e, stats) {
                    if (e == null) {
                        stats.height = block_height;
                        if (stats.transactions) {
                            var flag=6;
                            console.log(stats.height);
                            var ccid = formatCCID(stats.transactions[0].type, stats.transactions[0].uuid, atb(stats.transactions[0].chaincodeID));
                            var payload = atb(stats.transactions[0].payload);
                            if (ccid) {
                                var chaindata = formatPayload(payload, ccid,flag);
                                if (chaindata!='0'){
                                    var mydata = chaindata.split(" ");
                                    data.push(chaindata.slice(-64));
                                    console.log("NO." + data.length + "   " + chaindata.slice(-64));
                                }

                            }
                        }
                    }
                    cb(null);
                });
            }, function (err) {
                if (err) {
                    console.error("error");
                }
                sendMsg({msg: 'hash', chain_hash: data, table_name: "benchmarks"});
                console.log('---RETURN HASH ARR---length:' + data.length);
                console.log("[COUNT]  "+count);
                console.log("[LIST.length]  "+list.length);
                // return data;
            });
        }
    }

    //send a message, socket might be closed...
    function sendMsg(json){
        if(ws){
            try{
                ws.send(JSON.stringify(json));
            }
            catch(e){
                console.log('[ws error] could not send msg', e);
            }
        }
    }
};

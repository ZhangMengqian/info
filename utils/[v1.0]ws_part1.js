// ==================================
// Part 1 - incoming messages, look for type
// ==================================
var ibc = {};
var chaincode = {};
var async = require('async');

module.exports.setup = function(sdk, cc){
	ibc = sdk;
	chaincode = cc;
};

module.exports.process_msg = function(ws, data){
																					
		if(data.type == 'create_account'){
			console.log('its a create!');
			chaincode.invoke.create_account([data.ac_id, data.ac_short_name, data.status, data.term_date,
	data.inception_date, data.ac_region, data.ac_sub_region, data.cod_country_domicile, data.liq_method,
	data.contracting_entity, data.mgn_entity, data.ac_legal_name, data.manager_name, data.cod_ccy_base,
	data.long_name, data.mandate_id, data.client_id, data.custodian_name, data.sub_mandate_id, 
	data.transfer_agent_name, data.trust_bank, data.re_trust_bank, data.last_updated_by, 
	data.last_approved_by, data.last_update_date], cb_invoked);	
		}
		else if(data.type == 'ac_trade_setup'){
			console.log('its a create!');
			chaincode.invoke.ac_trade_setup([ data.ac_id, data.lvts, data.calypso,
	data.aladdin, data.trade_start_date, data.equity, data.fixed_income], cb_invoked);	
		}
		else if(data.type == 'ac_benchmark'){
			console.log('its a create!');
			chaincode.invoke.ac_benchmark([data.ac_id, data.benchmark_id, data.source, data.name,
	data.currency, data.primary_flag, data.start_date, data.end_date, data.benchmark_reference_id,
	data.benchmark_reference_id_source], cb_invoked);	
		}
		else if(data.type == 'benchmarks'){
			console.log('its a create!');
			chaincode.invoke.benchmarks([data.benchmark_id, data.id_source, data.name, data.currency,
	data.benchmark_reference_id, data.benchmark_reference_id_source], cb_invoked);	
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
		else if(data.type == 'chainstats'){
			console.log('chainstats msg');
			ibc.chain_stats(cb_chainstats);
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
				if(list.length >= 8) break;
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

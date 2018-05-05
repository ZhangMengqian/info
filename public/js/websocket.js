/* global new_block, $, document, WebSocket, escapeHtml, ws:true, start_up:true, known_companies:true, autoCloseNoticePanel:true */
/* global show_start_up_step, build_notification, build_user_panels, build_company_panel, populate_users_marbles, show_tx_step*/
/* global getRandomInt, block_ui_delay:true, build_a_tx, auditingMarble*/
/* exported transfer_marble, record_company, connect_to_server, refreshHomePanel, pendingTxDrawing*/

var getEverythingWatchdog = null;
var wsTxt = '[ws]';
var pendingTransaction = null;
var pendingTxDrawing = [];

// =================================================================================
// Socket Stuff
// =================================================================================
function connect_to_server() {
	var connected = false;
	connect();

	function connect() {
		var wsUri = null;
		if (document.location.protocol === 'https:') {
			wsTxt = '[wss]';
			wsUri = 'wss://' + document.location.hostname + ':' + document.location.port;
		} else {
			wsUri = 'ws://' + document.location.hostname + ':' + document.location.port;
		}
		console.log(wsTxt + ' Connecting to websocket', wsUri);

		ws = new WebSocket(wsUri);
		ws.onopen = function (evt) { onOpen(evt); };
		ws.onclose = function (evt) { onClose(evt); };
		ws.onmessage = function (evt) { onMessage(evt); };
		ws.onerror = function (evt) { onError(evt); };
	}

	function onOpen(evt) {
		console.log(wsTxt + ' CONNECTED');
		connected = true;
	}

	function onClose(evt) {
		console.log(wsTxt + ' DISCONNECTED', evt);
		connected = false;
	}

	// 接收来自服务器的数据
	function onMessage(msg) {
		try {
			var msgObj = JSON.parse(msg.data);

			if (msgObj.msg === 'create_success') {

			}
			else if( msgObj.msg === 'register_fail' ){
                alert("我是一个消息框！");
			}

			/*

			//marbles
			if (msgObj.msg === 'everything') {
				console.log(wsTxt + ' rec', msgObj.msg, msgObj);
				clearTimeout(getEverythingWatchdog);
				clearTimeout(pendingTransaction);
				$('#appStartingText').hide();
				clear_trash();
				build_user_panels(msgObj.everything.owners);
				for (var i in msgObj.everything.marbles) {
					populate_users_marbles(msgObj.everything.marbles[i]);
				}

				start_up = false;
				$('.marblesWrap').each(function () {
					if ($(this).find('.innerMarbleWrap').find('.ball').length === 0) {
						$(this).find('.noMarblesMsg').show();
					}
				});
			}

			//marbles
			else if (msgObj.msg === 'users_marbles') {
				console.log(wsTxt + ' rec', msgObj.msg, msgObj);
				populate_users_marbles(msgObj);
			}

			// block
			else if (msgObj.msg === 'block') {
				console.log(wsTxt + ' rec', msgObj.msg, ': ledger blockheight', msgObj.block_height);
				if (msgObj.block_delay) block_ui_delay = msgObj.block_delay * 2;				// should be longer than block delay
				new_block(msgObj.block_height);													// send to blockchain.js
				
				if ($('#auditContentWrap').is(':visible')) {
					var obj = {
						type: 'audit',
						marble_id: auditingMarble.id
					};
					ws.send(JSON.stringify(obj));
				}
			}

			//transaction error
			else if (msgObj.msg === 'tx_error') {
				console.log(wsTxt + ' rec', msgObj.msg, msgObj);
				if (msgObj.e) {
					var err_msg = (msgObj.e.parsed) ? msgObj.e.parsed : msgObj.e;
					addshow_notification(build_notification(true, escapeHtml(err_msg)), true);
					$('#txStoryErrorTxt').html(err_msg);
					$('#txStoryErrorWrap').show();
				}
			}

			//tx history
			else if (msgObj.msg === 'history') {
				console.log(wsTxt + ' rec', msgObj.msg, msgObj);
				var built = 0;
				var x = 0;
				var count = $('.txDetails').length;

				for(x in pendingTxDrawing) clearTimeout(pendingTxDrawing[x]);

				if (count <= 0) {									//if no tx shown yet, append to back
					$('.txHistoryWrap').html('');					//clear
					for (x=msgObj.data.parsed.length-1; x >= 0; x--) {
						built++;
						slowBuildtx(msgObj.data.parsed[x], x, built);
					}

				} else {											//if we already showing tx, prepend to front
					console.log('skipping tx', count);
					for (x=msgObj.data.parsed.length-1; x >= count; x--) {
						var html = build_a_tx(msgObj.data.parsed[x], x);
						$('.txHistoryWrap').prepend(html);
						$('.txDetails:first').animate({ opacity: 1, left: 0 }, 600, function () {
							//after animate
						});
					}
				}
			}

			//unknown
			else console.log(wsTxt + ' rec', msgObj.msg, msgObj);
			*/
		}
		catch (e) {
			console.log(wsTxt + ' error handling a ws message', e);
		}
	}

	function onError(evt) {
		console.log(wsTxt + ' ERROR ', evt);
	}
}

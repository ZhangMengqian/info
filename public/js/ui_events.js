/* global $, window, document */
/* global toTitleCase, connect_to_server, refreshHomePanel, closeNoticePanel, openNoticePanel, show_tx_step, marbles*/
/* global pendingTxDrawing:true */
/* exported record_company, autoCloseNoticePanel, start_up, block_ui_delay*/
var ws = {};
var bgcolors = ['whitebg', 'blackbg', 'redbg', 'greenbg', 'bluebg', 'purplebg', 'pinkbg', 'orangebg', 'yellowbg'];
var autoCloseNoticePanel = null;
var known_companies = {};
var start_up = true;
var lsKey = 'marbles';
var fromLS = {};
var block_ui_delay = 15000; 								//default, gets set in ws block msg
var auditingMarble = null;

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function () {

	// =================================================================================
	// jQuery UI Events
	// =================================================================================

    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $produceBox = $('#left');
    var $notifyBox = $('#rightBottom');
    var $checkBox = $('#checkBox');
    var $showBox = $('#showBox');
    var $transBox = $('#transBox');
    // var $userInfo = $('userInfo');


    // 切换到注册面板
    $loginBox.find('a.colMint').on('click', function () {
        $registerBox.show();
        $loginBox.hide();
    });

    // 切换到登录面板
    $registerBox.find('a.colMint').on('click', function () {
        $loginBox.show();
        $registerBox.hide();
    });

    // 注册
    $registerBox.find('button').on('click',function () {
        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/register',
            data:{
                username:$registerBox.find('[name="username"]').val(),
                type:$registerBox.find('[name="type"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val()
            },
            dataType:'json',
            success: function (result) {
                console.log(result);
                $registerBox.find('.colWarning').html(result.message);
                if(!result.code) {
                    //注册成功
                    setTimeout(function () {
                        $loginBox.show();
                        $registerBox.hide();
                    }, 1000);
                }
            }
        });
    });

    // 登录
    $('#loginBtn').on('click', (function(){
        // 通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                $loginBox.find('.colWarning').html(result.message);
                if(!result.code){
                    // 登录成功
                    alert("登录成功");
                    switch(result.userInfo.type)
                    {
                        case 0:
                        case 1:
                            // window.location.href = "/produce";
                            setTimeout("javascript:location.href='/produce'", 1000);
                            break;
                        case 2:
                            setTimeout("javascript:location.href='/check'", 1000);
                            break;
                        case 3:
                            setTimeout("javascript:location.href='/trans'", 1000);
                            break;
                        case 4:
                        default:
                            setTimeout("javascript:location.href='/sale'", 1000);
                    }
                    // setTimeout("javascript:location.href='/produce'", 1000);
                }
            }
        });
        return false;
    }));

    //退出
    $('#logout').on('click', function () {
        $.ajax({
            url: '/logout',
            success: function (result) {
                if(!result.code) {
                    window.location.href = '/login';
                }
            }
        });
    });

	//发布 -> 发布商品
    $('#newProBt').on('click', function () {
        console.log("someone click newProBt");
        // 获取上传的File对象，此处是一张图片对象
        var file = document.getElementById("pro_img").files[0];
        var formData = new FormData();
        formData.append('pro_name',$('input[name="pro_name"]').val());
        formData.append('pro_num',$('input[name="pro_num"]').val());
        formData.append('pro_price',$('input[name="pro_price"]').val());
        formData.append('pro_desc',$('textarea[name="pro_desc"]').val());
        formData.append('pro_img', file);

        // formData.append("avatar", file);            //设置key为avartar,value为上述的File对象
        // 通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/produce',
            data: formData,
            contentType: false,
            processData: false,
            // dataType: 'json',
            success: function (result) {
                $notifyBox.find('.notification').html(result.message);
            }
        });
        reset();
        return false;
    });

    // 发布 -> 重置信息
    $('#resetInfoBt').on('click', function () {
        reset();
    });

    // 审核 -> 获取模态框内展示的内容
    $('#myModal').on('show.bs.modal', function (event) {
        // var button = $(event.relatedTarget);         // Button that triggered the modal
        // var clickid = button.attr('id');
        // alert(clickid);
        $.ajax({
            type: 'post',
            url: '/details',
            data: {
                pro_id: $(event.relatedTarget).attr('id')
            },
            dataType: 'json',
            success: function (result) {
                // $loginBox.find('.colWarning').html(result.message);
                if(!result.code){
                    // 拿到商品信息了
                    // var modal = $(this);
                    var pro = result.userInfo.product;
                    // alert(pro.pro_name);
                    // modal.find('#name').val(pro.pro_name);
                    $('input[name="id"]').val(pro.id);
                    $('input[name="name"]').val(pro.pro_name);
                    $('input[name="num"]').val(pro.pro_num);
                    $('input[name="price"]').val(pro.pro_price);
                    $('textarea[name="desc"]').val(pro.pro_desc);
                    // $('img[name="img"]').src("/public/"+pro.pro_img);
                    $("#newImg").attr("src","/public/img/"+pro.pro_img);
                }
            }
        });
        // return false;

        // var recipient = button.data('whatever') // Extract info from data-* attributes
        // // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        // var modal = $(this);
        // modal.find('#pro_name').val({{products[clickid].pro_name}});
    });

    // 审核 -> 同意商品发布
    $('#accept').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/accept',
            data: {
                pro_id: $('input[name="id"]').val()
            },
            dataType: 'json',
            success: function (result) {
                // $notifyBox.find('.notification').html(result.message);
                // setTimeout("javascript:window.location.reload()", 1000);
                window.location.reload();
            }
        });
        return false;
    });

    // 审核 -> 拒绝商品发布
    $('#decline').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/decline',
            data: {
                pro_id: $('input[name="id"]').val()
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                window.location.reload();
            }
        });
        return false;
    });

    //销售 -> 立即购买
    $showBox.find('button').on('click', function (event) {
        var id = $(event.target).attr('name');
        $.ajax({
            type: 'post',
            url: '/buy',
            data: {
                // pro_id: $('input[name="show_id"]').val(),
                pro_id: $(event.target).attr('name'),
                city: document.getElementById(id).value
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                alert(result.message);
                window.location.reload();
            }
        });
        return false;
    });

    // 运输 -> 马上运送
    $transBox.find('button').on('click', function (event) {
        $.ajax({
            type: 'post',
            url: '/trans',
            data: {
                tra_id: $(event.target).attr('id')
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                alert(result.message);
                window.location.reload();
            }
        });
        return false;
    });

    // 重置函数
    function reset(){
        $('input[name="pro_name"]').val('');
        $('input[name="pro_num"]').val('');
        $('input[name="pro_price"]').val('');
        $('textarea[name="pro_desc"]').val('');
        $('input[name="pro_img"]').val('');
    }
});
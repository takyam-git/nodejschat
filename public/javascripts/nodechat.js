var inputbox;
var sendarea;
var chatarea;
var editdoc;
var editbody;
var cleditor;
$(document).ready(function(){
	chatarea = $('div#chatarea');
	$.superbox.settings = {
		closeTxt  : '閉じる',
		loadTxt   : '読込中',
		boxWidth  : '400',
		boxHeight : '150'
	};
	$.superbox();
	inputbox = $('div#inputbox textarea');
	cleditor = inputbox.cleditor({
		width: 718,
		height: 100,
		controls: 'bold italic underline strikethrough size | color highlight removeformat | alignleft center alignright justify | undo redo',
		colors:
			"334 FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF " +
			"FFF F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F " +
			"BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C " +
			"999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C " +
			"666 900 C60 C93 990 090 399 33F 60C 939 " +
			"333 600 930 963 660 060 366 009 339 636 " +
			"000 300 630 633 330 030 033 006 309 303",
		bodyStyle: 'color: #ffffff;margin:4px; font-family: ＭＳ Ｐゴシック,sans-serif; background-color:#333344; cursor:text'
	});

	sendarea = $('p#send');
	sendarea.hover(function(){
		$(this).css({
			'color' : '#dddddd',
			'cursor' : 'pointer'
		})
	}, function(){
		$(this).css({
			'color' : '#cccccc',
			'cursor' : 'default'
		})
	});

	editdoc = $('iframe:first').contents();
	editbody = editdoc.find('body');

	SessionWebSocket(function(socket) {
		socket.on('message', function(msg) {
			messageGetted(msg);
		});

		sendarea.click(function(){
			sendMessage();
		});

		var isCtrl;
		editdoc.keyup(function(e){
			if(e.which == 17){
				isCtrl=false;
			}
		}).keydown(function(e){
			if(e.which == 17){
				isCtrl=true;
			}
			if(e.which == 13 && isCtrl == true){ //run code for CTRL+S -- ie, save!
				sendMessage();
			}
		});

		var sendMessage = function(){
			var str = editbody.html();
			if(str!='' && str!='<br>'){
				socket.send(str);
				cleditor[0].clear();
				return false;
			}
		}
	});
});

function messageGetted(msg){
	if(msg.users != null){
		var usersbox = $('div#chatterlist');
		usersbox.html('');
		for(var u in msg.users){
			var adduser = $('<div class="userbox"><div class="userimg"><img height="24" width="24" src="/images/bakeneko.png"></div><div class="userstatus"><div class="username"></div><div class="userdate"></div></div></div>');
			adduser.find('div.userimg img').attr('src', msg.users[u].image);
			adduser.find('div.username').append(msg.users[u].name);
			adduser.find('div.userdate').append(msg.users[u].date);
			usersbox.append(adduser);
		}
	}
	var add = $('<div class="chatbox"><div class="chattop"><div class="chatimg"><img height="24" width="24" src="/images/bakeneko.png"></div><div class="chatbody"></div></div><div class="chatbottom"><div class="chatname"></div><div class="chatdate"></div></div></div>');
	add.find('div.chatbody').append(msg.message);
	add.find('div.chatimg img').attr('src', msg.image);
	add.find('div.chatname').append(msg.user);
	add.find('div.chatdate').append(msg.date);
	chatarea.prepend(add);
	for(var i = 0; i < chatarea.find('div.chatbox').length - 10; i++ ){
		chatarea.find('div.chatbox:last').remove();
	}
}
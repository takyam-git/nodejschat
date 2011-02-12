
/**
 * Module dependencies.
 */

var express          = require('express'),
	OAuth            = require('./lib/oauth').OAuth,
	io               = require('socket.io'),
	sws              = require('./lib/sws')();

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyDecoder());
	app.use(express.cookieDecoder());
	app.use(express.session({
		secret : 'some random text',
//		store  : (new require("express/middleware/session/memory"))({ reapInterval: 60000 * 10 })
	}));
	app.use(sws.http);
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.staticProvider(__dirname + '/public'));
});
/*app.dynamicHelpers({
	session: function(req, res){
		return req.session;
	}
});*/

var oauth_consumer_key = 'your key';
var oauth_consumer_key_secret = 'your secret key';
var oauth = new OAuth(
	'http://twitter.com/oauth/request_token',
	'http://twitter.com/oauth/access_token',
	oauth_consumer_key,
	oauth_consumer_key_secret,
	'1.0A',
	'http://www2133u.sakura.ne.jp:3000/login',
	'HMAC-SHA1'
);
app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
	res.render('index', {
		locals: {
			title: 'nodechat',
			session: req.session
		}
	});
});


app.get('/login', function(req, res){
	var oauth_token    = req.query.oauth_token;
	var oauth_verifier = req.query.oauth_verifier;
	if (oauth_token && oauth_verifier && req.session.oauth) {
		oauth.getOAuthAccessToken(
			oauth_token, null, oauth_verifier,
			function(error, oauth_access_token, oauth_access_token_secret, results) {
				if (error) {
					res.send(error, 500);
				} else {
					req.session.user = results.screen_name;
					res.redirect('/');
				}
			}
		);
	}else{
		oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			if(error){
				res.send(error, 500);
			}else{
				req.session.oauth = {
					oauth_token: oauth_token,
					oauth_token_secret: oauth_token_secret,
					request_token_results: results
				};
				res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
			}
		});
	}
});

//LOGOUT
app.get('/logout', function(req, res) {
	req.session.destroy(function() {
		res.redirect('/');
	});
});

var messages = [];
var socket = io.listen(app);
socket.on('connection', sws.ws(function(client){
		var user = client.sessionId;
		function create_message(msg){
			var ret = {
				user    : user,
				type    : 'announce',
				message : msg,
				date    : (new Date()).toLocaleString()
			}

			messages.push(ret);

			if(messages.length > 100){
				messages.shift();
			}
			return ret;
		}

		client.on('secure', function(){
			if(client.session.user){
				user = client.session.user;
			}

			if(client.session.connected){
				var message = create_message(client.sessionId + 'さんが、' + user + 'さんとしてログインしました');
			}else{
				var message = create_message(user + 'さんが接続されました');
			}
			for(var i = 0; i < messages.length; i++){
				client.send(messages[i]);
			}
			client.broadcast(message);
			client.session.connected = true;
		});

		client.on('message', function(msg){
			var message = create_message(msg);
			message.type = 'chat';
			client.send(message);
			client.broadcast(message);
		});

		client.on('disconnect', function(){
			if(!client.session){
				client.broadcast(create_message(user + 'さんが切断されました'));
			}
		});

	}
));

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port)
}

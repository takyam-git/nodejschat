//exposes a verifier for sessions
//first request an access token over xhr
//then connect the socket with the x-access-token returned as the first message
module.exports = function verifier(options)
{
  var defaults = {
    ttl: 30*1000//30 seconds before token is invalid
  };
  for (var k in options) {
    defaults[k] = options[k];
  }
  var session_jar = {};
  return {
    http:function give_token(req, res, next) {
      //x-access-request-token: simple
      //  --  one time use token for alternative sessions
      //  --  must be secure connection
      //
      //returns body with json {
      //  x-access-token: key ';' time
      //}
      if (req.headers["x-access-request-token"]) {
        if (req.headers["x-access-request-token"].toLowerCase()==="simple") {
          var token = Math.random();
          while (session_jar[token]) {
            token = Math.random();
          }
          var tmp = Date.now();
          session_jar[token] = {
            session: req.session,
            date: tmp,
            id: req.sessionID
          };
          res.writeHead(200);
          res.end('{"x-access-token": "'+token+';'+tmp+'"}');
          return;
        }
      }
      //for connect
      if (next) {
        next();
      }
    }
    , ws: function attach_client(cb) {
      return function route_client(client) {
        // new client is here!
        // verify session or default to none
        function verify(token) {
          var tmp = session_jar[token];
          //if we have a session and the session is not stale
          if (tmp && tmp.date > Date.now() - defaults.ttl) {
            var session = tmp;
            //do a little cleanup for logged in sessions
            //TODO: figure out secure cleanup for stale sessions?
            delete session_jar[token];
            return session;
          }
          return false;
        }
        //the first message will send out secret token
        //if it does emit("secure")
        //otherwise, emit("insecure") and fire emit("message")
        client.once('message', function first_verify(msg) {
          var session = verify(msg) || false;
          if (session) {
            client._session = session;
            client.session = session.session;
            client.emit("secure");

            // bind original listeners
            client.on = oldon;
            for (var i = 0, l = onmsgs.length; i < l; i++) {
              client.on('message', onmsgs[i]);
            }
          }
          else {
            //insecure does not stop the first message!
            client.emit("insecure");
            client.connection.end();
          }
        });

        //our mask of functions to add at/after the first message
        var onmsgs = [];
        var oldon = client.on;
        client.on = function(name, fn) {
          if (name === "message") onmsgs[onmsgs.length] = fn;
          else oldon.apply(this, arguments);
        };

        //hand over the client to w/e is going on
        cb(client);
      };
    }
  };
};
function SessionWebSocket(cb) {
	$.ajax({
		url: "/",
		dataType: "json",
		cache : false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('x-access-request-token', 'simple');
		},
		success: function(data) {
			var socket = new io.Socket();
			socket.connect();
			socket.send(data["x-access-token"].split(";")[0]);
			cb(socket);
		}
	});
}
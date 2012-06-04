(function(module) {
	var http = require('http');
	//代理远程服务
	module.exports = function (request, response, serverHost, serverPort) {
		response.header('X-Proxyed-By' ,'Weibo-Packager');
		serverPort = serverPort || 80;
		var proxyRequest = http.request({
			host	: serverHost || request.headers.host,
			port	: serverPort,
			path	: request.url,
			method	: request.method,
			headers	: request.headers
		}, function(proxyResponse) {
			proxyResponse.pipe(response);
			response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
		});
		proxyRequest.on('error', function(e) {
		  console.error(new Date().toLocaleString() +  ' error in proxyRequest: ', e);
		});
		request.pipe(proxyRequest);
	}
})(module);

(function(module) {
	//所有服务器的配置参数
	var config = {
		//documentRoot,默认指向/data1/wwwroot/js.wcdn.cn
		'documentRoot'	: "/data1/wwwroot/js.wcdn.cn/",

		//默认启动10个worker子进程作为服务器
		'workerNum' 	: 10,
		
		//默认自动代理请求未部署的工程
		'autoProxy'		: true
	};

	module.exports = function() {
		return config;
	};
})(module);

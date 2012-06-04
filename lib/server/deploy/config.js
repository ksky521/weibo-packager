(function(module) {
	var config = {
		//默认指向/data1/wwwroot/js.wcdn.cn
		'documentRoot'	: "/data1/wwwroot/js.wcdn.cn/",
		
		'port'			: 9999,

		//默认启动3个worker子进程作为服务器
		'workerNum' 	: 2,
		
		'svnRoot'		: 'https://svn1.intra.sina.com.cn/weibo/ria/',
		
		/* 
		 * deploy使用的js压缩合并工具
		 * 1 未来可以使用 '/data1/wwwroot/js.wcdn.cn/tools/combine-2012-02-20/js/main.js' 代替
		 * 2 未部署 combine/js/main.js 时自动以 combine-2012-02-20/js/main.js 代替
		 */
		'jsPackager'	: '/data1/wwwroot/js.wcdn.cn/tools/combine/js/main.js'
	};

	module.exports = function() {
		return config;
	};
})(module);
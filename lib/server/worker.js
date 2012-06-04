(function(module) {
	var path 			= require('path');
	var dns 			= require('dns');
	var express 		= require('express');
	var proxyService 	= require('./proxy');
	var config 			= require('./config')();
	var combineOneJS 	= require('../js/combineOne');
	var combineOneCSS 	= require('../css/combineOne');

	//文件动态合并服务
	var combineService = require('./combineService');

	module.exports = function() {
		var app = express.createServer();
		app.use(app.router);

		combineService(app, config, isPackagedProject);

		/*
		 * 1)如果是压缩合并过的工程,则走仿真模式(直接读取打包合并后的静态资源);
		 * 2)否则为开发模式(按需合并单个文件);
		 * 3)文件根本不存在时自动反向代理到线上资源.
		 * 4)本机做开发机器时,请在config.js中配置onlineServer ip地址
		 * 5)js不管是什么模式,先对/conf/目录做特殊处理,优先读取conf目录下相同路径文件
		 * */
		var url, onlineServerIP;
		dns.resolve4('js.t.sinajs.cn', function(err, addresses) {
			if(err){
				throw err;
			}
			onlineServerIP = addresses[0];
		});
		app.use(function(req, res, next) {
			//仿真模式,直接读取打包合并后的静态js/css/image.对conf目录文件特殊处理之.
			url = config.documentRoot + req.url.split('?')[0];
			if(req.url.lastIndexOf('.js') !== -1 || req.url.lastIndexOf('.css') !== -1) {
				if(isPackagedProject(req.url)) {//已经打包过,仿真模式
					if(path.existsSync(req.url.replace("/js/", '/js/conf/'))) {
						return res.redirect(req.url.replace("/js/", '/js/conf/'));
					}
					next();
				} else {//开发模式或者没有部署目标工程
					if(req.url.lastIndexOf('.js') !== -1) {
						res.header('Content-Type', 'application/x-javascript;Charset=UTF-8');
						if(path.existsSync(url.replace("/js/", '/js/conf/'))) {
							res.write(combineOneJS(url.replace("/js/", '/js/conf/')), 'utf-8');
							return res.end();
						}
						if(path.existsSync(url)) {
							res.write(combineOneJS(url), 'utf-8');
							return res.end();
						}
					} else {
						res.header('Content-Type', 'text/css;Charset=UTF-8');
						if(path.existsSync(url)) {
							res.write(combineOneCSS(url), 'utf-8');
							return res.end();
						}
					}
					config.autoProxy ? proxyService(req, res, onlineServerIP, 80) : next();
				}
			} else {
				if(path.existsSync(url)) {
					next();
				} else {
					config.autoProxy ? proxyService(req, res, onlineServerIP, 80) : next();
					//自动代理请求不存在的图片,swf等静态资源
				}
			}
		});
		if(config.documentRoot) {//下面的2句必须在自定义路由规则之后
			app.use(express['static'](config.documentRoot));
			app.use(express.directory(config.documentRoot));
		}

		app.listen(80);
		console.log('weibo ria worker server ' + process.pid + ' running on 80 port...');
	}
	
	/*
	 * 根据工程根目录下是否存在名为 .packaged.txt 的文件来判断工程是否是压缩合并过的.
	 * */
	var lsit, file;
	function isPackagedProject(url) {
		list = url.split('/').filter(function(item) {
			if(item !== '') {
				return item;
			}
		});
		file = path.join(config.documentRoot, list[0], list[1], '.packaged.txt');
		if(path.existsSync(file)) {
			return true;
		}

		//apps, appstyle等目录下工程需要再读取下一层目录
		file = path.join(config.documentRoot, list[0], list[1], list[2], '.packaged.txt');
		if(path.existsSync(file)) {
			return true;
		}
		return false;
	}

})(module);

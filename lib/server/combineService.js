/***
 * @fileoverview 动态合并文件(css,js)服务
 * @see http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=7147981 
 * */

(function(module) {
	var path = require('path');
	var fs = require('fs');
	var combineOneJS = require('../js/combineOne');
	var combineOneCSS = require('../css/combineOne');

	module.exports = function(app,config,isPackagedProject) {
		app.get('/edgecombo',function(req, res){
			//去掉version=xyz再切分过滤
			var fileList = req.url.replace(/version=\w*&?/g,'').split(/\?|&/g).filter(function(item){
				if(item !== ''){
					return item;
				}
			});
			fileList.shift();//去掉第一个'/edgecombo'
			if(fileList.length === 0){
				return res.end('', 'utf-8');
			}
			var prefix = fileList[0].split('p=')[1];//公共目录前缀
			if(prefix){
				fileList.shift();
			}
			if(fileList.length === 0){
				return res.end('', 'utf-8');
			}
			fileList = fileList.map(function(item){
				return prefix ? path.join(config.documentRoot,prefix,item) : path.join(config.documentRoot,item);
			});
			
			var isCSS = (path.extname(fileList[0]) === '.css'), jsConfig;
			if(isCSS){
				res.header('Content-Type','text/css;Charset=UTF-8');
			}else{
				res.header('Content-Type','application/x-javascript;Charset=UTF-8');
				
				if(isPackagedProject(fileList[0].replace(config.documentRoot,''))){//仿真压缩参数
					jsConfig = {
						keepRaw:false,
						beautify:false,
						mangle:true,
						squeeze:true
					};
				}
			}
			
			fileList.forEach(function(url){
				res.write(isCSS ? combineOneCSS(url) + '\n' : combineOneJS(url,jsConfig) + '\n', 'utf-8'); //chunck输出
			});
			
			res.end('', 'utf-8');
		});
	};
})(module);
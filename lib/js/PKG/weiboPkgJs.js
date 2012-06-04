var fs = require('fs');
var path = require('path');
var format = require('./format');
var combine = require('./combine');
var writeFile = require('./writeFile');
var log = require('../../tools/log');
var parseParam = require('./parseParam');

module.exports = function(fromDir, toDir, jsList,conf){
	var jsMap = {}, ret = {};
	//获取缓存的文件列表
	log.info('read all js source code......');
	jsList.forEach(function(uri){
		jsMap[uri] = fs.readFileSync(uri,'utf-8');
	});
	
	
	(function(){
		//对内容进行格式化
		var formatConf = parseParam({
			'isBeautify' : false,
			'isMangle' : false,
			'isSqueeze' : false
		},conf);
		for(var k in jsMap){
			try{
				jsMap[k] = format(jsMap[k], formatConf);
			}catch(exp){
				log.error(k + ' compress error!!!');
			}
			log.info('> compress ' + k + ' Done.');
		}
	})();
	
	errorReport();
	
	(function(){
		//对内容进行合并
		var combineConf = parseParam({
			'onlyConf' : true
		}, conf);
		if(combineConf.onlyConf){
			for(var k in jsMap){
				//对工程下js/conf做特殊处理时要考虑home/static/目录下js也不能忽略掉
				if(k.indexOf('/conf/') !== -1 || k.indexOf(path.join(fromDir, '/static/')) !== -1){
					ret[k] = combine(k,jsMap[k], jsMap);
					log.info('> combine ' + k + ' Done');
				}
			}
		}else{
			for(var k in jsMap){
				ret[k] = combine(k,jsMap[k], jsMap);
				log.info('> combine ' + k + ' Done');
			}
		}
		jsMap = null;
	})();
	
	errorReport();
	warningReport();
	
	(function(){
		//进行写文件操作
		var writeConf = parseParam({
			'confSpecial' : true
		}, conf);
		for(var k in ret){
			//u为目标文件绝对路径
			var u = k.replace(fromDir, toDir);
			if(writeConf.confSpecial && u.indexOf('/conf/') !== -1){
				u = u.replace('/conf/','/');
			}
			writeFile(ret[k], u,conf);
		}
		ret = null;
	})();
	
	log.info('\n > All javascripts merged!!!!!!\n');
};
function errorReport(){
	var errs = log.getError();
	if(errs.length > 0){
		for(var i = 0, len = errs.length; i < len; i += 1){
			log.errorInfo(errs[i]);
		}
		errs = [];
		log.errorInfo(fromDir + ' pkg Error!');
		throw fromDir + ' pkg Error!';
	}
};
function warningReport(){
	//处理报错
	var warnings = log.getWarning();
	for(var i = 0, len = warnings.length; i < len; i += 1){
		log.warningInfo(warnings[i]);
	}
	warnings = null;
};
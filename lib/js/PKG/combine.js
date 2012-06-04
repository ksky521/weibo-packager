var log = require('../../tools/log');
var reg = /\$Import\s*\(\s*(['|"])([\w\-\.\/]*)\1\s*\)\s*;?/gi;//如webim项目使用了小写的$import

var combine = function(uri,str, jsMap, baseJsDir,beCombined){
	return str.replace(reg, function(){
		var key = arguments[2];
		if(key){
			//转换为兼容t4,t35两种$import方式的绝对路径
			key = baseJsDir + key.replace(/\.js$/,'').replace(/\./g,'/') + '.js';
			if(typeof jsMap[key] === 'string'){
				if(beCombined[key] !== 0){
					beCombined[key] = 0;
					return combine(key,jsMap[key], jsMap, baseJsDir,beCombined);
				}else{
					return '';
				}
			}else{
				log.error(uri + ' $imported file ' + key + ' do not exist!!!!');
				return '';
			}
		}
	});
};

module.exports = function(uri,code, jsMap){
	var baseJsDir = uri.split('/js/')[0] + '/js/';
	var beCombined = {};
	return combine(uri,code, jsMap, baseJsDir,beCombined);
};
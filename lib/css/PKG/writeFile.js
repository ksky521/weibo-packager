var fs = require('fs');
var path = require('path');
var cssMD5 = require('../../tools/md5.js').cssMD5;

var hash,md5URI;
module.exports = function(code, uri,config){
	fs.writeFileSync(uri, code);
	
	if(!config.noMD5){
		//md5 文件并且写入 a/b/c.css --> a/b/c_xxx.css xxx为c.css的md5 hash值
		hash = cssMD5(uri,code);
		md5URI = uri.replace(/\.css$/,'_' + hash)
		//为BigPipe增加一个新特殊规则(增加比替换效率高)用于判断该css是否已经渲染生效
		//只为最终合并的文件在文件末尾增加这个规则.@import进来的文件不增加.
		code = code + ' #js' + md5URI.replace(path.dirname(path.resolve(config.to)),'').split('/').join('_') + '{height:42px;} ' ;
		fs.writeFileSync(md5URI + '.css',code);
	}
};
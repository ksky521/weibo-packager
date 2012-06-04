var fs = require('fs');
var path = require('path');
var log  = require('../../tools/log');
var syncMD5forFile = require('../../tools/md5.js').syncMD5forFile;

var hash,md5URI;
module.exports = function(code, uri,conf){
	fs.writeFileSync(uri,code);
	log.info('> writeFile ' + uri + ' Done!');
	
	if(!conf.noMD5){
		// 把形如 /a/b/c.js 的文件同步写入 /a/b/c_xxx.js xxx 是c.js的md5 hash值
		hash = syncMD5forFile(code,uri), md5URI = uri.replace(/\.js$/,'_' + hash + '.js'); 
		fs.writeFileSync(md5URI,code);
		hash = md5URI = null;
	}
};

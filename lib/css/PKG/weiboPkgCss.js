var cmb = require('./combine');
var tin = require('./tiny');
var log = require('../../tools/log');
var wtf = require('./writeFile');
var path = require('path');
var fs = require('fs');
var md5 = require('../../tools/md5.js');

module.exports = function(from, to, cssList,noMD5) {
	log.info('building cache......');
	var list = {};
	cssList.forEach(function(uri){
		list[uri] = fs.readFileSync(uri,'utf-8');
	});

	for(var k in list) {
		try {
			list[k] = tin(list[k]);
		} catch(exp) {
			log.error(k + ' tiny error!!!');
		}
		log.info('> tiny ' + k + ' Done.');
	}

	errorReport();

	var ret = {}, mapping = md5.getCssMD5Mapping();
	for(var k in list) {
		ret[k] = cmb(k, list, mapping, noMD5);
		log.info('> combine ' + k + ' Done');
	}
	list = mapping = null;

	errorReport();

	for(var k in ret) {
		wtf(ret[k], path.resolve(k).replace(path.resolve(from), path.resolve(to)), {
			'noMD5' : noMD5,
			'from' : from,
			'to' : to
		});
		log.info('> writeFile ' + k + ' Done!');
	}
	ret = null;

	errorReport();
	warningReport();

	function errorReport() {
		//处理报错
		var errs = log.getError();
		if(errs.length > 0) {
			for(var i = 0, len = errs.length; i < len; i += 1) {
				log.errorInfo(errs[i]);
			}
			log.errorInfo(from + ' pkg Error!');
			throw from + ' pkg Error!';
		}
	}
	function warningReport() {
		//处理警告
		var warnings = log.getWarning();
		for(var i = 0, len = warnings.length; i < len; i += 1) {
			log.warningInfo(warnings[i]);
		}
	}
};
var fs = require('fs');
var path = require('path');
var pkg = require('./PKG/weiboPkgJs');
var log = require('../tools/log');
var cpf = require('./PKG/cpFile');
var arg = require('arguments');
var writeMappingFile = require('./PKG/requireExtractor.js').writeMappingFile;
var walk = require('../tools/dirWalker');
var mkdirP = require('../tools/mkdirP');

console.time('Package-Time');

var from = path.resolve(process.argv[2]), to = path.resolve(process.argv[3]), projectPath = process.argv[4];
var conf = {
	'isBeautify':false,
	'isMangle' : false,
	'isSqueeze' : false,
	'onlyConf' : false,
	'confSpecial' : false,
	'from' : from,
	'to' : to,
	'projectPath' : projectPath
};

arg.parse(process.argv.slice(5), [
	{'name':/^-(v|verbose)$/, 'callback':function(){conf.verbose = true;}},//输出详细log
	{'name':/^-beautify$/, 'callback':function(){conf.isBeautify = true;}},//美化(格式化)代码
	{'name':/^-mangle$/, 'callback':function(){conf.isMangle = true;}},//混淆变量
	{'name':/^-squeeze$/, 'callback':function(){conf.isSqueeze = true;}},//进一步压缩压缩
	{'name':/^-onlyconf$/i, 'callback':function(){conf.onlyConf = true;}},//只合并conf目录下js
	{'name':/^-confspecial$/i, 'callback':function(){conf.confSpecial = true;}},//conf目录下文件去掉'conf'路径再写入
	{'name':/^-noMD5/i, 'callback':function(){conf.noMD5 = true;}}//不做MD5处理
]);

function showUsage(){
	console.error('Usage: node js/main.js fromDir toDir projectPath [-verbose] [-onlyConf] [-confSpecial][-mangle][-squeeze][-noMD5]');
	process.exit(1);
}
if(process.argv.length < 5){
	showUsage();
}

if(!from || !path.existsSync(from)){
	console.log('need fromDir');
	showUsage();
}
if(!to || !path.existsSync(to)){
	console.log('need toDir');
	showUsage();
}

if(!projectPath && !conf.noMD5){
	console.log('need projectPath to build MD5 mapping path, such as : t4/home or t4/webim or t4/apps/data ...');
	showUsage();
}
//获得打包路径的列表

console.log('Finding PKG. Please wait...\n');

var files = walk(from), jsList = files.js, otherFiles = files.other;
//先把目标目录建立好
var target;
jsList.concat(otherFiles).forEach(function(uri){
	target = uri.replace(from,to);
	if(!path.existsSync(path.dirname(target))){
		//如果confSpecial,配置目标目录时就要特殊处理
		if(conf.confSpecial && target.indexOf('/conf/') !== -1){
			mkdirP(path.dirname(target.replace('/conf/','/')),0777);
		}else{
			mkdirP(path.dirname(target),0777);
		}
	}
});

//压缩,合并js
pkg(from,to,jsList,conf);

//复制非js文件(swf,图片等静态资源,同时计算其md5)
console.log('Copy files. Please wait...\n');
otherFiles.forEach(function(source){
	cpf(source,source.replace(from,to),conf);
});

if(!conf.noMD5){
	writeMappingFile(to,conf);
}

console.log('######## Package JS SUCCESS! ###########');
console.timeEnd('Package-Time');

//.packaged.txt表明可用于仿真测试,勿删!
fs.writeFileSync(path.join(path.resolve(to) ,".packaged.txt"), 'packaged at: ' + (new Date().getTime()) + '\n');
process.exit(0);
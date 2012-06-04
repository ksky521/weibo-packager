var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;
var parseParam = require('./parseParam');
var log = require('../../tools/log');
var extractRequirePath = require('./requireExtractor.js').extractRequirePath;

var formated = '';
var format = function(code, conf){
	var conf = parseParam({
		'isBeautify' : false,
		'isMangle' : false,
		'isSqueeze' : false
	},conf);
	var ast;
	try{
		ast = jsp.parse(code);
	}catch(exp){
		throw exp.message;
	}
	if(ast && !conf.noMD5){
		extractRequirePath(ast, pro);
	}
	if(conf.isMangle){
		ast = pro.ast_mangle(ast,{
			except:['rm','require','rm.register','require.register']
		});
	}
	if(conf.isSqueeze){
		ast = pro.ast_squeeze(ast,{
			make_seqs   : false,//这个因为$import的特殊性,必须关闭
            dead_code   : true,
            no_warnings : false,
            keep_comps  : true
		});
	}
	formated =  conf.isBeautify ? pro.gen_code(ast,{'beautify':true}) : pro.gen_code(ast);
	ast = null;
	//文件末尾加换行符,使合并后的文件看起来结构更清晰
	return  formated + ';\n';
};

module.exports = format;
(function(exports) {
	var fs = require('fs');
	var path = require('path');
	var log = require('../../tools/log');
	var md5 = require('../../tools/md5.js');

	/*
	 * 自动检测rm.register加载的路径,用于以后替换为md5后路径名称
	 * (只抽取'a.b.c'这样的实例变量形式,不自动计算or替换引用类型变量值或者表达式)
	 * 1)解析AST语法解析树时必须考虑parse不同参数时每个node节点有不同结构:var ast = jsp.parse(orig_code,false,true);
	 * 2)pro.ast_add_scope(ast)可以防止原来ast被改变;
	 * 
	 * @param{Array}:ast 原始AST
	 * @param{Object}:pro uglify processor
	 * */
	var requireMapping = {}, walker;
	exports.extractRequirePath = function(ast, pro) {
		walker = walker || pro.ast_walker();
		walker.with_walkers({
			"call" : function(expr, args) {
				// console.log(util.inspect(this,false,5));//walker函数内this即为当前AST node节点本身
				if(expr[0] === 'dot' 
					&& expr[1][0] === 'name' 
					&& (expr[1][1] === 'rm' || expr[1][1] === 'require') 
					&& expr[2] === 'register' 
					&& args[0][0] === 'string' 
					&& args[1][0] === 'array') {
					args[1][1].forEach(function(item) {
						if(item[0] === 'string') {
							requireMapping[item[1]] = 1;
						}
					});
				}
			}
		}, function() {
			return walker.walk(ast);
		});
	};
	
	//把kit.extra.require 路径映射 插入 conf/base.js 并且重新计算conf/base.js md5值以后把全部md5映射写入输出目标根目录下.
	//目前只针对home工程才有这个额外操作.
	function writeRequirePath(toDir,conf) {
		var file = conf.confSpecial ? path.join(toDir,'js','base.js') : path.join(toDir,'js','conf','base.js');
		if(path.existsSync(file)){
			var mapping = md5.getMD5Mapping();
			for(var k in requireMapping){
				requireMapping[k] = mapping[path.join(toDir,'js',k.replace(/\./g,'/')) + '.js'];
			}
			var content = fs.readFileSync(file,'utf-8') 
				+ ';STK.register("requirePathMapping",function($){ return _MAP_;});'
				.replace('_MAP_',JSON.stringify(requireMapping));
				
			var hash = md5.syncMD5forFile(content,file.replace(toDir,''));//重新计算conf/base.js的md5值
			fs.writeFileSync(file,content);
			var md5Path = conf.confSpecial ? path.join(toDir,'js','base' + '_' + hash + '.js') : path.join(toDir,'js','conf','base' + '_' + hash + '.js');
			fs.writeFileSync(md5Path,content);//重新生成conf/base.js的md5路径文件
			log.info('\n kit.extra.require 路径映射 已经插入 >> ' + file + ' !\n');
			content = file = md5Path = null;
		}
		requireMapping = null;
	};
	
	//输出所有文件的md5映射
	function writeAllMD5Mapping(toDir,projectPath){
		var mapping = md5.getMD5Mapping(), mapping2 = {}, uri = '', ext = '';
		var mappingFile = path.join(toDir ,"md5_mapping.json");
		for(var k in mapping){
			uri = path.join(projectPath,k.replace(toDir,''))
			ext = path.extname(uri);
			mapping2[uri] = uri.replace(ext, '_' +  mapping[k] + ext);
		}
		fs.writeFileSync(mappingFile,JSON.stringify(mapping2,null,3));
		console.log('\n### MD5 映射文件是 ' + mappingFile + ' ###\n');
		mapping = mapping2 = null;
	}
	
	exports.writeMappingFile = function(toDir,conf){
		writeRequirePath(toDir,conf);
		writeAllMD5Mapping(toDir,conf.projectPath);
	};
})(exports);

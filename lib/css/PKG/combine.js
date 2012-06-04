var log = require('../../tools/log');
var path = require('path');

//匹配@import各种写法--有无url(),有无引号等 \2 Backreferences 指前面匹配的(['|"]?)
//注意,如果@import语句末尾有;符号,必须去掉,否则紧临其后的那条css规则就会失效.
var impReg = /@import\s*(url\s*\()*\s*(['|"]?)([\w\-\.\:\/\\\s]+)\2\s*(\))*\s*;?/igm;

var urlReg = /url\s*\(\s*(['|"]?)([^\)|\:]+)\1\s*\)/ig;

var importURI,parentCSS,lastImported, missing = {};
var buildTree = function(fileList, filePath,md5Mapping,noMD5){
	var parser = function(ret, uri){
		ret['key'] = uri;
		ret['children'] = [];
		var str = fileList[uri];
		if(str){
			while(str){
				var n = str.indexOf('@import');
				if(n === 0){
					var lis = str.match(impReg);
					if(lis){
						str = str.substring(lis[0].length).trim();
						lis[0].trim().replace(impReg,function(){
						    lastImported = importURI = arguments[3];
						});
						
						importURI =  path.resolve(uri,'../',lastImported);
						parentCSS = uri;
						ret.children.push(parser({},importURI));
					}
				}else if(n === -1){
					ret.children.push(replaceURL(str,uri,filePath,md5Mapping,noMD5));
					str = '';
				}else{
					ret.children.push(replaceURL(str.substring(0,n),uri,filePath,md5Mapping,noMD5));
					str = str.substring(n);
				} 
			}
		}else{
			if(parentCSS && !missing[parentCSS]){
				missing[parentCSS] = true;
				log.warning( parentCSS + ' @import ' + lastImported + ' does not exsist!');
			}
		}
		
		return ret;
	};
	return parser({},filePath);
};

//剪除重复@import---如果有重复,按照css解析规则,剪除前面重复的,只保留最后一个.
var clear = function(tree){
	var stack = [];//遍历栈
	var list = [];//返回队列
	var hold = true;//遍历开关
	var last = null;//栈尾节点
	var curr = null;//当前节点
	
	while(hold){
		//获取栈头
		if(stack.length > 0){
			last = stack[stack.length - 1];
		}else{
			// last = null;
			stack.push([tree, -1]);
			continue;
		}
		//获取子节点的信息
		
		curr = last[0]['children'][last[1] + 1];
		
		if(curr !== null && curr !== undefined){//进栈（栈为空或栈尾节点还有未遍历的子节点）
			if(typeof curr === 'string'){//如果是叶子节点
				for(var i = list.length - 1; i >= 0; i -= 1){
					if(list[i] == curr){
						list.splice(i,1);
					}
				}
				list.push(curr);
			}else{//如果不是叶子节点
				stack.push([curr, -1]);
			}
			last[1] += 1;
		}else{//出栈
			stack.pop();
			if(!stack.length){
				hold = false;
			}
		}
	}
	return list;
};

/**
 * 计算图片在合并后的文件中相对路径: 先根据图片和父级css的相对路径计算出图片路径,然后计算该路径与顶级css路径的相对路径.
 * @param{String}topPath: 顶级css路径
 * @param{String}importedPath: @import引用的css路径
 * @param{String}imgPath: @import引用的css文件中原始图片路径
 * */
var relative = function(topPath,importedPath,imgPath){
	return path.relative(topPath,path.resolve(importedPath,'..',imgPath)).replace('../','');
};

//替换md5路径时,是否保留老的url中?id=xxx形式
var compatibleID = process.argv.slice(4).join(" ").indexOf('-compatibleID') !== -1;

//替换url中图片名称为md5后图片名称
var img, index, hash, imgMissing = {};
var replaceURL = function(str,uri,filePath,md5Mapping,noMD5){
	return str.replace(urlReg, function(){
		if(noMD5){
			return 'url("' + relative(filePath,uri,arguments[2]) +'") ';
		}
		// resolve中间增加一个'../'是因为2个操作目标都是文件,不是文件夹.计算相对路径时要再去掉
		img = path.resolve(uri,'../',arguments[2]);//arguments[2]
		if(hash = md5Mapping[img.split('?')[0]]){
			index = img.lastIndexOf("/");
			img = compatibleID === true ?  img.split('?')[0] + '?id=' + hash : img.substr(0,index) + img.split('?')[0].substr(index).replace('.','_' + hash + '.');; 
			img = path.relative(filePath, img).replace('../','');
			index = hash = null;
		}else{//报告图片不存在
			img = relative(filePath,uri,arguments[2]);
			if(imgMissing[arguments[2]] !== 1){
				imgMissing[arguments[2]] = 1;
				log.warning( arguments[2] + ' in ' + uri + ' does not exsist!');
			}
		}
		return 'url("' + img +'") ';
	});
};

module.exports = function(filePath, fileList,md5Mapping,noMD5){
	return clear(buildTree(fileList, filePath,md5Mapping,noMD5)).join('\n');
};
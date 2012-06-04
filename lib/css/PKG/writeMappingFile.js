var fs = require('fs');
var path = require('path');
var md5 = require('../../tools/md5.js');
module.exports = function(from,to,projectPath){
	var mappingFile = path.join(path.resolve(to) ,"md5_mapping.json");
	var mapping = md5.getCssMD5Mapping(), mapping2 = {}, uri = '', ext = '';
	for(var k in mapping){
		uri = path.join(projectPath,k.replace(path.resolve(from),path.resolve(to)).replace(path.resolve(to),''));
		ext = path.extname(uri);
		mapping2[uri] = uri.replace(ext, '_' +  mapping[k] + ext);
	}
	fs.writeFileSync(mappingFile,JSON.stringify(mapping2,null,3));
	mapping = mapping2 = uri = ext = null;
	console.log('\n######## CSS MD5 mapping file is: ' + mappingFile + ' ########\n');
};
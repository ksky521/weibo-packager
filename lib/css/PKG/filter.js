/**
 * 过滤重复css规则(去掉前面相同的规则,保留最后那条规则)
 * */
module.exports = function(css, filePath) {
	var list = [], index;
	css.split(/\}/g).forEach(function(rule) { 
		rule = rule.trim();
		if(rule !== '') {
			rule = rule + '}';
			index = list.indexOf(rule);
			if(index !== -1){
				console.warn('repeated rule in ' + filePath + ' : ', rule);
				list.splice(index, 1);
			}
			list.push(rule);
		}
	});
	return list.join('');
};

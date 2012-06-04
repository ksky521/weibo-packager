var fs = require('fs');
var path = require('path');

module.exports = function mkdirP(p, mode) {
	try {
		fs.mkdirSync(p, mode)
	} catch (err0) {
		switch (err0.code) {
			case 'ENOENT' :
				var err1 = mkdirP(path.dirname(p), mode)
				if(err1)
					throw err1;
				else
					return mkdirP(p, mode);
				break;

			case 'EEXIST' :
				var stat;
				try {
					stat = fs.statSync(p);
				} catch (err1) {
					throw err0
				}
				if(!stat.isDirectory())
					throw err0;
				else
					return null;
				break;
			default :
				throw err0
				break;
		}
	}
	return null;
};

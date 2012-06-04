var removeBOMChar = require('../../tools/removeBOMChar.js').removeBOMChar;

var reg = /\r|\n|\@charset([^;]*);|\/\*((.|\r|\n)*?)\*\//ig;
module.exports = function(str){
	return removeBOMChar(str.replace(reg, '')).trim();
};
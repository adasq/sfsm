var crypto = require('crypto');
var fs = require('fs');
var stream = require('stream');
var _ = require('underscore');
var zlib = require('zlib');
var through2 = require('through2');
var bun = require('bun');

var zip = zlib.createGzip();
var unzip = zlib.createGunzip();

var encryptStream, decryptStream;

var defaultConfig = {
	algorithm: 'aes-256-ctr',
	password: 'd6F3Efeq'
};

var config = _.clone(defaultConfig);

module.exports = {
	init: init,
	decrypt: decrypt,
	encrypt: encrypt
};

function encrypt(){	
	return bun([zip, encryptStream]);
}

function decrypt(){
	return bun([decryptStream, unzip]);
}

function init(_config){
	if(_config && _.isObject(_config)){
		config = _.extend(config, _config);
	}
	encryptStream = crypto.createCipher(config.algorithm, config.password);
	decryptStream = crypto.createDecipher(config.algorithm, config.password);
}
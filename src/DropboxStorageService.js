 
var _ = require('underscore');
var EventEmitter = require('events');
var through2 = require('through2');
var path = require('path');
var util = require('util');
var Dropbox = require('./Dropbox');


function DropboxStorageService(config){
  EventEmitter.call(this);
  this.dropbox = new Dropbox({
    "token": config.token
  });
}

util.inherits(DropboxStorageService, EventEmitter);

DropboxStorageService.prototype.saveFile = function(fileName){
  return this.dropbox.uploadFile2(fileName);
};

DropboxStorageService.prototype.downloadFile = function(fileName){
  return this.dropbox.downloadFile(fileName);
};


DropboxStorageService.prototype.fileExists = function(fileName, cb){
  this.dropbox.getMetadata(fileName)
  .then(function(result){
    cb(true);
  }, function(err){
    cb(false);
  });
};

DropboxStorageService.prototype.removeFile = function(fileName, cb){
  this.dropbox.removeFile(fileName)
  .then(function(result){
    cb(result.error);
  }, function(err){
    cb(err);
  });
};


module.exports = DropboxStorageService;
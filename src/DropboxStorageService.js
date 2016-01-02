 
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


DropboxStorageService.prototype.watch = function(){
  var that = this;
  var cursor = null;

  function emitChanges(entries){
    console.log(entries);
  }

  that.dropbox.listFolder('').then(function(result){
  result.entries
  cursor = result.cursor;
  setInterval(function(){
    that.dropbox.listFolderContinue(cursor).then(function(changes){
      emitChanges(changes.entries);
      cursor = changes.cursor;
    }, function(err){
      console.log(err);
    });
  }, 4000);


})


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
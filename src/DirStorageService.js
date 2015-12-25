var util = require('util');
var path = require('path');
var fs = require('fs');
var EventEmitter = require('events');
var chokidar = require('chokidar');


function DirStorageService(config) {
  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);
  this.config = config;
  this.watcher = chokidar.watch(config.dirName, {
    cwd: '.',
    persistent: true
  });
  this.init();
}

util.inherits(DirStorageService, EventEmitter);

DirStorageService.prototype.fileExists = function(fileName, cb){
  fs.stat(path.join(this.config.dirName, fileName), function(err, stats){
    var error = !!err;
    cb(!error);
  });
};

DirStorageService.prototype.saveFile = function(fileName){
  return fs.createWriteStream(path.join(this.config.dirName, fileName));
};

DirStorageService.prototype.removeFile = function(fileName, cb){
  var file = path.join(this.config.dirName, fileName);
  console.log('removing', file);
  fs.unwatchFile(file);
  fs.unlink(file, function(err, r){
     cb(err);
  });
};

DirStorageService.prototype.init = function(){
var that = this;
this.watcher
  .on('ready', function() {})
  .on('all', function(event, sourceFilePath){
    console.log(event, that.config.dirName);
    var fileInfo = path.parse(sourceFilePath);
    if(event === 'add'){      
            that.emit('file-added', {
            readStream: function(){
              return fs.createReadStream(sourceFilePath);
            },
            name: fileInfo.base
          });
    }else if(event === 'unlink'){
           that.emit('file-removed', {
            name: fileInfo.base
          });   
    }
  });
};

module.exports = DirStorageService;
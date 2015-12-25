var request = require('request');
var _ = require('underscore');
var q = require('q');
var utf8 = require('utf8');


var urls = {
  DELETE_FILE_URL: 'https://api.dropbox.com/1/fileops/delete',
  FILE_PUT_URL: 'https://api-content.dropbox.com/1/files_put/auto/',
  GET_FILES_LIST: 'https://api.dropbox.com/1/metadata/auto',
  GET_FILE: 'https://api-content.dropbox.com/1/files/auto',
  GET_METADATA: 'https://api.dropboxapi.com/2/files/get_metadata'
};

var DropboxAPI = function(config){
  if(_.isObject(config)){
    this.configure(config);
  }
};

DropboxAPI.prototype.configure = function(config){
  this.config = config;
  this.config.headers = {
    "Authorization":"Bearer "+config.token,
  };
};
 
DropboxAPI.prototype.downloadFile = function(path){
  var qs = {}; 
  console.log(utf8.encode(path));
  var url = urls.GET_FILE +utf8.encode(path);
  var deferred = q.defer();

  request.get({headers: this.config.headers, url: url, qs:qs, json:true}, function(e,response,data){
    if(response.headers['content-type'] === 'application/json'){
      return deferred.reject(data);
    }
  })
  .on('response', function(response){
    if(response.headers['content-type'] !== 'application/json'){
      return deferred.resolve(response);
    }
  });
  return deferred.promise;
};

DropboxAPI.prototype.removeFile= function(fileName){

  var deferred = q.defer();
  var callback = function(error, response, body){
       var obj = null;
    try{
      obj = JSON.parse(body);
      if(obj.error){
        deferred.reject(obj.error);
      }else{
        deferred.resolve(obj);
      }      
    }catch(e){
      deferred.reject(body);
    }
  }; 
  var url = urls.DELETE_FILE_URL;
  
var targetRequest = request.post({
  uri: url,
  form: {
    root: 'auto',
    path: '/'+fileName
  },
  followRedirect: false, 
  headers: this.config.headers}, callback);
  return deferred.promise;
}

DropboxAPI.prototype.getMetadata= function(fileName){
  var deferred = q.defer();
  var callback = function(error, response, body){
       var obj = null;
    try{
      obj = JSON.parse(body);
      if(obj.error){
        deferred.reject(obj.error);
      }else{
        deferred.resolve(obj);
      }      
    }catch(e){
      deferred.reject(body);
    }
  }; 

var targetRequest = request({
  method: 'POST',
  uri: urls.GET_METADATA,
  body: {
    include_media_info: false,
    path: '/'+fileName
  },
  json: true,
  followRedirect: false, 
  headers: this.config.headers}, callback);
  return deferred.promise;
}














DropboxAPI.prototype.uploadFile= function(file){
  var deferred = q.defer();
  var callback = function(error, response, body){
    var obj = null;
    try{
      obj = JSON.parse(body);
      if(obj.error){
        deferred.reject(obj.error);
      }else{
        deferred.resolve(obj);
      }      
    }catch(e){
      deferred.reject(body);
    }
    
  }; 
  var uploadUrl = urls.FILE_PUT_URL+ (file.name);
  
var targetRequest = request.post({
  uri: uploadUrl,
  followRedirect: false, 
  headers: this.config.headers}, callback);

  file.stream.pipe(targetRequest);

  return deferred.promise;
};


 



DropboxAPI.prototype.retriveCatalogFiles = function(path){
  var qs = {list: true, include_media_info: true};
  var url = urls.GET_FILES_LIST + path;
  var deferred = q.defer();
  request.get({url: url, oauth: this.config, qs:qs, json:true}, function (e, r, data) {
    if(data.error){
      return deferred.reject(data.error);
    }
    deferred.resolve(data);
  });
  return deferred.promise;
};

module.exports = DropboxAPI;
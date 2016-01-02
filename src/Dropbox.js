var request = require('request');
var _ = require('underscore');
var q = require('q');
var utf8 = require('utf8');


var urls = {
  DELETE_FILE_URL: 'https://api.dropboxapi.com/2/files/delete',
  FILE_PUT_URL: 'https://api-content.dropbox.com/1/files_put/auto/',
  GET_FILES_LIST: 'https://api.dropbox.com/1/metadata/auto',
  GET_FILE: 'https://content.dropboxapi.com/2/files/download',
  GET_METADATA: 'https://api.dropboxapi.com/2/files/get_metadata',
  LIST_FOLDER: 'https://api.dropboxapi.com/2/files/list_folder',
  LIST_FOLDER_CONTINUE: 'https://api.dropboxapi.com/2/files/list_folder/continue'
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

DropboxAPI.prototype.listFolder= function(path){

  var deferred = q.defer();
  var callback = function(error, response, obj){
  if(error || _.isString(obj)){
        deferred.reject(obj);
      }else{
        deferred.resolve(obj);
      }  
  };  
  
var targetRequest = request({
  method: 'POST',
  uri: urls.LIST_FOLDER,
  body: {
    path: path
  },
  json: true,
  followRedirect: false, 
  headers: this.config.headers}, callback);
  return deferred.promise;
};

DropboxAPI.prototype.listFolderContinue= function(cursor){

  var deferred = q.defer();
  var callback = function(error, response, obj){
  if(error || _.isString(obj)){
        deferred.reject(obj);
      }else{
        deferred.resolve(obj);
      }  
  };  
  
var targetRequest = request({
  method: 'POST',
  uri: urls.LIST_FOLDER_CONTINUE,
  body: {
    cursor: cursor
  },
  json: true,
  followRedirect: false, 
  headers: this.config.headers}, callback);
  return deferred.promise;
};

DropboxAPI.prototype.downloadFile = function(fileName){
  
  var headers = _.extend({"Dropbox-API-Arg": JSON.stringify({path: '/'+utf8.encode(fileName)})}, this.config.headers);
  console.log(headers);
  return request({
    method: 'POST',
    headers: headers, 
    uri: urls.GET_FILE,
    json:true}, function(e,response,data){
    if(response.headers['content-type'] === 'application/json'){
    
    }
  })
  .on('response', function(response){
    if(response.headers['content-type'] !== 'application/json'){
    
    }
  });
};

DropboxAPI.prototype.removeFile= function(fileName){

  var deferred = q.defer();
  var callback = function(error, response, obj){
  if(error || _.isString(obj)){
        deferred.reject(obj);
      }else{
        deferred.resolve(obj);
      }  
  }; 
  var url = urls.DELETE_FILE_URL;
  
var targetRequest = request({
  method: 'POST',
  uri: url,
  body: {
    path: '/'+fileName
  },
  json: true,
  followRedirect: false, 
  headers: this.config.headers}, callback);
  return deferred.promise;
};

DropboxAPI.prototype.getMetadata= function(fileName){
  var deferred = q.defer();
  var callback = function(error, response, obj){
      if(error || _.isString(obj) || obj.error){
        deferred.reject(obj.error || obj);
      }else{
        deferred.resolve(obj);
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


DropboxAPI.prototype.uploadFile2= function(fileName){

  var uploadUrl = urls.FILE_PUT_URL+ (fileName);
  
var targetRequest = request.post({
  uri: uploadUrl,
  followRedirect: false, 
  headers: this.config.headers}, function(){console.log('ok:P')});

  return targetRequest;
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
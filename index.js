// var xda = require('xda');

var fs = require('fs');
var _ = require('underscore');
var chokidar = require('chokidar');
var zlib = require('zlib');
var crypto = require('crypto');
var through2 = require('through2');
var nconf = require('nconf');
var CryptoManager = require('./src/CryptoManager');
var GoogleDriveManager = require('./src/GoogleDriveManager');

//--------------------------------------------------------------------------------------------
nconf
.argv()
.env()
.file({ file: 'config.json' });


CryptoManager.init(nconf.get('crypto'));

GoogleDriveManager
.authorize(nconf.get('storage:google_drive')).then(function(){
  console.log('authorized');
  init();
  // prepareFileWatchers();
}, function(){
  console.log('not authorized!');
});

//--------------------------------------------------------------------------------------------
function init(){

  var defaultConfig = {
    algorithm: 'aes-256-ctr',
    password: 'd6F3Efeq'
  };

  var encryptedStream = fs.createReadStream('asot.jpg').pipe(CryptoManager.encrypt());

  var fileName = +new Date()+'.jpg';

  GoogleDriveManager.uploadFile(fileName, encryptedStream).then(function(){
    console.log('uploadFile :D');
    GoogleDriveManager.retrieveAllChanges().then(function(result){
      console.log('retrieveAllChanges :D');      
      GoogleDriveManager.getChangeById(result.largestChangeId).then(function(result){
        console.log(result.file.title, fileName);
        console.log(result.file.downloadUrl);

        GoogleDriveManager.downloadFile(result.file.downloadUrl)
        .pipe(CryptoManager.decrypt())
        .pipe(fs.createWriteStream(fileName));

      });
    }, function(){
      console.log('retrieveAllChanges :/');
    });
  },function(){
    console.log('uploadFile :/');
  });

}//init

function listFiles(){
  GoogleDriveManager.listFiles(function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var files = response.items;
        if (files.length == 0) {
          console.log('No files found.');
        } else {
          console.log('Files:');
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log('%s (%s)', file.title, file.id);
          }
        }
});
}



function prepareFileWatchers(){



var watcher = chokidar.watch('fotos', {
  ignored: /[\/\\]\./, persistent: true
});

watcher
  // .on('add', function(path) { 
  //   console.log('File', path, 'has been added');
  // })
  // .on('addDir', function(path) { 
  //   console.log('Directory', path, 'has been added'); 
  // })
  // .on('change', function(path) { console.log('File', path, 'has been changed'); })
  // .on('unlink', function(path) { console.log('File', path, 'has been removed'); })
  // .on('unlinkDir', function(path) { console.log('Directory', path, 'has been removed'); })
  // .on('error', function(error) { console.log('Error happened', error); })
  .on('ready', function() { console.log('Initial scan complete. Ready for changes.'); })
  .on('all', function(event, path){
    console.log(event, path);
  })
  // .on('raw', function(event, path, details) { console.log('Raw event info:', event, path, details); })

}

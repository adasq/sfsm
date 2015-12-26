
var fs = require('fs');
var _ = require('underscore');
var chokidar = require('chokidar');
var EventEmitter = require('events');
var zlib = require('zlib');
var crypto = require('crypto');
var through2 = require('through2');
var nconf = require('nconf');
var path = require('path');
var util = require('util');

var CryptoManager = require('./src/CryptoManager');
var Dropbox = require('./src/Dropbox');
var DirStorageService = require('./src/DirStorageService');
var DropboxStorageService = require('./src/DropboxStorageService');
var GoogleDriveManager = require('./src/GoogleDriveManager');

//--------------------------------------------------------------------------------------------
nconf
.argv()
.env()
.file({ file: 'config.json' });


CryptoManager.init(nconf.get('crypto'));
process.setMaxListeners(0);

const PLAIN_DIR_PATH = 'D:/sfsm-tests/plain' || path.join(__dirname, 'fotos-plain');
const ENC_DIR_PATH = 'C:/Users/adasq/Dropbox/PHOTOS-ENC' || 'D:/sfsm-tests/encrypted' || path.join(__dirname, 'fotos-enc');

var common = {
  prepareEncryptedName: function(plainFileName){
    return plainFileName;
    //return plainFileName + '.enc';
  },
  preparePlainName: function(encryptedFileName){
    return encryptedFileName;
    //return encryptedFileName.substr(0, encryptedFileName.length - 4);
  }
};

//----------------------------------------------------------------------------------------



// dropbox.downloadFile('/1450599864114.jpg')
// .then(function(r){
//   console.log('success', r.headers);
//   r.pipe(fs.createWriteStream('WWWWWWWWWWWWWW.jpg'))
// }, function(err){
//   console.log(err);
// });



//------------------------------------------------------
// var db = new DropboxStorageService({
//   token: nconf.get('dropbox_token')
// });


//fs.createReadStream('D:/sfsm-tests/image1.jpg').pipe(db.saveFile('aaa4.jpg'));
  
// db.fileExists('aaa2.jpg', function(exists){
//   console.log(exists);
// });

// db.removeFile('aaa2.jpg', function(err){
//   console.log(err);
// });

//db.downloadFile('aaaa.jpg').pipe(fs.createWriteStream('test.jpg'));

// dropbox.getMetadata('1450599864114 - Kopia (3).jpg')
// .then(function(result){
//   console.log(result);
// }, function(err){
//   console.log('err',err);
// })


var plainStorageService = new DirStorageService({dirName: PLAIN_DIR_PATH});
var encryptedStorageService = new DirStorageService({dirName: ENC_DIR_PATH});

encryptedStorageService.on('file-added', function(file){
  var encryptedFileName = file.name;
  var plainFileName = common.preparePlainName(encryptedFileName);
  plainStorageService.fileExists(plainFileName, function(exsist){
    if(!exsist){
      file.readStream()
          .pipe(CryptoManager.decrypt())
          .on('error', function(e){ console.log(e); })
          .pipe(plainStorageService.saveFile(plainFileName))
    }
  });
});

plainStorageService.on('file-added', function(file){
  var plainFileName = file.name;
  var encryptedFileName = common.prepareEncryptedName(plainFileName);
  encryptedStorageService.fileExists(encryptedFileName, function(exsist){
    if(!exsist){
        file.readStream()
          .pipe(CryptoManager.encrypt())
          .pipe(encryptedStorageService.saveFile(encryptedFileName))
    }
  });
});

encryptedStorageService.on('file-removed', function(file){
  console.log('encryptedStorageService file-removed');
  var encryptedFileName = file.name;
  var plainFileName = common.preparePlainName(encryptedFileName);
  plainStorageService.removeFile(plainFileName, function(err){
    console.log(plainFileName, 'removed', !!!err);
  });
});

plainStorageService.on('file-removed', function(file){
  console.log('plainStorageService file-removed');
  var plainFileName = file.name;
  var encryptedFileName = common.prepareEncryptedName(plainFileName);
  encryptedStorageService.removeFile(encryptedFileName, function(err){
    console.log(encryptedFileName, 'removed', !!!err);
  });
});



// GoogleDriveManager
// .authorize(nconf.get('storage:google_drive')).then(function(){
//   console.log('authorized');
//   init();
//   // prepareFileWatchers();
// }, function(){
//   console.log('not authorized!');
// });

// function init(){

//   var defaultConfig = {
//     algorithm: 'aes-256-ctr',
//     password: 'd6F3Efeq'
//   };


//   var encryptedStream = fs.createReadStream('asot.jpg').pipe(CryptoManager.encrypt());

//   var fileName = +new Date()+'.jpg';

//   GoogleDriveManager.uploadFile(fileName, encryptedStream).then(function(){
//     console.log('uploadFile :D');
//     GoogleDriveManager.retrieveAllChanges().then(function(result){
//       console.log('retrieveAllChanges :D');      
//       GoogleDriveManager.getChangeById(result.largestChangeId).then(function(result){
//         console.log(result.file.title, fileName);
//         console.log(result.file.downloadUrl);

//         GoogleDriveManager.downloadFile(result.file.downloadUrl)
//         .pipe(CryptoManager.decrypt())
//         .pipe(fs.createWriteStream(fileName));

//       });
//     }, function(){
//       console.log('retrieveAllChanges :/');
//     });
//   },function(){
//     console.log('uploadFile :/');
//   });

// }//init

// dropbox.downloadFile('/1450599864114.jpg')
// .then(function(r){
//   console.log('success', r.headers);
//   r.pipe(fs.createWriteStream('WWWWWWWWWWWWWW.jpg'))
// }, function(err){
//   console.log(err);
// });


// dropbox.uploadFile({
//   name: 'aaaa.jpg',
//   stream: fs.createReadStream('asot2.jpg')
// }).then(function(resp){
//   console.log(resp);
// }, function(e){
//   console.log('errr',e);
// })


// dropbox.getMetadata('1450599864114 - Kopia (3).jpg')
// .then(function(result){
//   console.log(result);
// }, function(err){
//   console.log('err',err);
// })

//return;

// process.setMaxListeners(0);



// fs.createReadStream('asot2.jpg')
// .pipe(CryptoManager.encrypt())
// .pipe(fs.createWriteStream('asot2.jpg!!!!!!!!!'))
// .on('finish', function(){
//   console.log(arguments);
//   setTimeout(function(){
//     fs.unlink('asot2.jpg!!!!!!!!!');
//   }, 6000);
  

// })
//   setInterval(function(){

//   }, 6000);
// return;
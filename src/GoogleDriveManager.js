var google = require('googleapis');
var fs = require('fs');
var q = require('q');
var request = require('request');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var through2 = require('through2');


var service, auth;




module.exports = {
	uploadFile: uploadFile,
	downloadFile: downloadFile,
	authorize: _authorize,
	getChangeById: getChangeById,
	retrieveAllChanges: retrieveAllChanges,
	listFiles: function(cb){
		console.log('============');
		  service.files.list({
		    maxResults: 10
		  }, cb);
	}
};


function uploadFile(name, pipe){
  var deferred = q.defer(); 
  service.files.insert({
    resource: {
      title: name
      // mimeType: 'image/jpg'
    },
    media: {
      // mimeType: 'image/jpg',
      body: pipe // read streams are awesome!
    }
  }, function(err){
  	deferred[err ? 'reject':'resolve']();
  });
  return deferred.promise;
}

function downloadFile(url){
	 return request({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + auth.credentials.access_token,
        // 'Content-Type': 'application/octet-stream'
      }
    }).pipe(through2(function(chunk, enc, callback){
    	this.push(chunk);
    	callback();
    }));
}

function _authorize(client_secret){
		var deferred = q.defer();
		authorize(client_secret, function(_auth){
			auth = _auth;
			service = google.drive({auth: _auth, version: 'v2'});
			deferred.resolve();
		});
		return deferred.promise;
}

function getChangeById(changeId){
	  var deferred = q.defer();
 
 service.changes.get({
    'changeId': changeId
  }, callback);

  function callback(err, result){
  	deferred[err ? 'reject':'resolve'](result || err);
  }
  return deferred.promise;
}

function retrieveAllChanges(startChangeId) {
  var deferred = q.defer();
  if (startChangeId) {
   service.changes.list({
      'startChangeId' : startChangeId
    }, callback);
  } else {
   service.changes.list({}, callback);
  }
  function callback(err, result){
  	deferred[err ? 'reject':'resolve'](result || err);
  }
  return deferred.promise;
 // retrievePageOfChanges(initialRequest, []);
}































/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

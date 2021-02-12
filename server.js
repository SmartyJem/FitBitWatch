//Developer Tool
'use strict';

//Required Libraries
var http = require('http');
var https = require('https');
var url = require('url');

//Webpage Resources and Secret Keys
var resource = require('./resources.js');
var key = require('./keys.js')

//The Webpage IPaddress:Port/Resource
var port = process.env.PORT || 1337;

//Creating the Web Server
var webServer = http.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;

    //Do not worry about requests for Webpage Icons
    if (pathname != '/favicon.ico') {

        if (pathname != '/result') {
            //This is a request that requires rendering a page 
            resource.findPage(req, res, pathname)
        } else {
            //This is used to retrieve the callback URL request
            callRequest(req, res)
        }
        
    }
}).listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

//Create a new Socket
var io = require('socket.io')(webServer);

//When a Browser requests a page from the WebServer
io.on('connect', () => {
    //On the start of the config page
    io.emit('startConfig', key.clientID, key.callbackURL, key.scope, key.expiresIn);

    //On the start of the default page
    io.emit('startOverlay', key.data);
});

async function callRequest(req, res) {
    await getURL(req, res);
    await createKey();
    await getToken();
}

//Retrieves the Authorization Code from the Callback URL
function getURL(req, res) {
    //Strip the Code from the Callback URL
    var urltext = url.parse(req.url).href;
    var code = urltext.replace('/result?code=', '')
    key.authorizationCode = code;

    //Confirm the code has been retrieved to the client
    io.emit('code')

    //Forget the Responce
    res.end()
}

//Encodes the secret key with base64
function createKey() {
    //Create the base64 string used to Authenticate the Token 
    const str = `${key.clientID}:${key.clientsecret}`;
    const buff = Buffer.from(str, 'utf-8');
    key.secretchild = buff.toString('base64');
}

//Retrieves the Authorization Token from a Post request to the OAuth Web API
function getToken() {
    //Authentication
    var authorizationToken = `Basic ${key.secretchild}`;

    //Format the Post Request
    const url = {
        host: 'api.fitbit.com',
        path: `/oauth2/token?grant_type=authorization_code&redirect_uri=${key.callbackURL}&code=${key.authorizationCode}`,
        method: 'POST',
        headers: {
            'Authorization': authorizationToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    //Send a Request to the token Authorization URL
    const req = https.request(url, res => {

        //When a Response is made by the Web API continue the process
        res.on('data', function (chunk) {
            //Grab the Authorization Token
            let json = JSON.parse(chunk);
            key.accessToken = json.access_token;

            //Grab the ID of the owner of the Resource
            key.owner = json.user_id;

            //Confirm the token has been retrieved to the client
            io.emit('token', { urltext: key.accessToken });
            updateJSON();
            //Confirm the overlay is working to the client
            io.emit('json');
        });
    });
    //Forget the Request
    req.end();
}

function updateJSON() {
    //Authentication 
    var secretkey = `Bearer ${key.accessToken}`;

    //Format the GET Request
    const url = {
        host: 'api.fitbit.com',
        path: `/1/user/${key.owner}/activities/heart/date/today/1d.json`,
        method: 'GET',
        headers: {'Authorization': secretkey}
    };

    //Send a Request to the Web API
    const req = https.request(url, res => {
        res.on('data', function (chunk) {
            //Grab the Data from the JSON file
            let json = `${chunk}`;
            key.data = json

            //Send the Data to the Overlay
            io.emit('overlay', { urltext: key.data});
        });
    });

    //Forget the Request
    req.end();
}
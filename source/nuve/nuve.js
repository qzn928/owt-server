/*global require, __dirname, process*/
'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var config = require('./../etc/woogeen_config');
var rpc = require('./rpc/rpc');
var logger = require('./logger').logger;
var log = logger.getLogger('Nuve');

var app = express();

rpc.connect();

var nuveAuthenticator = require('./auth/nuveAuthenticator');

var roomsResource = require('./resource/roomsResource');
var roomResource = require('./resource/roomResource');
var tokensResource = require('./resource/tokensResource');
var servicesResource = require('./resource/servicesResource');
var serviceResource = require('./resource/serviceResource');
var usersResource = require('./resource/usersResource');
var userResource = require('./resource/userResource');
var clusterResource = require('./resource/clusterResource');

app.use('/console', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view options', {
    layout: false
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, authorization, content-type');
    next();
});

app.options('*', function(req, res) {
    res.send(200);
});

app.get('*', nuveAuthenticator.authenticate);
app.post('*', nuveAuthenticator.authenticate);
app.delete('*', nuveAuthenticator.authenticate);
app.put('*', nuveAuthenticator.authenticate);

app.post('/rooms', roomsResource.createRoom);
app.get('/rooms', roomsResource.represent);

app.get('/rooms/:room', roomResource.represent);
app.delete('/rooms/:room', roomResource.deleteRoom);
app.put('/rooms/:room', roomResource.updateRoom);

app.post('/rooms/:room/tokens', tokensResource.create);

app.post('/services', servicesResource.create);
app.get('/services', servicesResource.represent);

app.get('/services/:service', serviceResource.represent);
app.delete('/services/:service', serviceResource.deleteService);

app.get('/rooms/:room/users', usersResource.getList);

app.get('/rooms/:room/users/:user', userResource.getUser);
app.delete('/rooms/:room/users/:user', userResource.deleteUser);

app.get('/cluster/nodes', clusterResource.getNodes);
app.get('/cluster/nodes/:node', clusterResource.getNode);
app.get('/cluster/rooms', clusterResource.getRooms);
app.get('/cluster/nodes/:node/config', clusterResource.getNodeConfig);

if (config.nuve.ssl === true) {
    var cipher = require('./cipher');
    cipher.unlock(cipher.k, '../cert/.woogeen.keystore', function cb (err, obj) {
        if (!err) {
            try {
                require('https').createServer({
                    pfx: require('fs').readFileSync(config.nuve.keystorePath),
                    passphrase: obj.nuve
                }, app).listen(3000);
            } catch (e) {
                err = e;
            }
        }
        if (err) {
            log.warn('Failed to setup secured server:', err);
            return process.exit();
        }
    });
} else {
    app.listen(3000);
}
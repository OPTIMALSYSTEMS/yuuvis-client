var express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
var proxy = require('http-proxy-middleware');

var app = express();
const destPath = path.resolve(__dirname, '..', '..', 'dist', 'yuuvis-flokfugl');
const pathSSLCert = path.resolve(__dirname, 'ssl.crt');
const pathSSLKey = path.resolve(__dirname, 'ssl.key');

// proxy configuration
app.use('/api', proxy({ target: 'http://127.0.0.1:4300', changeOrigin: true }));
app.use('/api-web', proxy({ target: 'http://127.0.0.1:4300', changeOrigin: true }));

// static resources from dist
app.use(express.static(destPath));
// push state
app.get('*', function(request, response) {
  response.sendFile(destPath + '/index.html');
});

// Enable for SSL
https
  .createServer(
    {
      key: fs.readFileSync(pathSSLKey),
      cert: fs.readFileSync(pathSSLCert),
      passphrase: 'optimal'
    },
    app
  )
  .listen(3000);

// app.listen(3000);

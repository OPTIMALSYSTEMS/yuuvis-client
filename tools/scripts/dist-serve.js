var express = require('express');
const path = require('path');
var proxy = require('http-proxy-middleware');

var app = express();
const destPath = path.resolve(__dirname, '..', '..', 'dist', 'yuuvis-flokfugl');

// proxy configuration
app.use('/api', proxy({ target: 'http://127.0.0.1:4300', changeOrigin: true }));
app.use('/api-web', proxy({ target: 'http://127.0.0.1:4300', changeOrigin: true }));

// static resources from dist
app.use(express.static(destPath));
// push state
app.get('*', function(request, response) {
  response.sendFile(destPath + '/index.html');
});
app.listen(3000);

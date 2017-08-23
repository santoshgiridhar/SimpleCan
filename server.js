/**
 * Development Server
 */

// Get list of routes that should serve the app state.
// Route them to the index.html
// Everything else should be routed as static files.

var Path = require('path'),
  Hapi = require('hapi'),
  fs = require('fs'),
  port = process.env.PORT || 8080;

// Parses "components/dashboard/index.html" for local navigation urls
// @return array of local urls for client routing.
function getAppRoutes(fullpath){
  return parseFile(fullpath);
}

function parseFile(fullpath){
  var contents = fs.readFileSync(fullpath, 'utf8');

  var urls = ( contents.match(/href=['"]?\/([^\{\}\s]+)['"]?/g) || []).map(function(a){
    return a.replace(/href=['"']\//, '').replace(/['"]/,'');
  });

  return urls;
}

var app_routes = getAppRoutes(Path.join('./components/dashboard/index.html'));
var server = new Hapi.Server();
server.connection({ port: port });
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    file: function (request) {
      var path = request.params.path;
      if (!path || app_routes.indexOf(path) >= 0) return 'index.html';
      return path;
    }
  }
});
server.start(function () {
  console.log('App routes: /' + app_routes.join(', /'));
  console.log('Server running at:', server.info.uri);
});

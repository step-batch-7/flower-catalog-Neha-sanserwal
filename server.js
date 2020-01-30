const http = require('http');
const { app } = require('./libs/handlers');

const defaultPort = 8000;

const main = function(port = defaultPort) {
  const server = new http.Server(app.serve.bind(app));
  server.listen(port);
};
const [, , port] = process.argv;
main(port);

const { Server } = require("net");
const generatePageResponse = function() {
  const response = [
    "http/1.1 404 NOT FOUND",
    "content-type : text/html",
    "content-length: 0",
    "",
    ""
  ];
  return response.join("\n");
};

const main = function(port) {
  server = new Server();

  server.on("connection", socket => {
    console.warn("server is listening on:", socket.localPort);
    socket.setEncoding("utf8");
    socket.on("close", () => {
      console.warn(`closing ${socket.remotePort}`);
    });
    socket.on("end", () => {
      console.warn(`closing ${socket.remotePort}`);
    });
    socket.on("data", data => {
      socket.write(generatePageResponse());
    });
  });
  server.listen(port);
};

main(process.argv[2]);

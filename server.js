const { Server } = require("net");
const fs = require("fs");
const generatePageResponse = function(data) {
  const [request] = data.split("\n");
  const [method, url] = request.split(" ");
  if (method === "GET" && url === "/") {
    const data = fs.readFileSync("index.html");
    const response = [
      "http/1.1 200 OK",
      "content-type : text/html",
      `content-length: ${data.length}`,
      "",
      ""
    ];
    return { response: response.join("\n"), data };
  }
  const response = [
    "http/1.1 404 NOT FOUND",
    "content-type : text/html",
    "content-length: 0",
    "",
    ""
  ];
  return { response: response.join("\n"), data };
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
      const pageResponse = generatePageResponse(data);
      socket.write(pageResponse.response);
      socket.write(pageResponse.data);
    });
  });
  server.listen(port);
};

main(process.argv[2]);

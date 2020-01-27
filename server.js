const { Server } = require("net");
const fs = require("fs");
const { Response } = require("./response");
const { Request } = require("./request");
const DEFAULT_RESPONSE = {
  protocol: "HTTP/1.1",
  status: "404",
  statusMsg: "NOT FOUND"
};
const DEFAULT_HEADERS = {
  "Content-Type": "text/html",
  "Content-Length": "0"
};
const loadResponseText = function(method, url, newResponse) {
  if (!fs.existsSync(url)) {
    return newResponse.data;
  }
  const [, fileExt] = url.split(".");
  const res = { status: "200", statusMsg: "OK" };
  newResponse.changeResponse(res);
  let body = "";
  if (method == "GET") {
    body = fs.readFileSync(url);
    newResponse.changeBody(body);
  }
  const headers = [
    `Content-Type: text/${fileExt}`,
    `Content-Length: ${body.length}`
  ];
  newResponse.changeHeaders(headers);
  return newResponse.data;
};

const getHeadAndBody = function(headAndBody, line) {
  if (line === "" && !headAndBody.body) {
    headAndBody["body"] = "";
    return headAndBody;
  }
  if ("body" in headAndBody) {
    headAndBody.body += line;
    return headAndBody;
  }
  headAndBody.headers.push(line);
  return headAndBody;
};

const generateRequestData = function(data) {
  const [request, ...headersAndBody] = data.split("\r\n");
  let [method, url, protocol] = request.split(" ");
  const headAndBody = headersAndBody.reduce(getHeadAndBody, { headers: [] });
  const req = { method, url, protocol };
  const newRequest = new Request(req, headAndBody);

  return newRequest;
};

const generatePageResponse = function(data) {
  const newRequest = generateRequestData(data);
  const completeUrl = newRequest.completeUrl;
  const newResponse = new Response(DEFAULT_RESPONSE, DEFAULT_HEADERS, "");
  return loadResponseText(newRequest.method, completeUrl, newResponse);
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
      socket.write(pageResponse.head);
      socket.write("");
      socket.write(pageResponse.body);
    });
  });
  server.listen(port);
};

main(process.argv[2]);

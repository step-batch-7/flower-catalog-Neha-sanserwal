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
const saveComments = function(newRequest) {
  newRequest.changeBody();
  let comments = fs.readFileSync("comments.json", "utf8");
  comments = JSON.parse(comments);
  comments.push(newRequest.body);
  fs.writeFileSync("./comments.json", JSON.stringify(comments));
};

const loadResponseText = function(newRequest, newResponse) {
  if (!fs.existsSync(newRequest.completeUrl)) {
    return newResponse.data;
  }
  if (newRequest.hasMethodPost()) {
    saveComments(newRequest);
  }
  return newResponse.generateGetResponse(newRequest.completeUrl);
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
  const newResponse = new Response(DEFAULT_RESPONSE, DEFAULT_HEADERS, "");
  return loadResponseText(newRequest, newResponse);
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
      console.warn(`ending ${socket.remotePort}`);
    });
    socket.on("data", data => {
      const pageResponse = generatePageResponse(data);
      console.warn(data);
      socket.write(pageResponse.head);
      socket.write(pageResponse.body);
    });
  });
  server.listen(port);
};

main(process.argv[2] || 8000);

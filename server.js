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
const loadComments = function() {
  if (!fs.existsSync("./comments.json")) {
    fs.writeFileSync("./comments.json", JSON.stringify([]));
  }
  let comments = fs.readFileSync("./comments.json", "utf8");
  return JSON.parse(comments);
};

const saveComments = function(newRequest) {
  newRequest.changeBody();
  let comments = loadComments();
  comments.unshift(newRequest.body);
  fs.writeFileSync("./comments.json", JSON.stringify(comments));
};
const readCommentList = function(comment) {
  let commentTemplate = fs.readFileSync("./commentTemplate.html", "utf8");

  for (let key in comment) {
    commentTemplate = commentTemplate.replace(`__${key}__`, comment[key]);
  }
  return commentTemplate;
};

const serveGuestPage = function(newRequest, newResponse) {
  let guestPage = fs.readFileSync(newRequest.completeUrl, "utf8");
  let comments = loadComments();
  let commentsList = comments.map(readCommentList);
  guestPage = guestPage.replace("__COMMENTS__", commentsList.join("\n"));
  return newResponse.generateGetResponse(newRequest.completeUrl, guestPage);
};

const loadResponseText = function(newRequest, newResponse) {
  if (!fs.existsSync(newRequest.completeUrl)) {
    return newResponse.data;
  }
  if (newRequest.hasMethodPost()) {
    saveComments(newRequest);
    return serveGuestPage(newRequest, newResponse);
  }
  let newBody = fs.readFileSync(newRequest.completeUrl);
  return newResponse.generateGetResponse(newRequest.completeUrl, newBody);
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
  let url = newRequest.completeUrl;
  if (newRequest.hasMethodGet() && url.includes("/public/guestBook.html")) {
    return serveGuestPage(newRequest, newResponse);
  }
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
      socket.write(pageResponse.head);
      socket.write(pageResponse.body);
    });
  });
  server.listen(port);
};

main(8000);

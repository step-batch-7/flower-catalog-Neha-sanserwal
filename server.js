const http = require("http");
const fs = require("fs");
const url = require("url");
const STATIC_DIR = `${__dirname}/public`;

const getFileExtension = function(fileName) {
  const [, fileExt] = fileName.split(".");
  return fileExt;
};
const loadOlderComments = function() {
  if (!fs.existsSync("./comments.json")) {
    fs.writeFileSync("./comments.json", JSON.stringify([]));
  }
  let comments = fs.readFileSync("./comments.json", "utf8");
  return JSON.parse(comments);
};
const parseCommentsDetails = function(comment) {
  const resultedBody = url.parse(`?${comment}`, true).query;
  resultedBody.date = new Date().toLocaleDateString();
  resultedBody.time = new Date().toLocaleTimeString();
  return resultedBody;
};
const saveComments = function(newRequest, newResponse) {
  let comment = "";
  newRequest.on("data", chunk => {
    comment += chunk;
  });

  newRequest.on("end", () => {
    let parsedComment = parseCommentsDetails(comment);
    let comments = loadOlderComments();
    comments.unshift(parsedComment);
    fs.writeFileSync("./comments.json", JSON.stringify(comments));
    serveGuestPage(newRequest, newResponse);
  });
};

const readCommentList = function(comment) {
  let commentTemplate = fs.readFileSync("./commentTemplate.html", "utf8");

  for (let key in comment) {
    commentTemplate = commentTemplate.replace(`__${key}__`, comment[key]);
  }
  return commentTemplate;
};

const getCompleteUrl = function(url) {
  let completeUrl = `${STATIC_DIR}${url}`;
  if (url === "/") {
    completeUrl = `${STATIC_DIR}/index.html`;
  }
  return completeUrl;
};

const loadResponseText = function(newRequest, newResponse) {
  let completeUrl = getCompleteUrl(newRequest.url);
  console.log(completeUrl);
  if (!fs.existsSync(completeUrl)) {
    newResponse.writeHead("404", "NOT FOUND");
    newResponse.end();
  }
  if (newRequest.method === "POST") {
    return saveComments(newRequest, newResponse);
  }
  let newBody = fs.readFileSync(completeUrl);
  generateGetResponse(completeUrl, newResponse, newBody);
};

const generateGetResponse = function(url, newResponse, body) {
  const fileExt = getFileExtension(url);
  const statusLine = { statusCode: "200", statusMsg: "OK" };
  newResponse.setHeader("Content-Type", `text/${fileExt}`);
  newResponse.writeHead(statusLine.statusCode, statusLine.statusMsg);
  newResponse.write(body);
  newResponse.end();
};

const serveGuestPage = function(newRequest, newResponse) {
  let completeUrl = getCompleteUrl(newRequest.url);
  let guestPage = fs.readFileSync(completeUrl, "utf8");
  let comments = loadOlderComments();
  let commentsList = comments.map(readCommentList);
  guestPage = guestPage.replace("__COMMENTS__", commentsList.join("\n"));
  generateGetResponse(completeUrl, newResponse, guestPage);
};

const main = function(port) {
  const server = http.createServer();
  server.on("request", (req, res) => {
    if (req.method === "GET" && req.url == "/guestBook.html") {
      return serveGuestPage(req, res);
    }
    return loadResponseText(req, res);
  });
  server.listen(port);
};

main(8000);

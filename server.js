const http = require("http");
const fs = require("fs");
const { Comment } = require("./comments");
const STATIC_DIR = `${__dirname}/public`;
const COMMENTS_FILE = "./comments.json";

const getFileExtension = function(fileName) {
  const [, fileExt] = fileName.split(".");
  return fileExt;
};

const loadOlderComments = function(commentsFile) {
  if (!fs.existsSync(commentsFile)) {
    fs.writeFileSync(commentsFile, JSON.stringify([]));
  }
  let comments = fs.readFileSync(commentsFile, "utf8");
  return JSON.parse(comments);
};

const saveComments = function(newRequest, newResponse) {
  let newComment = new Comment(COMMENTS_FILE);
  newRequest.on("data", chunk => {
    newComment.commentLog = chunk;
  });

  newRequest.on("end", () => {
    newComment.commentsData = loadOlderComments(COMMENTS_FILE);
    newComment.parseCommentDetails();
    newComment.saveComment();
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
const generateGetResponse = function(url, newResponse, body) {
  const fileExt = getFileExtension(url);
  const statusLine = { statusCode: "200", statusMsg: "OK" };
  newResponse.setHeader("Content-Type", `text/${fileExt}`);
  newResponse.writeHead(statusLine.statusCode, statusLine.statusMsg);
  newResponse.write(body);
  newResponse.end();
};

const loadResponseText = function(newRequest, newResponse) {
  let completeUrl = getCompleteUrl(newRequest.url);
  if (!fs.existsSync(completeUrl)) {
    newResponse.writeHead("404", "NOT FOUND");
    newResponse.end();
  }
  if (newRequest.method === "POST") {
    return saveComments(newRequest, newResponse);
  }
  let body = fs.readFileSync(completeUrl);
  generateGetResponse(completeUrl, newResponse, body);
};

const serveGuestPage = function(newRequest, newResponse) {
  let completeUrl = getCompleteUrl(newRequest.url);
  let guestPage = fs.readFileSync(completeUrl, "utf8");
  comments = loadOlderComments(COMMENTS_FILE);
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

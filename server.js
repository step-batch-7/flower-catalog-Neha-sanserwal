const http = require('http');
const fs = require('fs');
const { Comment } = require('./libs/comments');
const STATIC_DIR = `${__dirname}/public`;
const COMMENTS_FILE = `${STATIC_DIR}/docs/comments.json`;

const getFileExtension = function(fileName) {
  const [, fileExt] = fileName.split('.');
  return fileExt;
};
const loadFile = function(filePath, encoding) {
  if (encoding) {
    return fs.readFileSync(filePath, encoding);
  }
  return fs.readFileSync(filePath);
};

const writeTo = function(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
};

const loadOlderComments = function(commentsFile) {
  if (!fs.existsSync(commentsFile)) {
    writeTo(commentsFile, []);
  }
  const comments = loadFile(commentsFile);
  return JSON.parse(comments);
};

const saveComments = function(newRequest, newResponse) {
  const newComment = new Comment(COMMENTS_FILE);
  newRequest.on('data', chunk => {
    newComment.commentLog = chunk;
  });

  newRequest.on('end', () => {
    newComment.commentsData = loadOlderComments(COMMENTS_FILE);
    newComment.parseCommentDetails();
    newComment.append();
    serveGuestPage(newRequest, newResponse);
  });
};

const readCommentList = function(comment) {
  let commentTemplate = loadFile('templates/commentTemplate.html', 'utf8');
  for (const key in comment) {
    commentTemplate = commentTemplate.replace(`__${key}__`, comment[key]);
  }
  return commentTemplate;
};

const getCompleteUrl = function(url) {
  if (url === '/') {
    return `${STATIC_DIR}/index.html`;
  }
  return `${STATIC_DIR}${url}`;
};

const generateGetResponse = function(url, newResponse, body) {
  const fileExt = getFileExtension(url);
  newResponse.setHeader('Content-Type', `text/${fileExt}`);
  newResponse.writeHead('200', 'OK');
  newResponse.write(body);
  newResponse.end();
};

const loadResponseText = function(newRequest, newResponse) {
  const completeUrl = getCompleteUrl(newRequest.url, 'public');
  if (!fs.existsSync(completeUrl)) {
    newResponse.writeHead('404', 'NOT FOUND');
    newResponse.end();
  }
  const body = loadFile(completeUrl);
  generateGetResponse(completeUrl, newResponse, body);
};

const serveGuestPage = function(newRequest, newResponse) {
  const completeUrl = getCompleteUrl(newRequest.url, 'templates');
  let guestPage = loadFile(completeUrl, 'utf8');
  const comments = loadOlderComments(COMMENTS_FILE);
  const commentsList = comments.map(readCommentList);
  guestPage = guestPage.replace('__COMMENTS__', commentsList.join('\n'));
  generateGetResponse(completeUrl, newResponse, guestPage);
};

const main = function(port) {
  const server = http.createServer();
  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/guestBook.html') {
      return serveGuestPage(req, res);
    }
    if (req.method === 'POST') {
      return saveComments(req, res);
    }
    return loadResponseText(req, res);
  });
  server.listen(port);
};

main('8000');

const http = require('http');
const fs = require('fs');
const { Comment } = require('./libs/comments');
const STATIC_DIR = `${__dirname}/public`;
const COMMENTS_FILE = `${STATIC_DIR}/docs/comments.json`;
const { parse } = require('url');

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

const saveComments = function(req, res) {
  let commentText = '';
  req.on('data', chunk => {
    commentText += chunk;
  });

  req.on('end', () => {
    const newEntry = Comment.parseNewEntry(parse, commentText, new Date());
    const commentsLog = loadOlderComments(COMMENTS_FILE);
    const comment = new Comment(commentsLog, newEntry);
    comment.append(COMMENTS_FILE, writeTo);
    serveGuestPage(req, res);
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

const generateGetResponse = function(url, res, body) {
  const fileExt = getFileExtension(url);
  res.setHeader('Content-Type', `text/${fileExt}`);
  res.writeHead('200', 'OK');
  res.write(body);
  res.end();
};

const loadResponseText = function(req, res) {
  const completeUrl = getCompleteUrl(req.url, 'public');
  const body = loadFile(completeUrl);
  generateGetResponse(completeUrl, res, body);
};

const notFound = function(req, res) {
  const completeUrl = getCompleteUrl(req.url, 'public');
  if (!fs.existsSync(completeUrl)) {
    res.writeHead('404', 'NOT FOUND');
    res.end();
  }
};
const serveGuestPage = function(req, res) {
  const completeUrl = getCompleteUrl(req.url, 'templates');
  let guestPage = loadFile(completeUrl, 'utf8');
  const comments = loadOlderComments(COMMENTS_FILE);
  const commentsList = comments.map(readCommentList);
  guestPage = guestPage.replace('__COMMENTS__', commentsList.join('\n'));
  generateGetResponse(completeUrl, res, guestPage);
};
const pickHandler = function(req, res) {
  if (req.method === 'GET' && req.url === '/guestBook.html') {
    return serveGuestPage(req, res);
  }
  if (req.method === 'POST' && req.url === '/guestBook.html') {
    return saveComments(req, res);
  }
  if (fs.existsSync(getCompleteUrl(req.url))) {
    return loadResponseText(req, res);
  }
  return notFound(req, res);
};
const main = function(port) {
  const server = http.createServer();
  server.on('request', (req, res) => {
    pickHandler(req, res);
  });
  server.listen(port);
};

main('8000');

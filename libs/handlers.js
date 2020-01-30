const fs = require('fs');
const { parse } = require('url');
const { App } = require('./app.js');
const { Comment } = require('./comments');

const STATIC_DIR = `${__dirname}/../public`;
const COMMENTS_FILE = `${STATIC_DIR}/docs/comments.json`;

const getFileExtension = function(fileName) {
  const fileExt = fileName.split('.').pop();
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
const saveComment = function(req, res) {
  const newEntry = Comment.parseNewEntry(parse, req.body, new Date());
  const commentsLog = loadOlderComments(COMMENTS_FILE);
  const comment = new Comment(commentsLog, newEntry);
  comment.append(COMMENTS_FILE, writeTo);
  res.writeHead('302', { location: '/guestBook.html' });
  res.end(req.body);
};
const readBody = function(req, res, next) {
  let text = '';
  req.on('data', chunk => {
    text += chunk;
  });

  req.on('end', () => {
    req.body = text;
    next();
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
  res.write(body);
  res.end();
};

const loadResponseText = function(req, res) {
  const completeUrl = getCompleteUrl(req.url);
  const body = loadFile(completeUrl);
  generateGetResponse(completeUrl, res, body);
};

const notFound = function(req, res) {
  const completeUrl = getCompleteUrl(req.url);
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
const app = new App();

app.use(readBody);
app.get('/guestBook.html', serveGuestPage);
app.get('', loadResponseText);
app.post('/guestBook.html', saveComment);
app.use(notFound);

module.exports = { app };

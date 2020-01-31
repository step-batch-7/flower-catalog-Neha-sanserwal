const request = require('supertest');
const { app } = require('../libs/handlers');
const fs = require('fs');
const sinon = require('sinon');

describe('GET request', function() {
  before(() => {
    sinon.replace(fs, 'existsSync', () => {
      return true;
    });
    sinon.replace(fs, 'readFileSync', () => {
      return '[]';
    });
  });
  it('should return index.html when the route is /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-type', 'text/html')
      .expect(200, done);
  });
  it('should download the pdf when clicked on link', function(done) {
    request(app.serve.bind(app))
      .get('/pdfs/Abeliophyllum.pdf')
      .expect('Content-type', 'text/pdf')
      .expect(200, done);
  });
  it('should load css when browser ask for it', function(done) {
    request(app.serve.bind(app))
      .get('/css/flowerPage.css')
      .expect('Content-type', 'text/css')
      .expect(200, done);
  });
  it('should load image when browser ask for it', function(done) {
    request(app.serve.bind(app))
      .get('/images/pbase-Abeliophyllum.jpg')
      .expect('Content-type', 'text/jpg')
      .expect(200, done);
  });
  it('should load js files when browser ask for it', function(done) {
    request(app.serve.bind(app))
      .get('/js/animateJar.js')
      .expect('Content-type', 'text/js')
      .expect(200, done);
  });
  it('should return guest with comments when the route is /guestBook.html', function(done) {
    request(app.serve.bind(app))
      .get('/guestBook.html')
      .expect('Content-type', 'text/html')
      .expect(200, done);
  });
  after(() => {
    sinon.restore();
  });
});

describe('not found ', function() {
  it('should give error of not found when the file is not present', function(done) {
    request(app.serve.bind(app))
      .get('/abc.s')
      .expect(404, done);
  });
});

describe('Bad request', function() {
  it('should not allow methods on page which are not allowed', function(done) {
    request(app.serve.bind(app))
      .put('/')
      .send({ name: 'john' })
      .expect(400, done);
  });
});

describe('POST request', function() {
  before(() => {
    sinon.replace(fs, 'existsSync', () => {
      return true;
    });
    sinon.replace(fs, 'readFileSync', () => {
      return '[]';
    });
    sinon.replace(fs, 'writeFileSync', () => {});
  });
  it('should post the comment', function(done) {
    request(app.serve.bind(app))
      .post('/guestBook.html')
      .send({ username: 'john', comment: 'hello' })
      .expect(302, done);
  });
  after(() => {
    sinon.restore();
  });
});

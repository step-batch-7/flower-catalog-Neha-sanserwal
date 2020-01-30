const request = require('supertest');

const { app } = require('../libs/handlers');

describe('GET request', function() {
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
  it('should give error of not found when the file is not present', function(done) {
    request(app.serve.bind(app))
      .get('/abc.s')
      .expect(404, done);
  });
});

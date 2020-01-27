const STATIC_DIR = `${__dirname}/public`;
class Request {
  constructor(req, headAndBody) {
    this.method = req.method;
    this.url = req.url;
    this.protocol = req.protocol;
    this.headers = [...headAndBody.headers];
    this.body = headAndBody.body;
  }
  get data() {
    const reqMessage = `${this.method} ${this.url} ${this.protocol}`;
    const head = `${reqMessage}\n${this.headers.join("\n")}`;
    const body = this.body;
    return { head, body };
  }
  hasMethodPost() {
    return this.method === "POST";
  }
  get completeUrl() {
    let completeUrl = `${STATIC_DIR}${this.url}`;
    if (this.url === "/") {
      completeUrl = `${STATIC_DIR}/index.html`;
    }
    return completeUrl;
  }
}

module.exports = { Request };

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

  get completeUrl() {
    let completeUrl = `${STATIC_DIR}${this.url}`;
    if (this.url === "/") {
      completeUrl = `${STATIC_DIR}/index.html`;
    }
    return completeUrl;
  }

  hasMethodPost() {
    return this.method === "POST";
  }

  hasMethodGet() {
    return this.method === "GET";
  }

  changeBody() {
    const resultedBody = {};
    const formDetails = this.body.split("&");
    for (let detail of formDetails) {
      let [key, value] = detail.split("=");
      resultedBody[key] = value;
    }
    this.body = resultedBody;
  }
}

module.exports = { Request };

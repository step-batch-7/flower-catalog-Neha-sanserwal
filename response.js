class Response {
  constructor(res, headers, body) {
    this.status = res.status;
    this.statusMsg = res.statusMsg;
    this.protocol = res.protocol;
    this.headers = { ...headers };
    this.body = body;
  }
  stringifyHeaders() {
    let stringifiedHeaders = "";
    for (let key in this.headers) {
      stringifiedHeaders = `${stringifiedHeaders}${key} : ${this.headers[key]}\n`;
    }
    return stringifiedHeaders;
  }

  get data() {
    const msg = `${this.protocol} ${this.status} ${this.statusMsg}`;
    const head = `${msg}\n${this.stringifyHeaders()}\n`;
    const body = this.body;
    return { head, body };
  }

  changeResponse(res) {
    for (let key in res) {
      this[key] = res[key];
    }
  }
  changeHeaders(headers) {
    for (let KeyValues of headers) {
      let [key, value] = KeyValues.split(": ");
      this.headers[key] = value;
    }
  }
  changeBody(body) {
    this.body = body;
  }
}
module.exports = { Response };

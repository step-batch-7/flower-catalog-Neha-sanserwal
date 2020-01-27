const fs = require("fs");
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
      stringifiedHeaders = `${stringifiedHeaders}${key} : ${this.headers[key]}\r\n`;
    }
    return stringifiedHeaders;
  }

  get data() {
    const msg = `${this.protocol} ${this.status} ${this.statusMsg}`;
    const head = `${msg}\r\n${this.stringifyHeaders()}\r\n`;
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
  changeBody(newBody) {
    this.body = newBody;
  }
}
module.exports = { Response };

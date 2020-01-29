const { parse } = require("url");
const fs = require("fs");
class Comment {
  constructor(path) {
    this.commentsFile = path;
    this.commentLogs = [];
    this.commentDetails = {};
    this.commentLine = "";
  }
  set commentLog(chunk) {
    this.commentLine = this.commentLine + chunk;
    return;
  }
  set commentsData(data) {
    this.commentLogs = [...data];
  }
  append() {
    this.commentLogs.unshift(this.commentDetails);
    fs.writeFileSync(this.commentsFile, JSON.stringify(this.commentLogs));
  }
  parseCommentDetails() {
    this.commentDetails = parse(`?${this.commentLine}`, true).query;
    this.commentDetails.date = new Date().toLocaleDateString();
    this.commentDetails.time = new Date().toLocaleTimeString();
  }
}
module.exports = {
  Comment
};

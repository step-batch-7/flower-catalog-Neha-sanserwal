class Comment {
  constructor(logs, newEntry) {
    this.commentLogs = logs;
    this.newEntry = newEntry;
  }

  static parseNewEntry(parser, text, nowDate) {
    const newEntry = { ...parser(`?${text}`, true).query };
    newEntry.time = nowDate().toLocaleTimeString();
    newEntry.date = nowDate().toLocaleDateString();
    return newEntry;
  }

  append(file, writer) {
    this.commentLogs.unshift(this.newEntry);
    writer(file, this.commentLogs);
  }
}
module.exports = {
  Comment
};

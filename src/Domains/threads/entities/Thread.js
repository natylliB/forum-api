const Comment = require("../../comments/entities/Comment");

class Thread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = [];
  }

  setComments(val) {
    if (!Array.isArray(val) || val.some((comment) => !(comment instanceof Comment))) {
      throw new Error('THREAD.COMMENTS_MUST_BE_AN_ARRAY_OF_COMMENT');
    }

    this.comments = val.sort((a, b) => a.date > b.date ? 1 : -1);
  }

  _verifyPayload({ id, title, body, date, username }) {
    const requiredProperties = [ id, title, body, date, username ];

    if (requiredProperties.some((prop) => typeof prop === 'undefined')) {
      throw new Error('THREAD.NOT_CONTAINING_REQUIRED_PROPERTY');
    }

    const isDataTypeViolated = requiredProperties.some((prop) => {
      if (prop === date) {
        return !(prop instanceof Date);
      }
      return typeof prop !== 'string';
    });

    if (isDataTypeViolated) {
      throw new Error('THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Thread;

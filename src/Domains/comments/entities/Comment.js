const Reply = require("../../replies/entities/Reply");

class Comment {
  constructor(payload){
    this._validatePayload(payload);

    const { id, content, is_delete, username, date } = payload;

    this.id = id;
    this.username = username;
    this.date = date.toISOString();
    this.replies = [];
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.likeCount = 0;
  }

  setReplies(val) {
    if (!Array.isArray(val) || val.some((reply) => !(reply instanceof Reply))) {
      throw new Error('COMMENT.REPLIES_MUST_BE_AN_ARRAY_OF_REPLY');
    }

    this.replies = val.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  setLikeCount(val) {
    if (typeof val !== 'number') {
      throw new Error('COMMENT.LIKE_COUNT_MUST_BE_A_NUMBER');
    }

    this.likeCount = val;
  }

  _validatePayload({ id, content, username, date, is_delete }){
    const requiredProperty = [ id, content, username, date, is_delete ];
    if (requiredProperty.some(prop => typeof prop === 'undefined')) {
      throw new Error('COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
    }

    const isDataTypeViolated = requiredProperty.some((prop) => {
      if (prop === date) {
        return !(prop instanceof Date);
      }
      if (prop === is_delete) {
        return typeof prop !== 'boolean';
      }

      return typeof prop !== 'string';
    });

    if (isDataTypeViolated) {
      throw new Error('COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
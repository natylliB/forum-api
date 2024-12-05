class CommentLike {
  constructor(payload) {
    this._validatePayload(payload);

    const { threadId, commentId, userId } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.userId = userId;
  }

  _validatePayload({ threadId, commentId, userId }) {
    const requiredProperties = [ threadId, commentId, userId ];

    if (requiredProperties.some((prop) => typeof prop === 'undefined')) {
      throw new Error('COMMENT_LIKE.NOT_CONTAIN_REQUIRED_PROPERTY');
    }

    if (requiredProperties.some((prop) => typeof prop !== 'string')) {
      throw new Error('COMMENT_LIKE.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentLike;

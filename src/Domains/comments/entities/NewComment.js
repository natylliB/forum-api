class NewComment {
  constructor(payload) {
    this._validatePayload(payload);
  }

  _validatePayload({ thread_id, content, owner }) {
    if (typeof thread_id === 'undefined' || typeof content === 'undefined' || typeof owner === 'undefined') {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    if (typeof thread_id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;

class AddedComment {
  constructor(payload) {
    this._validatePayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _validatePayload({ id, content, owner }) {
    if (typeof id === 'undefined' || typeof content === 'undefined' || typeof owner === 'undefined') {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedComment;

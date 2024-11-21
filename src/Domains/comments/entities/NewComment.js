class NewComment {
  constructor(payload) {
    this._validatePayload(payload);
    
    const { thread_id, content, owner, date } = payload;

    this.thread_id = thread_id;
    this.content = content;
    this.owner = owner;
    this.date = date
  }

  _validatePayload({ thread_id, content, owner, date }) {
    const requiredProperty = [ thread_id, content, owner, date ];

    if (requiredProperty.some(prop => typeof prop === 'undefined')) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    if (requiredProperty.some(prop => typeof prop !== 'string')) {
      throw new Error('NEW_COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;

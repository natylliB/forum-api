class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { comment_id, content, owner, date } = payload;

    this.comment_id = comment_id;
    this.content = content;
    this.owner = owner;
    this.date = date;
  }
  _verifyPayload({ comment_id, content, owner, date }) {
    const requiredProperties = [ comment_id, content, owner, date ];

    if (typeof content === 'undefined') {
      throw new Error('NEW_REPLY.CONTENT_UNDEFINED');
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_REPLY.CONTENT_NOT_MET_DATA_TYPE_SPECIFICATION');
    }

    if (requiredProperties.some(property => typeof property === 'undefined')) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    
    if (requiredProperties.some(property => typeof property !== 'string')) {
      throw new Error('NEW_REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;

class Reply {
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
    if (requiredProperties.some(property => typeof property === 'undefined')) {
      throw new Error('REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    if (requiredProperties.some(property => typeof property !== 'string')) {
      throw new Error('REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;

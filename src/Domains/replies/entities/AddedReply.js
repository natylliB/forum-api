class AddedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ id, content, owner }) {
    const requiredProperties = [ id, content, owner ];
    if (requiredProperties.some(property => typeof property === 'undefined')) {
      throw new Error('ADDED_REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
    }
    if(requiredProperties.some(property => typeof property !== 'string')) {
      throw new Error('ADDED_REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedReply;

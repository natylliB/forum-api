class Reply {
  constructor(payload) {
    this._validatePayload(payload);

    const { id, content, date, username, is_delete } = payload;

    this.id = id;
    this.content = is_delete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
  }

  _validatePayload({ id, content, date, username, is_delete }) {
    const requiredProperty = [ id, content, date, username, is_delete ];

    if (requiredProperty.some((prop) => typeof prop === 'undefined')) {
      throw new Error('REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
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
      throw new Error('REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
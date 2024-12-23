class NewThread {
  constructor(payload) {
    this._validatePayload(payload);

    const { body, title, owner, date } = payload;

    this.body = body;
    this.title = title;
    this.owner = owner;
    this.date = date;
  }

  _validatePayload({ title, body, owner, date }) {
    const requiredProperties = [ title, body, owner, date ];

    if (requiredProperties.some(property => typeof property === 'undefined')) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_REQUIRED_PROPERTY');
    }

    if (requiredProperties.some(property => typeof property !== 'string')) {
      throw new Error('NEW_THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;

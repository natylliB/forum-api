class Thread {
  constructor(payload) {
    this._validatePayload(payload);

    const { body, title, owner } = payload;

    this.body = body;
    this.title = title;
    this.owner = owner;
  }

  _validatePayload({ title, body, owner }) {
    if (typeof title === 'undefined' || typeof body === 'undefined' || typeof owner === 'undefined') {
      throw new Error('THREADS.NOT_CONTAIN_REQUIRED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string') {
      throw new Error('THREADS.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Thread;

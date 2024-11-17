class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, owner } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
  }
  _verifyPayload({ id, title, owner }) {
    if (typeof id === 'undefined' || typeof title === 'undefined' || typeof owner === 'undefined') {
      throw new Error('ADDED_THREAD.NOT_CONTAIN_REQUIRED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedThread;

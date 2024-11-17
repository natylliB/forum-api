const AddedThread = require('../AddedThread');

describe('AddedThread { id, title, owner } object', () => {
  it('should throw error when missing required property', () => {
    const payload = {
      id: 'thread-123',
      title: 'Some Topic',
    };

    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_CONTAIN_REQUIRED_PROPERTY');
  });
  it('should throw error when property not met data type specification', () => {
    const payload = {
      id: 'tread-123', 
      title: 'Some Topic',
      owner: 123,
    };

    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });
  it('should create addedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Some Topic',
      owner: 'user-123',
    };

    const { id, title, owner } = new AddedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});

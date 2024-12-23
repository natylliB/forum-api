const NewThread = require('../NewThread');

describe('Threads { title, body, owner } object', () => {
  it('should throw error when missing property required', () => {
    const payload = {
      title: 'Some Topic',
      body: 'Some Content',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    const payload = {
      title: 'Some Topic',
      body: 'Some content',
      owner: 123,
      date: new Date().toISOString(),
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread object correctly', () => {
    const payload = {
      title: 'Some Topic', 
      body: 'Some Content',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    const { title, body, owner, date } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
    expect(date).toEqual(payload.date);
  });
});
const Thread = require('../Thread');

describe('Threads { title, body, owner } object', () => {
  it('should throw error when missing property required', () => {
    const payload = {
      title: 'Some Topic',
      body: 'Some Content',
    };

    expect(() => new Thread(payload)).toThrowError('THREADS.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    const payload = {
      title: 'Some Topic',
      body: 'Some content',
      owner: 123,
    };

    expect(() => new Thread(payload)).toThrowError('THREADS.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread object correctly', () => {
    const payload = {
      title: 'Some Topic', 
      body: 'Some Content',
      owner: 'user-123',
    };

    const { title, body, owner } = new Thread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
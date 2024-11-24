const Reply = require('../Reply');

// const payload = {
//   id: 'reply-123',
//   content: 'A Reply',
//   date: new Date(),
//   username: 'billy',
//   is_delete: false,
// }

describe('Reply {id, content, date, username, is_delete } object', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
      username: 'billy',
      is_delete: false,
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrow('REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
      date: new Date().toISOString(), // must be instanceof Date!
      username: 'billy',
      is_delete: false, // must be typeof boolean!
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrow('REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should block out content when is_delete is true', async () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
      date: new Date(),
      username: 'billy',
      is_delete: true,
    };

    // Action
    const { content } = new Reply(payload);

    // Assert
    expect(content).toEqual('**balasan telah dihapus**');
  });

  it('should create reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
      date: new Date(),
      username: 'billy',
      is_delete: false,
    };

    // Action
    const { id, content, date, username } = new Reply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});


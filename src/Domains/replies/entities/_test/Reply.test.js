const Reply = require('../Reply');

describe('Reply object { comment_id, content, owner, date }', () => {
  it('should throw error when not contain required property', () => {
    // Arrange
    const payload = {
      comment_id: 'comment-123',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
  });
  it('should throw error when property not met data type specifications', () => {
    const payload = {
      comment_id: 123,
      content: 'A Reply',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });
  it('should create Reply object correctly', () => {
    // Arrange
    const payload = {
      comment_id: 'comment-123',
      content: 'A Reply',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action
    const { comment_id, content, owner, date } = new Reply(payload);

    // Assert
    expect(comment_id).toEqual(payload.comment_id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(date).toEqual(payload.date);
  })
});
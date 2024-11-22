const AddedReply = require('../AddedReply');

describe('AddedReply object { id, content, owner }', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
  });
  it('should throw error when property data type specification not met', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: {},
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });
  it('should create AddedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A Reply',
      owner: 'user-123',
    };

    // Action
    const { id, content, owner } = new AddedReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
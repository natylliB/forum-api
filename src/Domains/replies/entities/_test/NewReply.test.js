const NewReply = require('../NewReply');

describe('Reply object { comment_id, content, owner, date }', () => {
  it('should throw error when not contain required property', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
      content: 'A cool reply',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specifications', () => {
    const payload = {
      comment_id: 123,
      content: 'A cool reply',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when reply content is missing', () => {
    // Arrange
    const payload = {
      comment_id: 'comment-123',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.CONTENT_UNDEFINED');
  });

  it('should throw error when reply content not met data type specification', () => {
    // Arrange
    const payload = {
      comment_id: 'comment-123',
      content: [''],
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert 
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.CONTENT_NOT_MET_DATA_TYPE_SPECIFICATION');
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
    const { comment_id, content, owner, date } = new NewReply(payload);

    // Assert
    expect(comment_id).toEqual(payload.comment_id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(date).toEqual(payload.date);
  })
});
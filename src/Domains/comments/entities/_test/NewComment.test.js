const NewComment = require('../NewComment');

describe('NewComment{ thread_id, content, owner, date } object', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload ={
      thread_id: 'thread-123',
      content: 'Some Comment',
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    // Arrange 
    const payload = {
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 123,
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when property content is missing', () => {
    // Arrange
    const payload = {
      thread_id: 'thread-123',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.CONTENT_UNDEFINED');
  });

  it('should throw error when property content not met data type specification', () => {
    // Arange
    const payload = {
      thread_id: 'thread-123',
      content: [''],
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.CONTENT_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    const payload = {
      thread_id: 'tread-123',
      content: 'Some Comment',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    // Action
    const { thread_id, content, owner, date } = new NewComment(payload);

    // Assert
    expect(thread_id).toEqual(payload.thread_id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(date).toEqual(payload.date);
  });
});
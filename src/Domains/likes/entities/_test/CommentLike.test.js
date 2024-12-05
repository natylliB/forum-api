const CommentLike = require('../CommentLike');

describe('CommentLike object { threadId, commentId, userId }', () => {
  it('should throw error when not containing required property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property data type specification not met', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: [''],
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });
  
  it('should create CommentLike object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action 
    const { threadId, commentId, userId } = new CommentLike(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(userId).toEqual(payload.userId);
  });
});
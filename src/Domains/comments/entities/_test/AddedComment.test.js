const AddedComment = require('../AddedComment');

describe('AddedComment { id, content, owner } ', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
  });
  it('should throw error when property not met data type specification', () => {
    // Arrange
    const payload = {
      id: [],
      content: 'Some Comment',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });
  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Some Comment', 
      owner: 'user-123',
    };

    // Action 
    const { id, content, owner } = new AddedComment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    const commentRepository = new CommentRepository();
    
    await expect(commentRepository.addComment()).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
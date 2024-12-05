const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository Interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    // Arrange
    const commentLikeRepository = new CommentLikeRepository();

    // Action & Assert
    await expect(
      commentLikeRepository.addCommentLike('', '')
    ).rejects.toThrowError(
      'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );

    await expect(
      commentLikeRepository.deleteCommentLike('', '')
    ).rejects.toThrowError(
      'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );

    await expect(
      commentLikeRepository.isCommentLiked('', '')
    ).rejects.toThrowError(
      'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );

    await expect(
      commentLikeRepository.getCommentLikeCountsByCommentIds('')
    ).rejects.toThrowError(
      'COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  })
})
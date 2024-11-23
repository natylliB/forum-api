const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('Delete Comment Use Case', () => {
  it('should orchestrate the delete comment process correctly', async () => {
    // Arrange
    /** Mock Required Depdencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mock required depedencies functions */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();
    mockCommentRepository.checkCommentAvailabilityInThread = jest.fn().mockResolvedValue();
    mockCommentRepository.checkCommentOwnership = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn().mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({ 
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository, 
    });

    // Action
    await expect(deleteCommentUseCase.execute('threadId', 'commentId', 'userId')).resolves.not.toThrow();

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('threadId');
    expect(mockCommentRepository.checkCommentAvailabilityInThread).toBeCalledWith('commentId', 'threadId');
    expect(mockCommentRepository.checkCommentOwnership).toBeCalledWith('commentId', 'userId');
    expect(mockCommentRepository.deleteComment).toBeCalledWith('commentId');
  });
})
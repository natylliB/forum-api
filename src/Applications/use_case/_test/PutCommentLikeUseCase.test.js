const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const PutCommentLikeUseCase = require("../PutCommentLikeUseCase");

describe('PutCommentLikeUseCase', () => {
  it('should orchestrate like comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** mock required depedencies function */
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailabilityInThread = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.isCommentLiked = jest.fn(() => Promise.resolve(false));
    mockCommentLikeRepository.addCommentLike = jest.fn(() => Promise.resolve());

    const putCommentLikeUseCase = new PutCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await putCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailabilityInThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockCommentLikeRepository.isCommentLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.addCommentLike).toBeCalledWith('comment-123', 'user-123');
  });

  it('should orchestrate unlike comment correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();
 
    /** mock required depedencies function */
    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailabilityInThread = jest.fn(() => Promise.resolve());
    mockCommentLikeRepository.isCommentLiked = jest.fn(() => Promise.resolve(true));
    mockCommentLikeRepository.deleteCommentLike = jest.fn(() => Promise.resolve());

    const putCommentLikeUseCase = new PutCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await putCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailabilityInThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockCommentLikeRepository.isCommentLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.deleteCommentLike).toBeCalledWith('comment-123', 'user-123');
  });
});
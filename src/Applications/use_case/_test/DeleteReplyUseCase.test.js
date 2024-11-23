const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply process correctly', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue(true);
    mockCommentRepository.checkCommentAvailabilityInThread = jest.fn().mockResolvedValue(true);
    mockReplyRepository.checkReplyAvailabilityInComment = jest.fn().mockResolvedValue(true);
    mockReplyRepository.checkReplyOwnership = jest.fn().mockResolvedValue(true);
    mockReplyRepository.deleteReply = jest.fn().mockResolvedValue();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    })).resolves.not.toThrow();
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailabilityInThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockReplyRepository.checkReplyAvailabilityInComment).toBeCalledWith('reply-123', 'comment-123');
    expect(mockReplyRepository.checkReplyOwnership).toBeCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.deleteReply).toBeCalledWith('reply-123');
  });
})
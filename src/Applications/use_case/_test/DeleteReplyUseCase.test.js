const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw NotFoundError when the thread is not valid', async () => {
    //Arrange
    /** Mock the required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** Mock the required depedencies functions*/ 
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(false);

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute({
      threadId: 'unknown-thread',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    })).rejects.toThrowError(new NotFoundError('Thread tidak ditemukan'));
  });

  it('should throw NotFoundError when comment of the reply is not valid', async () => {
    // Arrange
    /** Mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(false);

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute({
      threadId: 'thread-123',
      commentId: 'invalid-comment',
      replyId: 'reply-123',
      owner: 'user-123',
    })).rejects.toThrowError(new NotFoundError('Komentar tidak ditemukan'));
  });

  it('should throw NotFoundError when the reply you want to delete is not valid', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockReplyRepository.isReplyAvailableInComment = jest.fn().mockResolvedValue(false);

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123', 
      replyId: 'invalid-reply',
      owner: 'user-123',
    })).rejects.toThrowError(new NotFoundError('Balasan komentar tidak ditemukan'));
  })

  it('should throw AuthorizationError when deleting reply not your own', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockReplyRepository.isReplyAvailableInComment = jest.fn().mockResolvedValue(true);
    mockReplyRepository.isReplyOwnerValid = jest.fn().mockResolvedValue(false);

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
      owner: 'unauthorized-user',
    })).rejects.toThrowError(new AuthorizationError('Anda tidak berhak untuk mengubah balasan komentar ini'));
  });

  it('should orchestrate the delete reply process correctly', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockReplyRepository.isReplyAvailableInComment = jest.fn().mockResolvedValue(true);
    mockReplyRepository.isReplyOwnerValid = jest.fn().mockResolvedValue(true);
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
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.isCommentAvailableInThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockReplyRepository.isReplyAvailableInComment).toBeCalledWith('reply-123', 'comment-123');
    expect(mockReplyRepository.isReplyOwnerValid).toBeCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.deleteReply).toBeCalledWith('reply-123');
  });
})
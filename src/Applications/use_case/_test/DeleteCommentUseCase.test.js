const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('Delete Comment Use Case', () => {
  it('should throw NotFoundError when the thread of the comment you want to delete is not found', async () => {
    // Arrange
    /** Mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    
    /** Mock required depedencies function */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(false);

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {}
    });

    // Action & Assert 
    /** deleteCommentUseCase.execute(threadId, commentId, userId) */
    await expect(deleteCommentUseCase.execute(undefined, '', '')).rejects.toThrowError(NotFoundError);
  });
  it('should throw NotFoundError when the comment you want to delete is not found', async () => {
    // Arrange
    /** Mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(false);

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    /** deleteCommentUsecase.execute(threadId, commentId, userId) */
    await expect(deleteCommentUseCase.execute('threadId', undefined, '')).rejects.toThrowError(NotFoundError);
  });
  it('should throw AuthorizationError when trying to delete comment not your own', async () => {
    // Arrange
    /** Mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mock required depedencies functions */
    mockThreadRepository.isThreadAvailable =  jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockCommentRepository.checkCommentOwnership = jest.fn()
      .mockRejectedValue(
        new AuthorizationError('Anda tidak berhak melakukan perubahan pada komentar ini')
      );
    
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    /** deleteCommentUseCase.execute(threadId, commentId, userId) */
    await expect(
      deleteCommentUseCase.execute('threadId', 'commentId', undefined)
    ).rejects.toThrowError(
      new AuthorizationError('Anda tidak berhak melakukan perubahan pada komentar ini')
    );
  });
  it('should orchestrate the delete comment process correctly', async () => {
    // Arrange
    /** Mock Required Depdencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** Mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockCommentRepository.checkCommentOwnership = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn().mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({ 
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository, 
    });

    // Action
    await expect(deleteCommentUseCase.execute('threadId', 'commentId', 'userId')).resolves.not.toThrow();

    // Assert
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('threadId');
    expect(mockCommentRepository.isCommentAvailableInThread).toBeCalledWith('commentId', 'threadId');
    expect(mockCommentRepository.checkCommentOwnership).toBeCalledWith('commentId', 'userId');
    expect(mockCommentRepository.deleteComment).toBeCalledWith('commentId');
  });
})
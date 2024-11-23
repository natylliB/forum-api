const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('AddCommentUseCase', () => {
  it('should throw not found error when the thread to add is not available', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-unavailable',
      content: 'Some Comment',
      owner: 'user-123',
      date: new Date().toISOString(),
    };

    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies function */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockRejectedValue(new NotFoundError('Thread tidak ditemukan'));

    const addCommentUseCase = new AddCommentUseCase({ 
      commentRepository: {}, 
      threadRepository: mockThreadRepository, 
    });

    // Assert
    await expect(addCommentUseCase.execute(
      useCasePayload
    )).rejects.toThrowError(new NotFoundError('Thread tidak ditemukan'));
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-unavailable');
  });

  it('should throw Invariant Error when there is no comment', async () => {
    // Arrange
    const addCommentTimestamp = new Date().toISOString();
    const useCasePayload = {
      thread_id: 'thread-123',
      owner: 'user-123',
      date: addCommentTimestamp,
    };

    /** Mock required depedencies */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies funtions */
    mockCommentRepository.addComment = jest.fn().mockRejectedValue(
      new InvariantError('Tidak dapat menambahkan komentar, karena properti yang dibutuhkan tidak ada')
    );
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(
      new InvariantError('Tidak dapat menambahkan komentar, karena properti yang dibutuhkan tidak ada')
    );
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      owner: 'user-123',
      date: addCommentTimestamp,
    }));
  });

  it('should throw Invariant Error when comment not met data type specification', async () => {
    // Arrange
    const addCommentTimestamp = new Date().toISOString();
    const useCasePayload = {
      thread_id: 'thread-123',
      content: [''],
      owner: 'user-123',
      date: addCommentTimestamp,
    };

    /** mock required depedencies */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies functions */
    mockCommentRepository.addComment = jest.fn().mockRejectedValue(
      new InvariantError('Tidak dapat menambahkan komentar, karena tipe data tidak sesuai')
    );
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();
    
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(
      new InvariantError('Tidak dapat menambahkan komentar, karena tipe data tidak sesuai')
    );
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      content: [''],
      owner: 'user-123',
      date: addCommentTimestamp,
    }));
  });

  it('should throw invariant error when comment is empty string', async () => {
    // Assert
    const addCommentTimestamp = new Date().toISOString();
    const payload = {
      thread_id: 'thread-123',
      content: '',
      owner: 'user-123',
      date: addCommentTimestamp,
    };

    /** mock required depedencies */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies functions */
    mockCommentRepository.addComment = jest.fn().mockRejectedValue(
      new InvariantError('Tidak dapat menambahkan komentar, komentar tidak boleh kosong')
    );
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(payload)).rejects.toThrowError(
      new InvariantError('Tidak dapat menambahkan komentar, komentar tidak boleh kosong')
    );
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      content: '',
      owner: 'user-123',
      date: addCommentTimestamp,
    }));
  });

  it('should orchestrate add comment to threat correctly', async () => {
    // Arrange
    const addCommentTimestamp = new Date().toISOString();
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 'user-123',
      date: addCommentTimestamp,
    };

    /** Mock required depedencies */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** Mock required depedencies function */
    mockCommentRepository.addComment = jest.fn().mockResolvedValue(
      new AddedComment({
        id: 'comment-123',
        content: 'Some Comment',
        owner: 'user-123',
      })
    );

    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue(true);

    const addCommentUseCase = new AddCommentUseCase({ 
      commentRepository: mockCommentRepository, 
      threadRepository: mockThreadRepository 
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 'user-123',
      date: addCommentTimestamp,
    }));
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: 'Some Comment',
        owner: 'user-123',
      })
    );
  });
});

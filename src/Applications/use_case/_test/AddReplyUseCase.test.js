const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

jest.mock('../../../Domains/replies/entities/Reply');

describe('AddReplyUseCase', () => {
  it('should throw NotFoundError when the thread is not valid', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(false);

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: {},
      replyRepository: {}
    });

    // Action & Assert
    /** addReplyUseCase.execute({ thread_id, comment_id, content, owner, date }) */
    await expect(
      addReplyUseCase.execute({
        thread_id: 'invalidThreadId', 
        comment_id: 'commentId', 
        content: 'reply',
        owner: 'owner',
        date: 'some ISO date',
      })
    ).rejects.toThrowError(
      new NotFoundError('Thread tidak ditemukan')
    );
  });

  it('should throw NotFoundError when the comment to reply is not valid', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(false);

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    /** addReplyUseCase.execute({ thread_id, comment_id, content, owner, date }) */
    await expect(
      addReplyUseCase.execute({
        thread_id: 'threadId', 
        comment_id: 'invalidCommentId', 
        content: 'reply',
        owner: 'owner',
        date: 'some ISO date'
      })
    ).rejects.toThrowError(
      new NotFoundError('Komentar tidak ditemukan')
    );
  });

  it('should throw InvariantError when reply is missing', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    /** addReplyUseCase.execute({ thread_id, comment_id, content, owner, date }) */
    await expect(
      addReplyUseCase.execute({
        thread_id: 'thread-123',
        comment_id: 'comment-123',
        owner: 'user-123',
        date: 'some ISO date',
      })
    ).rejects.toThrowError(
      new InvariantError('Tidak ada balasan komentar')
    );
  });

  it('should throw InvariantError when reply is not type of string', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    /** addReplyUseCase.execute({ thread_id, comment_id, content, owner, date }) */
    await expect(
      addReplyUseCase.execute({
        thread_id: 'thread-123', 
        comment_id: 'comment-123', 
        content: {},
        owner: 'user-123',
        date: 'some ISO date',
      })
    ).rejects.toThrowError(
      new InvariantError('Tipe data balasan komentar tidak sesuai')
    );
  });

  it('should throw InvariantError when reply is an empty string', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: {},
    });

    // Action & Assert
    /** addReplyUseCase.execute({ thread_id, comment_id, content, owner, date }) */
    await expect(
      addReplyUseCase.execute({
        thread_id: 'thread-123', 
        comment_id: 'comment-123', 
        content: '',
        owner: 'user-123',
        date: 'some ISO date'
      })
    ).rejects.toThrowError(
      new InvariantError('Balasan komentar tidak boleh kosong')
    );
  });

  it('should orchestrate reply comment correctly', async () => {
    // Arrange
    const replyTimestamp = new Date().toISOString();
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      content: 'A critical reply',
      owner: 'user-123',
      date: replyTimestamp,
    };

    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies function */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockCommentRepository.isCommentAvailableInThread = jest.fn().mockResolvedValue(true);
    mockReplyRepository.addReply = jest.fn().mockResolvedValue(
      new AddedReply({
        id: 'reply-123',
        content: 'A critical reply',
        owner: 'user-123',
      })
    );

    /** mock Reply constructor call */
    Reply.mockImplementation((payload) => ({
      comment_id: payload.comment_id,
      content: payload.content,
      owner: payload.owner,
      date: payload.date,
    }));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(Reply).toBeCalledWith(expect.objectContaining({
      comment_id: 'comment-123',
      content: 'A critical reply',
      owner: 'user-123',
      date: replyTimestamp,
    }));
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.isCommentAvailableInThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockReplyRepository.addReply).toBeCalledWith(expect.objectContaining({
      comment_id: 'comment-123',
      content: 'A critical reply',
      owner: 'user-123',
      date: replyTimestamp,
    }));
    expect(addedReply).toEqual(new AddedReply({
      id: 'reply-123',
      content: 'A critical reply',
      owner: 'user-123',
    }));
  });
});

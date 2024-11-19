const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

jest.mock('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
  it('should throw not found error when the thread to add is not available', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-unavailable',
      content: 'Some Comment',
      owner: 'user-123',
    };

    // mock NewComment constructor property
    NewComment.mockImplementation((payload) => ({
      thread_id: payload.thread_id,
      content: payload.content,
      owner: payload.owner,
    }));

    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies function */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(false);

    const addCommentUseCase = new AddCommentUseCase({ commentRepository: {}, threadRepository: mockThreadRepository });

    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError)
  });

  it('should throw Invariant Error when there is no comment', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      owner: 'user-123',
    };

    const addCommentUseCase = new AddCommentUseCase({}, {});
    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(InvariantError);
  });

  it('should throw Invariant Error when comment not met data type specification', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      content: [''],
      owner: 'user-123',
    };

    const addCommentUseCase = new AddCommentUseCase({}, {});
    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(InvariantError);
  })

  it('should orchestrate add comment to threat correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 'user-123',
    };

    // mock NewComment constructor property 
    NewComment.mockImplementation((payload) => ({
      thread_id: payload.thread_id,
      content: payload.content,
      owner: payload.owner,
    }));

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
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);

    const addCommentUseCase = new AddCommentUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    expect(NewComment).toBeCalledWith(useCasePayload);
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 'user-123',
    }));
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: 'Some Comment',
        owner: 'user-123',
      })
    )
  });
});

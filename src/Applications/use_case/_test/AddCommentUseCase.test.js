const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');

jest.mock('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
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

    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();

    /** Mock NewComment constructor call */
    NewComment.mockImplementation((payload) => ({
      thread_id: payload.thread_id,
      content: payload.content,
      owner: payload.owner,
      date: payload.date,
    }));

    const addCommentUseCase = new AddCommentUseCase({ 
      commentRepository: mockCommentRepository, 
      threadRepository: mockThreadRepository 
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(NewComment).toBeCalledWith(expect.objectContaining({
      thread_id: 'thread-123',
      content: 'Some Comment',
      owner: 'user-123',
      date: addCommentTimestamp,
    }));

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

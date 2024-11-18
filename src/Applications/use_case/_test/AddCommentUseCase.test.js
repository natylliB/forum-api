const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

jest.mock('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
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

    /** Mock required depedencies function */
    mockCommentRepository.addComment = jest.fn().mockResolvedValue(
      new AddedComment({
        id: 'comment-123',
        content: 'Some Comment',
        owner: 'user-123',
      })
    );

    const addCommentUseCase = new AddCommentUseCase({ commentRepository: mockCommentRepository });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    expect(NewComment).toBeCalledWith(useCasePayload);
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

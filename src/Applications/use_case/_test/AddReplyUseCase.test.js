const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

jest.mock('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
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
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();
    mockCommentRepository.checkCommentAvailabilityInThread = jest.fn().mockResolvedValue();
    mockReplyRepository.addReply = jest.fn().mockResolvedValue(
      new AddedReply({
        id: 'reply-123',
        content: 'A critical reply',
        owner: 'user-123',
      })
    );

    /** mock Reply constructor call */
    NewReply.mockImplementation((payload) => ({
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
    expect(NewReply).toBeCalledWith(expect.objectContaining({
      comment_id: 'comment-123',
      content: 'A critical reply',
      owner: 'user-123',
      date: replyTimestamp,
    }));
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailabilityInThread).toBeCalledWith('comment-123', 'thread-123');
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

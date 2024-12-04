const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate getting thread detail correctly', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue();

    mockThreadRepository.getThreadDetail = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      username: 'billy',
      date: new Date('2021-08-08T07:19:09.775Z'),
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([
      {
        id: 'comment-123',
        thread_id: 'thread-123', 
        content: 'sebuah comment',
        username: 'jack',
        date: new Date('2021-08-08T07:22:33.555Z'),
        is_delete: false,
      },
      {
        id: 'comment-124',
        thread_id: 'thread-123',
        content: 'sebuah komentar menarik',
        username: 'billy',
        date: new Date('2021-08-08T07:26:21.338Z'),
        is_delete: true,
      },
    ]);

    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue([
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A critical reply',
        date: new Date('2024-11-24T04:01:23.335Z'),
        username: 'jack',
        is_delete: false,
      },
      {
        id: 'reply-124',
        comment_id: 'comment-123',
        content: 'A debateful reply',
        date: new Date('2024-11-24T04:41:10.982Z'),
        username: 'billy',
        is_delete: false,
      },
      {
        id: 'reply-125',
        comment_id: 'comment-123',
        content: 'A sensitive reply',
        date: new Date('2024-11-24T04:41:33.711Z'),
        username: 'jack',
        is_delete: true,
      },
    ]);

    
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
    
    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith('comment-123', 'comment-124');

    expect(threadDetail).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'billy',
      comments: [
        {
          id: 'comment-123', 
          username: 'jack',
          date: '2021-08-08T07:22:33.555Z',
          replies: [
            {
              id: 'reply-123',
              content: 'A critical reply',
              date: '2024-11-24T04:01:23.335Z',
              username: 'jack',
            },
            {
              id: 'reply-124',
              content: 'A debateful reply',
              date: '2024-11-24T04:41:10.982Z',
              username: 'billy',
            },
            {
              id: 'reply-125',
              content: '**balasan telah dihapus**',
              date: '2024-11-24T04:41:33.711Z',
              username: 'jack',
            },
          ],
          content: 'sebuah comment',
        },
        {
          id: 'comment-124',
          username: 'billy',
          date: '2021-08-08T07:26:21.338Z',
          replies: [],
          content: '**komentar telah dihapus**',
        },
      ],
    });
  });

  it('should orchestrate getting thread detail correctly for thread without comment', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mock required depedencies functions */
    mockThreadRepository.checkThreadAvailability = jest.fn().mockResolvedValue(true);

    mockThreadRepository.getThreadDetail = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      username: 'billy',
      date: new Date('2021-08-08T07:19:09.775Z'),
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([]); // no comment

    mockReplyRepository.getRepliesByCommentIds = jest.fn().mockResolvedValue([]); // thus no reply

    
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
    
    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith();

    expect(threadDetail).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'billy',
      comments: [],
    });
  })
});
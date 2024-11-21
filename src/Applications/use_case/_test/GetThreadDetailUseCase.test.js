const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should throw NotFoundError when the thread is not found', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(false);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute('')).rejects.toThrowError(NotFoundError);
  });
  it('should orchestrate getting thread detail correctly', async () => {
    // Arrange
    /** mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    /** mock required depedencies functions */
    mockThreadRepository.isThreadAvailable = jest.fn().mockResolvedValue(true);
    mockThreadRepository.getThreadDetail = jest.fn().mockResolvedValue({
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
          content: 'sebuah comment',
        },
        {
          id: 'comment-124',
          username: 'billy',
          date: '2021-08-08T07:26:21.338Z',
          content: '** Komentar telah dihapus **',
        },
      ],
    });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({ threadRepository: mockThreadRepository });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith('thread-123');
    expect(threadDetail).toEqual(expect.objectContaining({
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
          content: 'sebuah comment',
        },
        {
          id: 'comment-124',
          username: 'billy',
          date: '2021-08-08T07:26:21.338Z',
          content: '** Komentar telah dihapus **',
        },
      ],
    }));
  });
});
const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const Thread = require('../../../Domains/threads/entities/Thread');

jest.mock('../../../Domains/threads/entities/Thread');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thead process correctly', async () => {
    // Arrange
    const addThreadTimestamp = new Date().toISOString();
    const payload = {
      title: 'Some Topic',
      body: 'Some Content',
      owner: 'user-123',
      date: addThreadTimestamp,
    };
    
    // mock thread constructor behavior
    Thread.mockImplementation((payload) => ({
      title: payload.title,
      body: payload.body,
      owner: payload.owner,
      date: payload.date,
    }));

    /** Mock required depedencies */
    const mockThreadRepository = new ThreadRepository();

    //** Mock required depedencies function */
    mockThreadRepository.addThread = jest.fn().mockResolvedValue(
      new AddedThread({
        id: 'thread-123',
        title: 'Some Topic',
        owner: 'user-123',
      })
    );

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    
    // Action
    const addedThread = await addThreadUseCase.execute(payload);

    // Assert
    expect(Thread).toBeCalledWith(expect.objectContaining({
      title: 'Some Topic',
      body: 'Some Content',
      owner: 'user-123',
      date: addThreadTimestamp,
    }));
    
    expect(mockThreadRepository.addThread).toBeCalledWith(
      expect.objectContaining({
        title: 'Some Topic',
        body: 'Some Content',
        owner: 'user-123',
      })
    );
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: 'Some Topic',
        owner: 'user-123',
      })
    );
  });
});
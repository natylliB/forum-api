const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

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
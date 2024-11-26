const Comment = require('../../../comments/entities/Comment');
const Thread = require('../Thread');

// const payload = {
//   id: 'thread-123',
//   title: 'An interesting topic',
//   body: 'An engaging content',
//   date: new Date(),
//   username: 'billy',
// }

jest.mock('../../../comments/entities/Comment', () => {
  return jest.fn();
});

describe('Thread { id, title, body, date, username } object', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      body: 'An engaging content',
      date: new Date(),
      username: 'billy',
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAINING_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'An interesting topic',
      body: 'An engaging content',
      date: new Date().toISOString(), // must be instanceof Date!
      username: 'billy',
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'An interesting topic',
      body: 'An engaging content',
      date: new Date(),
      username: 'billy',
    };

    // Action
    const { id, title, body, date, username, comments } = new Thread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date.toISOString());
    expect(username).toEqual(payload.username);
    expect(comments).toEqual([]);
  });

  describe('setComments() function', () => {
    it('should update comments correctly', () => {
      const payload = {
        id: 'thread-123',
        title: 'An interesting topic',
        body: 'An engaging content',
        date: new Date(),
        username: 'billy',
      };

      const thread = new Thread(payload);
      expect(thread.comments).toHaveLength(0);

      /** mock Comment Class */
      Comment.mockImplementation(function Comment(payload) {
        this.id = payload.id;
      });

      const comments = [
        new Comment({
          id: 'comment-123',
        }),
        new Comment({
          id: 'comment-124',
        }),
        new Comment({
          id: 'comment-125',
        }),
      ];

      // Action
      thread.setComments(comments);

      // Assert
      expect(thread.comments).toHaveLength(3);
    });

    it('should throw error when not setting comments with array of comment', () => {
      // Arrange
      const payload = {
        id: 'thread-123',
        title: 'An interesting topic',
        body: 'An engaging content',
        date: new Date(),
        username: 'billy',
      };
      const thread = new Thread(payload);

      /** Mock Comment Class */
      Comment.mockImplementation(function Comment(){});

      // Action & Assert
      expect(() => thread.setComments({})).toThrowError('THREAD.COMMENTS_MUST_BE_AN_ARRAY_OF_COMMENT');
      const comments = [{}]; // array of object
      expect(() => thread.setComments(comments)).toThrowError('THREAD.COMMENTS_MUST_BE_AN_ARRAY_OF_COMMENT');
    });

    it('should sort comments ascendingly by date', () => {
      // Arrange
      const payload = {
        id: 'thread-123',
        title: 'An interesting topic',
        body: 'An engaging content',
        date: new Date(),
        username: 'billy',
      };
      const thread = new Thread(payload);

      Comment.mockImplementation(function Comment(payload) {
        this.date = payload.date;
      });

      const comments = [
        new Comment({
          date: '2021-08-08T07:26:21.338Z', // order 2
        }),
        new Comment({
          date: '2021-08-08T07:22:33.555Z', // order 1
        }),
        new Comment({
          date: '2024-11-26T01:56:51.310Z', // order 3
        }),
      ]

      // Action
      thread.setComments(comments);

      // Assert
      expect(thread.comments).toEqual(
        [
          {
            date: '2021-08-08T07:22:33.555Z',
          },
          {
            date: '2021-08-08T07:26:21.338Z',
          },
          {
            date: '2024-11-26T01:56:51.310Z',
          },
        ],
      )
    })
  });
});

const Comment = require('../../../comments/entities/Comment');
const Thread = require('../Thread');

// const payload = {
//   id: 'thread-123',
//   title: 'An interesting topic',
//   body: 'An engaging content',
//   date: new Date(),
//   username: 'billy',
// }

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

      // Action & Assert
      expect(() => thread.setComments({})).toThrowError('THREAD.COMMENTS_MUST_BE_AN_ARRAY_OF_COMMENT');

      /** making sure setting comment in comments */
      const comments = [
        {
          id: 'comment-123',
          content: 'sebuah comment',
          username: 'jack',
          date: '2021-08-08T07:22:33.555Z',
          replies: [],
        }
      ];

      expect(() => thread.setComments(comments)).toThrowError('THREAD.COMMENTS_MUST_BE_AN_ARRAY_OF_COMMENT');
    });

    it('should sort comments by date', () => {
      // Arrange
      const payload = {
        id: 'thread-123',
        title: 'An interesting topic',
        body: 'An engaging content',
        date: new Date(),
        username: 'billy',
      };
      const thread = new Thread(payload);

      const comments = [
        new Comment({
          id: 'comment-124',
          content: 'sebuah komentar menarik',
          username: 'billy',
          date: new Date('2021-08-08T07:26:21.338Z'), // order 2
          is_delete: true,
        }),
        new Comment({
          id: 'comment-123',
          content: 'sebuah comment',
          username: 'jack',
          date: new Date('2021-08-08T07:22:33.555Z'), // order 1
          is_delete: false,
        }),
      ]

      // Action
      thread.setComments(comments);

      // Assert
      expect(thread.comments).toEqual(
        [
          {
            id: 'comment-123', 
            username: 'jack',
            date: '2021-08-08T07:22:33.555Z',
            replies: [],
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
      )
    })
  });
});

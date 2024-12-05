const Reply = require('../../../replies/entities/Reply');
const Comment = require('../Comment');

// const payload = {
//   id: 'comment-123',
//   content: 'A Comment',
//   username: 'billy',
//   date: new Date(),
//   is_delete: false,
// }

jest.mock('../../../replies/entities/Reply', () => {
  return jest.fn();
});

describe('Comment { id, content, username, date, is_delete } object', () => {
  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      date: new Date(),
      is_delete: false,
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrow('COMMENT.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  it('should throw error when property not met data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      username: 'billy',
      date: new Date().toISOString(), // must be instanceof Date!
      is_delete: false, // must be typeof boolean!
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrow('COMMENT.PROPERTY_NOT_MET_DATA_TYPE_SPECIFICATION');
  });

  it('should block content when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      username: 'billy',
      date: new Date(),
      is_delete: true,
    };

    // Action
    const { content } = new Comment(payload);

    // Assert
    expect(content).toEqual('**komentar telah dihapus**');
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      username: 'billy',
      date: new Date(),
      is_delete: false,
    };

    // Action
    const { id, username, date, replies, content, likeCount } = new Comment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date.toISOString());
    expect(replies).toEqual([]);
    expect(content).toEqual(payload.content);
    expect(likeCount).toEqual(0);
  });

  describe('setReplies() function', () => {
    it('should update the replies property', () => {
      // Arrange
      const payload = {
        id: 'comment-123',
        content: 'A Comment',
        username: 'billy',
        date: new Date(),
        is_delete: false,
      };

      const comment = new Comment(payload);
      expect(comment.replies).toHaveLength(0);

      Reply.mockImplementation(function Reply(payload) {
        this.id = payload.id;
      })

      const replies = [
        new Reply({
          id: 'reply-124',
        }),
        new Reply({
          id: 'reply-123',
        }),
        new Reply({
          id: 'reply-125',
        }),
      ];

      // Action
      comment.setReplies(replies);

      // Assert
      expect(comment.replies).toHaveLength(3);      
    });

    it('should throw error when not setting array of replies', () => {
      // Arrange
      const payload = {
        id: 'comment-123',
        content: 'A Comment',
        username: 'billy',
        date: new Date(),
        is_delete: false,
      };

      Reply.mockImplementation(function Reply(){});

      const comment = new Comment(payload);

      // Action & Assert
      expect(() => comment.setReplies({})).toThrowError('COMMENT.REPLIES_MUST_BE_AN_ARRAY_OF_REPLY');
      
      /** making sure inserting reply in replies */
      const replies = [
        {
          id: 'reply-123',
          content: 'A critical reply',
          date: new Date('2024-11-24T04:01:23.335Z'),
          username: 'jack',
        }
      ];

      expect(() => comment.setReplies(replies)).toThrowError('COMMENT.REPLIES_MUST_BE_AN_ARRAY_OF_REPLY')
    });

    it('should sort replies by date ascendingly old to new', () => {
      // Arrange
      const payload = {
        id: 'comment-123',
        content: 'A Comment',
        username: 'billy',
        date: new Date(),
        is_delete: false,
      };

      Reply.mockImplementation(function Reply(payload){
        this.date = payload.date;
      });

      const comment = new Comment(payload);

      const replies = [
        new Reply({
          date: '2024-11-24T04:41:10.982Z', // order: 2
        }),
        new Reply({
          date: '2024-11-24T04:01:23.335Z', // order: 1
        }),
        new Reply({
          date: '2024-11-24T04:41:33.711Z', // order: 3
        }),
      ];
      
      // Action
      comment.setReplies(replies);

      // Assert
      expect(comment.replies).toEqual([
        {
          date: '2024-11-24T04:01:23.335Z',
        },
        {
          date: '2024-11-24T04:41:10.982Z',
        },
        {
          date: '2024-11-24T04:41:33.711Z',
        },
      ]);
    });
  });

  describe('setLikeCount function', () => {
    it('should set likeCount correctly', () => {
      // Arrange
      const payload = {
        id: 'comment-123',
        content: 'A Comment',
        username: 'billy',
        date: new Date(),
        is_delete: false,
      };

      const comment = new Comment(payload);
      expect(comment.likeCount).toEqual(0);

      // Action
      comment.setLikeCount(2);

      // Assert
      expect(comment.likeCount).toEqual(2);
    });

    it('should throw error when setting likeCount with non number', () => {
      // Arrange
      const payload = {
        id: 'comment-123',
        content: 'A Comment',
        username: 'billy',
        date: new Date(),
        is_delete: false,
      };

      const comment = new Comment(payload);
      expect(() => comment.setLikeCount('2')).toThrowError('COMMENT.LIKE_COUNT_MUST_BE_A_NUMBER');
    });
  });
});
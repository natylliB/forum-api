const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail', () => {
  const thread = {
    id: 'thread-123',
    title: 'sebuah thread',
    body: 'sebuah body thread',
    username: 'billy',
    date: new Date('2021-08-08T07:19:09.775Z'),
  };

  const threadComments = [
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
  ];

  const repliesOfComments = [
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
  ];

  const likeCountsOfComments = [
    {
      comment_id: 'comment-123',
      like_count: '2',
    },
  ];

  it('should throw error when missing required property', () => {
    // Arrange
    const payload = {
      thread,
      threadComments,
      repliesOfComments,
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_REQUIRED_PROPERTY');
  });

  describe('compose function', () => {
    it('should compose thread detail correctly', () => {
      // Arrange
      const payload = {
        thread,
        threadComments,
        repliesOfComments,
        likeCountsOfComments,
      };

      // Action
      const threadDetail = new ThreadDetail(payload).compose();

      // Assert
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
            likeCount: 2,
          },
          {
            id: 'comment-124',
            username: 'billy',
            date: '2021-08-08T07:26:21.338Z',
            replies: [],
            content: '**komentar telah dihapus**',
            likeCount: 0,
          },
        ],
      });
    });

    it('should compose thread detail correctly for thread without comment', () => {
      // Arrange
      const payload = {
        thread,
        threadComments: [],
        repliesOfComments: [],
        likeCountsOfComments: [],
      };

      // Action
      const threadDetail = new ThreadDetail(payload).compose();

      // Assert
      expect(threadDetail).toEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'billy',
        comments: [],
      });
    });
  });
});

const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ 
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadDetail(threadId);

    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = threadComments.map(((comment) => comment.id));

    const repliesOfComments = await this._replyRepository.getRepliesByCommentIds(...commentIds);
    
    const likeCountsOfComments = await this._commentLikeRepository.getCommentLikeCountsByCommentIds(...commentIds);

    const threadDetail = new ThreadDetail({
      thread,
      threadComments,
      repliesOfComments,
      likeCountsOfComments,
    }).compose();

    return threadDetail;
  }
}

module.exports = GetThreadDetailUseCase;

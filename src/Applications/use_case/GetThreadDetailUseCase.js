class GetThreadDetailUseCase {
  constructor({ 
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadDetail(threadId);

    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = threadComments.map(((comment) => comment.id));

    const repliesOfComments = await this._replyRepository.getRepliesByCommentIds(...commentIds);

    // Todo processing the data here

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;

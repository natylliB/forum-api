class ReplyRepository {
  async addReply({ comment_id, content, owner, date }) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyRepository;
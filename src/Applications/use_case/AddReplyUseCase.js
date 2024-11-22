const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const Reply = require("../../Domains/replies/entities/Reply");

class AddReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ thread_id, comment_id, content, owner, date }) {
    this._verifyReply(content);

    const newReply = new Reply({ comment_id, content, owner, date })

    const isThreadAvailable = await this._threadRepository.isThreadAvailable(thread_id);
    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    
    const isCommentAvailableInThread = await this._commentRepository.isCommentAvailableInThread(comment_id, thread_id);
    if (!isCommentAvailableInThread) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    const addedReply = await this._replyRepository.addReply(newReply);

    return addedReply;
  }

  _verifyReply(reply) {
    if (typeof reply === 'undefined') {
      throw new InvariantError('Tidak ada balasan komentar');
    }
    if (typeof reply !== 'string') {
      throw new InvariantError('Tipe data balasan komentar tidak sesuai');
    }
    if (reply.length === 0) {
      throw new InvariantError('Balasan komentar tidak boleh kosong');
    }
  }
}

module.exports = AddReplyUseCase;

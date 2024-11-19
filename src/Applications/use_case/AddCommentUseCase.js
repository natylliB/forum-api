const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;

    this.execute = this.execute.bind(this);
    this._validateComment = this._validateComment.bind(this);
  }

  async execute(payload) {
    this._validateComment(payload.content);
    const newComment = new NewComment(payload);
    const isThreadAvailable = await this._threadRepository.isThreadAvailable(newComment.thread_id);
    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    const addedComment = await this._commentRepository.addComment(newComment);
    return addedComment;
  }

  _validateComment(comment) {
    if (typeof comment === 'undefined') {
      throw new InvariantError('Tidak dapat membuat komentar baru karena comment tidak ada');
    }
    if (typeof comment !== 'string') {
      throw new InvariantError('Tidak dapat membuat komentar baru karena tipe data comment tidak sesuai');
    }
  }
}

module.exports = AddCommentUseCase;

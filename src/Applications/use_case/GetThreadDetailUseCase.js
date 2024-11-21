const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const isThreadAvailable = await this._threadRepository.isThreadAvailable(threadId);

    if (!isThreadAvailable) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const thread = await this._threadRepository.getThreadDetail(threadId);

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;

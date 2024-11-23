class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadDetail(threadId);

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;

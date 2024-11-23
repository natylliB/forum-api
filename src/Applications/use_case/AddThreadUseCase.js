const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }){
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const newThread = new NewThread(payload);
    return await this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;

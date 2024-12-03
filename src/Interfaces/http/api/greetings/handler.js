const GreetingUseCase = require("../../../../Applications/use_case/GreetingUseCase");

class GreetingHandler {
  constructor(container) {
    this._container = container;

    this.getGreetingHandler = this.getGreetingHandler.bind(this);
  }

  getGreetingHandler() {
    const greetingUseCase = this._container.getInstance(GreetingUseCase.name);
    const greeting = greetingUseCase.execute();

    return { value: greeting };
  }
}

module.exports = GreetingHandler;

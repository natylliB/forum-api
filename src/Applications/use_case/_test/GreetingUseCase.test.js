const GreetingUseCase = require('../GreetingUseCase');

describe('GreetingUseCase', () => {
  it('should orchestrate greeting correctly', () => {
    // Arrange
    const greetingUseCase = new GreetingUseCase();

    // Action
    const greeting = greetingUseCase.execute();

    // Assert
    expect(greeting).toEqual('Hello World!');
  });
})
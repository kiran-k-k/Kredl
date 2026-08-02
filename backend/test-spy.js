const { Reflector } = require('@nestjs/core');
const jest = require('jest-mock');
const reflector = new Reflector();
jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
console.log(reflector.getAllAndOverride());

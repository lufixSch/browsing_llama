import { Messager } from './message';

console.debug('Loading background...');

Messager.subscribe('hover', console.log);
Messager.subscribe('stop', console.log);

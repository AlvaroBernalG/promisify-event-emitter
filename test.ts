import EventPromise, {Message, Callback} from './index';

enum EXIT {
  SUCESS,
  FAIL
}

const log = console.log;
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const sum = (a: number, b:number): number => a + b;

const assert = (result: boolean, ...title: any[]) => {
  if (result === false) {
    log('');
    log('\x1b[31mFAILED: %s\x1b[0m', ...title);
    log('');
    process.exit(EXIT.FAIL);
    return;
  }
  log('\x1b[32m%s\x1b[0m', ...title); 
}

let events = new EventPromise<string | void>(); 

const countOne = async (): Promise<string> => {
  return 'one';
}

events.on('counter', countOne);

events.on('counter', async (_: Message<string>): Promise<string> => {
  await wait(300); 
  return 'two';
});

events.on('counter', async () => 'three');

let evn = new EventPromise<number>();

evn.on('double', async (m: Message<number>): Promise<number> => {
  let timeout = m.payload === 3 ? 1000 : 300;
  await wait(timeout);
  return m.payload * 2;
});

events.on('other', async () => {
  await wait(300);
  return 'other';
});

events.on('other', async () => {
  return 'test';
});

const numbers = new EventPromise<number>();

numbers.on('sum', async (m: Message<number>) => {
  return m.payload + 1;
});

numbers.on('sum', async (m: Message<number>) => {
  return m.payload + 1;
});

let plusOne = async (m: Message<number>) => m.payload++

numbers.on('sum', plusOne);

(async function start() {

  log('Starting test...');

  assert(events.emit('counter') instanceof Promise, 'emit() should return a Promise.');

  assert(events.emit('does not exits') instanceof Promise, 'emit() should return a Promise when no callbacks are registered with a namespace.');

  const res = await events.emit('counter', {payload: 'yeap'});
  assert(res.join(' ') === 'one two three', 'emit() should return the value of all listeners.', res.join(' '));

  numbers.off('sum', plusOne);
  let sumResult = await numbers.emit('sum', {payload: 0});
  assert(sumResult.reduce(sum, 0) === 2, 'off() should be able to remove all callbacks instances.', sumResult);

  numbers.off('sum');
  sumResult = await numbers.emit('sum', {payload: 0});
  assert(sumResult.length === 0, 'off() should be able to remove all callbacks of a namespace if no callback instance is passed.', sumResult);

  numbers.on('once', async(m: Message<number>): Promise<number> => {
    assert(m.payload === 3, 'on() callback should correctly handle execution.');
    return m.payload;
  });
  numbers.emit('once', {payload: 3});


})();


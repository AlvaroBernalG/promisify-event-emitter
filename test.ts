import EventEmitterPromisified, {Message} from './index';

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

(async function start() {

  log('Starting test...');
  const events = new EventEmitterPromisified<string, string>(); 
  const countOne = async (): Promise<string> => {
    return 'one';
  }
  const nothing = {payload: ''};
  events.on('counter', countOne);
  events.on('counter', async (): Promise<string> => {
    await wait(300); 
    return 'two';
  });
  events.on('counter', async () => 'three');
  
  assert(events.emit('counter', nothing) instanceof Promise, 'emit() should return a Promise.');

  assert(
    events.emit('does not exits', nothing) instanceof Promise, 
    'emit() should return a Promise when no callbacks are registered with a event name.'
  );

  const res = await events.emit('counter', {payload: 'yeap'});
  assert(
    res.join(' ') === 'one two three', 
    'emit() should return the value of all listeners.', 
    res.join(' ')
  );

  const listTest = new EventEmitterPromisified<void, number>();
  const dummyListenerCallback = async () => 1;
  listTest.on('listeners', dummyListenerCallback);
  listTest.on('listeners', dummyListenerCallback);
  listTest.on('listeners', dummyListenerCallback);
  assert(
    listTest.listeners('listeners')?.length === 3, 
    'listeners() should return list of all callbacks registered in a event name.', 
    listTest.listeners('listeners')?.length
  );

  const numbers = new EventEmitterPromisified<number,number>();
  numbers.on('sum', async (m: Message<number>) => {
    return m.payload + 1;
  });
  numbers.on('sum', async (m: Message<number>) => {
    return m.payload + 1;
  });
  const plusOne = async (m: Message<number>) => m.payload++
  numbers.on('sum', plusOne);
  numbers.off('sum', plusOne);
  let sumResult = await numbers.emit('sum', {payload: 0});
  assert(
    sumResult.reduce(sum, 0) === 2, 
    'off(eventName, callbackInstance) should be able to remove all callbacks instances associated with a event name.', 
    sumResult
  );

  numbers.off('sum');
  sumResult = await numbers.emit('sum', {payload: 0});
  assert(
    sumResult.length === 0, 
    'off(eventName) should be able to remove all callbacks associated with a event Name if no callback instance is passed.',
    sumResult
  );

  numbers.on('once', async(m: Message<number>): Promise<number> => {
    assert(m.payload === 3, 'on() callback should correctly handle execution.');
    return m.payload;
  });
  numbers.emit('once', {payload: 3});

  
  const eventNames = new EventEmitterPromisified<void, number>();
  eventNames.on('0', dummyListenerCallback);
  eventNames.on('1', dummyListenerCallback);
  eventNames.on('2', dummyListenerCallback);
  assert(
    eventNames.eventNames().join(' ') === '0 1 2', 
    'eventNames() should return an array with all the eventnames registered.', 
    eventNames.eventNames().join(' ')
  );

  const oncetest = new EventEmitterPromisified<number, number>();
  let counter = 0;
  oncetest.once('oncetest', async (m: Message<number>): Promise<number> => {
    counter += 1;
    m.payload += 2;
    return m.payload;
  });
  let onceTestRes = await oncetest.emit('oncetest', {payload: counter});
  const cero = {payload: 0};
  oncetest.emit('oncetest', cero);
  oncetest.emit('oncetest', cero);
  oncetest.emit('oncetest', cero);
  oncetest.emit('oncetest', cero);
  assert(counter === 1 && onceTestRes.length === 1 && onceTestRes[0] === 2, 
    'once() should register a callback that is only called once and then removed.', 
    counter, onceTestRes);

  const timestest = new EventEmitterPromisified<number, number>();
  counter = 0;
  timestest.times('timetestEventName', async (m: Message<number>): Promise<number> => {
    counter += 1;
    m.payload += 2;
    return m.payload;
  }, 3);
  await timestest.emit('timetestEventName', {payload: counter});
  await timestest.emit('timetestEventName', {payload: onceTestRes[0]});
  await timestest.emit('timetestEventName', {payload: onceTestRes[0]});
  await timestest.emit('timetestEventName', {payload: onceTestRes[0]});
  await timestest.emit('timetestEventName', {payload: onceTestRes[0]});
  assert(
    counter === 3 && onceTestRes.length === 1, 
    'times() should register a callback that is only called n amount of times and then removed.', 
    counter, onceTestRes
  );

  const prependTest = new EventEmitterPromisified<string, string>();
  const sayOne = async(m: Message<string>): Promise<string> => 'one' + m.payload 
  const sayTwo = async(m: Message<string>): Promise<string> => 'two' + m.payload
  const sayThree = async(m: Message<string>): Promise<string> =>  'three' + m.payload
  prependTest.prepend('prependtest', sayOne);
  prependTest.prepend('prependtest', sayTwo);
  prependTest.prepend('prependtest', sayThree);
  const message = await prependTest.emit('prependtest', {payload: ''});
  assert(
    message.join(' ') === 'three two one', 
    'prepend() should add callbacks at the begining of the array.', 
    message
  );

  prependTest.on('listenermax', sayOne);
  prependTest.setMaxEventListeners('listenermax', 1);
  assert(
    prependTest.getMaxEventListeners('listenermax') === 1, 
    'getMaxEventListeners() should return the maximum amount of event listeners assigned to a eventName.', 
    prependTest.getMaxEventListeners('listenermax')
  );
  prependTest.on('listenermax', sayTwo);
  prependTest.on('listenermax', sayThree);
  assert(
    prependTest.listeners('listenermax')?.length === 1, 
    'setMaxEventListeners(eventName, n) should only allow registering n number of callbacks for eventName.',
    prependTest.listeners('listenermax')?.length 
  );
  prependTest.setMaxEventListeners('doesnotexist', 30);
  assert(
    prependTest.setMaxEventListeners('doesnotexist', 30) === false, 
    'setEventMaxListener(eventName, max) should return false if eventName is not registered.', 
    prependTest.setMaxEventListeners('doesnotexist', 30)
  );

  assert(
    prependTest.defaultEventMaxListeners() === 10, 
    'defaultEventMaxListeners() should return the maximum amount of event listeners.',
    prependTest.defaultEventMaxListeners()
  );

  prependTest.setDefaultEventMaxListener(20);
  prependTest.on('__test__', sayOne);
  assert(
    (prependTest.defaultEventMaxListeners() === 20) && (prependTest.getMaxEventListeners('__test__') === 20), 
    'setDefaultEventMaxListener(max) should modify the default maximum amount of event listeners.',
    prependTest.defaultEventMaxListeners(), prependTest.getMaxEventListeners('__test__') 
  );

  const test = new EventEmitterPromisified<string, string>(); 
})();

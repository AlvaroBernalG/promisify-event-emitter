import EventPromise, {Message, Callback} from './index';

const log = console.log;
const assert = console.assert;

const wait = (ms: number): Promise<void> => new Promise((resolve, reject) => setTimeout(resolve, ms));

let events = new EventPromise<string | void>();
const logWorks = async (...works): Promise<string> => {
  return 'one';
}

events.on('test', logWorks);

events.on('test', async (message: Message<string>): Promise<string> => {
  await wait(300); 
  return 'two';
});

events.on('test', async () => 'three');

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

(async function start() {
  log('Starting Tests...');
  const res = await events.emit('test', {payload: 'yeap'});
  assert(res.join(' ') === 'one two three', 'Result should have been one two three. Instead got [' +res.join(' ')+ ']');
  events.emit('other');
  const [doubleres] = await evn.emit('double', {payload: 2});
  assert(doubleres === 4, ' Result of double should have been 4. Instead got ', doubleres);
  evn.emit('double', {payload: 3}).then(e => log('The result of doublign 3 is ', e));
  evn.emit('double', {payload: 4}).then(e => log('The result of doubling 4 is ', e));
})();


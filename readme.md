# ts-promisify-event-emitter
> Another implementation of [Event Emitter](https://nodejs.org/api/events.html) but with Promises

[![travis](https://travis-ci.org/AlvaroBernalG/ts-promisify-event-emitter.svg?branch=master)](https://travis-ci.org/AlvaroBernalG/ts-promisify-event-emitter.svg?branch=master) [![npm version](https://badge.fury.io/js/ts-promisify-event-emitter.svg)](https://badge.fury.io/js/ts-promisify-event-emitter)


## Install
```
$ npm install ts-promisify-event-emitter
```

## Usage

Basic usage:

```js
import EventEmitterPromisified, {Message, Callback} from 'ts-promisify-event-emitter';

// Result type
interface IUser {
    name: string;
    lastname: string;
}
// Query type
interface IQuery {
  id: string;
}

async function getUserFromDatabase(id: string): Promise<IUser> {
    // do something async
    return {
        name: 'Test',
        lastname: 'Testing'
    }
}

const events = new EventEmitterPromisified<IQuery, IUser>();

const callback: Callback<IQuery, IUser> = async (message: Message<IQuery>): Promise<IUser> => {
  const user: IUser = await getUserFromDatabase(message.payload.id);
  return user;
}

events.on('getUser', callback);

(async function start() {
  const query: Message<IQuery> = {payload: {id: "ID-1234"}};
  const [user] = await events.emit('getUser', query);
  console.log(`The user is: Name=${user.name}, lastname=${user.lastname}.`);
})();
```

## Contributing

All contributions are welcome.

## License

MIT

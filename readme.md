# ts-promisify-event-emitter
> Another implementation of Event Emitter but with Promises

## Install
```
$ npm install ts-promisify-event-emitter
```

## Usage

Basic usage:

```js
import EventEmitterPromisified, {Message, Callback} from 'ts-promisify-event-emitter';

interface IUser {
    name: string;
    lastname: string;
}

function getUserFromDatabase(id: string): IUser {
    // do something async
    return {
        name: 'Test',
        lastname: 'Testing'
    }
}

const events = new EventEmitterPromisified<{id:string}, IUser>();

const callback: Callback<{id: string}, IUser> = async (message: Message<{id:string}>): Promise<IUser> => {
    const user: IUser = await getUserFromDatabase(message.payload.id);
    return user;
}

events.on('getUser', callback);

(async function start() {
  const message: Message<{id:string}> = {payload: {id: "ID-1234"}};
  const [user] = await events.emit('getUser', message);
  console.log(`The user is: Name=${user.name}, lastname=${user.lastname}.`);
})();
```

## Contributing

All contributions are welcome.

## License
MIT

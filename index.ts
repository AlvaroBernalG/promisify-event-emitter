function removeWhile<T> (arr: Array<T>, fn: (T) => boolean): Array<T> {
  return arr.reduce((acc: Array<T>, next: T) =>
    fn(next) ? acc : [...acc, next]
  ,[]);
}

export interface Message<T> {
  payload: T
}

export type Callback<T> = (emitterMessage: Message<T>) => Promise<T>;

class EventEmitterPromisified<A> {
  private callbacks = new Map<string, Array<Callback<A>>>();

  on(eventName: string, eventCallback: Callback<A>): EventEmitterPromisified<A> {
    let events = this.callbacks.get(eventName);
    events = events  === undefined ? [] : events;
    events.push(eventCallback);
    this.callbacks.set(eventName, events);
    return this;
  }

  async emit(eventName: string, message?: Message<A>): Promise<Array<A>> {
    if (this.callbacks.has(eventName) === false) return Promise.resolve([]);
    const events = this.callbacks.get(eventName);
    return Promise.all(events.map(event => event(message)));
  }

  off(eventName: string, eventCallback?: Callback<A>): EventEmitterPromisified<A> {
    if (eventCallback === undefined) {
      this.callbacks.delete(eventName);
      return this;
    }
    let callbacks = this.callbacks.get(eventName);
    callbacks = removeWhile(callbacks, (cb) => cb === eventCallback);
    this.callbacks.set(eventName, callbacks);
    return this;
  }

  listeners(eventName: string): Array<Callback<A>> {
    return this.callbacks.get(eventName);
  }

  eventNames(): Array<string> {
    const keys = [];
    for (let x of this.callbacks.keys()) {
      keys.push(x);
    }
    return keys;
  }

  once(eventName: string, eventCallback: Callback<A>): EventEmitterPromisified<A> {
    return this.times(eventName, eventCallback, 1);
  }

  times(eventName, eventCallback: Callback<A>, times: number): EventEmitterPromisified<A>  {
    const removableCB = async (m: Message<A>): Promise<A> => {
      if((times -= 1) < 1) this.off(eventName, removableCB);
      
      return eventCallback(m);
    };
    return this.on(eventName, removableCB);
  }
}

export default EventEmitterPromisified;

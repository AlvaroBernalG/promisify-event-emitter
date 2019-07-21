function removeWhile<T> (arr: Array<T>, fn: (T) => boolean): Array<T> {
  return arr.reduce((acc: Array<T>, next: T) =>
    fn(next) ? acc : [...acc, next]
  ,[]);
}

export interface Message<T> {
  payload: T
}

export type Callback<T, B> = (emitterMessage: Message<T>) => Promise<B>;

class EventEmitterPromisified<A, B> {
  private callbacks = new Map<string, Array<Callback<A, B>>>();

  on(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B> {
    const events = this.getCallbacks(eventName);
    this.callbacks.set(eventName, [...events, eventCallback]);
    return this;
  }

  prepend(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B> {
    const events = this.getCallbacks(eventName);
    this.callbacks.set(eventName, [eventCallback, ...events]);
    return this;
  }

  private getCallbacks(eventName: string): Array<Callback<A, B>> {
    let events = this.callbacks.get(eventName);
    events = events  === undefined ? [] : events;
    return events;
  }

  async emit(eventName: string, message?: Message<A>): Promise<Array<B>> {
    if (this.callbacks.has(eventName) === false) return Promise.resolve([]);
    const events = this.callbacks.get(eventName);
    return Promise.all(events.map(event => event(message)));
  }

  off(eventName: string, eventCallback?: Callback<A, B>): EventEmitterPromisified<A, B> {
    if (eventCallback === undefined) {
      this.callbacks.delete(eventName);
      return this;
    }
    let callbacks = this.getCallbacks(eventName);
    callbacks = removeWhile(callbacks, (cb) => cb === eventCallback);
    this.callbacks.set(eventName, callbacks);
    return this;
  }

  listeners(eventName: string): Array<Callback<A, B>> {
    return this.callbacks.get(eventName);
  }

  eventNames(): Array<string> {
    const keys = [];
    for (let x of this.callbacks.keys()) {
      keys.push(x);
    }
    return keys;
  }

  once(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B> {
    return this.times(eventName, eventCallback, 1);
  }

  times(eventName, eventCallback: Callback<A, B>, times: number): EventEmitterPromisified<A, B>  {
    const removableCB = async (m: Message<A>): Promise<B> => {
      if((times -= 1) < 1) this.off(eventName, removableCB);
      return eventCallback(m);
    };
    return this.on(eventName, removableCB);
  }
}

export default EventEmitterPromisified;

function removeWhile<T> (arr: Array<T>, fn: (T) => boolean): Array<T> {
  return arr.reduce((acc: Array<T>, next: T) =>
    fn(next) ? acc : [...acc, next]
  ,[]);
}

export interface Message<T> {
  payload: T
}

export type Callback<T> = (emitterMessage: Message<T>) => Promise<T>;

class EventPromise<A> {
  private callbacks = new Map<string, Array<Callback<A>>>();

  on(eventName: string, eventCallback: Callback<A>): EventPromise<A> {
    let events = this.callbacks.get(eventName);
    events = events  === undefined ? [] : events;
    events.push(eventCallback);
    this.callbacks.set(eventName, events);
    return this;
  }

  async emit(eventName, message?: Message<A>): Promise<Array<A>> {
    if (this.callbacks.has(eventName) === false) return Promise.resolve([]);
    const events = this.callbacks.get(eventName);
    return Promise.all(events.map(event => event(message)));
  }

  off(eventName, eventCallback?: Callback<A>): EventPromise<A> {
    if(this.callbacks.has(eventName) === false) return;
    if (eventCallback === undefined) {
      this.callbacks.delete(eventName);
      return;
    }
    let callbacks = this.callbacks.get(eventName);
    callbacks = removeWhile(callbacks, (cb) => cb === eventCallback);
    this.callbacks.set(eventName, callbacks);
    return this;
  }

  listeners(eventName: string): Array<Callback<A>> {
    return this.callbacks.get(eventName);
  }
}

export default EventPromise;

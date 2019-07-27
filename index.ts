function removeWhile<T> (arr: Array<T>, fn: (T) => boolean): Array<T> {
  return arr.reduce((acc: Array<T>, next: T) =>
    fn(next) ? acc : [...acc, next]
  ,[]);
}

export interface Message<T> {
  payload: T
}

export interface IEventEnvelop<T, B> {
  maxListeners: number;
  callbacks: Array<Callback<T, B>>;
}

export type Callback<T, B> = (emitterMessage: Message<T>) => Promise<B>;

class EventEmitterPromisified<A, B> {
  private callbacks = new Map<string, IEventEnvelop<A, B>>();
  private maxListeners = 10;

  on(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B> {
    this.setCallback(eventName, eventCallback);
    return this;
  }

  prepend(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B> {
    this.setCallback(eventName, eventCallback, true);
    return this;
  }

  defaultEventMaxListeners(): number {
    return this.maxListeners;
  }

  setDefaultEventMaxListener(max: number): EventEmitterPromisified<A, B> {
    this.maxListeners = max;
    return this;
  }

  public setMaxEventListeners(eventName: string, maxListeners: number): boolean {
    const envelop: IEventEnvelop<A, B> = this.callbacks.get(eventName);
    if (envelop === undefined) return false;
    envelop.maxListeners = maxListeners;
    this.callbacks.set(eventName, envelop);
    return true;
  }

  public getMaxEventListeners(eventName: string): number {
    const envelop: IEventEnvelop<A, B> = this.callbacks.get(eventName);
    return envelop.maxListeners;
  }

  private setCallback(eventName: string, eventCallback: Callback<A, B>, pre = false): boolean {
    let envelop: IEventEnvelop<A, B> = this.callbacks.get(eventName);
    envelop = envelop === undefined ? {maxListeners: this.maxListeners, callbacks: []}: envelop; 
    if (envelop.callbacks.length >= envelop.maxListeners) return false;
    envelop.callbacks = pre ? [eventCallback, ...envelop.callbacks]: [...envelop.callbacks, eventCallback];
    this.callbacks.set(eventName, envelop);
    return true;
  }

  async emit(eventName: string, message?: Message<A>): Promise<Array<B>> {
    if (this.callbacks.has(eventName) === false) return Promise.resolve([]);
    const envelop: IEventEnvelop<A, B> = this.callbacks.get(eventName);
    const events = envelop.callbacks;
    return Promise.all(events.map(event => event(message)));
  }

  off(eventName: string, eventCallback?: Callback<A, B>): EventEmitterPromisified<A, B> {
    if (eventCallback === undefined) {
      this.callbacks.delete(eventName);
      return this;
    }
    let envelop: IEventEnvelop<A, B> = this.callbacks.get(eventName);
    envelop = envelop === undefined ? {maxListeners: this.maxListeners, callbacks: []}: envelop;
    envelop.callbacks = removeWhile(envelop.callbacks, (cb) => cb === eventCallback);
    return this;
  }

  listeners(eventName: string): Array<Callback<A, B>> {
    const envelop = this.callbacks.get(eventName);
    return envelop.callbacks;
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

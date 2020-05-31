interface IEventEnvelop<T, B> {
    maxListeners: number;
    callbacks: Array<Callback<T, B>>;
}

export interface Message<T> {
    payload: T
}

export type Callback<T, B> = (emitterMessage: Message<T>) => Promise<B>;

export default class EventEmitterPromisified<A, B> {

    on(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B>;

    prepend(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B>;

    emit(eventName: string, message: Message<A>): Promise<Array<B>>; 

    off(eventName: string, eventCallback?: Callback<A, B>): EventEmitterPromisified<A, B>;

    listeners(eventName: string): Array<Callback<A, B>>;
    
    eventNames(): Array<string>;

    once(eventName: string, eventCallback: Callback<A, B>): EventEmitterPromisified<A, B>;

    times(eventName: string, eventCallback: Callback<A, B>, times: number): EventEmitterPromisified<A, B>;

    defaultEventMaxListeners(): number;

    setDefaultEventMaxListener(n: number): EventEmitterPromisified<A, B>;

    setMaxEventListeners(evetnName: string, maxListeners: number): boolean;

    getMaxEventListeners(eventName: string): number;
}
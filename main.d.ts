declare interface Message<T> {
    payload: T
}

declare type Callback<T> = (emitterMessage: Message<T>) => Promise<T>;

declare class  EventEmitterPromisified<A> {

    on(eventName: string, eventCallback: Callback<A>): EventEmitterPromisified<A>;

    prepend(eventName: string, eventCallback: Callback<A>) :EventEmitterPromisified<A>;

    emit(eventName: string, message?: Message<A>): Promise<Array<A>>; 

    off(eventName: string, eventCallback?: Callback<A>): EventEmitterPromisified<A>;

    listeners(eventName: string): Array<Callback<A>>;
    
    eventNames(): Array<string>;

    once(eventName: string, eventCallback: Callback<A>): EventEmitterPromisified<A>;

    times(eventName, eventCallback: Callback<A>, times: number): EventEmitterPromisified<A>;
}

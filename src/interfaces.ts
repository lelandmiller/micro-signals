export type Listener<T> = (payload: T) => void;

export interface SignalBinding {
    detach(): void;
}

export interface BaseSignal<T> {
    add(listener: Listener<T>): SignalBinding;
}

export interface ReadableSignal<T> extends BaseSignal<T> {
    addOnce(listener: Listener<T>): SignalBinding;
    filter(filter: (payload: T) => boolean): ReadableSignal<T>;
    map<U>(transform: (payload: T) => U): ReadableSignal<U>;
    merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<T|U>;
    promisify(rejectSignal?: ReadableSignal<any>): Promise<T>;
    readOnly(): ReadableSignal<T>;
}

export interface WritableSignal<T> extends ReadableSignal<T> {
    dispatch: (payload: T) => void;
}

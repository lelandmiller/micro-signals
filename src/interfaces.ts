export type Listener<T> = (payload: T) => void;

export interface BaseSignal<T> {
    add(listener: Listener<T>): void;
    remove(listener: Listener<T>): void;
}

export interface ReadableSignal<T> extends BaseSignal<T> {
    addOnce(listener: Listener<T>): void;
    filter<U extends T>(filter: (payload: T) => payload is U): ReadableSignal<U>;
    filter(filter: (payload: T) => boolean): ReadableSignal<T>;
    map<U>(transform: (payload: T) => U): ReadableSignal<U>;
    merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<T|U>;
    promisify(rejectSignal?: ReadableSignal<any>): Promise<T>;
    readOnly(): ReadableSignal<T>;
}

export interface WritableSignal<T> {
    dispatch: (payload: T) => void;
}

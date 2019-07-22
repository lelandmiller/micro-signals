export type Listener<T> = (payload: T) => void;

export interface BaseSignal<T> {
    add(listener: Listener<T>, ...tags: any[]): void;
    remove(listenerOrTag: any): void;
}

export interface ReadableSignal<T> extends BaseSignal<T> {
    addOnce(listener: Listener<T>, ...tags: any[]): void;
    filter<U extends T>(filter: (payload: T) => payload is U): ReadableSignal<U>;
    filter(filter: (payload: T) => boolean): ReadableSignal<T>;
    map<U>(transform: (payload: T) => U): ReadableSignal<U>;
    merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<T|U>;
    promisify(rejectSignal?: ReadableSignal<any>): Promise<T>;
    readOnly(): ReadableSignal<T>;
    cache(cache: Cache<T>): ReadableSignal<T>;
}

export interface WritableSignal<T> {
    dispatch: (payload: T, catcher?: Catcher) => void;
    /**
     * set a listener to be called if no other listeners are available.
     */
    setDefaultListener(listener: Listener<T>): void;

    catch(catcher: Catcher): CatchingSignal<T>;
}

export interface CatchingSignal<T> extends WritableSignal<T> {
    /**
     * replace the catcher
     */
    setCatcher: (catcher: Catcher) => void;
}

export interface Cache<T> {
    add(payload: T): void;
    forEach(callback: (payload: T) => void): void;
}

export type Catcher = (error: any) => void;

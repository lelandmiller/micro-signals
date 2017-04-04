export interface Listener<T> {
    (payload: T): void;
}

export interface SignalBinding {
    detach(): void;
}

export interface WritableSignal<T> {
    dispatch: (payload: T) => void;
}

export interface ReadableSignal<T> {
    add: (listener: Listener<T>) => SignalBinding;
    addOnce: (listener: Listener<T>) => SignalBinding;
}

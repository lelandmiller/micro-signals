import {Listener} from './listener';
import {SignalBinding} from './signal-binding';

export interface SignalLike<T> extends ReadableSignalLike<T> {
    dispatch: (payload: T) => void;
}

export interface ReadableSignalLike<T> {
    add: (listener: Listener<T>) => SignalBinding;
    addOnce: (listener: Listener<T>) => SignalBinding;
    dispatch?: (payload: T) => void;
}

import {Listener} from './interfaces/listener';
import {SignalBinding} from './interfaces/signal-binding';
import {ReadableSignalLike, SignalLike} from './interfaces/signal-like';

export class Signal<T> implements SignalLike<T> {
    private _listeners = new Set<(payload: T) => void>();

    add(listener: Listener<T>): SignalBinding {
        this._listeners.add(listener);
        return {
            detach: () => this._listeners.delete(listener),
        };
    }

    addOnce(listener: Listener<T>): SignalBinding {
        const binding = this.add((payload: T) => {
            binding.detach();
            listener(payload);
        });
        return binding;
    }

    dispatch(payload: T): void {
        this._listeners.forEach(callback => callback.call(undefined, payload));
    }
}

export class ReadOnlySignal<T> implements ReadableSignalLike<T> {
    public add: (listener: (payload: T) => void) => SignalBinding;
    public addOnce: (listener: (payload: T) => void) => SignalBinding;

    constructor(signal: Signal<T>) {
        this.add = signal.add.bind(signal);
        this.addOnce = signal.addOnce.bind(signal);
    }
}

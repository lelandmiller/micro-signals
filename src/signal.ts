import {Listener, ReadableSignal, SignalBinding, WritableSignal} from './interfaces';

export class Signal<T> implements ReadableSignal<T>, WritableSignal<T> {
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

import { SignalBinding } from './signal-binding';

export class Signal<T> {
    private _listeners = new Set<(payload: T) => void>();

    add(listener: (payload: T) => void): SignalBinding {
        this._listeners.add(listener);
        return {
            detach: () => this._listeners.delete(listener),
        };
    }

    addOnce(listener: (payload: T) => void): SignalBinding {
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

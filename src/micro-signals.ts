export interface SignalBinding {
    detach(): void;
}

export class Signal<T> {
    private _listeners = new Set<(payload: T) => void>();
    add(listener: (payload: T) => void): SignalBinding {
        this._listeners.add(listener);
        return {
            detach: () => this._listeners.delete(listener),
        };
    }
    dispatch(payload: T): void {
        this._listeners.forEach(callback => callback.call(undefined, payload));
    }
}

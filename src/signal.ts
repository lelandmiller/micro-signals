import {BaseSignal, Listener, SignalBinding, WritableSignal} from './interfaces';

import {ExtendedSignal} from './extended-signal';

// TODO add deprecation notices should we deprecate?
export class Signal<T> extends ExtendedSignal<T> implements WritableSignal<T> {
    protected _signalSource: SignalSource<T>;
    constructor() {
        const signalSource = new SignalSource<T>();
        super(signalSource);
        this._signalSource = signalSource;
    }
    dispatch(payload: T): void {
        this._signalSource.dispatch(payload);
    }
}

export class SignalSource<T> implements BaseSignal<T> {
    public _listeners = new Set<(payload: T) => void>();
    add(listener: Listener<T>): SignalBinding {
        this._listeners.add(listener);
        return {
            detach: () => this._listeners.delete(listener),
        };
    }
    dispatch(payload: T): void {
        this._listeners.forEach(callback => callback.call(undefined, payload));
    }
}

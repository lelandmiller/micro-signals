import {Listener, ReadableSignal, SignalBinding} from './interfaces';

export class MappedSignal<T, U> implements ReadableSignal<U> {
    constructor(private _signal: ReadableSignal<T>, private _fn: (payload: T) => U) { }

    public add(listener: Listener<U>): SignalBinding {
        return this._signal.add(payload => listener(this._fn(payload)));
    }

    public addOnce(listener: Listener<U>): SignalBinding {
        return this._signal.addOnce(payload => listener(this._fn(payload)));
    }
}

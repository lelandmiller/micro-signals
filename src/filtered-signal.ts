import {Listener, ReadableSignal, SignalBinding} from './interfaces';
import {Signal} from './signal';

export interface FilterFunction<T> {
    (payload: T): boolean;
}

export class FilteredSignal<T> implements ReadableSignal<T> {
    private _forwardedSignal: ReadableSignal<T>;

    constructor(
        signal: ReadableSignal<T>,
        filter: FilterFunction<T> = () => true,
    ) {
        this._forwardedSignal = new Signal<T>();
        signal.add((payload: T) => {
            if (filter(payload)) {
                this._forwardedSignal.dispatch(payload);
            }
        });
    }

    add(listener: Listener<T>): SignalBinding {
        return this._forwardedSignal.add(listener);
    }

    addOnce(listener: Listener<T>): SignalBinding {
        return this._forwardedSignal.addOnce(listener);
    }

    dispatch(payload: T) {
        this._forwardedSignal.dispatch(payload);
    }
}

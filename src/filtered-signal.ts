import {Listener, ReadableSignal, SignalBinding} from './interfaces';

export interface FilterFunction<T> {
    (payload: T): boolean;
}

export class FilteredSignal<T> implements ReadableSignal<T> {
    constructor(
        private _baseSignal: ReadableSignal<T>,
        private _filter: FilterFunction<T> = () => true,
    ) {}

    add(listener: Listener<T>): SignalBinding {
        return this._baseSignal.add(filteredListener(listener, this._filter));
    }

    addOnce(listener: Listener<T>): SignalBinding {
        return this._baseSignal.addOnce(filteredListener(listener, this._filter));
    }
}

function filteredListener<T>(listener: Listener<T>, filter: FilterFunction<T>): Listener<T> {
    return (x: T) => {
        if (filter(x)) {
            listener(x);
        }
    };
}

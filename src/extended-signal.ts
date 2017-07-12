import {BaseSignal, FilterFunction, Listener, ReadableSignal, SignalBinding} from './interfaces';

import {
    filteredBase,
    mappedBase,
    mergedBase,
    readOnlyBase,
} from './base-signals';
import {promisifySignal} from './promisify-signal';

export class ExtendedSignal<T> implements ReadableSignal<T> {
    constructor(private _baseSignal: BaseSignal<T>) {}
    add(listener: Listener<T>): SignalBinding {
        return this._baseSignal.add(listener);
    }
    addOnce(listener: Listener<T>): SignalBinding {
        const binding = this._baseSignal.add(payload => {
            binding.detach();
            listener(payload);
        });
        return binding;
    }
    filter(filter: FilterFunction<T>): ReadableSignal<T> {
        return new ExtendedSignal(filteredBase(this._baseSignal, filter));
    }
    map<U>(transform: (payload: T) => U): ReadableSignal<U> {
        return new ExtendedSignal(mappedBase(this._baseSignal, transform));
    }
    merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<T|U> {
        return new ExtendedSignal(mergedBase<T|U>(this._baseSignal, ...signals));
    }
    promisify(rejectSignal?: ReadableSignal<Error>): Promise<T> {
        return promisifySignal(this._baseSignal, rejectSignal);
    }
    readOnly(): ReadableSignal<T> {
        return new ExtendedSignal(readOnlyBase(this._baseSignal));
    }
}

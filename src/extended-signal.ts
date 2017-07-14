import {BaseSignal, FilterFunction, Listener, ReadableSignal, SignalBinding} from './interfaces';

import {
    filteredBase,
    mappedBase,
    mergedBase,
    readOnlyBase,
} from './base-signals';
import {promisifySignal} from './promisify-signal';

export class ExtendedSignal<T> implements ReadableSignal<T> {
    public static merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<U> {
        return new ExtendedSignal(mergedBase<U>(...signals));
    }
    public static promisify<U>(
        resolveSignal: ReadableSignal<U>,
        rejectSignal?: ReadableSignal<Error>,
    ): Promise<U> {
        return promisifySignal(resolveSignal, rejectSignal);
    }
    constructor(private _baseSignal: BaseSignal<T>) {}
    public add(listener: Listener<T>): SignalBinding {
        return this._baseSignal.add(listener);
    }
    public addOnce(listener: Listener<T>): SignalBinding {
        const binding = this._baseSignal.add(payload => {
            binding.detach();
            listener(payload);
        });
        return binding;
    }
    public filter(filter: FilterFunction<T>): ReadableSignal<T> {
        return new ExtendedSignal(filteredBase(this._baseSignal, filter));
    }
    public map<U>(transform: (payload: T) => U): ReadableSignal<U> {
        return new ExtendedSignal(mappedBase(this._baseSignal, transform));
    }
    public merge<U>(...signals: ReadableSignal<U>[]): ReadableSignal<T|U> {
        return new ExtendedSignal(mergedBase<T|U>(this._baseSignal, ...signals));
    }
    public promisify(rejectSignal?: ReadableSignal<Error>): Promise<T> {
        return promisifySignal(this._baseSignal, rejectSignal);
    }
    public readOnly(): ReadableSignal<T> {
        return new ExtendedSignal(readOnlyBase(this._baseSignal));
    }
}

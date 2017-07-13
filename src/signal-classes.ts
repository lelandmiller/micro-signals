/**
 * The signal classes in this file will be removed by version 1.0.0 in favor of the functionality
 * provided on the Signal class itself.
 */
import {BaseSignal, FilterFunction} from './interfaces';

import {filteredBase, mappedBase, mergedBase, readOnlyBase} from './base-signals';
import {ExtendedSignal} from './extended-signal';

export class FilteredSignal<T> extends ExtendedSignal<T> {
    constructor( baseSignal: BaseSignal<T>, filter: FilterFunction<T> = () => true) {
        super(filteredBase(baseSignal, filter));
    }
}

/**
 * @deprecated
 */
export class MappedSignal<T, U> extends ExtendedSignal<U> {
    constructor(signal: BaseSignal<T>, transform: (payload: T) => U) {
        super(mappedBase(signal, transform));
    }
}

/**
 * @deprecated
 */
export class MergedSignal<T> extends ExtendedSignal<T> {
    constructor(...signals: BaseSignal<T>[]) {
        super(mergedBase(...signals));
    }
}

/**
 * @deprecated
 */
export class ReadOnlySignal<T> extends ExtendedSignal<T> {
    constructor(signal: BaseSignal<T>) {
        super(readOnlyBase(signal));
    }
}

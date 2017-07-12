
import {BaseSignal, FilterFunction} from './interfaces';

import {filteredBase, mappedBase, mergedBase, readOnlyBase} from './base-signals';
import {ExtendedSignal} from './extended-signal';

export class FilteredSignal<T> extends ExtendedSignal<T> {
    constructor( baseSignal: BaseSignal<T>, filter: FilterFunction<T> = () => true) {
        super(filteredBase(baseSignal, filter));
    }
}

export class MappedSignal<T, U> extends ExtendedSignal<U> {
    constructor(signal: BaseSignal<T>, transform: (payload: T) => U) {
        super(mappedBase(signal, transform));
    }
}

export class MergedSignal<T> extends ExtendedSignal<T> {
    constructor(...signals: BaseSignal<T>[]) {
        super(mergedBase(...signals));
    }
}

export class ReadOnlySignal<T> extends ExtendedSignal<T> {
    constructor(signal: BaseSignal<T>) {
        super(readOnlyBase(signal));
    }
}

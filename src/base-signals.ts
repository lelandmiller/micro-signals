import { BaseSignal, FilterFunction, Listener, SignalBinding } from './interfaces';

export function filteredBase<T>(
    baseSignal: BaseSignal<T>,
    filter: FilterFunction<T>,
): BaseSignal<T> {
    return {
        add(listener: Listener<T>): SignalBinding {
            return baseSignal.add(payload => {
                if (filter(payload)) {
                    listener(payload);
                }
            });
        },
    };
}

export function mappedBase<T, U>(
    baseSignal: BaseSignal<T>,
    transform: (payload: T) => U
): BaseSignal<U> {
    return {
        add(listener: Listener<U>) {
            return baseSignal.add(payload => listener(transform(payload)));
        },
    };
}

export function mergedBase<T>(
    ...baseSignals: BaseSignal<T>[]
): BaseSignal<T> {
    return {
        add(listener: Listener<T>): SignalBinding {
            const bindings = baseSignals.map(signal => signal.add(listener));
            return {
                detach() {
                    bindings.forEach(binding => binding.detach());
                },
            };
        },
    };
}

export function readOnlyBase<T>(baseSignal: BaseSignal<T>): BaseSignal<T> {
    return({
        add(listener: Listener<T>) {
            return baseSignal.add(listener);
        },
    });
}

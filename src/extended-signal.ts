import {BaseSignal, Cache, Listener, ReadableSignal} from './interfaces';

export class ExtendedSignal<T> implements ReadableSignal<T> {
    public static merge<U>(...signals: BaseSignal<U>[]): ReadableSignal<U> {
        const listeners = new Map<any, any>();
        return new ExtendedSignal({
            add(listener) {
                const newListener = (payload: U) => listener(payload);
                listeners.set(listener, newListener);
                signals.forEach(signal => signal.add(newListener));
            },
            remove(listener) {
                const newListener = listeners.get(listener);
                listeners.delete(listener);
                signals.forEach(signal => signal.remove(newListener));
            },
        });
    }
    public static promisify<U>(
        resolveSignal: BaseSignal<U>,
        rejectSignal?: BaseSignal<any>,
    ): Promise<U> {
        return new Promise<U>((resolve, reject) => {
            function clearListeners() {
                resolveSignal.remove(completeResolution);
                if (rejectSignal) {
                    rejectSignal.remove(completeRejection);
                }
            }

            function completeRejection(payload: any) {
                clearListeners();
                reject(payload);
            }

            function completeResolution(payload: U) {
                clearListeners();
                resolve(payload);
            }

            resolveSignal.add(completeResolution);
            if (rejectSignal) {
                rejectSignal.add(completeRejection);
            }
        });
    }
    private _addOnceListenerMap = new WeakMap<any, Listener<T>>();
    constructor(private _baseSignal: BaseSignal<T>) {}
    public add(listener: Listener<T>): void {
        this._baseSignal.add(listener);
    }
    public remove(listener: Listener<T>): void {
        const oneTimeListener = this._addOnceListenerMap.get(listener);
        if (oneTimeListener) {
            this._baseSignal.remove(oneTimeListener);
            this._addOnceListenerMap.delete(listener);
        }
        this._baseSignal.remove(listener);
    }
    public addOnce(listener: Listener<T>): void {
        // to match the set behavior of add, only add the listener if the listener is not already
        // registered
        if (this._addOnceListenerMap.has(listener)) {
            return;
        }
        const oneTimeListener = (payload: T) => {
            this._baseSignal.remove(oneTimeListener);
            listener(payload);
        };
        // TODO remove this once tokens are fully supported
        this._addOnceListenerMap.set(listener, oneTimeListener);
        this._baseSignal.add(oneTimeListener);
    }
    public filter(filter: (payload: T) => boolean): ReadableSignal<T> {
        return convertedListenerSignal(
            this._baseSignal,
            listener => payload => {
                if (filter(payload)) {
                    listener(payload);
                }
            },
        );
    }
    public map<U>(transform: (payload: T) => U): ReadableSignal<U> {
        return convertedListenerSignal(
            this._baseSignal,
            listener => payload => listener(transform(payload)),
        );
    }
    public merge<U>(...signals: BaseSignal<U>[]): ReadableSignal<T|U> {
        return ExtendedSignal.merge<T|U>(this._baseSignal, ...signals);
    }
    public promisify(rejectSignal?: ReadableSignal<any>): Promise<T> {
        return ExtendedSignal.promisify(this._baseSignal, rejectSignal);
    }
    public readOnly(): ReadableSignal<T> {
        return convertedListenerSignal(
            this._baseSignal,
            listener => payload => listener(payload),
        );
    }
    public cache(cache: Cache<T>): ReadableSignal<T> {
        this._baseSignal.add(payload => cache.add(payload));

        return convertedListenerSignal(
            this._baseSignal,
            listener => payload => listener(payload),
            (listener, listenerActive) => {
                cache.forEach(payload => {
                    if (listenerActive()) {
                        listener(payload);
                    }
                });
            },
        );
    }
}

/**
 * Provides a new signal, with its own set of listeners, and the ability to transform listeners that
 * are added to the new signal.
 */
function convertedListenerSignal<BaseType, ExtendedType>(
    baseSignal: BaseSignal<BaseType>,
    convertListener: (listener: Listener<ExtendedType>)  => Listener<BaseType>,
    postAddHook?: (listener: Listener<ExtendedType>, listenerActive: () => boolean) => void,
): ExtendedSignal<ExtendedType> {
    const listenerMap = new Map<Listener<ExtendedType>, Listener<BaseType>>();
    return new ExtendedSignal({
        add: listener => {
            const newListener = convertListener(listener);
            listenerMap.set(listener, newListener);
            baseSignal.add(newListener);
            if (postAddHook) {
                postAddHook(listener, () => listenerMap.has(listener));
            }
        },
        remove: listener => {
            const newListener = listenerMap.get(listener);
            listenerMap.delete(listener);
            // TODO undefined ok in other case
            if (newListener !== undefined) {
                baseSignal.remove(newListener);
            }
        },
    });
}

import {BaseSignal, Listener, ReadableSignal, SignalBinding} from './interfaces';

function detachBindings(bindings: SignalBinding[]): void {
    bindings.forEach(binding => binding.detach());
}

export class ExtendedSignal<T> implements ReadableSignal<T> {
    public static merge<U>(...signals: BaseSignal<U>[]): ReadableSignal<U> {
        return new ExtendedSignal({
            add: listener  => {
                const bindings = signals.map(signal => signal.add(listener));
                return {
                    detach() {
                        detachBindings(bindings);
                    },
                };
            },
        });
    }
    public static promisify<U>(
        resolveSignal: BaseSignal<U>,
        rejectSignal?: BaseSignal<any>,
    ): Promise<U> {
        return new Promise<U>((resolve, reject) => {
            const bindings: SignalBinding[] = [];
            if (rejectSignal) {
                bindings.push(rejectSignal.add(payload => {
                    detachBindings(bindings);
                    reject(payload);
                }));
            }
            bindings.push(resolveSignal.add(payload => {
                detachBindings(bindings);
                resolve(payload);
            }));
        });
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
    public filter(filter: (payload: T) => boolean): ReadableSignal<T> {
        return new ExtendedSignal({
            add: listener => this._baseSignal.add(payload => {
                if (filter(payload)) {
                    listener(payload);
                }
            }),
        });
    }
    public map<U>(transform: (payload: T) => U): ReadableSignal<U> {
        return new ExtendedSignal({
            add: listener => this._baseSignal.add((payload: T) => listener(transform(payload))),
        });
    }
    public merge<U>(...signals: BaseSignal<U>[]): ReadableSignal<T|U> {
        return ExtendedSignal.merge<T|U>(this._baseSignal, ...signals);
    }
    public promisify(rejectSignal?: ReadableSignal<any>): Promise<T> {
        return ExtendedSignal.promisify(this._baseSignal, rejectSignal);
    }
    public readOnly(): ReadableSignal<T> {
        return new ExtendedSignal({
            add: listener => this._baseSignal.add(listener),
        });
    }
}

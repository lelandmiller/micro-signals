import {Listener, ReadableSignal, SignalBinding} from './interfaces';

export class MergedSignal<T> implements ReadableSignal<T> {
    private _signals: ReadableSignal<T>[];
    constructor(...signals: ReadableSignal<T>[]) {
        this._signals = signals;
    }
    add(listener: Listener<T>): SignalBinding {
        const bindings = this._signals.map(signal => signal.add(listener));
        return {
            detach() {
                bindings.forEach(binding => binding.detach());
            },
        };
    }
    addOnce(listener: Listener<T>): SignalBinding {
        const binding = this.add(payload => {
            binding.detach();
            listener(payload);
        });
        return binding;
    }
}

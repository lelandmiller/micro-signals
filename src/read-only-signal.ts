import {Signal} from './signal';
import {SignalBinding} from './signal-binding';

export class ReadOnlySignal<T> {
    public add: (listener: (payload: T) => void) => SignalBinding;
    public addOnce: (listener: (payload: T) => void) => SignalBinding;

    constructor(signal: Signal<T>) {
        this.add = signal.add.bind(signal);
        this.addOnce = signal.addOnce.bind(signal);
    }
}

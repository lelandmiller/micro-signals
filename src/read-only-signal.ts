import { Listener, ReadableSignal, SignalBinding } from './interfaces';

export class ReadOnlySignal<T> implements ReadableSignal<T> {
    public add: (listener: Listener<T>) => SignalBinding;
    public addOnce: (listener: Listener<T>) => SignalBinding;

    constructor(signal: ReadableSignal<T>) {
        this.add = signal.add.bind(signal);
        this.addOnce = signal.addOnce.bind(signal);
    }
}

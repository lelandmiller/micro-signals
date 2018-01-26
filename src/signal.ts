import {Listener, WritableSignal} from './interfaces';

import {ExtendedSignal} from './extended-signal';

export class Signal<T> extends ExtendedSignal<T> implements WritableSignal<T> {
    protected _listeners = new Set<Listener<T>>();
    constructor() {
        super({
            add: listener => {
                this._listeners.add(listener);
            },
            remove: listener => {
                this._listeners.delete(listener);
            },
        });
    }
    public dispatch(payload: T): void {
        this._listeners.forEach(callback => callback.call(undefined, payload));
    }
}

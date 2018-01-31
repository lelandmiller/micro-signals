import {Listener, WritableSignal} from './interfaces';

import {ExtendedSignal} from './extended-signal';
import { ReadableSignal } from './index';

export class Signal<T> extends ExtendedSignal<T> implements WritableSignal<T>, ReadableSignal<T> {
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

import { ExtendedSignal } from './extended-signal';
import { ReadableSignal } from './index';
import { Catcher, Listener, WritableSignal } from './interfaces';

export class Signal<T> extends ExtendedSignal<T> implements WritableSignal<T>, ReadableSignal<T> {
    public static setDefaultListener(listener: Listener<any>) {
        Signal._staticDefaultListener = listener;
    }

    private static _staticDefaultListener: Listener<any> = () => {
        // default static listener is a noop
    }

    protected _listeners = new Set<Listener<T>>();
    protected _catchers  = new Set<Catcher>();

    constructor() {
        super({
            add: listener => {
                this._listeners.add(listener);
            },
            catch: catcher => {
                this._catchers.add(catcher);
            },
            remove: listener => {
                this._listeners.delete(listener);
            },
            removeCatcher: catcher => {
                this._catchers.delete(catcher);
            },
        });
    }

    public dispatch(payload: T): void {
        if (this._listeners.size === 0) {
            const instanceDefaultListener = this._instanceDefaultListener;
            instanceDefaultListener(payload);
            return;
        }
        this._listeners.forEach(listener => {
            try {
                listener.call(undefined, payload);
            } catch (error) {
                this._catchers.forEach(catcher => {
                    // not catching if the catcher throws, to let the user know
                    catcher.call(undefined, error);
                });
            }
        });
    }

    public setDefaultListener(listener: Listener<T>) {
        this._instanceDefaultListener = listener;
    }

    private _instanceDefaultListener: Listener<T>
        = payload => Signal._staticDefaultListener(payload)
}

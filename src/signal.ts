import {ExtendedSignal} from './extended-signal';
import {ReadableSignal} from './index';
import {Catcher, CatchingSignal, Listener, WritableSignal} from './interfaces';

export class Signal<T> extends ExtendedSignal<T> implements WritableSignal<T>, ReadableSignal<T> {
    public static setDefaultListener(listener: Listener<any>) {
        Signal._staticDefaultListener = listener;
    }

    public static makeSafe<U>(signal: Signal<U>, catcher: Catcher): CatchingSignal<U> {
        const originalDispatch = signal.dispatch.bind(signal);
        let overwritableCatcher = catcher;
        return {
            catch: signal.catch.bind(signal),
            setCatcher: (newCatcher: Catcher) => overwritableCatcher = newCatcher,
            dispatch(payload: U, localCatcher = overwritableCatcher) {
                originalDispatch(payload, localCatcher);
            },
            setDefaultListener: signal.setDefaultListener.bind(signal),
        };
    }

    private static _staticDefaultListener: Listener<any> = () => {
        // default static listener is a noop
    }

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

    public dispatch(payload: T, catcher?: Catcher): void {
        if (this._listeners.size === 0) {
            const instanceDefaultListener = this._instanceDefaultListener;
            instanceDefaultListener(payload);
            return;
        }
        if (catcher) {
            this._listeners.forEach(listener => {
                try {
                    listener.call(undefined, payload);
                } catch (error) {
                    catcher(error);
                }
            });
        } else {
            this._listeners.forEach(listener => {
                listener.call(undefined, payload);
            });
        }
    }

    public catch(catcher: Catcher): CatchingSignal<T> {
        return Signal.makeSafe(this, catcher);
    }

    public setDefaultListener(listener: Listener<T>) {
        this._instanceDefaultListener = listener;
    }

    private _instanceDefaultListener: Listener<T>
        = payload => Signal._staticDefaultListener(payload)
}

/**
 * This signal is use to insure that signals do not leak listeners. Signals should not leave listeners
 * attached to their base signals unless needed. This prevents memory leak that could occur when
 * using these extended signal types.
 */

import {
    Signal as BaseSignal,
} from '../../src';

export class LeakDetectionSignal<T> extends BaseSignal<T> {
    get listenerCount(): number {
        return this._listeners.size;
    }
}

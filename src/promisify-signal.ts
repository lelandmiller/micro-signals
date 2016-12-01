import {SignalLike} from './interfaces/signal-like';

export function promisifySignal<T>(
    resolveSignal: SignalLike<T>,
    rejectSignal?: SignalLike<T>,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        if (rejectSignal) {
            rejectSignal.add(reject);
        }
        resolveSignal.add(resolve);
    });
}

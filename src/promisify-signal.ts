import {ReadableSignal} from './interfaces';

export function promisifySignal<T>(
    resolveSignal: ReadableSignal<T>,
    rejectSignal?: ReadableSignal<T>,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        if (rejectSignal) {
            rejectSignal.add(reject);
        }
        resolveSignal.add(resolve);
    });
}

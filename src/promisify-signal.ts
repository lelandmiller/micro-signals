import {ReadableSignal, SignalBinding} from './interfaces';

export function promisifySignal<T>(
    resolveSignal: ReadableSignal<T>,
    rejectSignal?: ReadableSignal<T>,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const bindings: SignalBinding[] = [];
        if (rejectSignal) {
            bindings.push(rejectSignal.add(payload => {
                clearBindings(bindings);
                reject(payload);
            }));
        }
        bindings.push(resolveSignal.add(payload => {
            clearBindings(bindings);
            resolve(payload);
        }));
    });
}

function clearBindings(bindings: SignalBinding[]): void {
    bindings.forEach(binding => binding.detach());
}

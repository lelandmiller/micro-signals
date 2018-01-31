import { Cache } from './interfaces';

export abstract class ArrayCache<T> implements Cache<T> {
    protected _payloads: T[] = [];
    public abstract add(value: T): void;
    public forEach(callback: (value: T) => void): void {
        this._payloads.forEach(value => callback(value));
    }
}

export class ValueCache<T> extends ArrayCache<T> {
    public add(value: T): void {
        this._payloads = [ value ];
    }
}

export class CollectionCache<T> extends ArrayCache<T> {
    public add(value: T): void {
        this._payloads.push(value);
    }
}

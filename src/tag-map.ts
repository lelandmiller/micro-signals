import {Listener} from './interfaces';

export class TagMap<T> {
    private _tagToListeners = new WeakMap<any, Set<Listener<T>>>();
    private _listenerToTags = new WeakMap<Listener<T>, Set<any>>();
    public setListeners(listener: Listener<T>, ...tags: any[]) {
        const tagSet = this._listenerToTags.get(listener) || new Set();
        tags.forEach(tag => {
            const listenerSet = this._tagToListeners.get(tag) || new Set();
            listenerSet.add(listener);
            tagSet.add(tag);
            this._tagToListeners.set(tag, listenerSet);
        });
        this._listenerToTags.set(listener, tagSet);
    }
    public getListeners(tag: any): Set<Listener<T>> {
        return this._tagToListeners.get(tag) || new Set();
    }
    public getTags(listener: Listener<T>): Set<any> {
        return this._listenerToTags.get(listener) || new Set();
    }
    public clearListener(listener: Listener<T>) {
        const tags = this.getTags(listener);
        this._listenerToTags.delete(listener);
        tags.forEach(tag => {
            const listenerSet = this.getListeners(tag);
            listenerSet.delete(listener);
            if (listenerSet.size === 0) {
                this._tagToListeners.delete(tag);
            }
        });
    }
}


export class TagMap<Thing extends object> {
    private _tagToThings = new WeakMap<any, Set<Thing>>();
    private _thingToTags = new WeakMap<Thing, Set<any>>();

    public setHandlers(thing: Thing, ...tags: any[]) {
        const tagSet = this._thingToTags.get(thing) || new Set();
        tags.forEach(tag => {
            const thingSet = this._tagToThings.get(tag) || new Set();
            thingSet.add(thing);
            tagSet.add(tag);
            this._tagToThings.set(tag, thingSet);
        });
        this._thingToTags.set(thing, tagSet);
    }

    public getThings(tag: any): Set<Thing> {
        return this._tagToThings.get(tag) || new Set();
    }

    public getTags(listener: Thing): Set<any> {
        return this._thingToTags.get(listener) || new Set();
    }

    public clearThing(handler: Thing) {
        const tags = this.getTags(handler);
        this._thingToTags.delete(handler);
        tags.forEach(tag => {
            const listenerSet = this.getThings(tag);
            listenerSet.delete(handler);
            if (listenerSet.size === 0) {
                this._tagToThings.delete(tag);
            }
        });
    }
}

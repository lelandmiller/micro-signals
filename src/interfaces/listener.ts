export interface Listener<T> {
    (payload: T): void;
}

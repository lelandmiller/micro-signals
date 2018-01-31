import test = require('tape');

import {Cache} from '../../src';

export function cacheSuite(
    cacheClass: { new<T>(): Cache<T> },
    expected: <T>(testCase: T[]) => T[],
) {
    const cacheName = (cacheClass as any).name;

    test(`${cacheName} call forEach callback if add has not been called`, t => {
        const cache = new cacheClass();
        let hasValue = false;
        cache.forEach(() => hasValue = true);
        t.false(hasValue);
        t.end();
    });

    function testCacheWithValues<T>(testDescription: string, testValues: T[]) {
        test(testDescription, t => {
            const cache = new cacheClass<T>();
            const cachedValues: T[] = [];

            testValues.forEach(value => cache.add(value));

            cache.forEach(value => cachedValues.push(value));

            t.deepEqual(cachedValues, expected(testValues));
            t.end();
        });
    }

    testCacheWithValues(
        `${cacheName} calls the forEach callback with the correct values`,
        [0, 2, 4, Infinity, 1, 49, 0],
    );

    testCacheWithValues(
        `${cacheName} works with null and undefined values`,
        [null, 0, 2, 4, undefined, Infinity, 1, 49, null, 0, undefined],
    );
}

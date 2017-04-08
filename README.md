# micro-signals

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

## Usage

Install using `npm install micro-signals`.

## Signal Types

micro-signals is a collection of very simple signal types that can be combined in powerful ways.

### Signal

Signals return a binding with a detach method, similar to js-signals, but with a simplified
interface. The example below shows all of the functionality for the basic signal.

```ts
import {Signal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();

const received: string[] = [];

const binding = signal.add(payload => {
    received.push(payload);
});

signal.dispatch('a');

binding.detach();

signal.dispatch('b');

assert.deepEqual(received, ['a']);
```

### ReadOnlySignal

ReadOnlySignals provide a wrapper around a signal with no dispatch method. This is primarily used to
publicly expose a signal while indicating that consumers of the signal should not dispatch the
signal.

```ts
import {Signal, ReadOnlySignal} from 'micro-signals';
import * as assert from 'assert';

const signal = new Signal<string>();
const readOnlySignal = new ReadOnlySignal(signal);

const received: string[] = [];

readOnlySignal.add(payload => {
    received.push(payload);
});

assert.equal((readOnlySignal as any).dispatch, undefined);

signal.dispatch('a');

assert.deepEqual(received, ['a']);
```

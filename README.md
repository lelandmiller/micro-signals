# micro-signals

A tiny typed messaging system inspired by js-signals that uses ES2015 sets

## Usage

Install using `npm install micro-signals`.

Then use it in a similar way to js-signals:

```ts
import {Signal} from 'micro-signals';

const signal = new Signal<string>();

const binding = signal.add(payload => {
    console.log(payload);
});

signal.dispatch('a');

binding.detach();
```

The usage illustrated above shows all of the available functionality.

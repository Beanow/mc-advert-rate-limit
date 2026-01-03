# Fixed window per byte

Sets a budget of adverts allowed per prefix byte per (fixed) interval window.

Ignores the type of advert, using the first byte of companions, room servers and repeaters as one pool.
Resets all counters at the same time *for this repeater*.

Should NOT coordinate this reset interval with other repeaters (such as "at 1 AM").
Because random offsets between when resets occur on neighboring repeaters is an intentional allowance.

## Running

```
deno run fixed-window-per-byte/main.ts 3 20 2
```

- Argument 0: budget per window
- Argument 1: window reset interval
- Argument 2: spamming repeaters, n out of 10

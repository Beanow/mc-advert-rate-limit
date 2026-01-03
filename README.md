## Concept rate limits for MeshCore adverts

While I'm sure other types of scaling issues will come up. The hot topic today
is flood adverts on MeshCore.

The necessity for repeater adverts in particular is limited, yet it takes up
some of the most airtime currently. This repo explores rate limiting for such
adverts.

### Assumptions

Any proposal that requires global coordination to be effective (like relying
solely on a good default interval) is infeasible. Whether due to lack of total
coordination, degradation, bugs or intentional DOS attacks.

Accidental spam _will inevitably and regularly_ appear on the mesh. Intentional
bad actors _will inevitably and regularly_ appear on the mesh.

A majority of repeater operators are good actors, that try to update and
configure their firmware on a best-effort basis. But this means they may lag
behind.

### Goals

Low resource overhead on repeaters.

Significant reduction in total airtime usage in adverse conditions like:

- Bugged / solar brownout / misconfigured repeaters, flood advertising a lot.
- Malicious user forging adverts and spamming them.

Currently this repo focusses on adverts only. But considers all advert types
(`NONE|CHAT|REPEATER|ROOM`).

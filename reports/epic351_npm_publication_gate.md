# Epic 351 / Issue 392 — npm publication gate

Status: BLOCKED
Package: @megabrain/cli
Declared version (local package.json): 3.2.0
Registry: https://registry.npmjs.org
Public install approved: no

## Probe

Command:
```
npm view @megabrain/cli version dist --json --registry=https://registry.npmjs.org
```
Exit: 1
Result: E404. GET https://registry.npmjs.org/@megabrain%2fcli — Not found.

## Verdict

E404 keeps this gate BLOCKED.
Local source tarball / npm pack is not a substitute for a published artifact.
No public install, no isolated prefix install, no integrity check of a registry tarball.
Node engines not exercised remain BLOCKED.
npm publish was not run.

## Not done

- No production or test file edited.
- No global install.
- No credential mutation.

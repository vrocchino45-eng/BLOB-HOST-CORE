# HC-002R — Validation Report

## Expected Registry Fixes

```text
flow_bond: present
inorganic domain: present
confluence domain: present
```

## Expected Runtime Debug

```text
BLOB HC-002R
Schema: ok
Placeholder Expired: visible warning count
```

## Why placeholder warnings are expected

Many current visuals still use `HC_VIS_*` placeholder replacement contracts. They are acceptable for runtime testing but should be visible as replacement pressure before final visual lock.

## Failing Conditions

HC-002R fails if:

- any chem object references a missing bond
- any object/local cell references a missing domain
- build metadata still reads HC-002Q
- visual composition debug still reads HC-002P or HC-002C
- build does not compile

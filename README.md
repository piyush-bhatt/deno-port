# deno-port

> Deno module to check if a port is available, get an available TCP port, or kill a process running on a port.

### Import Module

```typescript
import {
  getAvailablePort,
  getAvailablePortSync,
  isPortAvailable,
  isPortAvailableSync,
  killProcessOnPort
} from "https://deno.land/x/port/mod.ts"
```

## Usage

### isPortAvailable(options)
_Requires `--allow-net` flag_\
Returns a promise which resolves to `true` if a given port is available, else `false`.

### isPortAvailableSync(options)
_Requires `--allow-net` flag_\
Returns `true` if a given port is available, else `false`.

#### options
Type: `object`

##### port
_Required_\
Type: `number`

##### hostname
Type: `string`

##### transport
Type: `string`\
Values: `tcp`

---

### getAvailablePort(options)
_Requires `--allow-net` flag_\
Returns a promise which resolves to an available port number based on the options provided.

### getAvailablePortSync(options)
_Requires `--allow-net` flag_\
Returns an available port number based on the options provided.

#### options
Type: `object`

##### port
Type: `number[] | { start: number, end: number }`\
If not provided, a random port will be returned\
If an array of ports is provided, the first encountered available port in the array will be returned\
If a range is provided, the first encountered available port in the range will be returned

##### hostname
Type: `string`

##### transport
Type: `string`\
Values: `tcp`

---

### killProcessOnPort(port)
_Requires `--allow-run` and `--allow-net` flag_\
Kills the process running on the given port. Returns `true` if the process is killed successfully and the port is free, else `false`.

#### port
_Required_\
Type: `number`

## Test

>deno test --allow-net mode_test.ts

## Licensing

[MIT](https://github.com/piyush-bhatt/deno-port/blob/main/LICENSE) licensed

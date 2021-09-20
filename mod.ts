import { IListenerOptions, IOptions } from "./types.ts";

/**
 * Checks if a port is available
 * Requires `--allow-net` flag
 * @param options
 */
export async function isPortAvailable(
  options: IListenerOptions
): Promise<boolean> {
  try {
    const listener = Deno.listen({
      port: options.port,
      ...(options.hostname ? { hostname: options.hostname } : {}),
      ...(options.transport ? { transport: options.transport } : {}),
    });
    listener.close();
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.AddrInUse) {
      return false;
    }
    throw error;
  }
}

/**
 * Checks if a port is available
 * Requires `--allow-net` flag
 * @param options
 */
export function isPortAvailableSync(options: IListenerOptions): boolean {
  try {
    const listener = Deno.listen({
      port: options.port,
      ...(options.hostname ? { hostname: options.hostname } : {}),
      ...(options.transport ? { transport: options.transport } : {}),
    });
    listener.close();
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.AddrInUse) {
      return false;
    }
    throw error;
  }
}

/**
 * Finds a free port based on the options
 * Requires `--allow-net` flag
 * @param options
 */
export async function getAvailablePort(
  options: IOptions = { transport: "tcp" }
): Promise<number | undefined> {
  if (options.port === undefined) {
    return getRandomPort(options);
  } else if (Array.isArray(options.port)) {
    const portList = options.port;
    for (let i = 0; i < portList.length; i++) {
      if (withinRange(portList[i])) {
        const portAvailable = await isPortAvailable({
          port: portList[i],
          ...(options.hostname ? { hostname: options.hostname } : {}),
          ...(options.transport ? { transport: options.transport } : {}),
        });
        if (portAvailable) {
          return portList[i];
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
  } else if (
    options.port.start !== undefined &&
    options.port.end !== undefined
  ) {
    const start = options.port.start;
    const end = options.port.end;
    if (start >= 0 && end <= 65535 && start <= end) {
      for (let p = start; p <= end; p++) {
        const portAvailable = await isPortAvailable({
          port: p,
          ...(options.hostname ? { hostname: options.hostname } : {}),
          ...(options.transport ? { transport: options.transport } : {}),
        });
        if (portAvailable) {
          return p;
        } else {
          continue;
        }
      }
    } else {
      throw new Error(
        "Range should be between 0 - 65535 and start should be less than end"
      );
    }
  }
}

/**
 * Finds a free port based on the options
 * Requires `--allow-net` flag
 * @param options
 */
export function getAvailablePortSync(
  options: IOptions = { transport: "tcp" }
): number | undefined {
  if (options.port === undefined) {
    return getRandomPortSync(options);
  } else if (Array.isArray(options.port)) {
    const portList = options.port;
    for (let i = 0; i < portList.length; i++) {
      if (withinRange(portList[i])) {
        const portAvailable = isPortAvailableSync({
          port: portList[i],
          ...(options.hostname ? { hostname: options.hostname } : {}),
          ...(options.transport ? { transport: options.transport } : {}),
        });
        if (portAvailable) {
          return portList[i];
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
  } else if (
    options.port.start !== undefined &&
    options.port.end !== undefined
  ) {
    const start = options.port.start;
    const end = options.port.end;
    if (start >= 0 && end <= 65535 && start <= end) {
      for (let p = start; p <= end; p++) {
        const portAvailable = isPortAvailableSync({
          port: p,
          ...(options.hostname ? { hostname: options.hostname } : {}),
          ...(options.transport ? { transport: options.transport } : {}),
        });
        if (portAvailable) {
          return p;
        } else {
          continue;
        }
      }
    } else {
      throw new Error(
        "Range should be between 0 - 65535 and start should be less than end"
      );
    }
  }
}

/**
 * Kills running process on a given port
 * Requires `--allow-run` flag
 * @param port
 */
export async function killProcessOnPort(port: number): Promise<boolean> {
  const os = Deno.build.os;
  if (os == "windows") {
    await handleKillPortWindows(port);
  } else {
    await handleKillPort(port);
  }
  await sleep(10);
  return await isPortAvailable({ port });
}

/**
 * Finds a random available port in range 0-65535
 * @param options
 */
async function getRandomPort(options: IOptions): Promise<number> {
  const randomPort = random(0, 65535);
  if (
    await isPortAvailable({
      port: randomPort,
      ...(options.hostname ? { hostname: options.hostname } : {}),
      ...(options.transport ? { transport: options.transport } : {}),
    })
  ) {
    return randomPort;
  } else {
    return getRandomPort(options);
  }
}

/**
 * Finds a random available port in range 0-65535
 * @param options
 */
function getRandomPortSync(options: IOptions): number {
  const randomPort = random(0, 65535);
  if (
    isPortAvailableSync({
      port: randomPort,
      ...(options.hostname ? { hostname: options.hostname } : {}),
      ...(options.transport ? { transport: options.transport } : {}),
    })
  ) {
    return randomPort;
  } else {
    return getRandomPortSync(options);
  }
}

/**
 * Finds a random number between the given range
 * @param min
 * @param max
 */
function random(min: number, max: number): number {
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * Checks if the given port is within range of 0-65535
 * @param port
 */
function withinRange(port: number): boolean {
  return port >= 0 && port <= 65535;
}

/**
 * Handles killing a process on given port in windows OS
 * @param port
 */
async function handleKillPortWindows(port: number) {
  const pid = await getPIDWindows(port);
  if (pid !== null) {
    killPIDWindows(pid);
  }
}

/**
 * Get PID for a running process on given port in windows OS
 * @param port
 */
async function getPIDWindows(port: number): Promise<number | null> {
  const cmd = Deno.run({
    cmd: ["cmd", "/c", "netstat -a -n -o | findstr", `${port}`],
    stdout: "piped",
    stderr: "piped",
  });
  const output = new TextDecoder("utf-8").decode(await cmd.output());
  const lines = output.split("\n");
  const lineWithLocalPortRegEx = new RegExp(`^ *TCP *[^ ]*:${port}`, "gm");
  const linesWithLocalPort = lines.filter((line) =>
    line.match(lineWithLocalPortRegEx)
  );
  let pid = linesWithLocalPort[0].trim().split(/[\s, ]+/)[3];
  return pid ? parseInt(pid) : null;
}

/**
 * Kill given PID in windows OS
 * @param pid
 */
async function killPIDWindows(pid: number) {
  const cmd = Deno.run({
    cmd: ["cmd", "/c", `taskkill /PID ${pid} /F`],
    stdout: "piped",
    stderr: "piped",
  });
  await cmd.output();
  cmd.close();
}

/**
 * Handles killing a process on given port in darwin and linux OS
 * @param port
 */
async function handleKillPort(port: number): Promise<void> {
  const bash = Deno.run({
    cmd: ["bash"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const command = `lsof -nti:${port} | xargs kill -9`;
  await bash.stdin.write(new TextEncoder().encode(command));
  bash.stdin.close();
  await bash.output();
  bash.close();
}

/**
 * Promisify setTimeout
 * @param ms
 */
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

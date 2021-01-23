import {
  assertEquals,
  assertThrows,
  assertThrowsAsync,
  serve,
} from "./test_deps.ts";
import {
  getAvailablePort,
  getAvailablePortSync,
  isPortAvailable,
  isPortAvailableSync,
} from "./mod.ts";

Deno.test("sync - port available", () => {
  assertEquals(isPortAvailableSync({ port: 3000 }), true);
  const server = serve({ port: 3000 });
  assertEquals(isPortAvailableSync({ port: 3000 }), false);
  server.close();
});

Deno.test("sync - random port", () => {
  const port = getAvailablePortSync();
  assertEquals(port !== undefined && 0 <= port && port <= 65535, true);
});

Deno.test("sync - ports array", () => {
  assertEquals(getAvailablePortSync({ port: [3000, 4000] }), 3000);
  const server1 = serve({ port: 3000 });
  assertEquals(getAvailablePortSync({ port: [3000, 4000] }), 4000);
  const server2 = serve({ port: 4000 });
  assertEquals(getAvailablePortSync({ port: [3000, 4000] }), undefined);
  server1.close();
  server2.close();
});

Deno.test("sync - ports range", () => {
  assertEquals(
    getAvailablePortSync({ port: { start: 3000, end: 3001 } }),
    3000
  );
  const server = serve({ port: 3000 });
  assertEquals(
    getAvailablePortSync({ port: { start: 3000, end: 3001 } }),
    3001
  );
  server.close();
});

Deno.test("sync - argument errors", () => {
  assertThrows(() => {
    getAvailablePortSync({ port: { start: 0, end: 65536 } });
  });
  assertThrows(() => {
    getAvailablePortSync({ port: { start: -1, end: 3000 } });
  });
  assertThrows(() => {
    getAvailablePortSync({ port: { start: 4000, end: 3000 } });
  });
});

Deno.test("async - port available", async () => {
  assertEquals(await isPortAvailable({ port: 3000 }), true);
  const server = serve({ port: 3000 });
  assertEquals(await isPortAvailable({ port: 3000 }), false);
  server.close();
});

Deno.test("async - random port", async () => {
  const port = await getAvailablePort();
  assertEquals(port !== undefined && 0 <= port && port <= 65535, true);
});

Deno.test("async - ports array", async () => {
  assertEquals(await getAvailablePort({ port: [3000, 4000] }), 3000);
  const server1 = serve({ port: 3000 });
  assertEquals(await getAvailablePort({ port: [3000, 4000] }), 4000);
  const server2 = serve({ port: 4000 });
  assertEquals(await getAvailablePort({ port: [3000, 4000] }), undefined);
  server1.close();
  server2.close();
});

Deno.test("async - ports range", async () => {
  assertEquals(
    await getAvailablePort({ port: { start: 3000, end: 3001 } }),
    3000
  );
  const server = serve({ port: 3000 });
  assertEquals(
    await getAvailablePort({ port: { start: 3000, end: 3001 } }),
    3001
  );
  server.close();
});

Deno.test("async - argument errors", () => {
  assertThrowsAsync(async () => {
    await getAvailablePort({ port: { start: 0, end: 65536 } });
  });
  assertThrowsAsync(async () => {
    await getAvailablePort({ port: { start: -1, end: 3000 } });
  });
  assertThrowsAsync(async () => {
    await getAvailablePort({ port: { start: 4000, end: 3000 } });
  });
});

// TODO : Add testcases for killProcessOnPort

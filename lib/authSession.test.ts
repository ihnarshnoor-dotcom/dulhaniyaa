import { describe, expect, it, vi } from "vitest";
import { createTokenStore, refreshDelay, sendWithAuth, singleFlight, tokenTimes, type LockManagerLike } from "./authSession";

const response = (status: number) => new Response(null, { status });

/** A promise plus the functions that settle it, so a test decides when a "request" finishes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Runs callbacks for the same lock name one after another, like navigator.locks across tabs. */
function fakeLocks() {
  const queues = new Map<string, Promise<unknown>>();
  const names: string[] = [];
  const locks: LockManagerLike = {
    request<T>(name: string, callback: () => Promise<T>) {
      names.push(name);
      const run = (queues.get(name) ?? Promise.resolve()).then(callback);
      queues.set(name, run.catch(() => {}));
      return run;
    },
  };
  return { locks, names };
}

describe("tokenTimes", () => {
  it("refreshes 60 seconds before a 15-minute token expires", () => {
    expect(tokenTimes(900, 1_000)).toEqual({ expiresAt: 901_000, refreshAt: 841_000 });
  });

  it("refreshes halfway through very short lifetimes", () => {
    expect(tokenTimes(60, 0)).toEqual({ expiresAt: 60_000, refreshAt: 30_000 });
    expect(tokenTimes(120, 0).refreshAt).toBe(60_000);
  });

  it.each([undefined, null, 0, -5, Number.NaN, Infinity, "900"])("assumes 15 minutes when expiresIn is %j", (expiresIn) => {
    expect(tokenTimes(expiresIn, 0)).toEqual({ expiresAt: 900_000, refreshAt: 840_000 });
  });
});

describe("refreshDelay", () => {
  it("counts down to the refresh time", () => {
    expect(refreshDelay(841_000, 1_000)).toBe(840_000);
  });

  it("is zero once the refresh time has passed (a tab shown again after a while)", () => {
    expect(refreshDelay(1_000, 5_000)).toBe(0);
  });

  it("stays within what setTimeout accepts for very long tokens", () => {
    const { refreshAt } = tokenTimes(60 * 60 * 24 * 30, 0);
    expect(refreshDelay(refreshAt, 0)).toBe(2 ** 31 - 1);
  });
});

describe("createTokenStore", () => {
  it("keeps the token in memory with its expiry", () => {
    const store = createTokenStore();
    expect(store.get()).toBeNull();
    expect(store.refreshAt()).toBeNull();

    store.set({ token: "a", expiresIn: 900 }, 0);
    expect(store.get()).toBe("a");
    expect(store.refreshAt()).toBe(840_000);
    expect(store.isExpired(894_000)).toBe(false);
    expect(store.isExpired(895_000)).toBe(true);
  });

  it("tells listeners about changes and bumps the version", () => {
    const store = createTokenStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const v0 = store.version();

    store.set({ token: "a", expiresIn: 900 });
    store.clear();
    store.clear(); // already empty: no change
    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.version()).toBe(v0 + 2);

    unsubscribe();
    store.set({ token: "b", expiresIn: 900 });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("singleFlight", () => {
  it("shares one run between callers while it is in flight", async () => {
    const pending = deferred<string>();
    const task = vi.fn(() => pending.promise);
    const refresh = singleFlight(task, { lockName: "refresh", locks: null });

    const first = refresh();
    const second = refresh();
    expect(second).toBe(first);
    expect(task).toHaveBeenCalledTimes(1);

    pending.resolve("token");
    await expect(Promise.all([first, second])).resolves.toEqual(["token", "token"]);
  });

  it("starts a new run once the last one has finished", async () => {
    const task = vi.fn().mockResolvedValueOnce("a").mockResolvedValueOnce("b");
    const refresh = singleFlight(task, { lockName: "refresh", locks: null });

    await expect(refresh()).resolves.toBe("a");
    await expect(refresh()).resolves.toBe("b");
    expect(task).toHaveBeenCalledTimes(2);
  });

  it("shares a failure, then lets the next call try again", async () => {
    const task = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("token");
    const refresh = singleFlight(task, { lockName: "refresh", locks: null });

    const calls = [refresh(), refresh()];
    await expect(calls[0]).rejects.toThrow("offline");
    await expect(calls[1]).rejects.toThrow("offline");
    await expect(refresh()).resolves.toBe("token");
    expect(task).toHaveBeenCalledTimes(2);
  });

  it("takes the named Web Lock, so tabs refresh one after another", async () => {
    const { locks, names } = fakeLocks();
    const order: string[] = [];
    const tabA = deferred<string>();
    // Two tabs: separate in-tab promises, one shared lock manager.
    const refreshA = singleFlight(
      () => {
        order.push("A start");
        return tabA.promise.then((t) => (order.push("A end"), t));
      },
      { lockName: "auth", locks },
    );
    const refreshB = singleFlight(
      async () => {
        order.push("B start");
        return "b";
      },
      { lockName: "auth", locks },
    );

    const a = refreshA();
    const b = refreshB();
    await Promise.resolve();
    expect(order).toEqual(["A start"]);

    tabA.resolve("a");
    await expect(Promise.all([a, b])).resolves.toEqual(["a", "b"]);
    expect(order).toEqual(["A start", "A end", "B start"]);
    expect(names).toEqual(["auth", "auth"]);
  });

  it("runs the task directly when the lock itself fails", async () => {
    const locks: LockManagerLike = { request: () => Promise.reject(new DOMException("blocked", "SecurityError")) };
    const task = vi.fn().mockResolvedValue("token");

    await expect(singleFlight(task, { lockName: "auth", locks })()).resolves.toBe("token");
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("does not run the task twice when the task fails inside the lock", async () => {
    const { locks } = fakeLocks();
    const task = vi.fn().mockRejectedValue(new Error("offline"));

    await expect(singleFlight(task, { lockName: "auth", locks })()).rejects.toThrow("offline");
    expect(task).toHaveBeenCalledTimes(1);
  });
});

describe("sendWithAuth", () => {
  const session = (token: string | null, { expired = false } = {}) => {
    let current = token;
    return {
      getToken: () => current,
      isExpired: () => expired,
      setToken: (t: string | null) => (current = t),
    };
  };

  it("sends the current token and does not refresh when the call works", async () => {
    const send = vi.fn().mockResolvedValue(response(200));
    const refresh = vi.fn();

    const res = await sendWithAuth(send, { ...session("old"), refresh });
    expect(res?.status).toBe(200);
    expect(send).toHaveBeenCalledExactlyOnceWith("old");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("on a 401, refreshes once and retries once with the new token", async () => {
    const send = vi.fn().mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(200));
    const refresh = vi.fn().mockResolvedValue("new");

    const res = await sendWithAuth(send, { ...session("old"), refresh });
    expect(res?.status).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(send.mock.calls).toEqual([["old"], ["new"]]);
  });

  it("gives up after one retry when the new token is refused too", async () => {
    const send = vi.fn().mockResolvedValue(response(401));
    const refresh = vi.fn().mockResolvedValue("new");

    const res = await sendWithAuth(send, { ...session("old"), refresh });
    expect(res?.status).toBe(401);
    expect(send).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("returns the 401 without retrying when the session is over", async () => {
    const send = vi.fn().mockResolvedValue(response(401));
    const refresh = vi.fn().mockResolvedValue(null);

    const res = await sendWithAuth(send, { ...session("old"), refresh });
    expect(res?.status).toBe(401);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("uses a token another request already refreshed instead of refreshing again", async () => {
    const auth = session("old");
    const send = vi.fn(async (token: string) => {
      if (token === "old") {
        auth.setToken("newer"); // a parallel request refreshed meanwhile
        return response(401);
      }
      return response(200);
    });
    const refresh = vi.fn();

    const res = await sendWithAuth(send, { ...auth, refresh });
    expect(res?.status).toBe(200);
    expect(send.mock.calls).toEqual([["old"], ["newer"]]);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes first when there is no token yet (after a reload)", async () => {
    const send = vi.fn().mockResolvedValue(response(200));
    const refresh = vi.fn().mockResolvedValue("restored");

    await sendWithAuth(send, { ...session(null), refresh });
    expect(send).toHaveBeenCalledExactlyOnceWith("restored");
  });

  it("refreshes first instead of sending a token that has already expired", async () => {
    const send = vi.fn().mockResolvedValue(response(200));
    const refresh = vi.fn().mockResolvedValue("new");

    await sendWithAuth(send, { ...session("old", { expired: true }), refresh });
    expect(send).toHaveBeenCalledExactlyOnceWith("new");
  });

  it("sends nothing and returns null when there is no session at all", async () => {
    const send = vi.fn();
    const res = await sendWithAuth(send, { ...session(null), refresh: vi.fn().mockResolvedValue(null) });
    expect(res).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("passes on a refresh that fails for another reason, such as the network", async () => {
    const send = vi.fn().mockResolvedValue(response(401));
    const refresh = vi.fn().mockRejectedValue(new Error("offline"));

    await expect(sendWithAuth(send, { ...session("old"), refresh })).rejects.toThrow("offline");
    expect(send).toHaveBeenCalledTimes(1);
  });
});

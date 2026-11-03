import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CacheService } from "@/lib/cache/cacheService";

describe("CacheService (TTL Cache em Memória)", () => {
  beforeEach(() => {
    CacheService.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    CacheService.clear();
    vi.useRealTimers();
  });

  it("deve executar o fetcher na primeira chamada e armazenar no cache", async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1, nome: "TV Ranking" });

    const data1 = await CacheService.getOrSet("tv_key", 15, fetcher);
    expect(data1).toEqual({ id: 1, nome: "TV Ranking" });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Segunda chamada imediata deve vir do cache sem chamar o fetcher
    const data2 = await CacheService.getOrSet("tv_key", 15, fetcher);
    expect(data2).toEqual({ id: 1, nome: "TV Ranking" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("deve re-executar o fetcher após o TTL expirar", async () => {
    let count = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      count++;
      return { count };
    });

    const res1 = await CacheService.getOrSet("count_key", 10, fetcher);
    expect(res1).toEqual({ count: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Avança 11 segundos no tempo simulado
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    const res2 = await CacheService.getOrSet("count_key", 10, fetcher);
    expect(res2).toEqual({ count: 2 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("deve invalidar chaves correspondentes ao padrão", async () => {
    const fetcher = vi.fn().mockResolvedValue("dados");
    await CacheService.getOrSet("user_123_profile", 60, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);

    CacheService.invalidate("user_123");

    await CacheService.getOrSet("user_123_profile", 60, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
function act(callback: () => void) {
  callback();
}

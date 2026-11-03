import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deve retornar o valor inicial imediatamente", () => {
    const { result } = renderHook(() => useDebounce("teste", 250));
    expect(result.current).toBe("teste");
  });

  it("não deve atualizar o valor antes do tempo limite de delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "inicio", delay: 250 } }
    );

    rerender({ value: "alterado", delay: 250 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("inicio");
  });

  it("deve atualizar o valor após completar o tempo limite de delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "inicio", delay: 250 } }
    );

    rerender({ value: "atualizado", delay: 250 });
    act(() => {
      vi.advanceTimersByTime(260);
    });
    expect(result.current).toBe("atualizado");
  });
});

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendBadge } from "@/components/crm/primitives/TrendBadge";

describe("TrendBadge — Regra Permanente de Sanitização de Sinais", () => {
  it("não deve exibir sinais matemáticos duplicados (++ ou --)", () => {
    const { container } = render(<TrendBadge value="++12.5%" />);
    const text = container.textContent || "";
    expect(text).not.toContain("++");
    expect(text).not.toContain("--");
    expect(text).toContain("+12.5%");
  });

  it("não deve exibir sufixo percentual duplicado (%%)", () => {
    const { container } = render(<TrendBadge value="15%" suffix="%" />);
    const text = container.textContent || "";
    expect(text).not.toContain("%%");
    expect(text).toBe("+15%");
  });

  it("não deve exibir caracteres de seta Unicode (↗ ou ↘) no texto quando houver ícone", () => {
    const { container } = render(<TrendBadge value="↗ +100%" showIcon={true} />);
    const text = container.textContent || "";
    expect(text).not.toContain("↗");
    expect(text).not.toContain("↘");
    expect(text).toBe("+100%");
  });

  it("deve sanitizar números negativos corretamente", () => {
    const { container } = render(<TrendBadge value={-5.2} />);
    const text = container.textContent || "";
    expect(text).toBe("-5,2%");
  });
});

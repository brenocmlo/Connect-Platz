"use client";

import React, { useState, useEffect } from "react";

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
}

/**
 * NumericInput
 * Componente controlado de entrada numérica que resolve definitivamente o problema
 * de 'zeros travados' em inputs React (quando o usuário tenta apagar com backspace ou
 * digitar outro número e o 0 persiste).
 *
 * Características:
 * - Quando o valor é 0, exibe placeholder sutil "0" em vez de um dígito travado.
 * - Ao focar, seleciona automaticamente todo o conteúdo (substituição imediata com 1 toque).
 * - Ao apagar tudo, permite que o campo fique em branco sem forçar "0" de volta.
 * - Aceita tanto ponto (.) quanto vírgula (,) no padrão brasileiro.
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  allowDecimals = true,
  placeholder = "0",
  className = "",
  onFocus,
  onBlur,
  ...rest
}: NumericInputProps) {
  // Mantém string interna para não brigar com o cursor do usuário ao digitar ou apagar
  const [text, setText] = useState<string>(() => (value === 0 ? "" : String(value)));

  // Sincroniza quando o valor externo muda via prop (ex: seleção de empreendimento ou reset de formulário)
  useEffect(() => {
    const currentNum = text === "" ? 0 : parseFloat(text);
    if (value !== currentNum) {
      setText(value === 0 ? "" : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Se o usuário apagou tudo (backspace), permite campo vazio e propaga 0
    if (raw.trim() === "") {
      setText("");
      onChange(0);
      return;
    }

    // Normaliza vírgula para ponto e remove caracteres inválidos
    let normalized = raw.replace(",", ".");
    if (allowDecimals) {
      // Permite dígitos e apenas um único ponto decimal
      normalized = normalized.replace(/[^\d.]/g, "");
      const parts = normalized.split(".");
      if (parts.length > 2) {
        normalized = `${parts[0]}.${parts.slice(1).join("")}`;
      }
    } else {
      normalized = normalized.replace(/\D/g, "");
    }

    setText(normalized);

    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      if (max !== undefined && parsed > max) {
        setText(String(max));
        onChange(max);
      } else {
        onChange(parsed);
      }
    } else {
      onChange(0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleção automática ao focar: digitar qualquer dígito substitui o número anterior
    e.target.select();
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        setText(String(min));
        onChange(min);
      }
    }
    onBlur?.(e);
  };

  return (
    <input
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={text}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  );
}

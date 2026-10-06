import { useEffect, useState } from "react";
import { formatNumber, parseMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value ? formatNumber(value) : "");

  useEffect(() => {
    setText(value ? formatNumber(value) : "");
  }, [value]);

  return (
    <input
      inputMode="numeric"
      autoComplete="off"
      className={cn("field tabular", className)}
      placeholder={placeholder}
      value={text}
      onChange={(event) => {
        const next = parseMoney(event.target.value);
        setText(event.target.value.trim() ? formatNumber(next) : "");
        onChange(next);
      }}
    />
  );
}

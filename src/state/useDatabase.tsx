import { createSignal } from "solid-js";
import type { NestMap, ValueObject, CurrentValue } from "../lib/types";

const settableTypes = ["string", "number", "boolean"];

export function useDatabase() {
  const [entries, setEntries] = createSignal<NestMap[]>([]);
  const [fileName, setFileName] = createSignal<string>("");

  function loadJSON(json: unknown[], name = "db.json") {
    setFileName(name);
    const mapped = json.map((entry) => mapEntry(entry as Record<string, any>));
    setEntries(mapped);
  }

  function mapEntry(obj: Record<string, any>): NestMap {
    const m: NestMap = new Map();
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      const isArrayOfPrimitives =
        Array.isArray(value) &&
        value.length > 0 &&
        settableTypes.includes(typeof value[0]);

      if (settableTypes.includes(typeof value) || isArrayOfPrimitives) {
        const vo: ValueObject = {
          currentValue: value as CurrentValue,
          newValue: "",
          history: [],
        };
        m.set(key, vo);
      } else if (value !== null && typeof value === "object") {
        m.set(key, mapEntry(value));
      } else {
        const vo: ValueObject = {
          currentValue: value as CurrentValue,
          newValue: "",
          history: [],
        };
        m.set(key, vo);
      }
    }
    return m;
  }

  function saveAll() {
    const updated = entries().map((entry) => {
      const newMap: NestMap = new Map();

      for (const [k, v] of entry) {
        if (v instanceof Map) {
          newMap.set(k, v);
        } else {
          const updatedCurrent =
            typeof v.newValue === "string" && v.newValue.length > 0
              ?
              coerceToOriginalType(v.currentValue, v.newValue)
              : v.currentValue;

          const updatedHistory =
            v.newValue.length > 0 ? [...v.history, String(v.currentValue)] : v.history;

          const vo: ValueObject = {
            currentValue: updatedCurrent,
            newValue: "",
            history: updatedHistory,
          };
          newMap.set(k, vo);
        }
      }

      return newMap;
    });

    setEntries(updated);
  }

  function coerceToOriginalType(orig: CurrentValue, newVal: string): CurrentValue {
    if (typeof orig === "number") {
      const n = Number(newVal);
      return Number.isNaN(n) ? newVal : n;
    }
    if (Array.isArray(orig)) {
      try {
        if (newVal.trim().startsWith("[")) return JSON.parse(newVal);
        return newVal.split(",").map((s) => s.trim());
      } catch {
        return newVal;
      }
    }
    if (typeof orig === "boolean") {
      const lower = newVal.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
    }
    return newVal;
  }

  function exportJSON() {
    const arr = entries().map((entry) => mapOut(entry));
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName() || "export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function mapOut(map: NestMap) {
    const out: Record<string, any> = {};
    for (const [k, v] of map) {
      if (v instanceof Map) {
        out[k] = mapOut(v);
      } else {
        out[k] = v.currentValue;
      }
    }
    return out;
  }

  return {
    entries,
    loadJSON,
    saveAll,
    exportJSON,
    fileName,
  };
}

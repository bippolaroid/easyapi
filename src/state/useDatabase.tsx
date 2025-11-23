import { createSignal } from "solid-js";
import type { NestMap, ValueObject } from "../lib/types";

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
          currentValue: value,
          newValue: "",
          history: [],
        };
        m.set(key, vo);
      } else if (value !== null && typeof value === "object") {
        m.set(key, mapEntry(value));
      } else {
        const vo: ValueObject = {
          currentValue: value,
          newValue: "",
          history: [],
        };
        m.set(key, vo);
      }
    }
    return m;
  }

  return {
    entries,
    loadJSON,
    fileName,
  };
}

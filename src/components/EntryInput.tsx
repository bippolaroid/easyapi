import type { Component } from "solid-js";
import type { ValueObject } from "../lib/types";

type Props = {
  valueObj: ValueObject;
  updateValue: (v: string) => void;
};

const EntryInput: Component<Props> = (props) => {
  return (
    <input
      class="w-full bg-slate-800 p-2 rounded text-slate-200 outline-none focus:ring-2 focus:ring-cyan-600"
      type="text"
      value={props.valueObj.newValue.length > 0 ? props.valueObj.newValue : String(props.valueObj.currentValue ?? "")}
      onInput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        props.updateValue(v);
      }}
    />
  );
};

export default EntryInput;

import { Match,  Switch, type Component } from "solid-js";
import type { ValueObject } from "../lib/types";

type Props = {
  name: string;
  valueObj: ValueObject;
  updateValue: (v: string) => void;
};

const charLimit = 60;

const EntryInput: Component<Props> = (props) => {
  return (
    <>
      <section class="flex flex-col gap-2">
        <label class="text-lg capitalize">{props.name}</label>
        <Switch fallback={<div>Invalid data type</div>}>
          <Match when={props.valueObj.currentValue?.toString().length! < charLimit}>
            <input
              class="w-full outline outline-neutral-300 hover:outline-neutral-400 focus:outline-neutral-700 transition text-neutral-300 hover:text-neutral-400 focus:text-neutral-700 px-2 py-1 rounded-lg"
              type="text"
              value={props.valueObj.newValue.length > 0 ? props.valueObj.newValue : String(props.valueObj.currentValue ?? "")}
              onInput={(e) => {
                const v = (e.currentTarget as HTMLInputElement).value;
                props.updateValue(v);
              }}
            />
          </Match>
          <Match when={props.valueObj.currentValue?.toString().length! > charLimit}>
            <textarea
              class="w-full min-h-72 outline outline-neutral-300 hover:outline-neutral-400 focus:outline-neutral-700 transition text-neutral-300 hover:text-neutral-400 focus:text-neutral-700 px-2 py-1 rounded-lg"
              value={props.valueObj.newValue.length > 0 ? props.valueObj.newValue : String(props.valueObj.currentValue ?? "")}
              onInput={(e) => {
                const v = (e.currentTarget as HTMLTextAreaElement).value;
                props.updateValue(v);
              }}>
            </textarea>
          </Match>
        </Switch>
      </section>
    </>
  );
};

export default EntryInput;

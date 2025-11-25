import { createSignal, createEffect, onMount } from "solid-js";
import type { NestMap, ValueObject } from "../lib/types";

type OnSelectInfo = {
  map: NestMap;
  keyName: string;
  setModified: (v: boolean) => void;
  setSelected: (v: boolean) => void;
  updateValue: (v: string) => void;
};

type Props = {
  map: NestMap;
  keyName: string;
  onSelect: (info: OnSelectInfo) => void;
  sticky?: boolean;
};

export default function ValueCell(props: Props) {
  const valueObj = props.map.get(props.keyName) as ValueObject;
  const [selected, setSelected] = createSignal(false);
  const [modified, setModified] = createSignal(false);
  const [text, setText] = createSignal<string>(String(valueObj?.currentValue ?? ""));

  let tableCell!: HTMLTableCellElement;

  if (valueObj.newValue) {
    setModified(true);
  }

  createEffect(() => {
    if (!modified()) {
      setText(String(valueObj?.currentValue ?? ""));
    } else {
      setText(valueObj?.newValue?.length ? valueObj.newValue : String(valueObj?.currentValue ?? ""));
    }
  });

  createEffect(() => {
    if (selected()) {
      tableCell.classList.remove("bg-white");
      tableCell.classList.add("bg-neutral-100");
      tableCell.classList.add("text-neutral-500");
    } else {
      tableCell.classList.add("bg-white");
      tableCell.classList.remove("bg-neutral-100");
      tableCell.classList.remove("text-neutral-500");
    }
  })

  onMount(() => {
    window.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (selected() && !target.closest("#properties-panel")) {
        setSelected(false);
      }
    })
  })

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    props.onSelect({
      map: props.map,
      keyName: props.keyName,
      setModified,
      setSelected,
      updateValue: (v: string) => {
        if (!valueObj) return;
        valueObj.newValue = v;
        setModified(true);
        setText(v);
      },
    });
  }

  return (
    <td
      ref={tableCell}
      class={`${props.sticky ? `sticky left-0 outline-6 outline-neutral-300 ` : ``}p-4 min-w-36 max-w-2xl bg-white text-neutral-300 border-b not-last:border-r border-neutral-300 hover:text-neutral-500 cursor-default`}
      onClick={handleClick}
    >
      <div class="mx-auto w-fit text-wrap break-keep">
        {text()}
      </div>
    </td>


  );
};
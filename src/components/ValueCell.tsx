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
};

export default function ValueCell(props: Props) {
  const valueObj = props.map.get(props.keyName) as ValueObject;
  const [selected, setSelected] = createSignal(false);
  const [modified, setModified] = createSignal(false);
  const [text, setText] = createSignal<string>(String(valueObj?.currentValue ?? ""));

  let tableCell!: HTMLTableCellElement;

  createEffect(() => {
    if (!modified()) {
      setText(String(valueObj?.currentValue ?? ""));
    } else {
      setText(valueObj?.newValue?.length ? valueObj.newValue : String(valueObj?.currentValue ?? ""));
    }
  });

  createEffect(() => {
    if (selected()) {
      tableCell.classList.add("bg-neutral-100");
      tableCell.classList.add("text-neutral-500");
    } else {
      tableCell.classList.remove("bg-neutral-100");
      tableCell.classList.remove("text-neutral-500");
    }
  })

  onMount(() => {
    window.addEventListener("click", () => {
      if (selected()) {
        setSelected(false);
      }
    })
  })

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    setSelected(!selected());
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
      class="px-3 py-2 text-neutral-300 border-b not-last:border-r border-neutral-300 hover:text-neutral-500 cursor-default whitespace-nowrap"
      onClick={handleClick}
    >
      {text()}
    </td>
  );
};
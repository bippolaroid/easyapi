import { createSignal, createEffect, onMount, JSXElement, Setter, Accessor } from "solid-js";
import type { NestMap } from "../lib/types";
import DataTable, { PropertiesData } from "./DataTable";

export type OnSelectInfo = {
    map: NestMap[];
    keyName: string;
    setModified: (v: boolean) => void;
    setSelected: (v: boolean) => void;
    updateValue: (v: string) => void;
};

type Props = {
    map: NestMap[];
    keyName: string;
    isExpanded: Setter<number | undefined>;
    propertiesData: PropertiesData;
    onSelect: (info: OnSelectInfo) => void;
    sticky?: boolean;
};

export default function MapCell(props: Props) {
    const [selected, setSelected] = createSignal(false);
    const [modified, setModified] = createSignal(false);
    const [text, setText] = createSignal<string>(`${props.map.length} entries`);

    let tableCell!: HTMLTableCellElement;

    createEffect(() => {
        if (modified()) {
            setText(props.map.length.toString());
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
                props.isExpanded();
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
            },
        });
    }

    return (
        <td
            ref={tableCell}
            class={`${props.sticky ? `sticky left-0 ` : ``}p-4 min-w-36 max-w-2xl bg-white text-neutral-300 border-b not-last:border-r border-neutral-300 hover:text-neutral-500 cursor-default`}
            onClick={handleClick}
        >
            <div class="mx-auto w-fit text-wrap break-keep">
                {text()}
            </div>
        </td>
    );
};
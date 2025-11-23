import { createSignal, createEffect, onMount, JSXElement, Setter } from "solid-js";
import type { NestMap } from "../lib/types";
import DataTable, { PropertiesData } from "./DataTable";

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
    subRow: Setter<JSXElement>;
    propertiesData: PropertiesData;
    onSelect: (info: OnSelectInfo) => void;
};

export default function MapCell(props: Props) {
    const [selected, setSelected] = createSignal(false);
    const [modified, setModified] = createSignal(false);
    const [text, setText] = createSignal<string>(`${(props.map as NestMap).size.toString()} entries`);


    let tableCell!: HTMLTableCellElement;

    createEffect(() => {
        if (modified()) {
            setText(props.map.size.toString());
        }
    });

    createEffect(() => {
        if (selected()) {
            tableCell.classList.add("bg-neutral-100");
            tableCell.classList.add("text-neutral-500");
            const entries = [props.map];
            const newTable = (
                <>
                    <DataTable entries={entries} propertiesData={props.propertiesData} />
                </>
            )
            props.subRow(newTable)
        } else {
            tableCell.classList.remove("bg-neutral-100");
            tableCell.classList.remove("text-neutral-500");
            props.subRow();
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
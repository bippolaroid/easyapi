import { For, Show, createSignal, createEffect, onMount, Accessor, Setter, JSXElement } from "solid-js";
import type { NestMap, ValueObject } from "../lib/types";
import ValueCell from "./ValueCell";
import Button from "./Button";
import { useDatabase } from "~/state/useDatabase";
import MapCell from "./MapCell";

const db = useDatabase();

export interface PropertiesData {
  get: Accessor<SelectedField>,
  set: Setter<SelectedField>
}

type Props = {
  entries?: NestMap[];
  propertiesData: PropertiesData
  isSubTable?: Boolean;
};

export type SelectedField = {
  map: NestMap;
  keyName: string;
  setModified: (v: boolean) => void;
  setSelected: (v: boolean) => void;
  updateValue: (v: string) => void;
} | null;

export default function DataTable(props: Props) {
  const [entries, setEntries] = createSignal<NestMap[]>([]);
  const [subRow, setSubRow] = createSignal<JSXElement>();
  let firstEntryKeys: string[] = [];
  let fileInput!: HTMLInputElement;


  createEffect(() => {
    if (props.entries && props.entries.length > 0) {
      setEntries(props.entries);
    } else {
      setEntries(db.entries());
    }

    if (entries().length > 0) {
      firstEntryKeys = Array.from(entries()[0]).map((item) => item[0]);
    }
  })

  onMount(async () => {
    fileInput.accept = "application/json";
    fileInput.multiple = true;
    fileInput.onchange = async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileText = await file.text();
        db.loadJSON(JSON.parse(fileText), file.name);
      }
    }

    window.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest("#properties-panel")) {
        props.propertiesData?.set(null);
      }
    })
  });

  return (
    <div class="w-full flex">
      <section class="w-full border border-neutral-200 bg-white">
        <Show
          when={entries().length > 0}
          fallback={<div class="p-12 w-full items-center gap-4 text-neutral-500 flex flex-col">
            <input type="file" ref={fileInput} class="hidden" />
            <span>No database selected.</span>
            <div class="flex"><Button onClick={() => {
              fileInput.click();
            }}>Add dataset</Button></div>
          </div>}
        >
          <Show when={!props.isSubTable}>
            <div class="flex items-center justify-between p-12">
              <div class="text-2xl font-semibold text-neutral-900">{db.fileName()}</div>
              <div class="flex gap-2">
                <Button onClick={() => null}>
                  Save all entries
                </Button>
                <Button level={1} onClick={() => null}>
                  Export JSON
                </Button>
              </div>
            </div>
          </Show>
          <div class={`${props.isSubTable ? `w-fit` : `w-full`} ml-auto`}>
            <div class="p-4">
              <div class={`${props.isSubTable ? `w-fit` : `w-full`} overflow-x-auto border border-neutral-300`} style="scrollbar-width: thin;">
                <table class={`${props.isSubTable ? `w-fit` : `w-full`} table-auto bg-white divide-neutral-300 rounded-lg`}>
                  <thead class="bg-neutral-300 text-neutral-500">
                    <tr>
                      <For each={firstEntryKeys}>
                        {(key) => <th class="text-left px-3 py-2 uppercase tracking-wider text-xs">{key}</th>}
                      </For>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={entries()}>
                      {(entry) => {
                        const keyEntries = Array.from(entry);
                        return (
                          <>
                            <tr>
                              <For each={keyEntries}>
                                {([k, v]) => {
                                  function createCells(kvPair: [string, NestMap | ValueObject][]) {
                                    return (
                                      <>
                                        <For each={kvPair}>
                                          {([k, v]) => {
                                            if (v instanceof Map) {
                                              return <MapCell map={v} keyName={k} subRow={{ get: subRow, set: setSubRow }} propertiesData={props.propertiesData} onSelect={() => {
                                                const prevInfo = props.propertiesData?.get();
                                                if (prevInfo && prevInfo.setSelected) {
                                                  prevInfo.setSelected(false);
                                                }
                                              }} />
                                            } else {
                                              return <><ValueCell map={entry} keyName={k} onSelect={(info) => {
                                                const prevInfo = props.propertiesData?.get();
                                                if (prevInfo && prevInfo.setSelected) {
                                                  props.propertiesData.set(null);
                                                  prevInfo.setSelected(false);
                                                }
                                                setSubRow();
                                                props.propertiesData.set(info)
                                              }} /></>
                                            }
                                          }}
                                        </For></>
                                    )
                                  }
                                  return createCells([[k, v]]);
                                }}
                              </For>
                            </tr>
                            <Show when={subRow()}>
                              <tr>
                                <td colspan={999} class="p-4">
                                  {subRow()}
                                </td>
                              </tr>
                            </Show>
                          </>
                        )
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Show>
      </section>
    </div>
  );
};
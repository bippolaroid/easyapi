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
          <div class="flex items-center justify-between p-12">
            <div class="text-2xl font-semibold text-neutral-900">{db.fileName()}</div>
            <div class="flex gap-2">
              <Button onClick={db.saveAll}>
                Save all entries
              </Button>
              <Button level={1} onClick={db.exportJSON}>
                Export JSON
              </Button>
            </div>
          </div>
          <div class="w-full p-6 pt-0">
            <div class="w-full overflow-x-auto border border-neutral-300" style="scrollbar-width: thin;">
              <table class="w-full table-auto bg-white divide-neutral-300 rounded-lg ">
                <thead class="bg-neutral-300 text-neutral-500">
                  <tr>
                    <For each={firstEntryKeys}>
                      {(key) => <th class="px-3 py-2 uppercase tracking-wider text-xs">{key}</th>}
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
                                if (!(v instanceof Map)) {
                                  return <><ValueCell map={entry} keyName={k} onSelect={(info) => props.propertiesData.set(info)} /></>
                                } else {
                                  const keyEntriesTwo = Array.from(v);
                                  for (const [k2, v2] of keyEntriesTwo) {
                                    if (v2 instanceof Map) {
                                      const keyEntriesThree = Array.from(v2);
                                      for (const [k3, v3] of keyEntriesThree) {
                                        if (!(v3 instanceof Map)) {
                                          return (
                                            <MapCell map={v2} keyName={k3} subRow={setSubRow} propertiesData={props.propertiesData} onSelect={() => null} />
                                          )
                                        }
                                      }
                                    }
                                  }
                                }
                              }}
                            </For>
                          </tr>
                          <Show when={subRow()}>
                            <tr>
                              <td colspan="18" class="p-4">
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
        </Show>
      </section>
    </div>
  );
};
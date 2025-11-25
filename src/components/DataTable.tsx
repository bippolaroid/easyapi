import { For, Show, createSignal, createEffect, onMount, Accessor, Setter, JSXElement } from "solid-js";
import type { NestMap, ValueObject } from "../lib/types";
import ValueCell from "./ValueCell";
import Button from "./Button";
import { useDatabase } from "~/state/useDatabase";
import MapCell, { OnSelectInfo } from "./MapCell";

const db = useDatabase();

export interface PropertiesData {
  get: Accessor<SelectedField>,
  set: Setter<SelectedField>
}

type Props = {
  entries?: NestMap[];
  propertiesData: PropertiesData
  isSubTable?: Boolean;
  filename?: string;
}

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
  const [mapSelected, setMapSelected] = createSignal<OnSelectInfo>();
  const stickyCells = [3]
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
        if (!props.filename) props.filename = file.name;
      }
    }

    window.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest("#properties-panel")) {
        props.propertiesData?.set(null);
        setMapSelected();
        setSubRow();
      }
    })
  });

  function remapJson(entries: NestMap, exportMap: Map<string, string | Object>) {
    const entryObj = Object.fromEntries(entries);
    for (const key in entryObj) {
      if (entryObj[key] instanceof Map) {
        const tempArr = [];
        for (const key2 of entryObj[key]) {
          if (key2[1] instanceof Map) {
            const subMap = new Map();
            remapJson(key2[1] as NestMap, subMap)
            tempArr.push(Object.fromEntries(subMap));
          }
        }
        exportMap.set(key, tempArr);
      } else {
        exportMap.set(key, entryObj[key].currentValue)
      }
    }
  }

  function exportJson() {
    const exportEntries = [];
    for (const entry of entries()) {
      const exportMap = new Map();
      remapJson(entry, exportMap);
      exportEntries.push(Object.fromEntries(exportMap));
    }
    const json = JSON.stringify(exportEntries);
    const blob = new Blob([json], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = props.filename || "db";
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div class="w-full flex">

      <Show
        when={entries().length > 0}
        fallback={<section class="w-full max-w-7xl mx-auto border border-neutral-200 bg-white"><div class="p-12 w-full items-center gap-4 text-neutral-500 flex flex-col">
          <input type="file" ref={fileInput} class="hidden" />
          <span>No database selected.</span>
          <div class="flex"><Button onClick={() => {
            fileInput.click();
          }}>Add dataset</Button></div>
        </div></section>}
      >
        <section class="w-full border border-neutral-200 bg-white">
          <Show when={!props.isSubTable}>
            <div class="flex items-center justify-between p-12">
              <div class="text-2xl font-semibold text-neutral-900">{db.fileName()}</div>
              <div class="flex gap-2">
                <Button onClick={() => null}>
                  Save all entries
                </Button>
                <Button level={1} onClick={() => exportJson()}>
                  Export JSON
                </Button>
              </div>
            </div>
          </Show>
          <div class={`${props.isSubTable ? `w-fit` : `w-full`} ml-auto`}>
            <div class="p-4">
              <div class={`${props.isSubTable ? `w-fit` : `w-full`} overflow-x-auto border border-neutral-300`} style="scrollbar-width: thin;">
                <table class={`${props.isSubTable ? `w-fit` : `w-full`} table-auto bg-white divide-neutral-300 rounded-lg`}>
                  <thead>
                    <tr class="text-neutral-500">
                      <For each={firstEntryKeys}>
                        {(key, idx) => <th class={`${stickyCells.includes(idx()) ? `sticky left-0 ` : ``}bg-neutral-300 text-left px-3 py-2 uppercase tracking-wider text-xs`}>{key}</th>}
                      </For>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={entries()}>
                      {(entry) => {
                        const keyEntries = Array.from(entry);
                        let stickyCellIndex = -1;
                        let subCellIndex = -1;
                        return (
                          <>
                            <tr>
                              <For each={keyEntries}>
                                {([k, v]) => {
                                  function createCells(kvPair: [string, NestMap | ValueObject][]) {
                                    return (
                                      <>
                                        <For each={kvPair}>
                                          {([k2, v2]) => {
                                            stickyCellIndex += 1;
                                            if (v2 instanceof Map) {
                                              const v2Arr = Array.from(v2.entries());
                                              const v2ArrList: NestMap[] = [];
                                              for (const [_, keyMap] of v2Arr) {
                                                v2ArrList.push(keyMap as NestMap);
                                              }
                                              return <MapCell sticky={stickyCells.includes(stickyCellIndex) ? true : false} map={v2ArrList} keyName={k2} subRow={{ get: subRow, set: setSubRow }} propertiesData={props.propertiesData} onSelect={(info) => {
                                                const prevInfo = props.propertiesData?.get();
                                                if (prevInfo && prevInfo.setSelected) {
                                                  props.propertiesData.set(null);
                                                  prevInfo.setSelected(false);
                                                }
                                                if (mapSelected() && mapSelected() !== info) {
                                                  mapSelected()?.setSelected(false);
                                                }
                                                setSubRow(<DataTable entries={v2ArrList} isSubTable={true} propertiesData={props.propertiesData} />);
                                                info.setSelected(true);
                                                setMapSelected(info);
                                              }} />
                                            } else {
                                              if (props.isSubTable) {
                                                subCellIndex += 1;
                                                return <ValueCell sticky={stickyCells.includes(stickyCellIndex) ? true : false} map={entry} keyName={k2} onSelect={(info) => {
                                                  const prevInfo = props.propertiesData?.get();
                                                  if (prevInfo && prevInfo !== info) {
                                                    props.propertiesData.set(null);
                                                    prevInfo.setSelected(false);
                                                  }
                                                  if (mapSelected()) {
                                                    mapSelected()?.setSelected(false);
                                                  }
                                                  setMapSelected();
                                                  setSubRow();
                                                  info.setSelected(true);
                                                  props.propertiesData.set(info)
                                                }} />
                                              } else {
                                                return <ValueCell sticky={stickyCells.includes(stickyCellIndex) ? true : false} map={entry} keyName={k2} onSelect={(info) => {
                                                  const prevInfo = props.propertiesData?.get();
                                                  if (prevInfo && prevInfo !== info) {
                                                    props.propertiesData.set(null);
                                                    prevInfo.setSelected(false);
                                                  }
                                                  if (mapSelected()) {
                                                    mapSelected()?.setSelected(false);
                                                  }
                                                  setMapSelected();
                                                  setSubRow();
                                                  info.setSelected(true);
                                                  props.propertiesData.set(info)
                                                }} />
                                              }
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
        </section>
      </Show>
    </div>
  );
};
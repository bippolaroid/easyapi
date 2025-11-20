import { For, Show, createSignal, createEffect, onMount } from "solid-js";
import type { NestMap } from "../lib/types";
import ValueCell from "./ValueCell";
import EntryInput from "./EntryInput";
import Button from "./Button";
import { useDatabase } from "~/state/useDatabase";

const db = useDatabase();

type Props = {
  entries?: () => NestMap[];
};

type SelectedField = {
  map: NestMap;
  keyName: string;
  setModified: (v: boolean) => void;
  setSelected: (v: boolean) => void;
  updateValue: (v: string) => void;
} | null;

export default function DataTable(props: Props) {
  const [selectedField, setSelectedField] = createSignal<SelectedField>(null);
  const [entries, setEntries] = createSignal<NestMap[]>([]);
  let firstEntryKeys: string[] = [];
  let fileInput!: HTMLInputElement;

  createEffect(() => {
    if (!props.entries && db.entries().length > 0) {
      setEntries(db.entries());
      firstEntryKeys = Array.from(db.entries()[0]).map((item) => item[0]);
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
  })

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
          <div class="flex items-center justify-between p-4">
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
          <div class="w-full p-4">
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
                    {(entry) => (
                      <tr>
                        <For each={Array.from(entry.entries())}>
                          {([key, value]) =>
                            value instanceof Map ? (
                              <td class="px-3 py-2 text-neutral-700 italic">[nested]</td>
                            ) : (
                              <ValueCell
                                map={entry}
                                keyName={key}
                                onSelect={(info) => setSelectedField(info)}
                              />
                            )
                          }
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>

      </section>
      <Show when={selectedField()}>
        <section class="w-80">
          <EntryInput
            valueObj={selectedField()!.map.get(selectedField()!.keyName) as any}
            updateValue={selectedField()!.updateValue}
          />
          </section>
      </Show>
    </div>
  );
};
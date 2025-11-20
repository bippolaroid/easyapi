import { createSignal, Show } from "solid-js";
import DataTable, { SelectedField } from "~/components/DataTable";
import EntryInput from "~/components/EntryInput";

export default function EditorPage() {
  const [propertiesData, setPropertiesData] = createSignal<SelectedField>(null);


  return (
    <div class="pt-18 w-full h-screen bg-neutral-50 text-black flex flex-col p-4 gap-4">
      <div class="flex items-center gap-2"><div class="cursor-pointer transition rounded-full text-sm px-4 py-2 bg-transparent hover:bg-neutral-100 text-neutral-500">My Project</div><span>↦</span><div>s</div></div>
      <div class="w-full flex gap-4 h-full">
        <div class="min-w-2/3 w-full"><DataTable propertiesData={{ get: propertiesData, set: setPropertiesData }} /></div>
        <Show when={propertiesData()}>
          <div class="w-full border border-neutral-200 bg-white p-2 h-full">
            <EntryInput
              valueObj={propertiesData()!.map.get(propertiesData()!.keyName) as any}
              updateValue={propertiesData()!.updateValue}
            />
          </div>
        </Show>
      </div>
    </div>
  );
}

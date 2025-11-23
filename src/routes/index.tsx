import { createEffect, createSignal, Show } from "solid-js";
import DataTable, { SelectedField } from "~/components/DataTable";
import EntryInput from "~/components/EntryInput";

export default function EditorPage() {
  const [propertiesData, setPropertiesData] = createSignal<SelectedField>(null);
  createEffect(() => {
  })


  return (
    <div class="pt-18 min-h-screen w-full bg-neutral-50 text-black flex flex-col p-6 gap-6">
      <div class="flex items-center gap-1"><div class="flex items-center gap-2 border-b border-b-transparent hover:border-b-neutral-200 border-t border-t-transparent hover:border-t-neutral-50 cursor-pointer transition rounded-full text-sm px-4 py-2 bg-transparent hover:bg-neutral-100 text-neutral-500 hover:text-black"><div class="w-5.5 text-center pb-1 text-xs rounded-full bg-teal-200 border border-teal-500 text-teal-500">s</div>My Project</div><span>↦</span><div>s</div></div>
      <div class="w-full flex gap-6 h-full">
        <div class="min-w-2/3 w-full"><DataTable propertiesData={{ get: propertiesData, set: setPropertiesData }} /></div>
        <Show when={propertiesData()}>
          <div id="properties-panel" class="w-full border border-neutral-200 bg-white p-6 h-full">
            <EntryInput
              name={propertiesData()!.keyName}
              valueObj={propertiesData()!.map.get(propertiesData()!.keyName) as any}
              updateValue={propertiesData()!.updateValue}
            />
          </div>
        </Show>
      </div>
    </div>
  );
}

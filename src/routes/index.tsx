import { createEffect, createSignal, Show } from "solid-js";
import DataTable, { SelectedField } from "~/components/DataTable";
import EntryInput from "~/components/EntryInput";
import { ValueObject } from "~/lib/types";

export default function EditorPage() {
  const [propertiesData, setPropertiesData] = createSignal<SelectedField>(null);
  const [propertiesKeyname, setPropertiesKeyname] = createSignal<string>();
  const [propertiesValue, setPropertiesValue] = createSignal<ValueObject>();

  createEffect(() => {
    if (propertiesData()) {
      setPropertiesKeyname(propertiesData()?.keyName);
      const valueObj = propertiesData()!.map.get(propertiesKeyname() as string) as ValueObject;
      setPropertiesValue(valueObj)
    } else {
      setPropertiesKeyname();
      setPropertiesValue();
    }
  })

  return (
    <div class="pt-18 min-h-screen w-full bg-neutral-50 text-black flex flex-col p-4 gap-4">
      <div class="flex items-center gap-1"><div class="flex items-center gap-2 border-b border-b-transparent hover:border-b-neutral-200 border-t border-t-transparent hover:border-t-neutral-50 cursor-pointer transition rounded-full text-sm px-4 py-2 bg-transparent hover:bg-neutral-100 text-neutral-500 hover:text-black"><div class="w-5.5 text-center pb-1 text-xs rounded-full bg-teal-200 border border-teal-500 text-teal-500">s</div>My Project</div><span>↦</span><div>s</div></div>
      <div class="w-full flex gap-4 h-full">
        <div class="flex-1 min-w-0"><DataTable propertiesData={{ get: propertiesData, set: setPropertiesData }} /></div>
        <Show when={propertiesKeyname() && propertiesValue()}>
          <div id="properties-panel" class="flex flex-col gap-6 w-[32%] max-w-[32%] min-w-[280px] border border-neutral-200 bg-white p-6 h-full">
            <div class="flex flex-col">
              <span class="py-2 uppercase tracking-wider text-xs text-neutral-300 font-bold">Value</span>
              <EntryInput
                name={propertiesKeyname() as string}
                valueObj={propertiesValue() as ValueObject}
                updateValue={propertiesData()!.updateValue}
              />
            </div>
            <div class="flex flex-col">
              <span class="py-2 uppercase tracking-wider text-xs text-neutral-300 font-bold">Preview</span>
              <div class="wrap-break-word">
                <Show when={propertiesValue()?.newValue} fallback={propertiesValue()?.currentValue}>
                  <Show when={propertiesValue()?.newValue}>
                    {propertiesValue()?.newValue}
                  </Show>
                </Show>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

const PreviewPanel = (value: string) => {
  const renderTypes = [".jpg", ".jpeg", ".png", ".webp", ".webm", ".mp4", ".gif", ".svg"]

}
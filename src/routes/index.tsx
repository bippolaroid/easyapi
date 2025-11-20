import DataTable from "~/components/DataTable";

export default function EditorPage() {

  return (
    <div class="w-full h-screen bg-neutral-50 text-black flex flex-col p-4 gap-4">
      <div class="flex items-center gap-2"><div class="cursor-pointer transition rounded-full text-sm px-4 py-2 bg-transparent hover:bg-neutral-100 text-neutral-500">My Project</div><span>↦</span><div>s</div></div>
      <DataTable />
    </div>
  );
}

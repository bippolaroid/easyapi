import { A } from "@solidjs/router";

const Nav = () => {

    return (
        <nav class="fixed z-1 w-full flex items-center justify-between p-4 bg-white border-b border-neutral-200">
            <div class="flex items-center gap-3">
                <A href="/" class="cursor-pointer text-black hover:text-green-500 transition-all group font-mono font-bold">easy<span class="transition-all text-green-500 group-hover:text-black">⇄</span>api</A>
            </div>
            <div>
                <span class="cursor-pointer text-xs border border-slate-700 bg-slate-500 hover:bg-slate-700 px-2 py-1.25 rounded-full transition">M</span>
            </div>
        </nav>
    )
}

export default Nav;
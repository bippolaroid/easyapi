import { JSXElement } from "solid-js"

interface ButtonIF {
    level?: number,
    children: JSXElement
    onClick: () => void
}

export default function Button(props: ButtonIF) {
    let buttonClassList = "";
    switch (props.level) {
        case 0:
        default:
            buttonClassList = "border-b-2 border-b-green-700 hover:border-transparent border-t border-t-green-300 bg-green-500 hover:bg-green-600 text-white";
            break;
        case 1:
            buttonClassList = "border-b-2 hover:border-transparent border-b-neutral-400 border-t border-t-neutral-100 bg-neutral-200 hover:bg-neutral-300 text-neutral-700";
            break;
    }
    return (
        <button class={`${buttonClassList} leading-normal text-sm cursor-pointer transition px-4 py-2 rounded-lg`} onClick={props.onClick}>
            {props.children}
        </button>
    )
}
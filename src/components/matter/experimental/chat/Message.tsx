import { useState } from "react";

import { ContextMenu as RadixContextMenu } from "radix-ui";
import { MtAvatar, MtButton, MtTextarea, WithContextMenu } from "@/lib";
import {
    CornerUpLeft,
    Ellipsis,
    CornerUpRight,
    Copy,
    MailMinus,
    Pen,
    Pin,
    Plus,
    Smile,
    SmilePlus,
    Trash2,
    VolumeX,
} from "lucide-react";

// chat message interfce
export interface ChatMessage {
    id: string;
}

export function MtChat() {
    return (
        <div>
            <div className="flex flex-col gap-2 p-2">
                <MtChatMessage />
                <MtChatMessage isForwarding />
                <MtSystemMessage />
                <MtChatMessage isReplying />
                <MtChatMessage isForwarding />
                <MtChatMessage />
                <MtChatDivider />
                <MtChatMessage />
                <MtChatMessage />
                <MtChatMessage isReplying />
                <MtChatDivider />
                <MtChatMessageForward />
                <MtChatMessage />
                <MtSystemMessage />
            </div>
            <MtChatComposer />
        </div>
    );
}

export function MtChatComposer() {
    const [message, setMessage] = useState("");

    const sendMessage = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        // Replace this with a real send callback when the chat container owns message state.
        console.log("send message", trimmedMessage);
        setMessage("");
    };

    return (
        <div className="mt-surface-panel flex gap-2 rounded-lg p-3">
            <MtButton kind="icon" variant="ghost" size="large">
                <Plus />
            </MtButton>
            <MtTextarea
                variant="ghost"
                autoSize
                rows={1}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                    }
                }}
                className="!min-h-0 !resize-none !py-1.5"
                placeholder="Type your message here..."
            />
            <MtButton kind="icon" variant="ghost" size="large">
                <SmilePlus className="w-5 h-5" />
            </MtButton>
        </div>
    );
}

export function MtChatMessageToolbar() {
    return (
        <div className="flex flex-row items-center gap-1 p-1 mt-surface-menu ">
            <MtButton tooltip="Add Reaction" kind="icon" variant="ghost">
                <Smile className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="Edit" kind="icon" variant="ghost">
                <Pen className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="Reply" kind="icon" variant="ghost">
                <CornerUpLeft className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="Forward" kind="icon" variant="ghost">
                <CornerUpRight className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="More" kind="icon" variant="ghost">
                <Ellipsis className="h-4 w-4" />
            </MtButton>
        </div>
    );
}

export function MtChatDivider() {
    return (
        <div className="flex flex-row items-center gap-2">
            <div className="flex-grow border-t border-border-default" />
            <div className="px-2 text-xs text-text-muted">Today</div>
            <div className="flex-grow border-t border-border-default" />
        </div>
    );
}

export function MtChatMessageReplyHeader() {
    return (
        <div className="flex flex-row gap-2">
            { /* Alignment/Prefix */}
            <div className="w-12 relative">
                <div className="absolute bottom-0 right-0 left-5 top-1/2 border-l-2 border-t-2 rounded-tl-md border-border-default translate-x-[-1px] translate-y-[-1px]" />
            </div>

            { /* Sender */}
            <div className="flex flex-row items-center text-text-muted">
                <MtAvatar className="h-4 w-4 rounded-full mr-1" />
                <span className="text-text-primary">Bob</span>
            </div>

            { /* Message */}
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-text-muted">
                <span className="text-sm text-muted-foreground">I think we should change the title to "test 123"</span>
            </div>
        </div>
    );
}

export function MtSystemMessage() {
    return (
        <div className="flex flex-row gap-4 p-2">
            { /* Alignment/Prefix */}
            <div className="w-10">
                <Pen className="w-4 h-4 text-text-muted" />
            </div>

            { /* Message */}
            <div className="text-text-muted">

                <span className="text-text-primary">Storm</span>
                <span> changed the post title: </span>
                <span className="font-bold ">test 123</span>
                <span className="text-sm"> 22:45</span>
            </div>
        </div>
    );
}

type MtChatMessageProps = {
    isReplying?: boolean;
    isForwarding?: boolean;
};

export function MtChatMessage({ isReplying = false }: MtChatMessageProps) {
    return (
        <WithContextMenu renderMenuItems={() => <MtChatMessageContextMenu />}>
            {({ openMenu }) => (
                <div onContextMenu={openMenu} >
                    {isReplying && (
                        <MtChatMessageReplyHeader />
                    )}
                    <div className="group relative flex flex-row gap-4 py-2 pr-12">
                        <MtAvatar className="h-10 w-10 rounded" />
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="font-medium">Alice</div>
                                <div className="text-xs text-text-muted">2:30 PM</div>
                            </div>
                            <div className="text-sm text-muted-foreground">Hello, how are you?</div>
                        </div>

                        <div className="absolute right-2 top-2 opacity-0 pointer-events-none transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                            <MtChatMessageToolbar />
                        </div>
                    </div>
                </div>
            )}
        </WithContextMenu>
    );
}

export function MtChatMessageForward() {
    return (
        <WithContextMenu renderMenuItems={() => <MtChatMessageContextMenu />}>
            {({ openMenu }) => (
                <div
                    onContextMenu={openMenu}
                    className="border-l-3 border-border-default pl-3"
                >
                    <div className="group relative flex flex-row gap-4 py-2 pr-12">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-1 text-text-muted pl-0.5">
                                 <CornerUpRight className="h-4 w-4" />
                                <div className="italic leading-none translate-y-[-0.17rem] text-sm font-medium">Forwarded</div>
                            </div>

                            <div className="text-sm text-muted-foreground">Hello, how are you?</div>
                        </div>

                        <div className="absolute right-2 top-2 opacity-0 pointer-events-none transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                            <MtChatMessageToolbar />
                        </div>
                    </div>
                </div>
            )}
        </WithContextMenu>
    );
}


function MtChatMessageContextMenu() {
    return (
        <div className="min-w-56">
            <div className="flex rounded-md p-1 gap-1">
                <MtButton kind="icon" variant="panel" size="large" className="flex-1 aspect-square">
                    👍
                </MtButton>
                <MtButton kind="icon" variant="panel" size="large" className="flex-1 aspect-square">
                    ❤️
                </MtButton>
                <MtButton kind="icon" variant="panel" size="large" className="flex-1 aspect-square">
                    😂
                </MtButton>
                <MtButton kind="icon" variant="panel" size="large" className="flex-1 aspect-square">
                    🔥
                </MtButton>
            </div>

            <RadixContextMenu.Sub>
                <RadixContextMenu.SubTrigger className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover data-disabled:cursor-not-allowed data-disabled:opacity-40">
                    <span className="flex items-center gap-2">
                        <Smile className="h-3.5 w-3.5" />
                        Add Reaction
                    </span>
                    <CornerUpRight className="h-3.5 w-3.5 opacity-70" />
                </RadixContextMenu.SubTrigger>
                <RadixContextMenu.Portal>
                    <RadixContextMenu.SubContent sideOffset={6} alignOffset={-4} className="z-50 min-w-44 rounded-lg border border-border-default bg-surface-base p-1.5 shadow-2xl grid">
                        <RadixContextMenu.Item onSelect={() => console.log("add reaction 😀")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                            <span>😀</span>
                        </RadixContextMenu.Item>
                        <RadixContextMenu.Item onSelect={() => console.log("add reaction ❤️")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                            <span>❤️</span>
                        </RadixContextMenu.Item>
                        <RadixContextMenu.Item onSelect={() => console.log("add reaction 😂")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                            <span>😂</span>
                        </RadixContextMenu.Item>
                        <RadixContextMenu.Item onSelect={() => console.log("add reaction 👍")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                            <span>👍</span>
                        </RadixContextMenu.Item>
                    </RadixContextMenu.SubContent>
                </RadixContextMenu.Portal>
            </RadixContextMenu.Sub>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item onSelect={() => console.log("edit message")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <Pen className="h-3.5 w-3.5" />
                    Edit Message
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => console.log("reply message")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    Reply
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => console.log("forward message")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <CornerUpRight className="h-3.5 w-3.5" />
                    Forward
                </span>
            </RadixContextMenu.Item>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item onSelect={() => console.log("copy text")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Text
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => console.log("pin message")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <Pin className="h-3.5 w-3.5" />
                    Pin Message
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => console.log("mark unread")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <MailMinus className="h-3.5 w-3.5" />
                    Mark Unread
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => console.log("copy message link")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover">
                <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Message Link
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item disabled className="flex min-w-44 cursor-not-allowed items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none opacity-40">
                <span className="flex items-center gap-2">
                    <VolumeX className="h-3.5 w-3.5" />
                    Speak Message
                </span>
            </RadixContextMenu.Item>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item onSelect={() => console.log("delete message")} className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-red-500 outline-none transition-colors data-highlighted:bg-red-500/10">
                <span className="flex items-center gap-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Message
                </span>
            </RadixContextMenu.Item>
        </div>
    );
}
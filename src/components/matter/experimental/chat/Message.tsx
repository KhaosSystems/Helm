import { useState, type ReactNode } from "react";

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
import { DEFAULT_QUICK_REACTIONS, type ChatMessage } from "./types";

export function formatMessageTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

export function MtChatComposer({
    value,
    onChange,
    onSend,
    disabled = false,
    placeholder = "Type your message here...",
    replyingTo,
    onCancelReply,
}: {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    placeholder?: string;
    replyingTo?: ChatMessage | null;
    onCancelReply?: () => void;
}) {
    return (
        <div className="m-2">
            {replyingTo ? (
                <div className="mb-1 flex items-center gap-2 rounded-t-lg border-b border-border-default mt-surface-panel px-3 py-1.5 text-xs">
                    <CornerUpLeft className="h-3.5 w-3.5 text-text-muted" />
                    <span className="text-text-muted">Replying to</span>
                    <span className="font-medium text-text-primary">{replyingTo.authorName}</span>
                    <span className="min-w-0 flex-1 truncate text-text-muted">{replyingTo.content}</span>
                    <button
                        type="button"
                        aria-label="Cancel reply"
                        className="shrink-0 text-text-muted hover:text-text-primary"
                        onClick={onCancelReply}
                    >
                        <Ellipsis className="hidden" />
                        ✕
                    </button>
                </div>
            ) : null}
            <div className="mt-surface-panel flex gap-2 rounded-lg p-3">
                <MtButton kind="icon" variant="ghost" size="large">
                    <Plus />
                </MtButton>
                <MtTextarea
                    variant="ghost"
                    autoSize
                    rows={1}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            onSend();
                        }
                    }}
                    className="!min-h-0 !resize-none !py-1.5"
                    placeholder={placeholder}
                />
                <MtButton kind="icon" variant="ghost" size="large">
                    <SmilePlus className="w-5 h-5" />
                </MtButton>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Hover toolbar
// ---------------------------------------------------------------------------

export function MtChatMessageToolbar({
    onReact,
    onReply,
    onForward,
}: {
    onReact?: () => void;
    onReply?: () => void;
    onForward?: () => void;
}) {
    return (
        <div className="flex flex-row items-center gap-1 p-1 mt-surface-menu ">
            <MtButton tooltip="Add Reaction" kind="icon" variant="ghost" onClick={onReact}>
                <Smile className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="Reply" kind="icon" variant="ghost" onClick={onReply}>
                <CornerUpLeft className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="Forward" kind="icon" variant="ghost" onClick={onForward}>
                <CornerUpRight className="h-3.5 w-3.5" />
            </MtButton>
            <MtButton tooltip="More" kind="icon" variant="ghost">
                <Ellipsis className="h-4 w-4" />
            </MtButton>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Time divider
// ---------------------------------------------------------------------------

export function MtChatDivider({ label }: { label: string }) {
    return (
        <div className="flex flex-row items-center gap-2 py-1">
            <div className="flex-grow border-t border-border-default" />
            <div className="px-2 text-xs text-text-muted">{label}</div>
            <div className="flex-grow border-t border-border-default" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Reply header (shown above a replying message)
// ---------------------------------------------------------------------------

export function MtChatMessageReplyHeader({
    authorName,
    authorImage,
    content,
}: {
    authorName: string;
    authorImage?: string;
    content: string;
}) {
    return (
        <div className="flex flex-row gap-2">
            {/* Alignment/Prefix */}
            <div className="w-12 relative">
                <div className="absolute bottom-0 right-0 left-5 top-1/2 border-l-2 border-t-2 rounded-tl-md border-border-default translate-x-[-1px] translate-y-[-1px]" />
            </div>

            {/* Sender */}
            <div className="flex flex-row items-center text-text-muted">
                <MtAvatar src={authorImage} name={authorName} className="h-4 w-4 rounded-full mr-1" />
                <span className="text-text-primary">{authorName}</span>
            </div>

            {/* Message */}
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-text-muted">
                <span className="text-sm text-muted-foreground">{content}</span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// System message
// ---------------------------------------------------------------------------

export function MtSystemMessage({ icon, time, children }: { icon?: ReactNode; time?: string; children: ReactNode }) {
    return (
        <div className="flex flex-row gap-4 p-2">
            {/* Alignment/Prefix */}
            <div className="w-10">{icon ?? <Pen className="w-4 h-4 text-text-muted" />}</div>

            {/* Message */}
            <div className="text-text-muted">
                {children}
                {time ? <span className="text-sm"> {time}</span> : null}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

export function MtChatMessage({
    message,
    repliedTo,
    forwardedFrom,
    quickReactions = DEFAULT_QUICK_REACTIONS,
    onReply,
    onForward,
    onToggleReaction,
}: {
    message: ChatMessage;
    repliedTo?: ChatMessage;
    forwardedFrom?: ChatMessage;
    quickReactions?: string[];
    onReply?: () => void;
    onForward?: () => void;
    onToggleReaction?: (emoji: string) => void;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const reactions = message.reactions ?? [];

    return (
        <WithContextMenu
            renderMenuItems={() => (
                <MtChatMessageContextMenu
                    quickReactions={quickReactions}
                    content={message.content}
                    onReply={onReply}
                    onForward={onForward}
                    onToggleReaction={onToggleReaction}
                />
            )}
        >
            {({ openMenu }) => (
                <div onContextMenu={openMenu}>
                    {repliedTo ? (
                        <MtChatMessageReplyHeader
                            authorName={repliedTo.authorName}
                            authorImage={repliedTo.authorImage}
                            content={repliedTo.content}
                        />
                    ) : null}
                    <div className="group relative flex flex-row gap-4 py-2 pr-12">
                        <MtAvatar className="h-10 w-10 rounded" src={message.authorImage} name={message.authorName} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="font-medium">{message.authorName || "Unknown"}</div>
                                <div className="text-xs text-text-muted">{formatMessageTime(message.createdAt)}</div>
                            </div>

                            {message.forwardedFrom ? (
                                <div className="border-l-3 border-border-default pl-3">
                                    <div className="flex flex-row items-center gap-1 pl-0.5 text-text-muted">
                                        <CornerUpRight className="h-4 w-4" />
                                        <div className="text-sm font-medium italic">
                                            Forwarded{forwardedFrom ? ` from ${forwardedFrom.authorName}` : ""}
                                        </div>
                                    </div>
                                    <div className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                        {message.content}
                                    </div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                    {message.content}
                                </div>
                            )}

                            {reactions.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {reactions.map((reaction) => (
                                        <button
                                            key={reaction.emoji}
                                            type="button"
                                            onClick={() => onToggleReaction?.(reaction.emoji)}
                                            className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition ${
                                                reaction.reacted
                                                    ? "border-text-link/60 bg-text-link/10 text-text-primary"
                                                    : "border-border-default bg-surface-base text-text-muted hover:bg-surface-hover"
                                            }`}
                                        >
                                            <span>{reaction.emoji}</span>
                                            <span>{reaction.count}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="absolute right-2 top-2 opacity-0 pointer-events-none transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                            <div className="relative">
                                <MtChatMessageToolbar
                                    onReact={() => setPickerOpen((open) => !open)}
                                    onReply={onReply}
                                    onForward={onForward}
                                />
                                {pickerOpen ? (
                                    <div className="absolute right-0 z-10 mt-1 flex gap-0.5 rounded-md border border-border-default bg-surface-base p-1 shadow-xl">
                                        {quickReactions.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className="rounded p-1 text-base hover:bg-surface-hover"
                                                onClick={() => {
                                                    onToggleReaction?.(emoji);
                                                    setPickerOpen(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </WithContextMenu>
    );
}

// ---------------------------------------------------------------------------
// Standalone forwarded message (no author/avatar)
// ---------------------------------------------------------------------------

export function MtChatMessageForward({ content }: { content: string }) {
    return (
        <WithContextMenu renderMenuItems={() => <MtChatMessageContextMenu quickReactions={DEFAULT_QUICK_REACTIONS} content={content} />}>
            {({ openMenu }) => (
                <div onContextMenu={openMenu} className="border-l-3 border-border-default pl-3">
                    <div className="group relative flex flex-row gap-4 py-2 pr-12">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-1 pl-0.5 text-text-muted">
                                <CornerUpRight className="h-4 w-4" />
                                <div className="translate-y-[-0.17rem] text-sm font-medium italic leading-none">Forwarded</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{content}</div>
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

// ---------------------------------------------------------------------------
// Context menu
// ---------------------------------------------------------------------------

function MtChatMessageContextMenu({
    quickReactions,
    content,
    onReply,
    onForward,
    onToggleReaction,
}: {
    quickReactions: string[];
    content: string;
    onReply?: () => void;
    onForward?: () => void;
    onToggleReaction?: (emoji: string) => void;
}) {
    const itemClass =
        "flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover";
    return (
        <div className="min-w-56">
            <div className="flex rounded-md p-1 gap-1">
                {quickReactions.slice(0, 4).map((emoji) => (
                    <MtButton
                        key={emoji}
                        kind="icon"
                        variant="panel"
                        size="large"
                        className="flex-1 aspect-square"
                        onClick={() => onToggleReaction?.(emoji)}
                    >
                        {emoji}
                    </MtButton>
                ))}
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
                        {quickReactions.map((emoji) => (
                            <RadixContextMenu.Item
                                key={emoji}
                                onSelect={() => onToggleReaction?.(emoji)}
                                className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-highlighted:bg-surface-hover"
                            >
                                <span>{emoji}</span>
                            </RadixContextMenu.Item>
                        ))}
                    </RadixContextMenu.SubContent>
                </RadixContextMenu.Portal>
            </RadixContextMenu.Sub>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item onSelect={() => onReply?.()} className={itemClass}>
                <span className="flex items-center gap-2">
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    Reply
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item onSelect={() => onForward?.()} className={itemClass}>
                <span className="flex items-center gap-2">
                    <CornerUpRight className="h-3.5 w-3.5" />
                    Forward
                </span>
            </RadixContextMenu.Item>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item onSelect={() => void navigator.clipboard?.writeText(content)} className={itemClass}>
                <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Text
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item className={itemClass}>
                <span className="flex items-center gap-2">
                    <Pin className="h-3.5 w-3.5" />
                    Pin Message
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item className={itemClass}>
                <span className="flex items-center gap-2">
                    <MailMinus className="h-3.5 w-3.5" />
                    Mark Unread
                </span>
            </RadixContextMenu.Item>
            <RadixContextMenu.Item disabled className="flex min-w-44 cursor-not-allowed items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none opacity-40">
                <span className="flex items-center gap-2">
                    <VolumeX className="h-3.5 w-3.5" />
                    Speak Message
                </span>
            </RadixContextMenu.Item>

            <RadixContextMenu.Separator className="my-1 h-px bg-border-default" />

            <RadixContextMenu.Item className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-red-500 outline-none transition-colors data-highlighted:bg-red-500/10">
                <span className="flex items-center gap-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Message
                </span>
            </RadixContextMenu.Item>
        </div>
    );
}

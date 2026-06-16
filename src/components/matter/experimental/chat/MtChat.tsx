import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Send } from 'lucide-react';
import { MtButton, MtDialog, MtInput } from '@/lib';
import {
    MtChatComposer,
    MtChatDivider,
    MtChatMessage,
    MtSystemMessage,
    formatMessageTime,
} from './Message';
import {
    DEFAULT_QUICK_REACTIONS,
    type ChatChannel,
    type ChatMessage,
    type ChatSendInput,
} from './types';

export type { ChatChannel, ChatMessage, ChatReaction, ChatSendInput } from './types';
export {
    MtChatComposer,
    MtChatDivider,
    MtChatMessage,
    MtChatMessageForward,
    MtChatMessageReplyHeader,
    MtChatMessageToolbar,
    MtSystemMessage,
    formatMessageTime,
} from './Message';

export interface MtChatProps {
    messages: ChatMessage[];
    currentUserId?: string;
    loading?: boolean;
    disabled?: boolean;
    emptyState?: ReactNode;
    placeholder?: string;
    quickReactions?: string[];
    /** Channels a message can be forwarded to; shown in the forward dialog. */
    channels?: ChatChannel[];
    onSend: (input: ChatSendInput) => void | Promise<void>;
    onToggleReaction?: (messageId: string, emoji: string) => void;
    /** Forward a message to another channel, with an optional accompanying note. */
    onForward?: (messageId: string, channelId: string, note?: string) => void;
    className?: string;
}

function dayLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(date, today)) return 'Today';
    if (sameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MtChat({
    messages,
    loading = false,
    disabled = false,
    emptyState,
    placeholder,
    quickReactions = DEFAULT_QUICK_REACTIONS,
    channels = [],
    onSend,
    onToggleReaction,
    onForward,
    className,
}: MtChatProps) {
    const [draft, setDraft] = useState('');
    const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
    const [forwardTarget, setForwardTarget] = useState<ChatMessage | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const byId = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const send = () => {
        const content = draft.trim();
        if (!content || disabled) return;
        void onSend({ content, replyTo: replyTarget?.id });
        setDraft('');
        setReplyTarget(null);
    };

    return (
        <div className={`flex h-full min-h-0 flex-col ${className ?? ''}`}>
            <div className="flex-1 min-h-0 overflow-auto px-2 py-2">
                {loading ? (
                    <p className="py-4 text-center text-xs text-text-muted">Loading…</p>
                ) : messages.length === 0 ? (
                    <div className="py-4 text-center text-xs text-text-muted">
                        {emptyState ?? 'No messages yet. Start the discussion.'}
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const previous = messages[index - 1];
                        const showDivider = !previous || dayLabel(previous.createdAt) !== dayLabel(message.createdAt);
                        return (
                            <div key={message.id}>
                                {showDivider ? <MtChatDivider label={dayLabel(message.createdAt)} /> : null}
                                {message.system ? (
                                    <MtSystemMessage time={formatMessageTime(message.createdAt)}>
                                        <span className="text-text-primary">{message.authorName}</span>{' '}
                                        <span>{message.content}</span>
                                    </MtSystemMessage>
                                ) : (
                                    <MtChatMessage
                                        message={message}
                                        repliedTo={message.replyTo ? byId.get(message.replyTo) : undefined}
                                        forwardedFrom={message.forwardedFrom ? byId.get(message.forwardedFrom) : undefined}
                                        quickReactions={quickReactions}
                                        onReply={() => setReplyTarget(message)}
                                        onForward={onForward ? () => setForwardTarget(message) : undefined}
                                        onToggleReaction={(emoji) => onToggleReaction?.(message.id, emoji)}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            <MtChatComposer
                value={draft}
                onChange={setDraft}
                onSend={send}
                disabled={disabled}
                placeholder={placeholder}
                replyingTo={replyTarget}
                onCancelReply={() => setReplyTarget(null)}
            />

            <MtForwardDialog
                open={forwardTarget !== null}
                channels={channels}
                onOpenChange={(open) => {
                    if (!open) setForwardTarget(null);
                }}
                onSubmit={(channelId, note) => {
                    if (forwardTarget) {
                        onForward?.(forwardTarget.id, channelId, note);
                    }
                    setForwardTarget(null);
                }}
            />
        </div>
    );
}

const CHANNEL_GROUPS: { type: NonNullable<ChatChannel['type']>; label: string }[] = [
    { type: 'dm', label: 'Direct Messages' },
    { type: 'task', label: 'Tasks' },
    { type: 'general', label: 'Channels' },
];

function MtForwardDialog({
    open,
    channels,
    onOpenChange,
    onSubmit,
}: {
    open: boolean;
    channels: ChatChannel[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (channelId: string, note?: string) => void;
}) {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (open) {
            setSearch('');
            setSelectedId(null);
            setNote('');
        }
    }, [open]);

    const query = search.trim().toLowerCase();
    const filtered = query ? channels.filter((channel) => channel.title.toLowerCase().includes(query)) : channels;

    const submit = () => {
        if (!selectedId) return;
        onSubmit(selectedId, note.trim() || undefined);
    };

    return (
        <MtDialog open={open} onOpenChange={onOpenChange} title="Forward To" maxWidth="460px">
            <div className="flex h-[60vh] max-h-[560px] flex-col gap-3">
                <MtInput
                    autoFocus
                    placeholder="Search"
                    className="!w-full"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border-default">
                    {filtered.length === 0 ? (
                        <p className="p-4 text-center text-sm text-text-muted">No channels found.</p>
                    ) : (
                        CHANNEL_GROUPS.map((group) => {
                            const groupChannels = filtered.filter((channel) => (channel.type ?? 'general') === group.type);
                            if (groupChannels.length === 0) return null;
                            return (
                                <div key={group.type} className="py-1">
                                    <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        {group.label}
                                    </div>
                                    {groupChannels.map((channel) => (
                                        <button
                                            key={channel.id}
                                            type="button"
                                            onClick={() => setSelectedId(channel.id)}
                                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                                                selectedId === channel.id
                                                    ? 'bg-text-link/10 text-text-primary'
                                                    : 'text-text-secondary hover:bg-surface-hover'
                                            }`}
                                        >
                                            <span className="min-w-0 flex-1 truncate">{channel.title}</span>
                                        </button>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <MtButton kind="icon" variant="accent" aria-label="Send" disabled={!selectedId} onClick={submit}>
                        <Send className="h-4 w-4" />
                    </MtButton>
                    <MtInput
                        placeholder="Add a message (optional)"
                        className="!w-full min-w-0 flex-1"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                submit();
                            }
                        }}
                    />
                </div>
            </div>
        </MtDialog>
    );
}

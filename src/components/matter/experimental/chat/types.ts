export interface ChatReaction {
    emoji: string;
    count: number;
    /** Whether the current user reacted with this emoji. */
    reacted: boolean;
}

export interface ChatMessage {
    id: string;
    authorId: string;
    authorName: string;
    authorImage?: string;
    content: string;
    createdAt: number;
    /** id of the message this one replies to (resolved within the message list). */
    replyTo?: string;
    /** id of the original message when this one was forwarded. */
    forwardedFrom?: string;
    reactions?: ChatReaction[];
    /** Renders as a system line (joins, status changes, ...) instead of a chat bubble. */
    system?: boolean;
}

export interface ChatChannel {
    id: string;
    title: string;
    /** Grouping bucket in the forward dialog. */
    type?: 'dm' | 'task' | 'general';
}

export interface ChatSendInput {
    content: string;
    replyTo?: string;
}

export const DEFAULT_QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👀', '🔥'];

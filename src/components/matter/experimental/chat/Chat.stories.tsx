import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
    MtChat,
    MtChatComposer,
    MtChatDivider,
    MtChatMessage,
    MtChatMessageForward,
    MtSystemMessage,
    type ChatMessage,
} from './MtChat';

const meta = {
    title: 'Experimental/Chat',
    component: MtChat,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MtChat>;

export default meta;

type Story = StoryObj<typeof meta>;

// --- sample data ------------------------------------------------------------

const at = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
};

const alice: ChatMessage = {
    id: 'm-alice',
    authorId: 'alice',
    authorName: 'Alice',
    content: 'Hello, how are you?',
    createdAt: at(14, 30),
};

const bob: ChatMessage = {
    id: 'm-bob',
    authorId: 'bob',
    authorName: 'Bob',
    content: 'I think we should change the title to "test 123"',
    createdAt: at(14, 0),
};

const aliceForwarded: ChatMessage = { ...alice, id: 'm-alice-fwd', forwardedFrom: 'orig' };

function SystemTitleChange() {
    return (
        <MtSystemMessage time="22:45">
            <span className="text-text-primary">Storm</span> changed the post title:{' '}
            <span className="font-bold">test 123</span>
        </MtSystemMessage>
    );
}

// --- gallery: recreates the original MtChat demo ----------------------------

function ChatGallery() {
    const [value, setValue] = useState('');
    return (
        <div className="flex h-screen flex-col">
            <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
                <MtChatMessage message={alice} />
                <MtChatMessage message={aliceForwarded} forwardedFrom={alice} />
                <SystemTitleChange />
                <MtChatMessage message={alice} repliedTo={bob} />
                <MtChatMessage message={aliceForwarded} forwardedFrom={alice} />
                <MtChatMessage message={alice} />
                <MtChatDivider label="Today" />
                <MtChatMessage message={alice} />
                <MtChatMessage message={alice} />
                <MtChatMessage message={alice} repliedTo={bob} />
                <MtChatDivider label="Today" />
                <MtChatMessageForward content="Hello, how are you?" />
                <MtChatMessage message={alice} />
                <SystemTitleChange />
            </div>
            <MtChatComposer value={value} onChange={setValue} onSend={() => setValue('')} />
        </div>
    );
}

/** Recreates the original static MtChat demo using the data-driven components. */
export const Gallery: Story = {
    args: { messages: [], onSend: () => {} },
    render: () => <ChatGallery />,
};

// --- interactive: the full data-driven MtChat -------------------------------

const conversation: ChatMessage[] = [
    bob,
    { ...alice, id: 'c1', createdAt: at(14, 31) },
    {
        id: 'c2',
        authorId: 'alice',
        authorName: 'Alice',
        content: 'Replying to your idea 👍',
        createdAt: at(14, 32),
        replyTo: 'm-bob',
        reactions: [
            { emoji: '👍', count: 2, reacted: true },
            { emoji: '🔥', count: 1, reacted: false },
        ],
    },
];

function InteractiveChat() {
    const [messages, setMessages] = useState<ChatMessage[]>(conversation);
    return (
        <div className="h-screen">
            <MtChat
                messages={messages}
                currentUserId="alice"
                channels={[
                    { id: 'ch1', title: '#1 Onboarding', type: 'task' },
                    { id: 'ch2', title: 'general', type: 'general' },
                ]}
                onSend={({ content, replyTo }) =>
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: `local-${prev.length}`,
                            authorId: 'me',
                            authorName: 'You',
                            content,
                            createdAt: Date.now(),
                            replyTo,
                        },
                    ])
                }
                onToggleReaction={(messageId, emoji) =>
                    setMessages((prev) =>
                        prev.map((message) => {
                            if (message.id !== messageId) return message;
                            const reactions = message.reactions ?? [];
                            const existing = reactions.find((reaction) => reaction.emoji === emoji);
                            if (existing) {
                                return {
                                    ...message,
                                    reactions: reactions
                                        .map((reaction) =>
                                            reaction.emoji === emoji
                                                ? {
                                                      ...reaction,
                                                      reacted: !reaction.reacted,
                                                      count: reaction.count + (reaction.reacted ? -1 : 1),
                                                  }
                                                : reaction,
                                        )
                                        .filter((reaction) => reaction.count > 0),
                                };
                            }
                            return { ...message, reactions: [...reactions, { emoji, count: 1, reacted: true }] };
                        }),
                    )
                }
                onForward={(messageId, channelId) => console.log('forward', messageId, '->', channelId)}
            />
        </div>
    );
}

export const Interactive: Story = {
    args: { messages: [], onSend: () => {} },
    render: () => <InteractiveChat />,
};

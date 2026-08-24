import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send, Sparkles } from "lucide-react";
import { api } from "../services/api";
import type { Conversation, Message } from "../types";

const suggestions = ["I'm feeling overwhelmed", "Help me plan today", "I can't focus", "I need a quick reset"];
const MAX_LEN = 1000;

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await api.get<{ conversations: Conversation[] }>("/conversations");
      setConversations(res.conversations);
      if (res.conversations.length && !activeId) {
        selectConversation(res.conversations[0].id);
      }
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (id: string) => {
    setActiveId(id);
    const res = await api.get<{ messages: Message[] }>(`/conversations/${id}/messages`);
    setMessages(res.messages);
  };

  const startNewConversation = async () => {
    const res = await api.post<{ conversation: Conversation }>("/conversations", {});
    setConversations((c) => [res.conversation, ...c]);
    setActiveId(res.conversation.id);
    setMessages([]);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    let convoId = activeId;
    if (!convoId) {
      const res = await api.post<{ conversation: Conversation }>("/conversations", {});
      convoId = res.conversation.id;
      setConversations((c) => [res.conversation, ...c]);
      setActiveId(convoId);
    }

    setSending(true);
    setInput("");
    // Optimistic render — still just plain text, never HTML.
    setMessages((m) => [...m, { id: `temp-${Date.now()}`, conversationId: convoId!, role: "user", content: trimmed, createdAt: new Date().toISOString() }]);

    try {
      const res = await api.post<{ userMessage: Message; assistantMessage: Message }>(`/conversations/${convoId}/messages`, { content: trimmed });
      setMessages((m) => [...m.filter((msg) => !msg.id.startsWith("temp-")), res.userMessage, res.assistantMessage]);
    } catch {
      setMessages((m) => m.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/5 bg-white/50 p-4 md:flex">
        <button
          onClick={startNewConversation}
          className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-canvas hover:bg-lavender-deep"
        >
          <Plus size={16} /> New conversation
        </button>
        <div className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {loadingConvos && <p className="px-2 text-xs text-inkmute">Loading conversations…</p>}
          {!loadingConvos && conversations.length === 0 && (
            <p className="px-2 text-xs text-inkmute">No conversations yet. Your first conversation starts here.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`block w-full truncate rounded-xl px-3 py-2 text-left text-sm ${
                activeId === c.id ? "bg-lavender-soft text-lavender-deep font-semibold" : "text-inkmute hover:bg-canvas hover:text-ink"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink/5 bg-white/60 px-6 py-4">
          <div>
            <p className="font-display font-semibold text-ink">CalmCampus AI</p>
            <p className="text-xs text-inkmute">Personal student support</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
          </span>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl bg-lavender-soft/60 p-5 text-sm text-ink">
              <Sparkles size={16} className="mb-2 text-lavender-deep" />
              Hey! I&apos;m here with you. What&apos;s been making exam season feel difficult today?
            </div>
          )}

          {/*
            SECURITY NOTE: message.content is rendered as plain text via
            JSX text interpolation only — React escapes it automatically.
            dangerouslySetInnerHTML is never used here, so injected HTML
            or <script> content is always displayed inert, as text.
          */}
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "ml-auto bg-ink text-canvas" : "bg-white text-ink shadow-calm"
              }`}
            >
              {m.content}
            </motion.div>
          ))}
          {sending && <div className="max-w-md rounded-2xl bg-white px-4 py-3 text-sm text-inkmute shadow-calm">CalmCampus AI is thinking…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink/5 bg-white/60 px-6 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-inkmute hover:border-lavender-deep hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                maxLength={MAX_LEN}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Tell me what's on your mind…"
                rows={1}
                className="w-full resize-none rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-lavender-deep"
              />
              <p className="mt-1 text-right text-[11px] text-inkmute">
                {input.length} / {MAX_LEN}
              </p>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-canvas disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

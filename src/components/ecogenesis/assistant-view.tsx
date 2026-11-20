"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, IntegrityNote, EmptyState } from "./ui-kit";
import { api, useAsync, fmtDate } from "@/lib/client";
import { toast } from "@/hooks/use-toast";

interface Msg {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

const SUGGESTIONS = [
  "How can I reduce my household carbon footprint?",
  "Which household appliances consume the most electricity?",
  "How can I reduce plastic waste at home?",
  "How much water could I save by changing my daily habits?",
  "How can my business become more sustainable?",
  "What sustainable improvements would make the biggest difference in a city?",
];

export default function AssistantView() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const history = useAsync<{ messages: Msg[] }>(() => api("/api/assistant"), []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.data) setMessages(history.data.messages);
  }, [history.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setInput("");
    setSending(true);
    const optimistic: Msg = { id: `tmp-${Date.now()}`, role: "user", content: message, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await api<{ reply: Msg }>("/api/assistant", { method: "POST", body: JSON.stringify({ message }) });
      setMessages((m) => [...m, res.reply]);
    } catch (e) {
      toast({ title: "Assistant unavailable", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Bot className="h-4 w-4" /> AI Sustainability Assistant
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Advice that shows its sources</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          The assistant explains the environmental issue, gives prioritised recommendations, honest benefit ranges with
          stated assumptions, difficulty, cost, and named sources with confidence levels. It is instructed to say
          &quot;hard to quantify&quot; rather than invent numbers.
        </p>
      </div>

      <GlassCard className="flex h-[62vh] flex-col p-0">
        <div className="scroll-slim flex-1 space-y-4 overflow-y-auto p-5">
          {history.loading && <Skeleton className="h-40 w-full rounded-xl" />}
          {!history.loading && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Sparkles className="h-7 w-7 text-accent" />
              </span>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Ask anything about sustainable living, energy, water, waste or community action. Your conversation stays
                private to your session.
              </p>
              <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-xl border border-border/70 bg-background/40 px-3 py-2.5 text-left text-xs leading-relaxed text-foreground/80 transition-colors hover:border-accent/40 hover:bg-accent/[0.06]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </span>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent/15 border border-accent/25 text-foreground"
                    : "border border-border/60 bg-background/50 text-foreground/90"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <div className="prose-eco space-y-2 [&_li]:marker:text-accent [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_strong]:text-accent [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
                <div className="mt-1.5 text-[10px] text-muted-foreground/70">{fmtDate(m.createdAt)}</div>
              </div>
              {m.role === "user" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                  <User className="h-4 w-4 text-accent" />
                </span>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                <Bot className="h-4 w-4 text-primary eco-pulse" />
              </span>
              <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="eco-pulse h-2 w-2 rounded-full bg-accent" style={{ animationDelay: "0s" }} />
                  <span className="eco-pulse h-2 w-2 rounded-full bg-accent" style={{ animationDelay: "0.3s" }} />
                  <span className="eco-pulse h-2 w-2 rounded-full bg-accent" style={{ animationDelay: "0.6s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-border/60 p-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about energy, water, waste, transport, food, biodiversity..."
              className="min-h-11 flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              aria-label="Message to the sustainability assistant"
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/85" disabled={sending || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </GlassCard>

      <IntegrityNote>
        The AI assistant explains, recommends and computes — but it does not invent measurements. Quantitative claims
        either derive from your own inputs with named factors, or come from published research the assistant cites with
        a confidence level. For measured environmental data, the Intelligence Dashboard is the authority.
      </IntegrityNote>

      {history.error && <EmptyState title="History unavailable" hint={history.error} />}
    </div>
  );
}

/**
 * AI Service abstraction.
 *
 *   Frontend -> Express API -> AI Service -> Real Provider (Claude API) / Offline Fallback
 *
 * The frontend NEVER talks to an AI API directly and never sees an API key.
 *
 * If AI_API_KEY is set, every message is answered by the real Claude API —
 * it can actually answer whatever the student asks, not just match a few
 * keywords. Without a key, OfflineFallbackProvider still gives varied,
 * context-aware, non-repeating responses so the app is usable immediately,
 * but a real key is what makes AI Support genuinely useful.
 */

import Anthropic from "@anthropic-ai/sdk";

interface ChatMessage {
  role: string;
  content: string;
}

interface AIProvider {
  reply(history: ChatMessage[], userMessage: string): Promise<string>;
}

const SYSTEM_PROMPT = `You are the AI assistant inside CalmCampus AI, a wellness and study-support app for
college students during exam season. You talk with real warmth, like a calm, switched-on senior student —
not a chatbot script and not a clinician.

You can help with two kinds of things, and you should freely mix them:
1. Genuine emotional support around exam stress, overwhelm, procrastination, sleep, and motivation.
2. Practical, specific study help — actually answer the student's question (how to plan revision, how to
   memorize something, how to structure an essay, what a concept means, how to manage time before an exam,
   etc.) the way a knowledgeable, encouraging person would.

Guidelines:
- Actually answer what they asked. If they ask a factual or how-to question, give a real, useful answer —
  don't deflect every message into "how does that make you feel."
- Keep replies short: 2-5 sentences for most messages. Only go longer if they've asked for a real
  explanation or a study plan.
- Be specific, not generic. Reference details they've actually mentioned (subjects, exams, feelings).
- Never claim to be a licensed therapist or make medical/diagnostic claims.
- If someone expresses serious crisis, self-harm, or safety concerns, gently and clearly encourage them to
  reach out to a trusted person, their college's support services, or local emergency/crisis services —
  and keep that suggestion brief and non-alarming rather than clinical.
- Don't be saccharine or repeat stock phrases like "that sounds like a lot to carry" every time — vary your
  language naturally like a real person would.`;

class RealClaudeProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.model = process.env.AI_MODEL || "claude-sonnet-4-5";
  }

  async reply(history: ChatMessage[], userMessage: string): Promise<string> {
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-16).map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return textBlock?.text?.trim() || "I'm here — could you tell me a bit more about what's going on?";
  }
}

/**
 * Offline fallback used only when no AI_API_KEY is configured. Unlike a
 * single canned response, this actually reads the message for question
 * type and topic, picks from several worded variants, and avoids
 * repeating whatever it (or the student) said last turn — so it doesn't
 * feel like the same reply on repeat, even without a real model behind it.
 */
class OfflineFallbackProvider implements AIProvider {
  async reply(history: ChatMessage[], userMessage: string): Promise<string> {
    const text = userMessage.toLowerCase().trim();
    const lastAssistant = [...history].reverse().find((m) => m.role === "assistant")?.content;
    const isQuestion = /\?|^(how|what|why|when|should|can|could|is it|do i|does)\b/i.test(text);

    const pick = (options: string[]): string => {
      const filtered = options.filter((o) => o !== lastAssistant);
      const pool = filtered.length ? filtered : options;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const qa: { test: RegExp; answers: string[] }[] = [
      {
        test: /(memoriz|remember|recall|retain)/,
        answers: [
          "Active recall beats re-reading — close the book and try to write out what you remember, then check what you missed. Spacing that out over a few days (instead of one long session) makes it stick far better.",
          "Try turning the material into questions and quizzing yourself, rather than just re-reading notes. Teaching it out loud to an imaginary classmate works surprisingly well too.",
        ],
      },
      {
        test: /(procrastinat|can'?t start|won'?t start|avoid|putting off)/,
        answers: [
          "Procrastination usually isn't about laziness — it's the task feeling too big or too vague. Pick the smallest possible first step (open the notes, write one sentence) and commit to just that.",
          "Try a 10-minute rule: tell yourself you'll only do it for 10 minutes, then you're allowed to stop. Most of the time starting is the hard part, and momentum carries you past it.",
        ],
      },
      {
        test: /(time management|schedule|plan my|how (do|to) i (plan|study))/,
        answers: [
          "Start by listing every exam with its date, then work backward — block out revision for the closest one first. Breaking each subject into 2-3 specific sessions (not just 'study X') makes it far less overwhelming.",
          "A simple approach: rank your subjects by urgency (soonest exam) and difficulty, then give the hardest one your best-focused hours, not your last tired ones.",
        ],
      },
      {
        test: /(focus|distract|concentrat)/,
        answers: [
          "Short, timed sessions usually beat long unfocused ones — try 25 minutes fully on one thing, then a real 5-minute break. There's a Focus Timer built into the app for exactly this if you want to try it.",
          "Put your phone in another room, not just face-down — proximity alone pulls focus. Pair that with a single, specific goal for the session, like 'finish these 10 practice questions' instead of 'study'.",
        ],
      },
      {
        test: /(sleep|tired|exhaust|can'?t sleep|insomnia)/,
        answers: [
          "Running on too little sleep tends to cost you more the next day than the extra revision hour gains you — memory consolidation actually happens during sleep. A short wind-down without screens can help you fall asleep faster.",
          "If your mind is racing about exams at night, try writing down tomorrow's top 3 tasks before bed — it takes the pressure off your brain to keep rehearsing them.",
        ],
      },
      {
        test: /(anxious|anxiety|panic|nervous before|scared)/,
        answers: [
          "A bit of pre-exam nervousness is normal and even useful — it sharpens focus. If it's tipping into panic, a slow exhale-longer-than-inhale breathing pattern for a minute can calm your nervous system quickly. The Unwind space in the app has a guided version.",
          "Try naming specifically what you're worried about rather than a general dread — often it's 1-2 concrete gaps you can actually study, which is much more manageable than 'everything'.",
        ],
      },
    ];

    const matched = qa.find((q) => q.test.test(text));
    if (matched) return pick(matched.answers);

    if (/^(hi|hey|hello|yo|sup)\b/.test(text)) {
      return pick([
        "Hey! What's on your mind today?",
        "Hi there — how's exam prep treating you so far?",
        "Hey! What's been going on with your studying today?",
      ]);
    }

    if (/(thank|thanks|thx)/.test(text)) {
      return pick([
        "Anytime. You're doing better than you think.",
        "Of course — go easy on yourself today.",
        "Happy to help. Come back whenever you need to think something through.",
      ]);
    }

    if (/(overwhelm|too much|can'?t handle|drowning|so much to do)/.test(text)) {
      return pick([
        "That's a lot at once. Let's shrink it — name just one thing you could do in the next 20 minutes, and we'll leave the rest for later.",
        "When everything feels urgent, nothing gets done well. Pick the single most time-sensitive thing and let the rest wait its turn.",
      ]);
    }

    if (isQuestion) {
      return pick([
        "Good question — can you give me a bit more detail on what you're working with? I want to actually help, not just guess.",
        "Tell me a bit more about the specific subject or situation and I'll try to give you something concrete to work with.",
      ]);
    }

    if (history.length === 0) {
      return "Hey, I'm here with you. What's been making exam season feel difficult today?";
    }

    return pick([
      "Tell me a little more about that — what's the part that's weighing on you most?",
      "I hear you. What would feel like a manageable next step here?",
      "That makes sense. What's one small thing that would make today easier?",
    ]);
  }
}

function getProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY;
  if (apiKey) {
    return new RealClaudeProvider(apiKey);
  }
  return new OfflineFallbackProvider();
}

export async function getAIReply(history: ChatMessage[], userMessage: string): Promise<string> {
  const provider = getProvider();
  try {
    return await provider.reply(history, userMessage);
  } catch (err) {
    console.error("[aiService] provider error, falling back:", err);
    if (provider instanceof RealClaudeProvider) {
      return new OfflineFallbackProvider().reply(history, userMessage);
    }
    return "I'm having a little trouble responding right now — mind trying that again in a moment?";
  }
}

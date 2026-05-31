import { requestUrl } from "obsidian";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export const MODELS = {
    "claude-opus-4-8": "Claude Opus 4.8",
    "claude-opus-4-7": "Claude Opus 4.7",
    "claude-opus-4-6": "Claude Opus 4.6",
    "claude-sonnet-4-6": "Claude Sonnet 4.6",
    "claude-haiku-4-5": "Claude Haiku 4.5",
} as const;
export type ModelId = keyof typeof MODELS;
export const DEFAULT_MODEL: ModelId = "claude-opus-4-8";
export const DEFAULT_MAX_TOKENS = 2048;

const SYSTEM_PROMPT = `You are Sage, an assistant embedded in the user's note-taking app. Your role is to explain selected passages from their notes in clear, intuitive language that helps the user understand technical concepts.

The user will provide a passage to explain, possibly with surrounding context from their notes. Use the context to disambiguate the selection's meaning, but focus your explanation on the selected text only.

Structure every response as:
1. A single line containing a 3-6 word title for the concept, in title case. No markdown formatting, no surrounding quotes, no trailing punctuation.
2. A 2-3 sentence TL;DR that captures the core idea in plain language.
3. 3-4 short paragraphs of elaboration, each beginning with a bold run-in subheading. Explain the selection without merely restating it.

Guidelines:
- Write directly. No preamble like "Great question" or "Here's an explanation."
- Format responses as markdown for rendering in Obsidian.
- Render any math with MathJax: $inline$ and $$display$$.
- If the selection contains equations, break them down, show canonical forms, or work through simple derivations.`;

interface AnthropicTextBlock {
    type: "text";
    text: string;
}

interface AnthropicMessagesResponse {
    content: AnthropicTextBlock[];
}

export interface SelectionContext {
    leading: string;
    trailing: string;
}

export interface ExplainOptions {
    model: ModelId;
    maxTokens: number;
    context?: SelectionContext;
}

export interface ExplainResult {
    title: string;
    body: string;
}

export async function explain(
    selection: string,
    apiKey: string,
    options: ExplainOptions,
): Promise<ExplainResult> {
    if (!apiKey) throw new Error("Missing Anthropic API key.");
    if (!selection.trim()) throw new Error("Selection is empty.");

    const { leading = "", trailing = "" } = options.context ?? {};
    const blocks: string[] = [];
    if (leading) blocks.push(`<context_before>\n${leading}\n</context_before>`);
    blocks.push(`<selection>\n${selection}\n</selection>`);
    if (trailing) blocks.push(`<context_after>\n${trailing}\n</context_after>`);
    const prompt = blocks.join("\n\n");

    const response = await requestUrl({
        url: ANTHROPIC_MESSAGES_URL,
        method: "POST",
        contentType: "application/json",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
            model: options.model,
            max_tokens: options.maxTokens,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: prompt }],
        }),
        throw: false,
    });

    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Anthropic API error ${response.status}: ${response.text}`);
    }

    const data = response.json as AnthropicMessagesResponse;
    const fullText = data.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();

    const newlineIdx = fullText.indexOf("\n");
    if (newlineIdx === -1) {
        return { title: "", body: fullText };
    }

    const rawTitle = fullText.slice(0, newlineIdx);
    const body = fullText.slice(newlineIdx + 1).trim();

    const title = rawTitle
        .replace(/^#+\s*/, "")
        .replace(/^\*+|\*+$/g, "")
        .replace(/^\p{Pi}|\p{Pf}$/gu, "")
        .replace(/^title\s*:\s*/i, "")
        .trim();

    return { title, body };
}

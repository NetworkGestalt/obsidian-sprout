import { Editor, EditorPosition } from "obsidian";

export const truncate = (s: string, max = 50): string => {
    const flat = s.replace(/\s+/g, " ").trim();
    if (flat.length <= max) return flat;
    let cut = max - 3;
    while (cut < flat.length && /\w/.test(flat.charAt(cut))) cut++;
    return cut >= flat.length ? flat : flat.slice(0, cut) + "...";
};

export function expandEditorSelectionToWords(editor: Editor): void {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const fromLine = editor.getLine(from.line);
    const toLine = editor.getLine(to.line);
    const isWord = (c: string) => /\w/.test(c);

    let fromCh = from.ch;
    while (fromCh > 0 && isWord(fromLine.charAt(fromCh - 1))) fromCh--;

    let toCh = to.ch;
    while (toCh < toLine.length && isWord(toLine.charAt(toCh))) toCh++;

    editor.setSelection({ line: from.line, ch: fromCh }, { line: to.line, ch: toCh });
}

function wrapLines(text: string, fn: (content: string) => string): string {
    return text
        .split("\n")
        .map((line) => {
            const match = line.match(/^(\s*)(.*?)(\s*)$/);
            if (!match || !match[2]) return line;
            return `${match[1]}${fn(match[2])}${match[3]}`;
        })
        .join("\n");
}

export function wrapHighlight(text: string): string {
    return wrapLines(text, (s) => `==${s}==`);
}

export function wrapWikilink(text: string, target: string): string {
    return wrapLines(text, (s) => `[[${target}|${s}]]`);
}

export function getContextAround(
    editor: Editor,
    from: EditorPosition,
    to: EditorPosition,
    maxChars: number,
): { leading: string; trailing: string } {
    if (maxChars <= 0) return { leading: "", trailing: "" };
    const doc = editor.getValue();
    const fromOffset = editor.posToOffset(from);
    const toOffset = editor.posToOffset(to);
    return {
        leading: doc.slice(Math.max(0, fromOffset - maxChars), fromOffset),
        trailing: doc.slice(toOffset, toOffset + maxChars),
    };
}

export function quoteCallout(text: string, title = "Original selection"): string {
    const body = text.split("\n").map((line) => `> ${line}`).join("\n");
    return `> [!quote] ${title}\n${body}`;
}

const RESERVED_WINDOWS_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;

export function sanitizeFilename(name: string, fallback: string): string {
    const cleaned = name
        // eslint-disable-next-line no-control-regex -- stripping control characters is intentional for filenames
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, "")
        .replace(/^[.\s]+|[.\s]+$/g, "")
        .slice(0, 80)
        .trim();
    if (!cleaned || RESERVED_WINDOWS_NAMES.test(cleaned)) return fallback;
    return cleaned;
}
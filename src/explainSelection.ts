import { Editor, Notice, normalizePath } from "obsidian";
import type SagePlugin from "./main";
import {
    truncate,
    expandEditorSelectionToWords,
    wrapHighlight,
    wrapWikilink,
    quoteCallout,
    getContextAround,
    sanitizeFilename,
} from "./utils";
import { explain, ExplainResult } from "./model";

export async function explainSelection(plugin: SagePlugin, editor: Editor) {
    const { app, settings } = plugin;

    expandEditorSelectionToWords(editor);
    const selection = editor.getSelection();
    if (!selection.trim()) return;

    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const sourceFile = app.workspace.getActiveFile();

    const {
        conceptsFolder: folder,
        selectionStyle,
        conceptAlias,
        apiKeySecret,
        contextLength,
        model,
        maxTokens,
    } = settings;
    const apiKey = apiKeySecret ? app.secretStorage.getSecret(apiKeySecret) : null;
    if (!apiKey) {
        new Notice("Sage: input an API key in settings.");
        return;
    }

    const context = getContextAround(editor, from, to, contextLength);

    const notice = new Notice("", 0);
    const baseText = `Sage: explaining "${truncate(selection)}"`;
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let frame = 0;
    const renderSpinner = () => notice.setMessage(`${frames[frame]} ${baseText}`);
    renderSpinner();
    const spinner = window.setInterval(() => {
        frame = (frame + 1) % frames.length;
        renderSpinner();
    }, 80);

    let result: ExplainResult;
    try {
        result = await explain(selection, apiKey, { model, maxTokens, context });
    } catch (err) {
        new Notice(`Sage: ${err instanceof Error ? err.message : String(err)}`);
        return;
    } finally {
        window.clearInterval(spinner);
        notice.hide();
    }

    const fallbackTitle = Math.random().toString(36).slice(2, 10);
    const title = sanitizeFilename(result.title, fallbackTitle);
    const normalizedFolder = folder ? normalizePath(folder) : "";
    const path = normalizePath(normalizedFolder ? `${normalizedFolder}/${title}.md` : `${title}.md`);

    try {
        if (normalizedFolder && !app.vault.getAbstractFileByPath(normalizedFolder)) {
            await app.vault.createFolder(normalizedFolder);
        }

        if (app.vault.getAbstractFileByPath(path)) {
            new Notice(`Sage: linked to existing note "${title}".`);
        } else {
            const noteBody = `${quoteCallout(selection)}\n\n${result.body}`;
            const created = await app.vault.create(path, noteBody);
            if (sourceFile) {
                await app.fileManager.processFrontMatter(created, (frontmatter: Record<string, unknown>) => {
                    frontmatter.source = `[[${app.metadataCache.fileToLinktext(sourceFile, path)}]]`;
                });
            }
        }
    } catch (err) {
        new Notice(`Sage: ${err instanceof Error ? err.message : String(err)}`);
        return;
    }

    const linkTarget = normalizedFolder ? `${normalizedFolder}/${title}` : title;
    const alias = conceptAlias === "icon" ? "🌿" : title;
    let body = selection;
    if (selectionStyle === "highlight") body = wrapHighlight(selection);
    if (selectionStyle === "wikilink") body = wrapWikilink(selection, linkTarget);
    const link = selectionStyle === "wikilink" ? "" : ` [[${linkTarget}|${alias}]]`;
    editor.replaceRange(`${body}${link}`, from, to);
}

import { Editor, Notice, Plugin } from "obsidian";
import { SproutSettings, DEFAULT_SETTINGS, SproutSettingTab } from "./settings";
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

export default class SproutPlugin extends Plugin {
    settings!: SproutSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SproutSettingTab(this.app, this));

        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor) => {
                if (!editor.getSelection()) return;
                menu.addItem((item) =>
                    item.setTitle("Explain selection")
                        .setIcon("sprout")
                        .onClick(() => this.handleExplainSelection(editor))
                );
            })
        );

        this.addCommand({
            id: "explain-selection",
            name: "Explain selection",
            icon: "sprout",
            editorCheckCallback: (checking, editor) => {
                if (!editor.getSelection()) return false;
                if (!checking) void this.handleExplainSelection(editor);
                return true;
            },
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as SproutSettings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async handleExplainSelection(editor: Editor) {
        expandEditorSelectionToWords(editor);
        const selection = editor.getSelection();
        if (!selection.trim()) return;

        const from = editor.getCursor("from");
        const to = editor.getCursor("to");

        const {
            conceptsFolder: folder,
            selectionStyle,
            conceptAlias,
            apiKeySecret,
            contextLength,
            model,
            maxTokens,
        } = this.settings;
        const apiKey = apiKeySecret ? this.app.secretStorage.getSecret(apiKeySecret) : null;
        if (!apiKey) {
            new Notice("Sprout: input an API key in settings.");
            return;
        }

        const context = getContextAround(editor, from, to, contextLength);

        const notice = new Notice("", 0);
        const baseText = `Sprout: explaining "${truncate(selection)}"`;
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
            new Notice(`Sprout: ${err instanceof Error ? err.message : String(err)}`);
            return;
        } finally {
            window.clearInterval(spinner);
            notice.hide();
        }

        const fallbackTitle = Math.random().toString(36).slice(2, 10);
        const title = sanitizeFilename(result.title, fallbackTitle);
        const path = folder ? `${folder}/${title}.md` : `${title}.md`;

        try {
            if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
                await this.app.vault.createFolder(folder);
            }

            if (this.app.vault.getAbstractFileByPath(path)) {
                new Notice(`Sprout: linked to existing note "${title}".`);
            } else {
                const noteBody = `${quoteCallout(selection)}\n\n${result.body}`;
                await this.app.vault.create(path, noteBody);
            }
        } catch (err) {
            new Notice(`Sprout: ${err instanceof Error ? err.message : String(err)}`);
            return;
        }

        const linkTarget = folder ? `${folder}/${title}` : title;
        const alias = conceptAlias === "sprout" ? "🌱" : title;
        let body = selection;
        if (selectionStyle === "highlight") body = wrapHighlight(selection);
        if (selectionStyle === "wikilink") body = wrapWikilink(selection, linkTarget);
        const link = selectionStyle === "wikilink" ? "" : ` [[${linkTarget}|${alias}]]`;
        editor.replaceRange(`${body}${link}`, from, to);
    }
}
import { App, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import type SproutPlugin from "./main";
import { MODELS, ModelId, DEFAULT_MODEL, DEFAULT_MAX_TOKENS } from "./model";

export type SelectionStyle = "none" | "highlight" | "wikilink";
export type ConceptAlias = "sprout" | "title";

export interface SproutSettings {
    conceptsFolder: string;
    selectionStyle: SelectionStyle;
    conceptAlias: ConceptAlias;
    apiKeySecret: string;
    contextLength: number;
    model: ModelId;
    maxTokens: number;
}

export const DEFAULT_SETTINGS: SproutSettings = {
    conceptsFolder: "concepts",
    selectionStyle: "none",
    conceptAlias: "title",
    apiKeySecret: "",
    contextLength: 2000,
    model: DEFAULT_MODEL,
    maxTokens: DEFAULT_MAX_TOKENS,
};

export class SproutSettingTab extends PluginSettingTab {
    plugin: SproutPlugin;

    constructor(app: App, plugin: SproutPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        this.containerEl.empty();

        new Setting(this.containerEl)
            .setName("Concepts folder")
            .setDesc("Name of the folder where concept notes are created (vault root if blank).")
            .addText((text) =>
                text
                    .setPlaceholder("Concepts")
                    .setValue(this.plugin.settings.conceptsFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.conceptsFolder = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(this.containerEl)
            .setName("Selection style")
            .setDesc((() => {
                const frag = document.createDocumentFragment();
                frag.appendText("Display style of the selected text after a concept is created. ");
                frag.createEl("em", {
                    text:
                        'Warning: "Highlight" breaks existing highlights in the selected text, ' +
                        'and "Wikilink" breaks math rendering.',
                });
                return frag;
            })())
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        none: "None",
                        highlight: "Highlight",
                        wikilink: "Wikilink",
                    })
                    .setValue(this.plugin.settings.selectionStyle)
                    .onChange(async (value) => {
                        this.plugin.settings.selectionStyle = value as SelectionStyle;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(this.containerEl)
            .setName("Concept alias")
            .setDesc("Display name of the concept wikilink.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        sprout: "🌱",
                        title: "Title",
                    })
                    .setValue(this.plugin.settings.conceptAlias)
                    .onChange(async (value) => {
                        this.plugin.settings.conceptAlias = value as ConceptAlias;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(this.containerEl)
            .setName("Context length")
            .setDesc("Max number of characters before and after the selection to send as context.")
            .addText((text) => {
                text.inputEl.type = "number";
                text.inputEl.min = "0";
                text
                    .setPlaceholder("2000")
                    .setValue(String(this.plugin.settings.contextLength))
                    .onChange(async (value) => {
                        const n = Number.parseInt(value, 10);
                        this.plugin.settings.contextLength = Number.isFinite(n) && n >= 0 ? n : 0;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(this.containerEl)
            .setName("Model")
            .setDesc("Anthropic model used to explain selections.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions(MODELS)
                    .setValue(this.plugin.settings.model)
                    .onChange(async (value) => {
                        this.plugin.settings.model = value as ModelId;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(this.containerEl)
            .setName("Max tokens")
            .setDesc("Upper bound on the length of the model's response.")
            .addText((text) => {
                text.inputEl.type = "number";
                text.inputEl.min = "1";
                text
                    .setPlaceholder(String(DEFAULT_MAX_TOKENS))
                    .setValue(String(this.plugin.settings.maxTokens))
                    .onChange(async (value) => {
                        const n = Number.parseInt(value, 10);
                        this.plugin.settings.maxTokens = Number.isFinite(n) && n >= 1 ? n : DEFAULT_MAX_TOKENS;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(this.containerEl)
            .setName("API key")
            .setDesc("Anthropic API key used to explain selections.")
            .addComponent((el) =>
                new SecretComponent(this.app, el)
                    .setValue(this.plugin.settings.apiKeySecret)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKeySecret = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
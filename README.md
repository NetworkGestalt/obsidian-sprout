# Sprout

Select a term or passage in a note and Sprout uses the Anthropic API to generate a linked explanation note in your vault. Built for reading research papers that have already been converted to markdown.

## Requirements

- Obsidian 1.11.4 or later
- An [Anthropic API key](https://console.anthropic.com/)

## Installation

Sprout isn't in the community plugin catalog yet, so install it manually:

1. Get `main.js` and `manifest.json` from the latest release, or build them by cloning the repo and running `npm install && npm run build`.
2. Place both files in `.obsidian/plugins/sprout/`.
3. Enable **Sprout** under **Settings → Community plugins**.

## Setup

Open **Settings → Sprout** and paste your Anthropic API key. See [Privacy and security](#privacy-and-security) for how it is stored.

## Usage

1. Select a word, phrase, or passage in a note.
2. Run **Sprout: Explain selection** from the command palette, or right-click the selection and choose **Explain selection**.
3. Sprout writes a concept note to your concepts folder and links your selection to it.

If a concept note with the same title already exists, Sprout links to it instead of creating a duplicate.

## Settings

- **Concepts folder**: where concept notes are created.
- **Selection style**: how the original selection looks after linking: plain, highlighted, or turned into a wikilink.
- **Concept alias**: display the link as 🌱 or as the concept's title.
- **Context length**: how much surrounding text is sent along to disambiguate the selection.
- **Model**: which Anthropic model to use.
- **Max tokens**: upper bound on the response length.

## Privacy and security

> [!CAUTION]
> Explaining a selection sends the selected text and surrounding context to the Anthropic API (a third party). Your API key is kept in Obsidian's secret storage, which is currently **not encrypted at rest**: it is saved unencrypted in local storage, where software with access to that data can read it.

## License

Released under the terms in [LICENSE](LICENSE).

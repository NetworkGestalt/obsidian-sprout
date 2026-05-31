# Sprout

Select a term or passage and Sprout uses the Anthropic API to generate a linked explanation note in your vault. Useful for explaining technical concepts in research papers, or for going down a learning rabbit hole.

## Requirements

- Obsidian 1.11.4 or later
- An [Anthropic API key](https://console.anthropic.com/)
- Papers already in your vault as markdown (Sprout works on notes, not PDFs)

## Installation

Sprout isn't in the community plugin catalog yet, so install it manually:

1. Clone the repo and run `npm install && npm run build` to produce `main.js`.
2. Place `main.js` and `manifest.json` in `.obsidian/plugins/sprout/`.
3. Enable **Sprout** under **Settings → Community plugins**.

## Setup

Open **Settings → Sprout** and paste your Anthropic API key.

> [!NOTE]
> When you explain a selection, Sprout sends the selected text and up to 2000 characters (configurable) of surrounding context to the Anthropic API.

> [!CAUTION]
> Your API key is kept in Obsidian's secret storage, which is currently not encrypted at rest: other programs on your computer could read it.

## Usage

1. Select a word, phrase, or passage in a note.
2. Run **Sprout: Explain selection** from the command palette, or right-click the selection and choose **Explain selection**.
3. Sprout writes a concept note to your concepts folder and links your selection to it.

If a concept note with the same title already exists, Sprout links to it instead of creating a duplicate.

## Settings

- **Concepts folder**: where concept notes are created (vault root if blank).
- **Selection style**: how the original selection looks after linking (plain, highlighted, or a wikilink).
- **Concept alias**: display the link as "🌱" or the concept's title.
- **Context length**: total characters around the selection sent to the model as context.
- **Model**: which Anthropic model to use.
- **Max tokens**: upper bound on the response length.
- **API key**: your Anthropic API key, stored in Obsidian's secret storage.

## License

Released under the terms in [LICENSE](LICENSE).

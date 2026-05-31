# Sage

Select a term or passage and Sage uses the Anthropic API to generate a linked concept note in your vault. Useful for explaining technical research papers, or for going down a learning rabbit hole.

## Requirements

- Obsidian 1.11.4 or later
- An [Anthropic API key](https://console.anthropic.com/)
- Papers already in your vault as markdown (Sage works on notes, not PDFs)

## Setup

Open **Settings → Sage** and paste your Anthropic API key.

> **Note:** When you explain a selection, Sage sends the selected text and up to 2000 characters (configurable) of surrounding context to the Anthropic API.

> **Caution:** Your API key is kept in Obsidian's secret storage, which is currently not encrypted at rest: other programs on your computer could read it.

## Usage

1. Select a word, phrase, or passage in a note.
2. Run **Sage: Explain selection** from the command palette, or right-click the selection and choose **Explain selection**.
3. Sage writes a concept note to your concepts folder and links your selection to it.

If a concept note with the same title already exists, Sage links to it instead of creating a duplicate.

## Settings

- **Concepts folder**: where concept notes are created (vault root if blank).
- **Selection style**: how the original selection looks after linking (plain, highlighted, or a wikilink).
- **Concept alias**: display the link as "🌿" or the concept's title.
- **Context length**: total characters around the selection sent to the model as context.
- **Model**: which Anthropic model to use.
- **Max tokens**: upper bound on the response length.
- **API key**: your Anthropic API key, stored in Obsidian's secret storage.

## License

Released under the MIT License.

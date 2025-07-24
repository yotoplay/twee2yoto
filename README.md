# twee2yoto

A TypeScript library for converting Twine/TweeJSON to YotoJSON format for interactive audio content.

## Related Packages

This package is designed to work together with [`@yotoplay/twee2json`](https://github.com/yotoplay/twee2json) to provide a complete Twee to Yoto conversion pipeline:

- **`@yotoplay/twee2json`**: Converts Twee format to TweeJSON
- **`@yotoplay/twee2yoto`**: Converts TweeJSON to YotoJSON

### Complete Workflow

```bash
# Convert Twee to TweeJSON
npm install @yotoplay/twee2json
# Then convert TweeJSON to YotoJSON
npm install @yotoplay/twee2yoto
```

## Installation

```bash
npm install twee2yoto
```

## Usage

```typescript
import { convertTweeToYoto, generateTracks } from "twee2yoto";

// Convert Twee JSON to Yoto format
const tweeJson = {
  metadata: {
    title: "My Story",
    init: null,
    data: {
      start: "Start",
      ifid: "12345678-1234-1234-1234-123456789012",
      creator: "Author Name",
    },
  },
  variables: {
    cover: "https://example.com/cover.jpg",
    resumeTimeout: 3600,
  },
  passages: [
    {
      name: "Start",
      metadata: null,
      content: "This is the start of the story.",
      choices: [{ text: "Go to next", link: "Next" }],
      tags: ["start"],
    },
    {
      name: "Next",
      metadata: null,
      content: "This is the next passage.",
      choices: [{ text: "Go back", link: "Start" }],
      tags: ["middle"],
    },
  ],
};

const yotoJson = convertTweeToYoto(tweeJson, { useTags: false });
console.log(yotoJson);

// Generate tracks from audio data
const audioData = [
  {
    key: "passage1",
    contentAudioUrl: "https://example.com/audio1.mp3",
    choices: [{ text: "Next", link: "passage2" }],
  },
];

const tracks = generateTracks(audioData, "aac");
console.log(tracks);
```

## API

### `convertTweeToYoto(tweeJson: TweeJSON, options: { useTags: boolean }): YotoJSON`

Converts a Twee JSON object to Yoto format.

#### Parameters

- `tweeJson` (TweeJSON): The Twee JSON object to convert
- `options` (object): Configuration options
  - `useTags` (boolean): Whether to include passage tags in chapter titles

#### Returns

A `YotoJSON` object with the following structure:

```typescript
interface YotoJSON {
  title?: string;
  slug: string;
  sortkey: string;
  metadata: YotoMetadata;
  updatedAt: string;
  content: YotoContent;
}
```

### `generateTracks(audios: GeneratedAudio[], format?: string): Track[]`

Generates Yoto track objects from audio data.

#### Parameters

- `audios` (GeneratedAudio[]): Array of audio data objects
- `format` (string, optional): Audio format (default: 'aac')

#### Returns

An array of `Track` objects with events for interactive navigation.

## Types

### TweeJSON

```typescript
interface TweeJSON {
  metadata: Metadata;
  variables: { [key: string]: any };
  passages: Passage[];
}
```

### YotoJSON

```typescript
interface YotoJSON {
  title?: string;
  slug: string;
  sortkey: string;
  metadata: YotoMetadata;
  updatedAt: string;
  content: YotoContent;
}
```

### GeneratedAudio

```typescript
interface GeneratedAudio {
  key: string;
  contentAudioUrl: string;
  choices: Choice[];
}
```

## Features

- Converts Twee JSON to Yoto interactive format
- Generates navigation events for left/right button and end actions
- Supports custom cover images and metadata
- Handles passage tags and choice navigation
- Configurable audio format support
- Automatic slug generation from titles
- Default values for missing metadata

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Lint code
npm run lint

# Format code
npm run format:fix

# Run semantic-release locally (for testing)
npm run release
```

## Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing. The release process is triggered automatically when changes are pushed to the `main` branch.

### Commit Message Format

To ensure proper versioning, commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `BREAKING CHANGE:` - Breaking changes (triggers major version bump)
- `docs:` - Documentation changes (no version bump)
- `style:` - Code style changes (no version bump)
- `refactor:` - Code refactoring (no version bump)
- `test:` - Adding or updating tests (no version bump)
- `chore:` - Maintenance tasks (no version bump)

### Release Process

1. Push changes to the `main` branch
2. GitHub Actions automatically runs tests and builds
3. If tests pass, semantic-release analyzes commit messages
4. If a new version is needed, it:
   - Updates the version in `package.json`
   - Generates release notes
   - Updates `CHANGELOG.md`
   - Publishes to npm
   - Creates a GitHub release

### Manual Release

To run semantic-release locally (for testing):

```bash
npm run release
```

## License

MIT

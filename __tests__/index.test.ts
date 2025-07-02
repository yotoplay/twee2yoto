import { describe, it, expect } from 'vitest';
import { convertTweeToYoto, generateTracks } from '../src/index.js';

describe('convertTweeToYoto', () => {
    const mockTweeJson = {
        metadata: {
            title: 'Test Story',
            init: null,
            data: {
                start: 'Start',
                ifid: '12345678-1234-1234-1234-123456789012',
                creator: 'Test Author',
                format: 'Harlowe',
                'format-version': '3.3.5'
            }
        },
        variables: {
            cover: 'https://example.com/cover.jpg',
            resumeTimeout: 3600
        },
        passages: [
            {
                name: 'Start',
                metadata: null,
                content: 'This is the start.',
                choices: [{ text: 'Go to next', link: 'Next' }],
                tags: ['start']
            },
            {
                name: 'Next',
                metadata: null,
                content: 'This is the next passage.',
                choices: [
                    { text: 'Go back', link: 'Start' },
                    { text: 'End', link: 'End' }
                ],
                tags: ['middle']
            },
            {
                name: 'End',
                metadata: null,
                content: 'This is the end.',
                choices: [],
                tags: ['end']
            }
        ]
    };

    it('should convert twee JSON to yoto format', () => {
        const result = convertTweeToYoto(mockTweeJson, { useTags: false });

        expect(result.title).toBe('Test Story');
        expect(result.slug).toBe('test-story');
        expect(result.sortkey).toBe('test-story');
        expect(result.metadata.author).toBe('Test Author');
        expect(result.metadata.category).toBe('activities');
        expect(result.metadata.cover.imageL).toBe(
            'https://example.com/cover.jpg'
        );
        expect(result.metadata.description).toBe('Test Story');
        expect(result.content.playbackType).toBe('interactive');
        expect(result.content.chapters).toHaveLength(3);
    });

    it('should handle tags when useTags is true', () => {
        const result = convertTweeToYoto(mockTweeJson, { useTags: true });

        expect(result.content.chapters[0].title).toBe('Start [start]');
        expect(result.content.chapters[1].title).toBe('Next [middle]');
        expect(result.content.chapters[2].title).toBe('End [end]');
    });

    it('should handle tags when useTags is false', () => {
        const result = convertTweeToYoto(mockTweeJson, { useTags: false });

        expect(result.content.chapters[0].title).toBe('Start');
        expect(result.content.chapters[1].title).toBe('Next');
        expect(result.content.chapters[2].title).toBe('End');
    });

    it('should generate correct events for choices', () => {
        const result = convertTweeToYoto(mockTweeJson, { useTags: false });

        // Start passage has one choice
        const startTrack = result.content.chapters[0].tracks[0];
        console.log('DEBUG startTrack.events.onEnd:', startTrack.events.onEnd);
        expect(startTrack.events.onEnd).toEqual({
            cmd: 'stop'
        });

        // Next passage has two choices
        const nextTrack = result.content.chapters[1].tracks[0];
        expect(nextTrack.events.onLhb).toEqual({
            cmd: 'goto',
            params: {
                chapterKey: 'Start',
                trackKey: 'Start'
            }
        });
        expect(nextTrack.events.onRhb).toEqual({
            cmd: 'goto',
            params: {
                chapterKey: 'End',
                trackKey: 'End'
            }
        });
        expect(nextTrack.events.onEnd).toEqual({ cmd: 'stop' });

        // End passage has no choices
        const endTrack = result.content.chapters[2].tracks[0];
        expect(endTrack.events.onEnd).toEqual({
            cmd: 'stop'
        });
    });

    it('should use default values when metadata is missing', () => {
        const minimalTweeJson = {
            metadata: {
                title: undefined,
                init: null
            },
            variables: {},
            passages: [
                {
                    name: 'Start',
                    metadata: null,
                    content: 'Content',
                    choices: [],
                    tags: []
                }
            ]
        };

        const result = convertTweeToYoto(minimalTweeJson, { useTags: false });

        expect(result.title).toBeUndefined();
        expect(result.slug).toBe('untitled');
        expect(result.sortkey).toBe('untitled');
        expect(result.metadata.author).toBe('Unknown');
        expect(result.metadata.description).toBe('Untitled');
        expect(result.metadata.cover.imageL).toBe(
            'https://cdn.yoto.io/myo-cover/star_green.gif'
        );
    });

    it('should use custom resume timeout when provided', () => {
        const result = convertTweeToYoto(mockTweeJson, { useTags: false });

        expect(result.content.config.resumeTimeout).toBe(3600);
    });

    it('should use default resume timeout when not provided', () => {
        const tweeJsonWithoutTimeout = {
            ...mockTweeJson,
            variables: { cover: 'https://example.com/cover.jpg' }
        };

        const result = convertTweeToYoto(tweeJsonWithoutTimeout, {
            useTags: false
        });

        expect(result.content.config.resumeTimeout).toBe(2592000);
    });
});

describe('generateTracks', () => {
    it('should generate tracks from audio data', () => {
        const mockAudios = [
            {
                key: 'passage1',
                contentAudioUrl: 'https://example.com/audio1.mp3',
                choices: [{ text: 'Next', link: 'passage2' }]
            },
            {
                key: 'passage2',
                contentAudioUrl: 'https://example.com/audio2.mp3',
                choices: [
                    { text: 'Back', link: 'passage1' },
                    { text: 'End', link: 'passage3' }
                ]
            }
        ];

        const result = generateTracks(mockAudios);

        expect(result).toHaveLength(2);
        expect(result[0].key).toBe('passage1');
        expect(result[0].title).toBe('passage1');
        expect(result[0].type).toBe('audio');
        expect(result[0].format).toBe('aac');
        expect(result[0].trackUrl).toBe('https://example.com/audio1.mp3');
        expect(result[0].events.onLhb).toEqual({
            cmd: 'goto',
            params: {
                chapterKey: 'passage2',
                trackKey: 'passage2'
            }
        });

        expect(result[1].key).toBe('passage2');
        expect(result[1].events.onLhb).toEqual({
            cmd: 'goto',
            params: {
                chapterKey: 'passage1',
                trackKey: 'passage1'
            }
        });
        expect(result[1].events.onRhb).toEqual({
            cmd: 'goto',
            params: {
                chapterKey: 'passage3',
                trackKey: 'passage3'
            }
        });
    });

    it('should use custom format when provided', () => {
        const mockAudios = [
            {
                key: 'passage1',
                contentAudioUrl: 'https://example.com/audio1.mp3',
                choices: []
            }
        ];

        const result = generateTracks(mockAudios, 'mp3');

        expect(result[0].format).toBe('mp3');
    });

    it('should handle empty choices array', () => {
        const mockAudios = [
            {
                key: 'passage1',
                contentAudioUrl: 'https://example.com/audio1.mp3',
                choices: []
            }
        ];

        const result = generateTracks(mockAudios);

        expect(result[0].events.onEnd).toEqual({
            cmd: 'stop'
        });
    });
});

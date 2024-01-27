import { Game } from '@app/interfaces/game';
import isValidGame from '@app/utils/is-valid-game';

describe('isValidGame', () => {
    it('should return true for a valid game object', () => {
        const game: Game = {
            id: '123456',
            title: 'Valid Game',
            description: 'A valid game description',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 15,
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        expect(isValidGame(game)).toBeTrue();
    });

    it('should return false if the game title is missing', () => {
        const game: Game = {
            id: '123456',
            title: '',
            description: 'Game without title',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if the game has no questions', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if a question is missing a type', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 4,
                    type: '',
                    text: 'Sample Question',
                    points: 10,
                    choices: [],
                },
            ],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if a question is missing text', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 5,
                    type: 'QCM',
                    text: '',
                    points: 10,
                    choices: [],
                },
            ],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if a question is missing points', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 5,
                    type: 'QCM',
                    text: 'Sample Question',
                    choices: [],
                    points: null as unknown as number,
                },
            ],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if a question has no choices', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 5,
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [],
                },
            ],
        };

        expect(isValidGame(game)).toBeFalse();
    });

    it('should return false if a question has no correct choice', () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: 5,
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: false },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        expect(isValidGame(game)).toBeFalse();
    });
});

import { Game } from '@app/interfaces/game';
import { customAlphabet } from 'nanoid';

const ID_LENGTH = 6;

const assignNewGameAttributes = (game: Game): void => {
    game.lastModification = new Date();
    game.id = generateNewId();
};

const generateNewId = (): string => {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', ID_LENGTH);
    return nanoid();
};

export default assignNewGameAttributes;

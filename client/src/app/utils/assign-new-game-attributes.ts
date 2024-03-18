import { Game } from '@app/interfaces/game';
import { customAlphabet } from 'nanoid';

const ID_LENGTH = 6;

const assignNewGameAttributes = (game: Game): void => {
    game.lastModification = new Date().toISOString() as unknown as Date;
    game.id = generateNewId();
};

export const generateNewId = (): string => {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', ID_LENGTH);
    return nanoid();
};

export default assignNewGameAttributes;

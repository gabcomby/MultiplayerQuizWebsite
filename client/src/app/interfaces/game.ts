export interface Game {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
    duration: number;
    lastModification: Date;
    questions: Question[];
}

export interface Choice {
    text: string;
    isCorrect: boolean;
}

export interface AnswersPlayer extends Map<string, number[]> {}

// export interface AnswersPlayer {
//     [question: string]: number[];
// }

export interface Question {
    type: string;
    text: string;
    points: number;
    choices: Choice[];
    lastModification: Date;
    id: string;
}

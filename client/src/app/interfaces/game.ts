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
    isCorrect?: boolean;
}

export interface Question {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
    previousIndex?: number;
    currentIndex?: number;
    lastModification: Date;
    id: string;
}

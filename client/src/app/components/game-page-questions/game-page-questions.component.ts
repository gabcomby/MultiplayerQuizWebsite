import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Choice } from '@app/interfaces/game';
import { AnswerStateService } from '@app/services/answer-state.service';

@Component({
    selector: 'app-game-page-questions',
    templateUrl: './game-page-questions.component.html',
    styleUrls: ['./game-page-questions.component.scss'],
})
export class GamePageQuestionsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() question: string;
    @Input() mark: number;
    @Input() choices: Choice[] = [];
    @Input() timerExpired: boolean;
    @Input() answerIsCorrect: boolean;
    @Output() answerIdx = new EventEmitter<number[]>();

    selectedChoices: number[];
    answerGivenIsCorrect: boolean;
    answerIsLocked: boolean = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private answerStateService: AnswerStateService,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.verifyActiveElement()) {
            const buttonPressed = event.key;
            if (this.checkIsNumber(buttonPressed)) {
                if (this.checkIfNumberValid(buttonPressed)) {
                    this.toggleAnswer(Number(buttonPressed) - 1);
                }
            } else if (buttonPressed === 'Enter') {
                this.submitAnswer();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question || changes.choices) {
            this.resetAnswerState();
        }
    }

    ngOnInit(): void {
        this.selectedChoices = [];
        this.answerIdx.emit(this.selectedChoices);
        this.document.addEventListener('keydown', this.buttonDetect.bind(this));
    }

    ngOnDestroy(): void {
        this.document.removeEventListener('keydown', this.buttonDetect.bind(this));
    }

    toggleAnswer(index: number) {
        if (this.timerExpired || this.answerIsLocked) return;
        if (!this.checkIfMultipleChoice()) {
            this.selectedChoices = [];
        }
        const answerIdx = this.selectedChoices.indexOf(index);
        // eslint-disable-next-line
        if (answerIdx > -1) {
            this.selectedChoices.splice(answerIdx, 1);
        } else {
            this.selectedChoices.push(index);
        }
        this.answerIdx.emit(this.selectedChoices);
        this.document.body.focus();
    }

    isSelected(index: number): boolean {
        return this.selectedChoices.includes(index);
    }

    submitAnswer(): void {
        this.answerIsLocked = true;
        this.answerStateService.lockAnswer(this.answerIsLocked);
    }

    resetAnswerState(): void {
        this.selectedChoices = [];
        this.answerIdx.emit(this.selectedChoices);
        this.answerIsLocked = false;
        this.answerStateService.lockAnswer(this.answerIsLocked);
    }

    private checkIfNumberValid(buttonPressed: string): boolean {
        return Number(buttonPressed) > 0 && Number(buttonPressed) <= this.choices.length;
    }

    private verifyActiveElement(): boolean {
        return this.document.activeElement == null || this.document.activeElement.tagName.toLowerCase() !== 'textarea';
    }

    private checkIfMultipleChoice(): boolean {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        if (count > 1) return true;
        else return false;
    }

    private checkIsNumber(buttonPressed: string): boolean {
        return !Number.isNaN(Number(buttonPressed));
    }
}

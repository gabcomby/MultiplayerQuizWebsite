import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Output() registerQuestion: EventEmitter<string> = new EventEmitter();
    question: string = '';
    // questionId: number = 0;
    point: number = 0;

    addQuestion() {
        this.registerQuestion.emit(this.question);
        this.question = '';
    }
}

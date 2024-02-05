import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Choice, Question } from '@app/interfaces/game';

const MAX_CHOICES = 4;

@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @Output() registerAnswer: EventEmitter<Choice[]> = new EventEmitter();
    questionForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.initForm();
    }

    get answers(): FormArray {
        return this.questionForm.get('answers') as FormArray;
    }

    initForm() {
        this.questionForm = this.formBuilder.group({
            answers: this.formBuilder.array([this.createAnswerField(), this.createAnswerField()]),
        });
    }

    createAnswerField(): FormGroup {
        return this.formBuilder.group({
            text: ['', Validators.required],
            isCorrect: false,
        });
    }

    drop(event: CdkDragDrop<Question[]>) {
        const answersArray = this.answers.getRawValue();
        moveItemInArray(answersArray, event.previousIndex, event.currentIndex);
        this.answers.patchValue(answersArray);
    }

    addChoice() {
        if (this.answers.length < MAX_CHOICES) {
            this.answers.push(this.createAnswerField());
        } else {
            alert('maximum 4 choix');
        }
    }

    removeChoice(index: number) {
        if (this.answers.length > 2) {
            this.answers.removeAt(index);
        } else {
            alert('minimum 2');
        }
    }


    addAnswer() {
        if (this.questionForm.valid) {
            const answers = this.questionForm.value.answers;
            this.registerAnswer.emit(answers);
        }
    }

    //     if (goodAnswer < 1 || goodAnswer === this.answers.length) {
    //         alert('Au moins une bonne réponse et une mauvaise réponse');
    //     } else if (this.answerValid(this.answers)) {
    //         this.registerAnswer.emit(this.answers);
    //     }
    // }
    // answerValid(answer: Choice[]) {
    //     let valid = true;
    //     answer.forEach((elem) => {
    //         if (elem.text === '') {
    //             valid = false;
    //         }
    //         if (elem.text.trim().length === 0) {
    //             valid = false;
    //         }
    //     });
    //     return valid;
    // }
}

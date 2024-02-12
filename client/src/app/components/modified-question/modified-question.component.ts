import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    @Input() gameQuestions: Question[];
    @Input() modifiedShown: boolean;
    @Input() listQuestionBank: boolean;

    questionList: Question[] = [];
    disabled: boolean[] = [];
    menuSelected: boolean = false;

    constructor(
        private questionService: QuestionService,
        // private snackbarService: SnackbarService,
        private questionValidationService: QuestionValidationService,
    ) {}

    ngOnInit() {
        if (this.listQuestionBank) {
            this.loadQuestionsFromBank();
        } else {
            this.setQuestionList();
        }
        this.questionService.onQuestionAdded.subscribe((question) => {
            this.questionList.push(question);
            this.disabled.push(true);
        });
    }
    setQuestionList() {
        if (!this.gameQuestions) {
            this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
        } else {
            this.questionList = this.gameQuestions;
            this.questionList.forEach(() => {
                this.disabled.push(false);
            });
        }
    }
    async loadQuestionsFromBank() {
        this.questionList = await this.questionService.getQuestions();
        this.disabled = this.questionList.map(() => true);
    }

    toggleModify(index: number) {
        this.disabled[index] = false;
    }

    saveQuestion(index: number) {
        this.questionList[index].lastModification = new Date();
        if (this.listQuestionBank) {
            this.questionService.updateQuestion(this.questionList[index].id, this.questionList[index]);
            this.disabled[index] = true;
        } else {
            if (
                this.questionValidationService.verifyOneGoodAndBadAnswer2(index, this.questionList) &&
                this.questionValidationService.validateQuestion(this.questionList[index])
            ) {
                this.questionService.updateList(this.questionList);
                this.disabled[index] = true;
            }
        }
    }

    // verifyOneGoodAndBadAnswer(index: number): boolean {
    //     const question = this.questionList[index];

    //     let goodAnswerCount = 0;
    //     if (question.choices) {
    //         for (const choice of question.choices) {
    //             if (choice.isCorrect) {
    //                 goodAnswerCount++;
    //             }
    //         }

    //         if (goodAnswerCount < 1 || goodAnswerCount === question.choices.length) {
    //             this.snackbarService.openSnackBar('Il doit y avoir au moins une bonne et mauvaise réponse');

    //             return false;
    //         }
    //     }

    //     return true;
    // }

    // validateQuestion(newQuestion: Question) {
    //     if (newQuestion.text !== '' && newQuestion.points !== 0 && newQuestion.text.trim().length !== 0) {
    //         if (newQuestion.choices) {
    //             if (this.answerValid(newQuestion.choices)) return true;
    //         }
    //     } else this.snackbarService.openSnackBar('La question a besoin d une question, de point et pas juste des espaces');
    //     return false;
    // }

    // answerValid(choices: Choice[]) {
    //     let valid = true;
    //     choices.forEach((elem) => {
    //         if (elem.text === '') {
    //             valid = false;
    //             this.snackbarService.openSnackBar('tous les champs des choix de réponses doivent être remplis');
    //         }
    //     });
    //     return valid;
    // }

    removeQuestion(question: Question, index: number) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questionList, event.previousIndex, event.currentIndex);
        this.toggleMenuSelection();
    }

    toggleMenuSelection(): void {
        this.menuSelected = !this.menuSelected;
    }
}

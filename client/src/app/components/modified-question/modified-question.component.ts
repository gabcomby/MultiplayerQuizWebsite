import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
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
    @Input() fromBank: boolean;

    questionList: Question[] = [];
    disabled: boolean[] = [];
    menuSelected: boolean = false;

    constructor(protected questionService: QuestionService) {}

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
        const validated = this.questionService.saveQuestion(index, this.questionList, this.listQuestionBank);

        this.disabled[index] = validated;
    }

    removeQuestion(question: Question, index: number) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }

    toggleMenuSelection(): void {
        this.menuSelected = !this.menuSelected;
    }
}

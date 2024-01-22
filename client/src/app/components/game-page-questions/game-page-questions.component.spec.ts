import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageQuestionsComponent } from './game-page-questions.component';

describe('GamePageQuestionsComponent', () => {
    let component: GamePageQuestionsComponent;
    let fixture: ComponentFixture<GamePageQuestionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GamePageQuestionsComponent],
        });
        fixture = TestBed.createComponent(GamePageQuestionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeService } from '@app/services/time.service';
import { GamePageTimerComponent } from './game-page-timer.component';

const TOTAL_PLAYTIME = 100;

class MockTimeService {
    time = 0;
    startTimer(time: number) {
        this.time = time;
    }
}

describe('GamePageTimerComponent', () => {
    let component: GamePageTimerComponent;
    let fixture: ComponentFixture<GamePageTimerComponent>;
    let mockTimeService: MockTimeService;

    beforeEach(() => {
        mockTimeService = new MockTimeService();

        TestBed.configureTestingModule({
            declarations: [GamePageTimerComponent],
            providers: [{ provide: TimeService, useValue: mockTimeService }],
        });

        fixture = TestBed.createComponent(GamePageTimerComponent);
        component = fixture.componentInstance;

        component.gameTimer = TOTAL_PLAYTIME;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct total time', () => {
        expect(component.totalTime).toBe(TOTAL_PLAYTIME);
    });
});

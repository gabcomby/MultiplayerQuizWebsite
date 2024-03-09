import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Subject, Subscription, concatMap, from, takeUntil } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    endGame = false;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    private destroy = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private matchLobbyService: MatchLobbyService,
        private gameService: GameService,
    ) {}

    ngOnInit() {
        from((this.unsubscribeSubject = this.gameService.initializeHostGame(this.route.snapshot.params['lobbyId'])))
            .pipe(
                concatMap(() => this.matchLobbyService.getLobby(this.route.snapshot.params['lobbyId'])),
                takeUntil(this.destroy),
            )
            .subscribe({
                next: (lobby) => {
                    this.lobby = lobby;
                },
            });
        this.gameService.finalResultsEmitter.subscribe(() => {
            this.endGame = true;
        });
    }
    // ngOnInit(): void {
    //     return;
    // }
    // ngOnDestroy() {
    //     this.destroy.next();
    //     this.destroy.complete();
    //     this.unsubscribeSubject.forEach((subject) => {
    //         subject.unsubscribe();
    //     });
    // }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Match, Player } from '@app/interfaces/match';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchService {
    private apiUrl = 'http://localhost:3000/api/matches';
    constructor(private http: HttpClient) {}

    getAllMatches(): Observable<Match[]> {
        return this.http.get<Match[]>(`${this.apiUrl}/`);
    }

    getMatch(matchId: string): Observable<Match> {
        return this.http.get<Match>(`${this.apiUrl}/${matchId}`);
    }

    getPlayersFromMatch(matchId: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.apiUrl}/${matchId}/players`);
    }

    createNewMatch(match: Match): Observable<Match> {
        return this.http.post<Match>(`${this.apiUrl}/`, match);
    }

    deleteMatch(matchId: string): Observable<Match> {
        return this.http.delete<Match>(`${this.apiUrl}/${matchId}`);
    }

    addPlayer(player: Player, matchId: string): Observable<Match> {
        return this.http.patch<Match>(`${this.apiUrl}/${matchId}/players`, player);
    }

    removePlayer(playerId: string, matchId: string): Observable<Match> {
        return this.http.delete<Match>(`${this.apiUrl}/${matchId}/players/${playerId}`);
    }

    updatePlayerScore(matchId: string, playerId: string, score: number): Observable<Player> {
        return this.http.patch<Player>(`${this.apiUrl}/${matchId}/players/${playerId}`, { score });
    }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { generateLobbyId, generateNewId } from '@app/utils/assign-new-game-attributes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchLobbyService {
    private apiUrl: string;
    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/lobbies`;
    }

    getAllLobbies() {
        return this.http.get(`${this.apiUrl}/`);
    }

    getLobby(lobbyId: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/${lobbyId}`);
    }

    lobbyExists(lobbyId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${lobbyId}/exist`);
    }

    createLobby(gameId: string): Observable<MatchLobby> {
        const lobby: MatchLobby = {
            id: generateNewId(),
            playerList: [],
            gameId,
            bannedNames: ['organisateur'],
            lobbyCode: generateLobbyId(),
            isLocked: false,
            hostId: generateNewId(),
        };

        return this.http.post<MatchLobby>(`${this.apiUrl}/`, lobby);
    }

    createTestLobby(creatorName: string, gameId: string): Observable<MatchLobby> {
        const player: Player = {
            id: generateNewId(),
            name: creatorName,
            score: 0,
            bonus: 0,
        };
        const lobby: MatchLobby = {
            id: generateNewId(),
            playerList: [player],
            gameId,
            bannedNames: [],
            lobbyCode: generateLobbyId(),
            isLocked: false,
            hostId: '0',
        };
        return this.http.post<MatchLobby>(`${this.apiUrl}/`, lobby);
    }

    deleteLobby(lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}`);
    }

    addPlayer(playerName: string, lobbyId: string): Observable<MatchLobby> {
        const player: Player = {
            id: generateNewId(),
            name: playerName,
            score: 0,
            bonus: 0,
        };
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobbyId}/players`, player);
    }

    getPlayers(lobbyId: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.apiUrl}/${lobbyId}/players`);
    }

    getPlayer(lobbyId: string, playerId: string): Observable<Player> {
        return this.http.get<Player>(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }

    updatePlayerScore(lobbyId: string, playerId: string, incr: number): Observable<MatchLobby> {
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobbyId}/players/${playerId}`, { incr });
    }

    removePlayer(playerId: string, lobbyId: string): Observable<MatchLobby> {
        return this.http.delete<MatchLobby>(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }

    getLobbyByCode(lobbyCode: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/joinLobby/${lobbyCode}`);
    }

    getBannedArray(lobbyId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/${lobbyId}/banned`);
    }

    banPlayer(name: string, lobby: string): Observable<MatchLobby> {
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobby}/banned`, { name });
    }

    authenticateUser(playerName: string, lobbyCode: string): Observable<boolean> {
        const body = { player: playerName.toLowerCase() };
        return this.http.post<boolean>(`${this.apiUrl}/${lobbyCode}/banned`, body);
    }

    gameLocked(lobbyId: string, isLocked: boolean): Observable<MatchLobby> {
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobbyId}/locked`, { isLocked });
    }
    getLockStatus(lobbyId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/${lobbyId}/locked`);
    }

    authentificateNameOfUser(playerName: string, lobbyCode: string): Observable<boolean> {
        console.log('name', playerName);
        console.log('name to lowercase', playerName);
        const body = { player: playerName };
        return this.http.post<boolean>(`${this.apiUrl}/${lobbyCode}/isTaken`, body);
    }
}

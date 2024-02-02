import { Application } from '@app/app';
import { IMatch, IPlayer } from '@app/model/match.model';
import { MatchService } from '@app/services/match.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    let matchService: SinonStubbedInstance<MatchService>;
    let expressApp: Express.Application;

    const mockPlayerData: IPlayer[] = [
        { id: 'player1', name: 'Player 1', score: 100 } as IPlayer,
        { id: 'player2', name: 'Player 2', score: 50 } as IPlayer,
        { id: 'player3', name: 'Player 3', score: 100 } as IPlayer,
        { id: 'player4', name: 'Player 4', score: 100 } as IPlayer,
        { id: 'player5', name: 'Player 5', score: 50 } as IPlayer,
        { id: 'player6', name: 'Player 6', score: 100 } as IPlayer,
    ];

    const mockMatchData: IMatch[] = [
        {
            id: '123abc',
            playerList: [mockPlayerData[0], mockPlayerData[1], mockPlayerData[2]],
        } as IMatch,
        {
            id: '456def',
            playerList: [mockPlayerData[3], mockPlayerData[4], mockPlayerData[5]],
        } as IMatch,
    ];

    beforeEach(async () => {
        matchService = createStubInstance(MatchService);

        const app = Container.get(Application);
        Object.defineProperty(app['matchController'], 'matchService', { value: matchService, writable: true });

        expressApp = app.app;
    });

    it('getAllMatches should return an error status on GET request if service fails', async () => {
        matchService.getAllMatches.rejects(new Error("Can't find matches to fetch"));

        return supertest(expressApp)
            .get('/api/matches')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find matches to fetch" });
            });
    });

    it('getMatch should return an error status on GET request if service fails', async () => {
        matchService.getMatch.rejects(new Error("Can't find requested match"));

        return supertest(expressApp)
            .get('/api/matches/123abc')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find requested match" });
            });
    });

    it('getAllPlayersFromMatch should return an error status on GET request if service fails', async () => {
        matchService.getAllMatches.rejects(new Error("Can't find players in requested match"));

        return supertest(expressApp)
            .get('/api/matches/123abc/players')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find players in requested match" });
            });
    });

    it('createMatch should return an error status on POST request if service fails', async () => {
        matchService.createMatch.rejects(new Error("Can't create match"));

        return supertest(expressApp)
            .post('/api/matches')
            .send(mockMatchData[0])
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't create match" });
            });
    });

    it('deleteMatch should return an error status on DELETE request if service fails', async () => {
        matchService.deleteMatch.rejects(new Error("Can't delete match"));

        return supertest(expressApp)
            .delete('/api/matches/123abc')
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't delete match" });
            });
    });

    it('addPlayer should return an error status on PATCH request if service fails', async () => {
        matchService.addPlayer.rejects(new Error("Can't add player to match"));

        return supertest(expressApp)
            .patch('/api/matches/123abc/players')
            .send({ id: 'a1b2c3', name: 'Test', score: 1000 })
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't add player to match" });
            });
    });

    it('removePlayer should return an error status on DELETE request if service fails', async () => {
        matchService.removePlayer.rejects(new Error("Can't remove player from match"));

        return supertest(expressApp)
            .delete('/api/matches/123abc/players/player1')
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't remove player from match" });
            });
    });

    it('getAllMatches should return all matches successfully on GET request', async () => {
        matchService.getAllMatches.resolves(mockMatchData);

        const response = await supertest(expressApp).get('/api/matches').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData);
    });

    it('getMatch should return specified match successfully on GET request', async () => {
        matchService.getMatch.resolves(mockMatchData[0]);

        const response = await supertest(expressApp).get('/api/matches/123abc').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData[0]);
    });

    it('getAllPlayersFromMatch should return all players from specified match successfully on GET request', async () => {
        matchService.getAllPlayersFromMatch.resolves([mockPlayerData[0], mockPlayerData[1], mockPlayerData[2]]);

        const response = await supertest(expressApp).get('/api/matches/123abc/players').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal([mockPlayerData[0], mockPlayerData[1], mockPlayerData[2]]);
    });

    it('createMatch should return newly created match on POST request', async () => {
        matchService.createMatch.resolves(mockMatchData[0]);

        const response = await supertest(expressApp).post('/api/matches').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData[0]);
    });

    it('deleteMatch should return deleted match on DELETE request', async () => {
        matchService.deleteMatch.resolves(mockMatchData[0]);

        const response = await supertest(expressApp).delete('/api/matches/123abc').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData[0]);
    });

    it('addPlayer should return updated match on PATCH request', async () => {
        matchService.addPlayer.resolves(mockMatchData[0]);

        const response = await supertest(expressApp)
            .patch('/api/matches/123abc')
            .send({ id: 'a1b2c3', name: 'Test', score: 1000 })
            .expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData[0]);
    });

    it('removePlayer should return updated match on DELETE request', async () => {
        matchService.addPlayer.resolves(mockMatchData[0]);

        const response = await supertest(expressApp).delete('/api/matches/123abc/players/player1').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockMatchData[0]);
    });
});

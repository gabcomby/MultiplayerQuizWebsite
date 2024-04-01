import { IGame } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import { customAlphabet } from 'nanoid';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;
const ID_LOBBY_LENGTH = 4;
const FIRST_ANSWER_MULTIPLIER = 1.2;
const TIME_BETWEEN_QUESTIONS_TEST_MODE = 5000;

export class Room {
    // Variables for the lobby
    io: SocketIoServer;
    roomId = '';
    playerList = new Map<string, IPlayer>();
    playerLeftList: IPlayer[] = [];
    game: IGame;
    bannedNames: string[] = [];
    roomLocked = false;
    hostId = '';
    isTestRoom: boolean;
    gameHasStarted = false;

    // Variables for the timer
    launchTimer = true;
    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;

    // Variables for the questions & answers
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Needed to not overflow the array and keep minimal code recycling
    currentQuestionIndex = -1;
    firstAnswerForBonus = true;
    assertedAnswers: number = 0;
    playerHasAnswered = new Map<string, boolean>();
    lockedAnswers = 0;
    livePlayerAnswers = new Map<string, number[] | string>();
    globalAnswerIndex: number[] = [];
    allAnswersForQCM = new Map<string, number[]>();
    allAnswersForQRL = new Map<string, [IPlayer, string][]>();
    globalAnswersText: [IPlayer, string][] = [];
    // gameTest = false;

    constructor(game: IGame, isTestRoom: boolean, io: SocketIoServer) {
        this.roomId = this.generateLobbyId();
        this.game = game;
        this.isTestRoom = isTestRoom;
        this.io = io;
    }

    startQuestion(): void {
        if (!this.isRunning) {
            if (this.launchTimer) {
                this.duration = 5;
                this.isRunning = true;
                this.startCountdownTimer();
            } else {
                this.currentQuestionIndex += 1;
                if (this.currentQuestionIndex === this.game.questions.length) {
                    this.io
                        .to(this.roomId)
                        // TODO : Add the answers for QRL
                        .emit('go-to-results', Array.from(this.playerList), this.game.questions, Array.from(this.allAnswersForQCM));
                } else {
                    this.firstAnswerForBonus = true;
                    this.assertedAnswers = 0;
                    this.io.to(this.roomId).emit('question', this.game.questions[this.currentQuestionIndex], this.currentQuestionIndex);
                    this.isRunning = true;
                    this.playerHasAnswered.forEach((value, key) => {
                        this.playerHasAnswered.set(key, false);
                    });
                    this.livePlayerAnswers.forEach((value, key) => {
                        this.livePlayerAnswers.set(key, []);
                    });
                    this.startCountdownTimer();
                }
            }
        }
    }

    startCountdownTimer(): void {
        this.currentTime = this.duration;
        if (this.game.questions[this.currentQuestionIndex]?.type === 'QRL') {
            this.currentTime = 60;
            this.io.to(this.roomId).emit('timer-countdown', this.currentTime);
        } else {
            this.io.to(this.roomId).emit('timer-countdown', this.duration);
        }
        const timerId = setInterval(
            () => {
                this.currentTime -= 1;
                this.io.to(this.roomId).emit('timer-countdown', this.currentTime);
                if (this.currentTime === 0) {
                    this.firstAnswerForBonus = false;
                    if (!this.launchTimer) {
                        this.io.to(this.roomId).emit('timer-stopped');
                    }
                    this.handleTimerEnd();
                }
            },
            ONE_SECOND_IN_MS,
            this.currentTime,
        );
        this.timerId = timerId;
    }

    handleTimerEnd(): void {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.currentTime = this.duration;
        this.lockedAnswers = 0;
        if (this.launchTimer) {
            this.launchTimer = false;
            this.io.to(this.roomId).emit('question-time-updated', this.game.duration);
            this.duration = this.game.duration;
            this.startQuestion();
            return;
        }
        if (this.isTestRoom) {
            setInterval(() => {
                this.startQuestion();
            }, TIME_BETWEEN_QUESTIONS_TEST_MODE);
        }
    }

    // eslint-disable-next-line complexity
    verifyAnswers(playerId: string, answerIdx: number[] | string, player?: IPlayer): void {
        if (!answerIdx || this.playerHasAnswered.get(playerId)) {
            return;
        }
        this.playerHasAnswered.set(playerId, true);
        const question = this.game.questions[this.currentQuestionIndex];
        this.assertedAnswers += 1;
        if (typeof answerIdx === 'string') {
            this.globalAnswersText.push([player, answerIdx]);
            this.handleQrlAnswers(answerIdx);
        }
        if (this.isTestRoom && question.type === 'QRL') {
            this.playerList.get(playerId).score += question.points;
        } else if (typeof answerIdx !== 'string') {
            if (answerIdx.length !== 0) {
                answerIdx.forEach((index) => {
                    this.globalAnswerIndex.push(index);
                });
                const totalCorrectChoices = question.choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                const isMultipleAnswer = totalCorrectChoices > 1;
                let isCorrect = false;
                if (!isMultipleAnswer) {
                    isCorrect = question.choices[answerIdx[0]].isCorrect;
                } else {
                    for (const index of answerIdx) {
                        if (answerIdx.length < totalCorrectChoices) {
                            isCorrect = false;
                            break;
                        }
                        if (!question.choices[index].isCorrect) {
                            isCorrect = false;
                            break;
                        }
                        isCorrect = true;
                    }
                }
                if (isCorrect && this.firstAnswerForBonus) {
                    this.firstAnswerForBonus = false;
                    this.playerList.get(playerId).score += question.points * FIRST_ANSWER_MULTIPLIER;
                    this.playerList.get(playerId).bonus += 1;
                } else if (isCorrect) {
                    this.playerList.get(playerId).score += question.points;
                }
            }
        }

        if (this.assertedAnswers === this.playerList.size) {
            this.io.to(this.roomId).emit('playerlist-change', Array.from(this.playerList));
            if (question.type === 'QCM') {
                this.allAnswersForQCM.set(question.text, this.globalAnswerIndex);
                this.globalAnswerIndex = [];
            } else if (question.type === 'QRL') {
                this.allAnswersForQRL.set(question.text, this.globalAnswersText);
                this.globalAnswersText = [];
            }
        }
    }

    calculatePointsQRL(points: [IPlayer, number][]): void {
        const question = this.game.questions[this.currentQuestionIndex];
        const playerArray = Array.from(this.playerList.entries());
        points.forEach(([player, point]: [IPlayer, number]) => {
            const playerIndex = playerArray.findIndex(([, p]) => p.id === player.id);
            if (question && playerIndex >= 0) {
                playerArray[playerIndex][1].score += point * question.points;
            }
        });
        this.io.to(this.roomId).emit('playerlist-change', playerArray);
    }
    handleQrlAnswers(answer: string) {
        console.log('qrl' + answer);
    }

    handleEarlyAnswers(playerId: string, answer: number[] | string, player: IPlayer): void {
        this.lockedAnswers += 1;
        this.verifyAnswers(playerId, answer, player);
        if (this.lockedAnswers === this.playerList.size) {
            console.log('TIMER VA STOP');
            this.io.to(this.hostId).emit('locked-answers-QRL', Array.from(this.allAnswersForQRL));
            this.io.to(this.roomId).emit('timer-stopped');
            this.handleTimerEnd();
        }
    }

    generateLobbyId = (): string => {
        const nanoid = customAlphabet('1234567890', ID_LOBBY_LENGTH);
        return nanoid();
    };
}

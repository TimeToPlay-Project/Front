import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { 
    connectWebSocket, 
    sendMessage, 
    setMessageHandler, 
    disconnectWebSocket, 
    subscribeToRoom, 
    unsubscribeFromRoom 
} from '../websocket/chatService';
import '../css/LiarGame.css';
import Swal from 'sweetalert2';

function LiarGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(1);
    const [word, setWord] = useState('');
    const [category, setCategory] = useState('');
    const [timer, setTimer] = useState(0);
    const [isLiar, setIsLiar] = useState(false);
    const [votes, setVotes] = useState({});
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [game, setGame] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [playerOrder, setPlayerOrder] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const LiarGameId = pathname.split('/').pop();
    
    const chatContainerRef = useRef(null);


 
    useEffect(() => {
        let isSubscribed = true;

        const connectAndSetup = async () => {
            try {
                const client = await connectWebSocket();
                console.log("게임 웹소켓 연결 성공");


                await subscribeToRoom(gameId);
                console.log(`게임 ${gameId} 구독 완료`);

                sendMessage('/app/game.getLiarGame', {LiarGameId : LiarGameId });

                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("게임 서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'GET_GAME':
                            console.log("게임 정보 수신:", response.data);
                            setGame(response.data);
                            setCountdown(3);
                            break;
                        case 'GAME_START':
                            handleGameStart(response.data);
                            break;
                        case 'TURN_CHANGE':
                            handleTurnChange(response.data);
                            break;
                        case 'WORD_REVEAL':
                            handleWordReveal(response.data);
                            break;
                        case 'VOTE_UPDATE':
                            handleVoteUpdate(response.data);
                            break;
                        case 'GAME_RESULT':
                            handleGameResult(response.data);
                            break;
                        case 'CHAT':
                            console.log("채팅 메시지 수신:", response);
                            setMessages(prev => [...prev, response.data]);
                            break;
                        case 'ERROR':
                            handleError(response.data);
                            break;
                        default:
                            console.log("알 수 없는 메시지 타입:", response.type);
                    }
                });

            } catch (error) {
                console.error("게임 웹소켓 연결 실패:", error);
                alert("서버 연결에 실패했습니다. 로비로 이동합니다.");
                navigate('/liar');
            }
        };

        connectAndSetup();

        return () => {
            isSubscribed = false;
            unsubscribeFromRoom();
            disconnectWebSocket();
        };
    }, [gameId, navigate]);


 
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);


    useEffect(() => {
        if (countdown === null || !game) return;

        const currentNickname = isHost ? hostName : nickname;
        
        if (countdown === 0) {
            setCountdown(null);
            // 카운트다운이 끝나면 제시어 팝업 표시
            Swal.fire({
                title: `제시어 공개
                <div class="round">round ${currentRound}</div>`,
                html: `
                
                    <div class="word-reveal">
                        <div class="word-category">${game.category}</div>
                        <div class="word-text">${game.liar?.nickname === currentNickname ? '당신은 라이어입니다!' : `제시어: ${game.keywords?.[currentRound-1]}`}</div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: '게임 시작',
                allowOutsideClick: false,
                customClass: {
                    popup: 'word-popup',
                    title: 'word-title',
                    confirmButton: 'word-confirm-btn'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // 플레이어 순서를 랜덤하게 섞기
                    const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
                    setPlayerOrder(shuffledPlayers);
                    setCurrentPlayerIndex(0);
                    startTurn();
                }
            });
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, game, hostName, nickname, isHost]);

    const startTurn = () => {
        if (currentTurn > game.turnTime) {
            // 모든 턴이 끝났을 때의 처리
            endRound();
            return;
        }

        // 현재 턴의 플레이어 표시
        const currentPlayer = playerOrder[currentPlayerIndex];
        
        // 턴 타이머 시작 (30초)
        let timeLeft = 30;
        const turnTimer = setInterval(() => {
            timeLeft--;
            setTimer(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(turnTimer);
                nextPlayer();
            }
        }, 1000);
    };

    const nextPlayer = () => {
        if (currentPlayerIndex === playerOrder.length - 1) {
            // 모든 플레이어가 턴을 마쳤으면 다음 턴으로
            setCurrentPlayerIndex(0);
            setCurrentTurn(prev => prev + 1);
            startTurn();
        } else {
            // 다음 플레이어로
            setCurrentPlayerIndex(prev => prev + 1);
            startTurn();
        }
    };

    const endRound = () => {
        // 라운드 종료 처리
        if (currentRound < game.rounds) {
            setCurrentRound(prev => prev + 1);
            setCurrentTurn(1);
            setCountdown(3); // 다음 라운드 시작
        } else {
            // 게임 종료
            setGameState('finished');
        }
    };

    const handleGameStart = (data) => {
        setGameState('playing');
        setPlayers(data.players);
        setIsLiar(data.isLiar);
        setCategory(data.category);
        if (data.isLiar) {
            setWord('당신은 라이어입니다!');
        } else {
            setWord(data.word);
        }
    };

    const handleTurnChange = (data) => {
        setCurrentTurn(data.currentPlayer);
        setTimer(data.timeLeft);
    };

    const handleWordReveal = (data) => {
        setWord(data.word);
    };

    const handleVoteUpdate = (data) => {
        setVotes(data.votes);
    };

    const handleGameResult = (data) => {
        setGameState('result');
     
    };

    const handleChat = (data) => {
        setMessages(prev => [...prev, data]);
    };

    const handleError = (data) => {
        alert(data.message);
    };


    const handleVote = (playerName) => {
        sendMessage('/app/game.vote', {
            gameId: gameId,
            votedPlayer: playerName
        });
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        console.log("nickname : ", nickname);
        const senderNickname = isHost ? hostName : nickname;
        
        sendMessage('/app/game.chatGame', {
            gameId: gameId,
            content: chatInput,
            sender: senderNickname
        });
        setChatInput('');
    };

    const handleLeaveGame = () => {
        navigate('/liar');
    };

    return (
        <div className="liar-game">
            <div className="game-header">
                <button className="leave-button" onClick={handleLeaveGame}>
                    나가기
                </button>
            </div>

            {countdown !== null && (
                <div className="countdown-overlay">
                    <div className="countdown-number">{countdown}</div>
                </div>
            )}

            <div className="game-content">
                <div className="players-section">
                    {[...Array(6)].map((_, index) => {
                        const player = game?.players[index];
                        const playerIndex = playerOrder.findIndex(p => p?.nickname === player?.nickname);
                        const isCurrentPlayer = gameState === 'playing' && playerIndex === currentPlayerIndex;
                        
                        return player ? (
                            <div key={index} className="player-card">
                                <div className={`player-avatar ${isCurrentPlayer ? 'current-turn' : ''}`}>
                                    {player.nickname.charAt(0).toUpperCase()}
                                    {playerIndex !== -1 && (
                                        <div className="player-order-badge">{playerIndex + 1}</div>
                                    )}
                                </div>
                                <div className="player-info">
                                    <div className="player-status">
                                        {player.nickname}
                                    </div>
                                    {isCurrentPlayer && (
                                        <div className="current-turn-indicator">
                                            <div className="indicator-dot"></div>
                                            현재 차례
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="player-card empty">
                                <div className="player-avatar empty">
                                    ?
                                </div>
                                <div className="player-info">
                                    <div className="player-name">빈 자리</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="chat-section">
                    <div className="chat-messages" ref={chatContainerRef}>
                        {messages.map((msg, index) => (
                            <div
                            key={index}
                            className={`message ${msg.sender === (isHost ? hostName : nickname) ? 'my-message' : ''}`}
                        >
                            <strong>{msg.sender}: </strong>
                            <span className="messageContent">{msg.content}</span>
                        </div>
                        ))}
                    </div>
                    <div className="chat-input2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="메시지를 입력하세요..."
                        />
                        <button onClick={handleSendChat}>전송</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiarGame;
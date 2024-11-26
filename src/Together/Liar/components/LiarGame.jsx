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

function LiarGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = window.location.pathname;
    const gameId = pathname.split('/').pop();
    const { nickname, isHost, hostName } = location.state || {};

    const [gameState, setGameState] = useState('waiting');
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [word, setWord] = useState('');
    const [category, setCategory] = useState('');
    const [timer, setTimer] = useState(0);
    const [isLiar, setIsLiar] = useState(false);
    const [votes, setVotes] = useState({});
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [game, setGame] = useState(null);
    const [countdown, setCountdown] = useState(null);
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
        if (countdown === null) return;
        
        if (countdown === 0) {
            setCountdown(null);
            // 여기에 카운트다운 후 실행할 로직을 넣습니다
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);


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
                        return player ? (
                            <div key={index} className="player-card">
                                <div className="player-avatar">
                                    {player.nickname.charAt(0).toUpperCase()}
                                </div>
                                <div className="player-info">
                                    {/* <div className="player-name">{player.nickname}</div> */}
                                    <div className="player-status">
                                    {player.nickname}
                                    </div>
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
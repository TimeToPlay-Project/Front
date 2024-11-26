import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { 
    connectWebSocket, 
    sendMessage, 
    setMessageHandler, 
    disconnectWebSocket, 
    subscribeToRoom, 
    unsubscribeFromRoom 
} from '../websocket/chatService';
import '../css/GameRoom.css';
import '../css/chat.css';

function GameRoom() {
    const navigate = useNavigate();
    const location = useLocation();
    const [room, setRoom] = useState(null);
    const [joinStauts, setJoinStatus] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordDialog, setShowPasswordDialog] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [reconnectCount, setReconnectCount] = useState(0);
    const [loginStatus, setLoginStatus] = useState(false);
    const [nickname, setNickname] = useState('');
    const [playerInfo, setPlayerInfo] = useState(null);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const { hostName, isHost } = location.state || {};
    const pathname = window.location.pathname;
    const UserRoomId = pathname.split('/').pop();

    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatContainerRef = useRef(null);

    // 채팅 자동 스크롤
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    

    // 컴포넌트 마운트 시 플레이어 정보 초기화
    useEffect(() => {
        const currentPlayer = isHost ? hostName : nickname;
        if (nickname) {
            setPlayerInfo(currentPlayer);
            console.log(`플레이어: ${currentPlayer} `);
            console.log(`플레이어222: ${currentPlayer} `);
        }
    }, [isHost, hostName, nickname]);

    const handlePasswordSubmit = async () => {
        try {
            await sendMessage('/app/game.login', { roomId : UserRoomId, password : password });
        } catch (error) {
            console.error("비밀번호 검증 실패:", error);
            alert("비밀번호가 올바르지 않습니다.");
        }
    };

    const handleNicknameSubmit = async () => {
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        try {
            await sendMessage('/app/game.join', { roomId: UserRoomId, nickname: nickname });
            setJoinStatus(true);
            setShowPasswordDialog(false);
        } catch (error) {
            console.error("닉네임 설정 실패:", error);
            alert("닉네임 설정에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        let Data = {};
        if(isHost) {
            Data = {
                roomId: UserRoomId,
                sender: hostName,
                content: chatInput
            }
        }
        else{
            Data = {
                roomId: UserRoomId,
                sender: nickname,
                content: chatInput
            }
        }
        try {
            await sendMessage('/app/game.chat', Data);
            setChatInput('');
        } catch (error) {
            console.error("메시지 전송 실패:", error);
        }
    };

    useEffect(() => {
        let isSubscribed = true;
        
        

        const connectAndSetup = async () => {
            if (reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
                setConnectionError(true);
                alert('서버 연결에 문제가 있습니다. 로비로 이동합니다.');
                navigate('/liar');
                return;
            }

            try {
                const client = await connectWebSocket();
                console.log("웹소켓 연결 성공");
                setConnectionError(false);
                setReconnectCount(0);


                await subscribeToRoom(UserRoomId);
                console.log(`게임 ${UserRoomId} 구독 완료`);
                
                if (!isSubscribed) return;

                if(isHost){
                    setShowPasswordDialog(false);
                    setJoinStatus(true);
                    await sendMessage('/app/game.getRoom', { 
                        roomId: UserRoomId, 
                        hostName: hostName
                    });
                    console.log(`방 ${UserRoomId} 정보 요청 완료`);
                }
                else{
                    await sendMessage('/app/game.getRoom', { 
                        roomId: UserRoomId, 
                        hostName: nickname
                    });
                    console.log(`방 ${UserRoomId} 정보 요청 완료`);
                }

                // 방 구독
                await subscribeToRoom(UserRoomId);
                console.log(`방 ${UserRoomId} 구독 완료`);

                // 방 정보 요청
            
             
              

                // 메시지 핸들러 설정
                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("서버로부터 메시지 수신:", response);
                    
                    switch(response.type) {
                        case 'IS_HOST':
                            setRoom(response.data);
                            console.log("호스트로 자동 입장");
                            setLoginStatus(true);
                            setShowPasswordDialog(false);
                            setJoinStatus(true);

                            break;
                        case 'IS_LOGIN':
                            console.log("IS_LOGIN 메시지 수신:", response);
                            if(response.data === 'not'){
                                alert('비밀번호가 일치하지 않습니다.');
                            } else {
                                
                                setLoginStatus(true);
                                setShowPasswordDialog(false);
                            }
                            break;
                        case 'PLAYER_JOINED':
                            console.log("PLAYER_JOINED 메시지 수신:", response);
                            if(response.data === 'not'){
                                alert('오류');
                                return;
                            } else {
                                setRoom(response.data);
                                setJoinStatus(true);
                                setShowPasswordDialog(false);
                            }
                            break;
                        case 'GET_ROOM':
                            console.log("GET_ROOM 메시지 수신:", response);
                            setRoom(response.data);
                            break;
                        case 'PLAYER_LEFT':
                            console.log("PLAYER_LEFT 메시지 수신:", response);
                            if(response.data === 'remove Room'){
                                console.log("방 삭제");
                                Swal.fire({
                                    title: "나가기 성공",
                                    icon: "success",
                                });
                                navigate('/liar');
                            }
                            else {
                                console.log("방 나가짐");
                                const leavingPlayer = response.user;

                                Exit(leavingPlayer, response.data);
                            }
                            break;
                        case 'CHAT':
                            console.log("채팅 메시지 수신:", response);
                            setMessages(prev => [...prev, response.data]);
                            break;
                        case 'CREATE_LIARGAME':
                            const senderNickname = isHost ? hostName : nickname;
                            console.log("라이어게임 만듬")
                            navigate(`/liar/game/${response.data.liarGameId}`, {
                                state: {
                                  nickname: senderNickname
                                },
                            });
                            break;
                        case 'ERROR':
                            console.error("에러 메시지 수신:", response);
                            alert(response.data.message);
                            break;
                        default:
                            console.log("알 수 없는 메시지 타입:", response.type);
                    }
                });

            } catch (error) {
                console.error("웹소켓 연결 실패:", error);
                setConnectionError(true);
                setReconnectCount(prev => prev + 1);
                
                // 재연결 시도
                setTimeout(connectAndSetup, Math.min(1000 * Math.pow(2, reconnectCount), 10000));
            }
        };

        connectAndSetup();

        return () => {
            isSubscribed = false;
            unsubscribeFromRoom();
            disconnectWebSocket();
        };
    }, [UserRoomId, reconnectCount, isHost, hostName, nickname]);

    useEffect(() => {
        console.log("room1 : ",room);
        console.log(`플레이어: ${playerInfo} `);
    }, [room]);

    const Exit = (leavingPlayer, room) =>{

        console.log("!!!!! : " + leavingPlayer+ "    " + room);
        console.log("!!!!! 222: " + playerInfo);

        if (leavingPlayer === playerInfo) {
            navigate('/liar');
        } else {
            setRoom(room);
        }
    }

    const handleExit = async () =>{
        if (!playerInfo && !hostName) {
            console.error("플레이어 정보가 없습니다.");
            return;
        }

        try {
            const result = await Swal.fire({
                title: "나가시겠습니까? ",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "나가기",
                cancelButtonText: "취소"
            });
            
            if (result.isConfirmed) {
                if(playerInfo){
                    sendMessage('/app/game.leaveRoom', {
                        roomId: UserRoomId, 
                        nickname: playerInfo
                    });
                }
                else{
                    sendMessage('/app/game.leaveRoom', {
                        roomId: UserRoomId, 
                        nickname: hostName
                    });
                }
              
            }
        } catch (error) {
            console.error("방 나가기 메시지 전송 실패:", error);
        }
    }

    const handleStart = () =>{
        
        sendMessage('/app/game.createLiarGame', {roomId : UserRoomId, players : room.players})
    }

    return (
        <div>
            {connectionError && (
                <div className="connection-error">
                    서버와의 연결이 불안정합니다. 잠시 후 다시 시도해주세요.
                </div>
            )}
    
            {/* 비밀번호 입력 다이얼로그 */}
            {showPasswordDialog && (
                <Dialog open={showPasswordDialog} onClose={() => {}}>
                    <DialogTitle>비밀번호를 입력하세요</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePasswordSubmit} color="primary">
                            입장하기
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* 닉네임 입력 다이얼로그 */}
            {!showPasswordDialog && !joinStauts && (
                <Dialog open={true} onClose={() => {}}>
                    <DialogTitle>닉네임을 입력하세요</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            type="text"
                            fullWidth
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleNicknameSubmit} color="primary">
                            입장하기
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
    
            {/* 게임룸 메인 화면 */}
            {room && joinStauts && (
                <div className="gameContainer">
                    <div className="header">
                        <h2 className="roomTitle">
                            <span className="roomId">
                                http://localhost:3000/liar/room/{room.roomId}
                            </span>
                            <span className="roomId">
                                {room.password}
                            </span>
                        </h2>
                        <div className="controls">
                            {isHost ?(
                                <div>
                                    <button
                                        className="button startButton"
                                        // disabled={room.players.length < 3}
                                        onClick={handleStart}
                                    >
                                        게임 시작
                                    </button>
                                    {room.players.length < 3 && (
                                        <div className="playerRequirement">
                                            3명 이상의 플레이어가 필요합니다
                                        </div>
                                    )}
                                </div>
                            ) :(
                                <div></div>
                            )}
                            
                            <button
                                className="button exitButton"
                                onClick={handleExit}
                            >
                                나가기
                            </button>
                        </div>
                    </div>
    
                    <div className="playersList">
                        {room.players.map((player, index) => (
                            <div key={index} className="playerCard">
                                <div className="playerAvatar">
                                    {player.nickname.charAt(0).toUpperCase()}
                                </div>
                                <div className="playerInfo">
                                    <div className="playerName">{player.nickname}</div>
                                    <div className="playerStatus">
                                        {player.nickname === room.hostName && (
                                            <span className="badge hostBadge">방장</span>
                                        )}
                                        
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
    
                    <div className="chatSection">
                        <div className="chatMessages" ref={chatContainerRef}>
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
                        <div className="chatInput">
                            <input
                                className="input"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="메시지를 입력하세요..."
                            />
                            <button className="sendButton" onClick={handleSendMessage}>
                                전송
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameRoom;

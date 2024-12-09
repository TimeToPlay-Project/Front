import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { FaCopy } from 'react-icons/fa'; 
import { 
    connectWebSocket, 
    sendMessage, 
    setMessageHandler, 
    disconnectWebSocket, 
    subscribeToRoom, 
    unsubscribeFromRoom ,
} from '../websocket/chatService';
import '../css/SpeedGameRoom.css';
import '../css/chat.css';
import axios from 'axios';

function SpeedGameRoom() {
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
    const [update, setUpdate] = useState(false);
    const [turnTime, setTurnTime] = useState(2);
    const [rounds, setRounds] = useState(1);
    const [category, setCategory] = useState('나라');
    const categories = ['랜덤','나라', '동물', '무기', '탈것', '음식', '장소', '직업', '가수'];
    const MAX_RECONNECT_ATTEMPTS = 5;
    const { hostName, isHost } = location.state || {};
    const pathname = window.location.pathname;
    const UserRoomId = pathname.split('/').pop();
    const MaxScore = useRef(0);
    const quizNum = useRef(0);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatContainerRef = useRef(null);

    const [showSettings, setShowSettings] = useState(false);

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
            const response = await axios.post(
                `http://localhost:8080/api/speed/password/check`,
                {
                    roomId: UserRoomId,
                    password: password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            // 상태 코드가 200일 경우
            if (response.status === 200) {
                setLoginStatus(true);
                setShowPasswordDialog(false);
            }
        } catch (error) {
            // 상태 코드가 400일 경우
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: '비밀번호가 틀렸습니다.',
                    customClass: {
                        popup: 'swal-top',
                    },
                });
                
            } else {
                // 기타 서버 오류 처리
                Swal.fire({
                    icon: 'error',
                    title: '서버 오류',
                    text: '서버에 문제가 발생했습니다. 다시 시도해주세요.',
                    customClass: {
                        popup: 'swal-top',
                    },
                });
            }
        }
    };
    

    const handleNicknameSubmit = async () => {
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:8080/api/speed/nickname`,
                {
                    roomId: UserRoomId,
                    nickname: nickname,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            // 상태 코드가 200일 경우
            if (response.status === 200) {
                setRoom(response.data);
                setJoinStatus(true);
                setShowPasswordDialog(false);
                const client = await connectWebSocket();
                    console.log("웹소켓 연결 성공");
                    setConnectionError(false);
                    setReconnectCount(0);


                    await subscribeToRoom(UserRoomId);
                    console.log(`게임 ${UserRoomId} 구독 완료`);
                
                setUpdate(true);
                
            }
            else if(response.status ===202){
                Swal.fire({
                    icon: 'error',
                    title: '중복된 닉네임입니다',
                    customClass: {
                        popup: 'swal-top',
                    },
                });
            }
        } catch (error) {
            // 상태 코드가 400일 경우
            if (error.response && error.response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: '오류',
                    customClass: {
                        popup: 'swal-top',
                    },
                });
                
            } else {
                // 기타 서버 오류 처리
                Swal.fire({
                    icon: 'error',
                    title: '서버 오류',
                    text: '서버에 문제가 발생했습니다. 다시 시도해주세요.',
                    customClass: {
                        popup: 'swal-top',
                    },
                });
            }
        }
    };


    useEffect(()=>{
        if (update) {
            const updateRoom = async () => {
                try {
                    await sendMessage('/app/speed_game.getRoom', { 
                        roomId: UserRoomId
                    });
                    setUpdate(false);
                } catch (error) {
                    console.error("방 정보 업데이트 실패:", error);
                }
            };
            updateRoom();
        }
        setUpdate(false);
    },[update])


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
            await sendMessage('/app/speed_game.chat', Data);
            setChatInput('');
        } catch (error) {
            console.error("메시지 전송 실패:", error);
        }
    };

    useEffect(() => {
        let isSubscribed = true;
        
        

        const connectAndSetup = async () => {
            // if (reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
            //     setConnectionError(true);
            //     alert('서버 연결에 문제가 있습니다. 로비로 이동합니다.');
            //     navigate('/liar');
            //     return;
            // }

            try {

                if(isHost){
                    const client = await connectWebSocket();
                    console.log("웹소켓 연결 성공");
                    setConnectionError(false);
                    setReconnectCount(0);


                    await subscribeToRoom(UserRoomId);
                    console.log(`게임 ${UserRoomId} 구독 완료`);
                
                }
                
                // if (!isSubscribed) return;

                if(isHost){
                    setShowPasswordDialog(false);
                    setJoinStatus(true);
                    await sendMessage('/app/speed_game.getRoom', { 
                        roomId: UserRoomId, 
                        hostName: hostName
                    });
                    console.log(`방 ${UserRoomId} 정보 요청 완료`);
                }
                // else{
                //     await sendMessage('/app/game.getRoom', { 
                //         roomId: UserRoomId, 
                //         hostName: nickname
                //     });
                //     console.log(`방 ${UserRoomId} 정보 요청 완료`);
                // }

                // 방 구독
            

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
                                navigate('/speedQuiz');
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
                        case 'CREATE_SPEEDQUIZ':
                            const senderNickname = isHost ? hostName : nickname;
                            console.log("라이어게임 만듬 : ", response.data);
                            navigate(`/speedQuiz/game/${response.data.speedGameId}`, {
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
            navigate('/speedQuiz');
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
                    sendMessage('/app/speed_game.leaveRoom', {
                        roomId: UserRoomId, 
                        nickname: playerInfo
                    });
                }
                else{
                    sendMessage('/app/speed_game.leaveRoom', {
                        roomId: UserRoomId, 
                        nickname: hostName
                    });
                }
              
            }
        } catch (error) {
            console.error("방 나가기 메시지 전송 실패:", error);
        }
    }

    const handleStart = () => {
        sendMessage('/app/speed_game.createSpeedQuizGame', {
            roomId: UserRoomId, 
            players: room.players,
            category: category,
            maxScore: MaxScore.current,
            quizNum : quizNum.current
        });
    };

    // 게임 설정을 Material-UI Dialog를 사용한 팝업으로 변경하고, 설정 버튼을 추가합니다.
    const handleSettings = () => {
        setShowSettings(true);
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            // 복사 성공 시 버튼에 애니메이션 효과
            const button = document.getElementById(`copy-${type}`);
            button.classList.add('copy-success');
            
            // 애니메이션 종료 후 클래스 제거
            setTimeout(() => {
                button.classList.remove('copy-success');
            }, 500);

            // 복사 성공 알림
            Swal.fire({
                title: '복사 완료!',
                text: `${type === 'url' ? 'URL이' : '비밀번호가'} 클립보드에 복사되었습니다.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }).catch(err => {
            console.error('복사 실패:', err);
        });
    };

    return (
        <div>
            {connectionError && (
                <div className="connection-error">
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
                    {isHost && (
                        <button 
                            className="settings-btn"
                            onClick={handleSettings}
                        >
                            게임 설정
                        </button>
                    )}
                    <div className="header">
                        <h2 className="roomTitle">
                            <div className="url-container">
                                <span className="roomId">
                                    http://localhost:3000/speedQuiz/room/{room.roomId}
                                </span>
                                <button 
                                    id="copy-url"
                                    className="copy-button"
                                    onClick={() => copyToClipboard(`http://localhost:3000/speedQuiz/room/${room.roomId}`, 'url')}
                                    title="URL 복사"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                            <div className="password-container">
                                <span className="roomId">
                                    {room.password}
                                </span>
                                
                            </div>
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
            {/* 설정 팝업 */}
            <Dialog 
                open={showSettings} 
                onClose={() => setShowSettings(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        backgroundColor: 'rgb(81, 81, 81)',
                        color: 'white',
                        borderRadius: '15px',
                    },
                }}
            >
               
                
            </Dialog>
        </div>
    );
}

export default SpeedGameRoom;

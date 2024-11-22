import React from 'react';
import '../css/GameRoom.css';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from'react';
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from '../websocket/chatService';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

function GameRoom() {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [joinStauts, setJoinStatus] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordDialog, setShowPasswordDialog] = useState(true);
    const location = useLocation();
    const { roomId, hostStatus, hostName } = location.state || {};

    const handlePasswordSubmit = async () => {

        await sendMessage('/app/game.getRoom', { roomId, password });

        try {
            await sendMessage('/app/game.getRoom', { roomId, password });
        
            
        } catch (error) {
            console.error("비밀번호 검증 실패:", error);
            alert("비밀번호가 올바르지 않습니다.");
        }
    };

    useEffect(() => {
        let client = null;
        let isSubscribed = true;

        const connectAndSetup = async () => {
            try {
                client = await connectWebSocket();
                console.log("웹소켓 연결 성공");
                
                if (!isSubscribed) return;

                // 메시지 핸들러 설정
                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("받은 메시지:", response);
                    switch(response.type) {
                        case 'IS_HOST':
                            console.log("IS_HOST 메시지 수신:", response);
                            if(response.data === 'not Host'){
                                alert('host is not available');
                                navigate(-1);
                            } else {
                                console.log("서버에서 받은 룸 데이터:", response.data);
                                setRoom(response.data);
                            }
                            break;
                        case 'PLAYER_JOINED':
                        case 'PLAYER_LEFT':
                            setRoom(response.data);
                            break;
                        case 'PLAYER_JOINED':
                            if(response.data === 'not'){
                                alert('비밀번호가 다릅니다');
                                return;
                            }
                            else{
                                setJoinStatus(true);
                                setShowPasswordDialog(false);
                                setRoom(response.data);
                            }
                            
                            break;
                        case 'ERROR':
                            alert(response.data.message);
                            break;
                        default:
                            console.log("처리되지 않은 메시지 타입:", response.type);
                            break;
                    }
                });

                if(hostStatus === 'active' && hostName) {
                    console.log("getRoom 메시지 전송 시도:", { roomId, hostName });
                    setJoinStatus(true);
                    await sendMessage('/app/game.getRoom', { roomId, hostName });
                    console.log("getRoom 메시지 전송 완료");
                }
            } catch (error) {
                console.error("웹소켓 연결/메시지 전송 에러:", error);
                if (isSubscribed) {
                    alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
                    navigate(-1);
                }
            }
        };

        connectAndSetup();

        return () => {
            isSubscribed = false;
            if (client) {
                disconnectWebSocket().catch(console.error);
            }
        };
    }, [roomId, hostStatus, hostName, navigate]);

    useEffect(() => {
        console.log("room : ",room);
    }, [room]);

    const handleExit = () =>{
        sendMessage('/app/game.leaveRoom', {roomId : roomId, nickname : roomId });
        navigate("/liar");

    }

    return (
        <div>
            
            
            {!joinStauts ? (
                <Dialog 
                open={showPasswordDialog && !joinStauts} 
                onClose={() => navigate(-1)}
                PaperProps={{
                    style: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)'
                    }
                }}
            >
                <DialogTitle style={{ color: 'white', textAlign: 'center' }}>
                    비밀번호 입력
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="방 비밀번호"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                        InputProps={{
                            style: { color: 'white' }
                        }}
                        InputLabelProps={{
                            style: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
                    <Button 
                        onClick={() => navigate(-1)}
                        style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            marginRight: '10px'
                        }}
                        variant="outlined"
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handlePasswordSubmit}
                        style={{
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            color: 'white',
                            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                        }}
                        variant="contained"
                    >
                        입장하기
                    </Button>
                </DialogActions>
            </Dialog>
            ) : room ? (
                <div className="game-room">
                    <div className="room-header">
                        <div className="room-title">
                       
                            <span className="room-id">http://localhost:3000/liar/room/{room.roomId}</span>
                        </div>
                        <div className="room-info">
                            <span className="player-count">{room.players.length} / {room.maxPlayers} 명</span>
                            <span className="host-name">방장: {room.hostName}</span>
                        </div>
                    </div>

                    <div className="players-container">
                        {Array.from({ length: room.maxPlayers }).map((_, index) => {
                            const player = room.players[index];
                            return (
                                <div key={index} className={`player-box ${player ? 'occupied' : 'empty'}'current-player'`}>
                                    {player ? (
                                        <>
                                            <div className="player-avatar">
                                                {player.nickname.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="player-info">
                                                <span className="player-nickname">{player.nickname}</span>
                                                <span className="player-status">
                                                    {player.isReady ? '준비완료' : '대기중'}
                                                </span>
                                            </div>
                                            {player.nickname === room.hostName && (
                                                <div className="host-badge">👑</div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="empty-slot">
                                            빈 자리
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="room-controls">
                        <button className="ready-button">
                            준비하기
                        </button>
                        <button className="leave-button" onClick={handleExit}>
                            나가기
                        </button>
                    </div>
                </div>
            ) : (
                <div>방 정보를 불러오는 중...</div>
            )}
        </div>
    );
}

export default GameRoom;

import React, { useState, useEffect } from "react";
import "./css/LiarMain.css"
import Navigate3 from "../../Navigate3";
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from './websocket/chatService';
import GameRoom from './components/GameRoom';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function LiarMain() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [nickname, setNickname] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [joinNickname, setJoinNickname] = useState('');
    const [client, setClient] = useState(null);
    const [searchHostName, setSearchHostName] = useState('');
    const [hostStatus, setHostStatus] = useState(false);
    const [hostName, setHostName] = useState('');

    useEffect(() => {
        setHostName('');
        return () => {
            disconnectWebSocket();
        };
    }, []);

    const initializeWebSocket = async () => {
        try {
            const newClient = await connectWebSocket();
            setClient(newClient);
            
            setMessageHandler((response) => {
                switch(response.type) {
                    case 'ROOM_CREATED':
                        setHostStatus(true);
                        setCurrentRoom(response.data);
                        break;
                    case 'PLAYER_JOINED':
                    case 'PLAYER_LEFT':
                        setCurrentRoom(response.data);
                        break;
                    case 'ERROR':
                        alert(response.data.message);
                        break;
                    case 'ROOM_LIST':
                        setRooms(response.data);
                        break;
                    default:
                        break;
                }
            });
        
        } catch (error) {
            console.error(error);
        }
    };

    const onCreateRoom = () => {
        initializeWebSocket();
        setShowModal(true);
    };

    const handleCreateRoomCancle = () => {
        setShowModal(false);
        if (client) {
            disconnectWebSocket();
            setClient(null);
        }
    }

    const handleJoinCancle = () => {
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
        if (client) {
            disconnectWebSocket();
            setClient(null);
        }
    }

   
    useEffect(() => {
        if (currentRoom) {
            navigate("/liar/room/" + currentRoom.roomId, {
                state: { roomId: currentRoom.roomId, hostStatus: "active" , hostName:hostName},
            });
        }
    }, [currentRoom, navigate]);

    const handleCreateRoom = () => {
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        if (!roomName.trim()) {
            alert('방 이름을 입력해주세요.');
            return;
        }
        if (!roomPassword.trim()) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        const roomData = {
            type: 'CREATE_ROOM',
            data: {
                nickname: nickname,
                maxPlayers: maxPlayers,
                roomName: roomName,
                password: roomPassword
            }
        };
        
        sendMessage('/app/game.createRoom', roomData);
        setHostName(nickname)
        setShowModal(false);
    };

    const handleJoinClick = () => {
        initializeWebSocket();
        sendMessage('/app/game.getRooms', { type: 'GET_ROOMS' });
        setShowJoinModal(true);
    };

    const handleJoinRoom = () => {
        if (!selectedRoom) {
            alert('방을 선택해주세요.');
            return;
        }
        if (!joinNickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const joinData = {
            type: 'JOIN_ROOM',
            data: {
                roomId: selectedRoom.roomId,
                nickname: joinNickname
            }
        };

        sendMessage('/app/game.joinRoom', joinData);
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
    };


    return (
        <div className="liar-main">
            <Navigate3 />
            <div className="liar-container">
                <div className="button-container">
                    <button className="create-room-button" onClick={onCreateRoom}>방 만들기</button>
                    <button className="join-room-button" onClick={handleJoinClick}>방 참가하기</button>
                </div>

                {/* 방 만들기 모달 */}
                <Dialog 
                    open={showModal} 
                    onClose={handleCreateRoomCancle}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        방 만들기
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="닉네임"
                            type="text"
                            fullWidth
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="방 이름"
                            type="text"
                            fullWidth
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="비밀번호"
                            type="password"
                            fullWidth
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                        />
                        <FormControl fullWidth sx={{ marginTop: 2 }}>
                            <InputLabel>최대 인원</InputLabel>
                            <Select
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                            >
                                {[4, 5, 6, 7, 8].map((num) => (
                                    <MenuItem key={num} value={num}>{num}명</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleCreateRoomCancle}
                            variant="outlined"
                        >
                            취소
                        </Button>
                        <Button 
                            onClick={handleCreateRoom}
                            variant="contained"
                        >
                            방 만들기
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 방 참가하기 모달 */}
                <Dialog 
                    open={showJoinModal} 
                    onClose={handleJoinCancle}
                    PaperProps={{
                        style: {
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '15px',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            minWidth: '400px'
                        }
                    }}
                >
                    <DialogTitle style={{ color: 'white', textAlign: 'center' }}>
                        방 참가하기
                    </DialogTitle>
                    <DialogContent>
                        <div className="room-list">
                            <div className="search-container">
                                <div className="search-box">
                                    <TextField
                                        type="text"
                                        placeholder="방장 닉네임을 입력하세요"
                                        value={searchHostName}
                                        onChange={(e) => setSearchHostName(e.target.value)}
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
                                            marginBottom: 2
                                        }}
                                    />
                                    <Button 
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            marginRight: '10px'
                                        }}
                                        variant="outlined"
                                        onClick={() => {
                                            if (searchHostName.trim()) {
                                                sendMessage('/app/game.getRooms', { 
                                                    type: 'GET_ROOMS',
                                                    data: { hostName: searchHostName.trim() }
                                                });
                                            }
                                        }}
                                    >
                                        검색
                                    </Button>
                                </div>
                                {rooms.length > 0 ? (
                                    <div className="search-results">
                                        {rooms.map(room => (
                                            <div
                                                key={room.roomId}
                                                className={`room-item ${selectedRoom?.roomId === room.roomId ? 'selected' : ''}`}
                                                onClick={() => setSelectedRoom(room)}
                                            >
                                                <div className="room-item-header">
                                                    <span className="room-item-name">{room.roomName}</span>
                                                    <span className="room-item-id">#{room.roomId.substring(0, 8)}</span>
                                                </div>
                                                <div className="room-item-info">
                                                    <span>{room.players.length} / {room.maxPlayers} 명</span>
                                                    <span>방장: {room.hostName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-rooms">
                                        검색된 방이 없습니다
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedRoom && (
                            <TextField
                                type="text"
                                placeholder="닉네임을 입력하세요"
                                value={joinNickname}
                                onChange={(e) => setJoinNickname(e.target.value)}
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
                                    marginBottom: 2
                                }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
                        <Button 
                            onClick={handleJoinCancle}
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
                            onClick={handleJoinRoom}
                            disabled={!selectedRoom || !joinNickname.trim()}
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
            </div>
        </div>
    );
}

export default LiarMain;

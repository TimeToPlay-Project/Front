/**
 * WebSocket을 사용한 채팅 서비스 클래스
 * STOMP 프로토콜을 통해 서버와의 실시간 통신을 관리
 */

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
let messageCallback = null;

export const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        if (stompClient && stompClient.connected) {
            resolve(stompClient);
            return;
        }

        const socket = new SockJS('http://localhost:8080/liar-game');
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('웹소켓 연결 성공');
                // 서버로부터 메시지를 받는 구독
                stompClient.subscribe('/topic/game', (message) => {
                    try {
                        const response = JSON.parse(message.body);
                        console.log('서버로부터 메시지 수신:', response);
                        
                        if (messageCallback) {
                            messageCallback(response);
                        }
                    } catch (error) {
                        console.error('메시지 파싱 에러:', error);
                    }
                });
                resolve(stompClient);
            },
            onDisconnect: () => {
                console.log('웹소켓 연결 종료');
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
                reject(frame);
            }
        });

        try {
            stompClient.activate();
        } catch (error) {
            console.error('웹소켓 활성화 에러:', error);
            reject(error);
        }
    });
};

export const setMessageHandler = (callback) => {
    messageCallback = callback;
};

export const sendMessage = (destination, message) => {
    return new Promise((resolve, reject) => {
        if (stompClient && stompClient.connected) {
            try {
                stompClient.publish({
                    destination: destination,
                    body: JSON.stringify(message),
                    headers: {},
                });
                resolve();
            } catch (error) {
                console.error('메시지 전송 에러:', error);
                reject(error);
            }
        } else {
            const error = new Error('웹소켓이 연결되어 있지 않습니다.');
            console.error(error);
            reject(error);
        }
    });
};

export const disconnectWebSocket = () => {
    return new Promise((resolve) => {
        if (stompClient) {
            stompClient.deactivate()
                .then(() => {
                    stompClient = null;
                    messageCallback = null;
                    console.log('웹소켓 연결이 정상적으로 종료되었습니다.');
                    resolve();
                })
                .catch((error) => {
                    console.error('웹소켓 종료 중 에러:', error);
                    stompClient = null;
                    messageCallback = null;
                    resolve();
                });
        } else {
            resolve();
        }
    });
};

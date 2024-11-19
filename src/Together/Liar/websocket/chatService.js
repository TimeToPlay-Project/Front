/**
 * WebSocket을 사용한 채팅 서비스 클래스
 * STOMP 프로토콜을 통해 서버와의 실시간 통신을 관리
 */

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
let messageCallback = null;

export const connectWebSocket = () => {
    if (stompClient) {
        return stompClient;
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
            if (stompClient && stompClient.connected) {
                stompClient.subscribe('/topic/game', (message) => {
                    const response = JSON.parse(message.body);
                    console.log('서버로부터 메시지 수신:', response);
                    
                    if (messageCallback) {
                        messageCallback(response);
                    }
                });
            }
        },
        onStompError: (frame) => {
            console.error('STOMP 에러:', frame);
        }
    });

    stompClient.activate();
    return stompClient;
};

export const setMessageHandler = (callback) => {
    messageCallback = callback;
};

export const sendMessage = (destination, message) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: destination,
            body: JSON.stringify(message)
        });
    } else {
        console.error('웹소켓이 연결되어 있지 않습니다.');
    }
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        messageCallback = null;
    }
};

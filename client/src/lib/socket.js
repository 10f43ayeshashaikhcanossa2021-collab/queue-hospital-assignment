import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket;

function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      transports: ['websocket']
    });
  }

  return socket;
}

export default getSocket;
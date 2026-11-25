export const webSocketConfig = {
  path: '/ws/socket.io',
  // NOTE: With ENABLE_WEBSOCKET_SUPPORT=false Open WebUI accepts only polling, so the client falls back to it.
  transports: ['websocket', 'polling'],
  tryAllTransports: true,
  // NOTE After 20 seconds after switching to the background, the socket will disconnect automatically.
  // See ping_timeout in the server param - https://python-socketio.readthedocs.io/en/stable/api.html
  pingTimeout: 20000,
  // NOTE: Open WebUI drops a socket from its session pool after 120 s or more without `heartbeat`,
  // and temporary chats need that session to send and stop. The web app sends it every 30 s.
  heartbeatInterval: 30 * 1000,
};

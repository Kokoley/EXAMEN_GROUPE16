export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join:role", (role) => {
      socket.join(`room:${String(role || "").toLowerCase()}`);
    });

    socket.on("disconnect", () => {
      // Reserve for logs/metrics
    });
  });
};

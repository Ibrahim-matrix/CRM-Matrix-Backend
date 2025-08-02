module.exports = (io) => {
  try {
    const users = []; // Store user socket connections

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);
      // Event when admin assigns a lead to a user
      socket.on("assignLead", ({ leadId, userId }) => {
        console.log(leadId, userId);
        // Code to assign the lead to the user
        // ...

        // Notify the user about the assigned lead
        const user = users.find((user) => user.userId === userId);
        console.log(user);
        if (user) {
          console.log("inside if", user.socketId);
          try {
            socket
              .to(user.socketId)
              .emit("leadAssigned", "lead assigned to you!!");
          } catch (error) {
            console.error("Error sending leadAssigned event:", error);
          }
        } else {
          console.log("User not found with userId:", userId);
        }
      });

      // Event when a user logs in
      socket.on("userLoggedIn", (userData) => {
        userData["socketId"] = socket.id;
        users.push(userData);
        console.log(users);
      });

      // Event when a user disconnects
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove the user socket from the users Map
        for (const [key, value] of users.entries()) {
          if (value === socket) {
            users.delete(key);
            break;
          }
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
};

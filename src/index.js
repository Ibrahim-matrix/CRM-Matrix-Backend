const mongoose = require("mongoose");
const https = require("https");
const http = require("http");


const fs = require("fs");
var CronJob = require("cron").CronJob;
const app = require("./app");
const { generateExcelSheet } = require("../src/utils/Excel");
const path = require("path");

const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
//const {client} = require("../src/utils/redis"); // Import the Redis client

const redis = require("redis");

const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});
const { io } = require("./utils/socket");

let server;

require("dotenv").config({ path: path.join(__dirname, "../.env") });

let PORT = process.env.PORT;
let HTTPS = process.env.HTTPS;

// if (cluster.isMaster) {
//   console.log(`Master process ${process.pid} is running.`);

//   // Fork worker processes
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // Listen for worker process exit and restart if necessary
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker process ${worker.process.pid} died.`);
//     console.log("Restarting worker process...");
//     cluster.fork();
//   });
// } else {
//   // Database connection
//   mongoose.set("strictQuery", true);
//   mongoose
//     .connect(process.env.MONGO_URL, { useNewUrlParser: true })
//     .then(() => {
//       console.log("MongoDB Connected");

//       // // Handle Redis connection event
//       // client.connect().then(() => {
//       //   console.log("redis is connected");
//       // }).catch((error)=>{
//       //   console.log(error)
//       // })
//       // // Set the Redis client on the app object
//       // app.set("redisClient", client);

//       // Server creation
//       if (HTTPS == "false") {
//         const httpServer = http.createServer(app);
//         server = httpServer.listen(PORT, () => {
//           console.log(`HTTP Server running on port ${PORT}`);

//           //"30 5 * * *"
//           const job = new CronJob("* * * * *", async function () {
//             console.log("cron updated!!");
//             //await generateExcelSheet();
//             try {
//               if (fs.existsSync("./leadDate.xlsx")) {
//                 await appendLeads();
//                 //fs.unlinkSync("./leadDate.xlsx");
//               }
//             } catch (err) {
//               console.error(err);
//             }
//           });
//           job.start();
//           // client.connect().then(()=> {
//           //   console.log('redis is connected')
//           // })
//         });
//       } else {
//         const httpsServer = https.createServer(
//           {
//             key: fs.readFileSync(
//               "/etc/letsencrypt/live/crm-live.thetoppersacademy.org/privkey.pem"
//             ),
//             cert: fs.readFileSync(
//               "/etc/letsencrypt/live/crm-live.thetoppersacademy.org/fullchain.pem"
//             ),
//           },
//           app
//         );

//         server = httpsServer.listen(PORT, () => {
//           console.log(`HTTPS Server running on port  ${PORT}`);
//         });
//       }
//     })
//     .catch((error) => {
//       console.error("MongoDB Connection Error:", error);
//     });
// }

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }).then(() => {
  console.log("mongoDB Connected");
    console.log("Connected to DB:", mongoose.connection.name);
  if (HTTPS == "false") {
    const httpServer = http.createServer(app);
    server = httpServer.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT}`);
      let io = require('socket.io')(server);
      require('./utils/socket')(io);
    });
  } else {
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/crm-live.thetoppersacademy.org/privkey.pem"
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/crm-live.thetoppersacademy.org/fullchain.pem"
        ),
      },
      app
    );


   console.log("Connected to DB:", mongoose.connection.name);



    server = httpsServer.listen(PORT, () => {
      console.log(`HTTPS Server running on port  ${PORT}`);
    });
  }

 

  const job = new CronJob("28 12 * * *", async function () {
    console.log("cron running");
    let filePath = path.join(__dirname, "../uploads/leadDate.xlsx");
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await generateExcelSheet();
    } catch (err) {
      console.error(err);
    }
  });
  job.start();
});


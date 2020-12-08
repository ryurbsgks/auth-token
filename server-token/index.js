require("dotenv").config();
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const privateKey = fs.readFileSync(__dirname + "/FILL_ME_IN", "utf8");
const certificate = fs.readFileSync(__dirname + "/FILL_ME_IN", "utf8");
const credentials = { key: privateKey, cert: certificate };

const express = require("express");
const app = express();

const controllers = require("./controllers");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["https://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(cookieParser());
app.post("/login", controllers.login);
app.get("/accesstokenrequest", controllers.accessTokenRequest);
app.get("/refreshtokenrequest", controllers.refreshTokenRequest);

const HTTPS_PORT = process.env.HTTPS_PORT || 4000;
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(HTTPS_PORT, () => console.log("server runnning"));

module.exports = httpsServer;

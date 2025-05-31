const express = require("express");
require("dotenv").config();

const connectToDB = require("./src/config/mongoose.config");
const corsConfig = require("./src/config/cors.config");
const mainRouter = require("./src/app.routes");
const NotFoundHandler = require("./src/common/exception/not-found.handler");
const AllExceptionHandler = require("./src/common/exception/all-exception.handler");

function main() {
    const app = express();
    const port = process.env.PORT;

    connectToDB();

    app.use(corsConfig());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/public", express.static("public"));
    app.use(mainRouter);

    NotFoundHandler(app);
    AllExceptionHandler(app);

    app.listen(port, () => console.log(`http://localhost:${port}`));
}

main();

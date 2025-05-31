const cors = require("cors");

const corsConfig = () => {
    return cors({
        origin: "https://fitland.liara.run",
        optionsSuccessStatus: 200,
    });
};

module.exports = corsConfig;

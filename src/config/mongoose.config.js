const { default: mongoose } = require("mongoose");

const connectToDB = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            authSource: "admin",
        })
        .then(() => console.log("Connected to DB"))
        .catch((error) => console.log(error?.message ?? "Failed DB connection"));
};

module.exports = connectToDB;

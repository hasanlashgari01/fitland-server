function NotFoundHandler(app) {
    app.use((req, res, next) => {
        res.status(404).json({
            message: "مسیری یافت نشد",
        });
    });
}

module.exports = NotFoundHandler;

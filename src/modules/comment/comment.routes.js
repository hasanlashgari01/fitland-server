const router = require("express").Router();

const Authorization = require("../../common/guard/authorization.guard");
const Public = require("../../common/guard/public.guard");
const commentController = require("./comment.controller");

router.patch("/like/:commentId", Authorization, commentController.toggleLike);
router.patch("/reply/:commentId", Authorization, commentController.reply);
router.post("/report/:commentId", Authorization, commentController.report);
router
    .route("/slug/:slug")
    .get(Public, commentController.findByProductSlug)
    .post(Authorization, commentController.createComment);

module.exports = { CommentRouter: router };

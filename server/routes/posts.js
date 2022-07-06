import express from "express";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  getPostsBySearch,
  getPost,
  commentPost,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/find/:id", getPost);
router.get("/search", getPostsBySearch);
router.post("/", auth, createPost);
router.post("/:id/commentPost", auth, commentPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/likePost/:id", auth, likePost);

export default router;

import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { PostMessage } from "../models/postMessage.js";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/errorsControls.js";

export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({ ...post, creator: req.userId });
  await newPost.save();
  res.status(StatusCodes.OK).json(newPost);
};

export const getPosts = async (req, res) => {
  const { page } = req.query;
  const LIMIT = 6;
  const startIndex = (Number(page) - 1) * LIMIT;
  const total = await PostMessage.countDocuments({});

  const posts = await PostMessage.find()
    .sort({ _id: -1 })
    .limit(LIMIT)
    .skip(startIndex);
  res.status(StatusCodes.OK).json({
    data: posts,
    currentPage: Number(page),
    numberOfPage: Math.ceil(total / LIMIT),
  });
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  const post = await PostMessage.findById(id);
  res.status(StatusCodes.OK).json(post);
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  const title = new RegExp(searchQuery, "i");
  const posts = await PostMessage.find({
    $or: [{ title }, { tags: { $in: tags.split(",") } }],
  });
  res.status(StatusCodes.OK).json({ data: posts });
};

export const updatePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("No post with that id");
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(
    postId,
    { $set: req.body },
    { new: true }
  );
  res.status(StatusCodes.OK).json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("No post with that id");
  }
  await PostMessage.findByIdAndRemove(postId);
  res.status(StatusCodes.OK).json("Post has been deleted");
};

export const likePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!req.userId) throw new UnauthenticatedError("You are not permitted");
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("No post with that id");
  }
  const post = await PostMessage.findById(postId);
  const index = post.likes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(postId, post, {
    new: true,
  });
  res.status(StatusCodes.OK).json(updatedPost);
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  const post = await PostMessage.findById(id);
  post.comments.push(value);
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.status(StatusCodes.OK).json(updatedPost);
};

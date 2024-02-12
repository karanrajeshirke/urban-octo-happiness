import express from "express";
import mongoose from "mongoose";
const app = express();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  caption: {
    type: String,
    requried: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  text: {
    type: String,
    required: true,
  },
});
const userModel = mongoose.model("User", userSchema);
const postModel = mongoose.model("Post", postSchema);
const commentModel = mongoose.model("Comment", commentSchema);

//! adding an user

app.get("/add-user", async (req, res) => {
  try {
    const user = new userModel({
      name: "shivendra",
      email: "shivendra@gmail.com",
      password: "shiv988",
    });

    const savedUser = await user.save();

    res.status(200).send(savedUser);
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//! adding an post

app.get("/add-post", async (req, res) => {
  try {
    const userId = "65c92f1fb8d4ee2a3825e9c4";

    const post = new postModel({
      user: userId,
      caption: "my home town dervan",
    });

    const postCreated = await post.save();

    res.status(200).send(postCreated);
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//! getting the posts of user
app.get("/post-user", async (req, res) => {
  try {
    const userId = "65c92f1fb8d4ee2a3825e9c4";

    const posts = await postModel.find({ user: userId });
    res.status(200).send({
      posts,
    });
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//! adding an comment

app.get("/add-comment", async (req, res) => {
  try {
    const userId = "65c9b3c17eba20a7f69a28ca";
    const postId = "65c92e2f425dbfa1579a844b";

    const comment = new commentModel({
      user: userId,
      post: postId,
      text: "have a wonderful trip !",
    });

    const savedComment = await comment.save();

    const updatedPost = await postModel.findByIdAndUpdate(postId, {
      $push: { comments: comment },
    });

    res.status(200).send({
      savedComment,
      updatedPost,
    });
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//! deleteing an comment

app.get("/delete-comment", async (req, res) => {
  try {
    let commentId = "65c9b8b28ef9381a32e5c9f0";
    let comment = await commentModel.findById(commentId);
    let postId = comment.post;

    const deletedComment = await commentModel.findByIdAndDelete(commentId);

    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { $pull: { comments: commentId } },
      { new: true }
    );

    res.status(200).send({
      deletedComment,
      updatedPost,
    });
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//!getting all comments on a particular post

app.get("/get-commments-post", async (req, res) => {
  try {
    let postId = "65c92e3f7876f80ecb497a3a";

    let allCommentsOfPost = await commentModel.find({ post: postId });

    res.status(200).send(allCommentsOfPost);
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

//!delting a post

app.get("/delete-post", async (req, res) => {
  try {
    let postId = "65c92e2f425dbfa1579a844b";

    let post = await postModel.findById(postId);
    let commentOnPost = post.comments;

    let deletedPost = await postModel.findByIdAndDelete(postId);
    let deletedComments = await commentModel.deleteMany({
      _id: { $in: commentOnPost },
    });

    res.status(200).send({ deletedComments, deletedPost });
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});
const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Instagram-db");
    console.log("connected to db");
  } catch (error) {
    handleError(error);
  }
};
connectDb();

app.listen(8080, () => {
  console.log("listening on port 8080");
});

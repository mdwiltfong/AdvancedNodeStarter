const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const clearCache = require("../middlewares/clearHash");

const Blog = mongoose.model("Blog");
const redis = require("redis");
const redisURL = "redis://127.0.0.1:6379";
const client = redis.createClient(redisURL);
module.exports = (app) => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  app.get("/api/blogs", requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id,
    });
    res.send(blogs);
  });

  app.post("/api/blogs", requireLogin, clearCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      clearHash(req.user.id);
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};

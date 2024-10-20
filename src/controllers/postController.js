const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  const { content } = req.body;
  const author = req.user.id;

  try {
    const post = new Post({
      content,
      author
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const liked = post.likes.includes(req.user.id);

    if (liked) {
      post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      
      if (post.author.toString() !== req.user.id.toString()) {
        createNotification(post.author, req.user.id, 'like', post._id);
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.retweetPost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyRetweeted = originalPost.retweets.includes(req.user.id);

    if (alreadyRetweeted) {
      originalPost.retweets = originalPost.retweets.filter(userId => userId.toString() !== req.user.id);
      await Post.findOneAndDelete({ author: req.user.id, originalPost: req.params.id, isRetweet: true });
    } else {
      const retweet = new Post({
        author: req.user.id,
        originalPost: req.params.id,
        isRetweet: true
      });

      await retweet.save();
      originalPost.retweets.push(req.user.id);

      if (originalPost.author.toString() !== req.user.id.toString()) {
        createNotification(originalPost.author, req.user.id, 'retweet', originalPost._id);
      }
    }

    await originalPost.save();
    res.status(200).json(originalPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyPost = async (req, res) => {
  const { content } = req.body;
  const author = req.user.id;

  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = new Post({
      content,
      author,
      originalPost: req.params.id
    });

    await reply.save();
    originalPost.replies.push(reply._id);
    await originalPost.save();

    if (originalPost.author.toString() !== req.user.id.toString()) {
      createNotification(originalPost.author, req.user.id, 'reply', originalPost._id);
    }

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

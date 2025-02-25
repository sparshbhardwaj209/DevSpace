// controllers/searchController.js
const Post = require("../models/Post");
const User = require("../models/User");

exports.combinedSearch = async (req, res) => {
  const searchTerm = req.body.searchTerm;
  console.log("Search term received:", searchTerm); // Log the search term

  // Validate the search term
  if (typeof searchTerm !== "string") {
    return res.status(400).json({ posts: [], users: [] });
  }

  try {
    // Fetch posts & users in parallel
    const [posts, users] = await Promise.all([
      Post.search(searchTerm),
      User.search(searchTerm),
    ]);
    // Add safety checks for results
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeUsers = Array.isArray(users) ? users : [];

    console.log("Users found:", users);
    console.log("Posts found:", posts);

    // Format the response data
    const formattedResponse = {
      posts: safePosts.map((post) => ({
        _id: post._id,
        title: post.title,
        createdDate: post.createdDate || new Date(),
        author: {
          username: post.author.username,
          avatar: post.author.avatar,
        },
      })),
      users: safeUsers.map((user) => ({
        username: user.username,
        avatar: user.avatar,
      })),
    };

    // Send response with status code
    return res.status(200).json(formattedResponse);

    // res.json({ posts, users });
  } catch (error) {
    console.error(error);
    res.json({ posts: [], users: [] });
  }
};

import dbConnect from './utils/dbConnect';
import Post from '../models/Post';

export default async function handler(req, res) {
  const { id } = req.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const post = await Post.findOne({ id });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  } else if (req.method === 'PUT') {
    try {
      const postData = req.body;
      const post = await Post.findOneAndUpdate(
        { id },
        postData,
        { new: true, runValidators: true }
      );
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update post' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const post = await Post.findOneAndDelete({ id });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
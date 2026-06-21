const jwt = require('jsonwebtoken');
const { Member } = require('../models');

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

exports.authorizeGroup = async (req, res, next) => {
  const groupId = req.params.id || req.params.groupId || req.body.groupId;
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    const membership = await Member.findOne({
      where: {
        group_id: groupId,
        email: req.user.email
      }
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this group' });
    }
    req.memberId = membership.id; // Attach member context
    next();
  } catch (err) {
    next(err);
  }
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error'
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Duplicate entry'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Referenced record not found'
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      error: 'Database error'
    });
  }

  res.status(500).json({
    error: 'Internal server error'
  });
};

module.exports = errorHandler;

const { Router } = require('express');
const Note = require('../models/Note');

const router = Router();

// Read groups
router.get('/', async (req, res, next) => {
  try {
    const distinctGroups = await Note.distinct('group');
    res.json(distinctGroups);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

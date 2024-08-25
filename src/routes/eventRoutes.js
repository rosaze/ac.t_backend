const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');
const authorize = require('../middleware/authorize');

router.post('/events', authorize, EventController.createEvent);
router.get('/events', authorize, EventController.getEvents);
router.get('/events/:id', authorize, EventController.getEventById);
router.post(
  '/events/:id/participate',
  authorize,
  EventController.participateInEvent
);
router.post('/events/:id/like', authorize, EventController.likeForParticipant);
router.get('/events/:id/ranking', authorize, EventController.getEventRanking);

module.exports = router;

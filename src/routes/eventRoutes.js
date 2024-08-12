const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');

router.post('/events', EventController.createEvent);
router.get('/events', EventController.getEvents);
router.get('/events/:id', EventController.getEventById);
router.post('/events/:id/participate', EventController.participateInEvent);
router.post('/events/:id/like', EventController.voteForParticipant);
router.get('/events/:id/ranking', EventController.getEventRanking);

module.exports = router;

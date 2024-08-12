const EventService = require('../services/EventService');

class EventController {
  async createEvent(req, res) {
    try {
      const event = await EventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getEvents(req, res) {
    try {
      const events = await EventService.getEvents();
      res.status(200).json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getEventById(req, res) {
    try {
      const event = await EventService.getEventById(req.params.id);
      res.status(200).json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async participateInEvent(req, res) {
    try {
      const { eventId, userId, imageUrl } = req.body;
      const event = await EventService.participateInEvent(
        eventId,
        userId,
        imageUrl
      );
      res.status(200).json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async likeForParticipant(req, res) {
    try {
      const { eventId, participantId } = req.body; // 이벤트 ID와 참가자 ID를 받음
      const event = await EventService.voteForParticipant(
        eventId,
        participantId
      );
      res.status(200).json(event); // 업데이트된 이벤트 반환
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getEventRanking(req, res) {
    try {
      const ranking = await EventService.getEventRanking(req.params.id);
      res.status(200).json(ranking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new EventController();

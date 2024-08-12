const Event = require('../models/Event');

//이벤트 생성 참여 투표, 순위 결정
class EventService {
  async createEvent(data) {
    const event = new Event(data);
    return await event.save();
  }

  async getEvents() {
    return await Event.find().exec();
  }

  async getEventById(id) {
    return await Event.findById(id).populate('participants.user').exec();
  }

  async participateInEvent(eventId, userId, imageUrl) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    event.participants.push({ user: userId, imageUrl });
    return await event.save();
  }
  // 다른 사용자들이 올린 게시물에 투표
  async likeParticipant(eventId, participantId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const participant = event.participants.id(participantId);
    if (!participant) throw new Error('Participant not found');

    participant.likes += 1; // 좋아요 수 증가
    return await event.save();
  }
  //좋아요 수 정렬
  async getEventRanking(eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    return event.participants.sort((a, b) => b.votes - a.votes);
  }
}

module.exports = new EventService();

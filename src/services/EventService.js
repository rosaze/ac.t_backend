const Event = require('../models/Event');
const BadgeService = require('./badgeService');

class EventService {
  constructor() {
    this.badgeService = new BadgeService();
  }
  // 이벤트 생성
  async createEvent(data) {
    const event = new Event(data);
    return await event.save();
  }

  // 모든 이벤트 조회
  async getEvents() {
    return await Event.find().exec();
  }

  // 특정 이벤트 조회
  async getEventById(id) {
    return await Event.findById(id).populate('participants.user').exec();
  }

  // 이벤트 참여
  async participateInEvent(eventId, userId, imageUrl) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    event.participants.push({ user: userId, imageUrl });
    return await event.save();
  }

  // 좋아요 수 증가 및 배지 지급
  async likeParticipant(eventId, participantId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const participant = event.participants.id(participantId);
    if (!participant) throw new Error('Participant not found');

    participant.likes += 1; // 좋아요 수 증가
    await event.save();

    // 좋아요가 가장 많은 참가자에게 배지 지급
    const topParticipant = this.getTopParticipant(event);
    if (topParticipant.user.toString() === participant.user.toString()) {
      await this.badgeService.awardBadgeForEventWinner(
        participant.user,
        event.title
      );
    }
    return participant;
  }

  // 좋아요 수가 가장 많은 참가자 찾기
  getTopParticipant(event) {
    return event.participants.reduce((top, current) => {
      return current.likes > top.likes ? current : top;
    }, event.participants[0]);
  }

  // 참가자 순위 조회
  async getEventRanking(eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    return event.participants.sort((a, b) => b.likes - a.likes);
  }
}

module.exports = new EventService();

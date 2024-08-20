const Event = require('../models/Event');
const BadgeService = require('./badgeService');

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
    await event.save();

    //현재 좋아요가 가장 많은 참가자에게 배지 지급
    const topParticipant = this.getTopParticipant(event);
    if (topParticipant.user.toString() === participant.user.toString()) {
      await BadgeService.awardBadge(participant.user, `${event.title} Winner`);
    }
    return participant;
  }

  //좋아요 수가 가자 맣은 참가자 찾기
  getTopParticipant(event) {
    return event.participants.reduce((top, current) => {
      return current, likes > top.likes ? current : top;
    }, event.participants[0]);
  }

  //좋아요 수 정렬(모든 참가자들의 순위를 보고 싶을 때 사용)
  async getEventRanking(eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    return event.participants.sort((a, b) => b.votes - a.votes);
  }
}

module.exports = new EventService();

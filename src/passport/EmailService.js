const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const smtpTransport = nodemailer.createTransport({
  service: 'gmail', // 메일 서비스
  auth: {
    user: process.env.SMTP_USER, // 발송 이메일 주소
    pass: process.env.SMTP_PASSWORD, // 비밀번호
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAuthNumber = async (email) => {
  // 6자리 난수 생성
  const authNumber = Math.floor(Math.random() * 888888) + 111111;

  const mailOptions = {
    from: process.env.SMTP_USER, // 발송 주체
    to: email, // 인증을 요청한 이메일 주소
    subject: 'Ac.T 이메일 확인 인증번호 안내', // 이메일 제목
    text: `아래 인증번호를 확인하여 이메일 주소 인증을 완료해 주세요.\n\n인증번호: ${authNumber}`, // 이메일 내용
  };

  try {
    // 이메일 전송
    const info = await smtpTransport.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return authNumber; // 인증번호 반환
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send authentication email');
  } finally {
    smtpTransport.close(); // SMTP 연결 종료
  }
};

module.exports = { sendAuthNumber };

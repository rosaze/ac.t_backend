const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const smtpTransport = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE, // 메일 서비스
  auth: {
    user: process.env.SMTP_USER, // 발송 이메일 주소
    pass: process.env.SMTP_PASSWORD, // 비밀번호
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAuthNumber = (email, res) => {
  // 6자리 난수 생성
  const authNumber = Math.floor(Math.random() * 888888) + 111111;

  const mailOptions = {
    from: 'Ac.T.sookmyung', // 발송 주체
    to: email, // 인증을 요청한 이메일 주소
    subject: 'Ac.T 이메일 확인 인증번호 안내', // 이메일 제목
    text: `아래 인증번호를 확인하여 이메일 주소 인증을 완료해 주세요.\n
    연락처 이메일 👉 ${email}\n
    인증번호 6자리 👉 ${authNumber}`, // 이메일 내용
  };

  smtpTransport.sendMail(mailOptions, (error, responses) => {
    if (error) {
      res.status(500).json({
        message: `Failed to send authentication email to ${email}`,
      });
    } else {
      res.status(200).json({
        authNumber,
        message: `Authentication mail is sent to ${email}`,
      });
    }
    smtpTransport.close();
  });
};

module.exports = { sendAuthNumber };

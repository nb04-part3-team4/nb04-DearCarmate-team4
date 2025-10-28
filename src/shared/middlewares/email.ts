import nodemailer from 'nodemailer';

interface EmailAttachment {
  filename: string;
  path: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  text: string,
  attachments: EmailAttachment[],
) => {
  try {
    // 이메일 설정이 없으면 스킵
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('📧 Email configuration not found. Skipping email send.');
      return;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // 이메일 전송 실패는 에러를 던지지 않음 (계약서 업데이트는 성공)
    console.log('⚠️  Email sending failed, but continuing with the operation.');
  }
};

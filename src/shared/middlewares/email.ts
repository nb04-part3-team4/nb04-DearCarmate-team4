import nodemailer from 'nodemailer';

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
  attachmentUrl: string,
) => {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      attachments: [
        {
          filename: 'contract-document.png',
          path: attachmentUrl,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

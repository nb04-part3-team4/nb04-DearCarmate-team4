import sgMail from '@sendgrid/mail';
import { InternalServerError } from './custom-error.js';
import axios from 'axios';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface AttachmentData {
  filename: string;
  path: string;
}
interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
}

export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  text: string,
  attachmentsData: AttachmentData[],
) => {
  try {
    if (!process.env.SENDER_EMAIL) {
      throw new InternalServerError('서버 에러');
    }
    const attachments: EmailAttachment[] = await Promise.all(
      attachmentsData.map(async (attachmentInfo) => {
        const response = await axios.get(attachmentInfo.path, {
          responseType: 'arraybuffer', // Buffer 형태로 받기
        });
        const fileBuffer = Buffer.from(response.data);
        const base64Content = fileBuffer.toString('base64');

        return {
          content: base64Content,
          filename: attachmentInfo.filename,
          type: 'application/image',
          disposition: 'attachment',
        };
      }),
    );

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text,
      attachments,
    };
    
    await sgMail.send(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new InternalServerError('Email could not be sent');
  }
};

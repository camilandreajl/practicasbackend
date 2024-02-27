import nodemailer from 'nodemailer';

export const SendMail = (data: any) => {
  const { email } = data;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: data.subject,
    html: data.template,
  };
  try {
    transporter.sendMail(message);
  } catch (error) {
    console.log(error);
  }
};

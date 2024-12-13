import nodemailer from 'nodemailer';

export const SendMail = async (data: any, nextAuthCredentials: any) => {
  const { email } = data;
  try {
    const transporter = nodemailer.createTransport({
      host: nextAuthCredentials?.EMAIL_HOST || process.env.EMAIL_HOST,
      port:
        Number(nextAuthCredentials?.EMAIL_PORT) ||
        Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: nextAuthCredentials?.EMAIL_USER || process.env.EMAIL_USER,
        pass: nextAuthCredentials?.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD,
      },
    });
    const message = {
      from: nextAuthCredentials?.EMAIL_FROM || process.env.EMAIL_FROM,
      to: email,
      subject: data.subject,
      html: data.template,
    };

    const result = await transporter.sendMail(message);
    return result;
  } catch (error) {
    return Error(error as string);
  }
};

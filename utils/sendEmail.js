// utils/sendEmail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rayandevloper@gmail.com',
    pass: 'spmr ghsi apoc slqb',
  },
});

export const sendVerificationEmail = async (to, token) => {
  const mailOptions = {
    from: 'rayandevloper@gmail.com',
    to,
    subject: 'Email Verification Code',
    html: `<p>Your verification code is: <b>${token}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
};

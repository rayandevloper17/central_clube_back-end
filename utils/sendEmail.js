// utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.padel-mindset.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to, token) => {
  const mailOptions = {
    from: '"Padel Mindset" <no-reply@padel-mindset.com>',
    to,
    subject: 'Code de vérification',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Vérification de votre compte</h2>
        <p>Votre code de vérification est :</p>
        <h1 style="color: #4CAF50;">${token}</h1>
        <p>Ce code expirera dans 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;

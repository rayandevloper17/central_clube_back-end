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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background-color: #12281E; padding: 40px 20px; text-align: center; }
          .logo { max-width: 150px; height: auto; margin-bottom: 10px; }
          .content { padding: 40px 30px; text-align: center; color: #333333; }
          .title { color: #12281E; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .text { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 30px; }
          .code-container { background-color: #f8f9fa; border: 2px dashed #12281E; border-radius: 12px; padding: 20px; margin: 0 auto 30px; display: inline-block; }
          .code { color: #12281E; font-size: 36px; font-weight: 800; letter-spacing: 4px; margin: 0; }
          .expiry { font-size: 14px; color: #888888; margin-top: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
          .accent-line { height: 4px; background-color: #CFE202; width: 100%; }
          .btn { background-color: #CFE202; color: #12281E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <!-- Replace with your actual hosted logo URL -->
            <img src="https://padel-mindset.com/assets/icons/logofinal.png" alt="Padel Mindset" class="logo" style="display: none;"> 
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">PADEL MINDSET</h1>
            <p style="color: #CFE202; margin: 5px 0 0; font-size: 14px; letter-spacing: 2px;">REJOIGNEZ LA COMMUNAUTÉ</p>
          </div>
          <div class="accent-line"></div>
          
          <div class="content">
            <h2 class="title">Vérification de votre compte</h2>
            <p class="text">
              Merci de vous être inscrit sur Padel Mindset. Pour sécuriser votre compte et commencer à réserver vos matchs, veuillez utiliser le code ci-dessous :
            </p>
            
            <div class="code-container">
              <h1 class="code">${token}</h1>
            </div>
            
            <p class="expiry">
              ⚠️ Ce code expirera dans <strong>10 minutes</strong>.<br>
              Ne le partagez avec personne.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Padel Mindset. Tous droits réservés.</p>
            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;

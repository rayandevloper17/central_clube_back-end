export default function VerificationEmailService(models, transporter) {
  const create = async (data) => {
    const user = await models.utilisateur.findByPk(data.id_utilisateur);
    if (!user) throw new Error('User not found');

    const token = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    await models.verification_email.create({
      id_utilisateur: data.id_utilisateur,
      token,
    });

    // Send token by email
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: 'Code de vérification',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Vérification de votre compte</h2>
          <p>Votre code de vérification est :</p>
          <h1 style="color: #4CAF50;">${token}</h1>
          <p>Ce code expirera dans 10 minutes.</p>
        </div>
      `,
    });

    return { message: 'Verification email sent', token }; // token returned for testing only
  };

  const verify = async (id_utilisateur, token) => {
    const record = await models.verification_email.findOne({ where: { id_utilisateur, token } });
    if (!record) throw new Error('Invalid token');
    return { message: 'Token verified successfully' };
  };

  return {
    create,
    verify,
  };
}

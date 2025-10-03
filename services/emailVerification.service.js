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
      from: '"Rayan App" <rayandevloper@gmail.com>',
      to: user.email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${token}`,
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

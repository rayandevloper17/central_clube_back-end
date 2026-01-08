import transporter from './utils/sendEmail.js';

async function testEmail() {
  const targetEmail = process.argv[2];
  
  if (!targetEmail) {
    console.error('Please provide an email address as an argument.');
    console.error('Usage: node test_smtp.js your_email@example.com');
    process.exit(1);
  }

  console.log(`Sending test email to: ${targetEmail}`);

  try {
    const info = await transporter.sendMail({
      from: '"Padel Mindset" <no-reply@padel-mindset.com>',
      to: targetEmail,
      subject: "SMTP Test Successful",
      html: "<h2>Email system is working ✅</h2><p>This is a test email from the Padel Mindset backend.</p>",
    });

    console.log("✅ Message sent successfully!");
    console.log("Message ID: %s", info.messageId);
    console.log("Response: %s", info.response);
  } catch (error) {
    console.error("❌ Error sending email:");
    console.error(error);
  }
}

testEmail();
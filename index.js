const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', 
    pass: 'your-app-password' 
  }
});

exports.sendEmailOTP = functions.https.onCall(async (data, context) => {
  const email = data.email;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  try {
    await admin.firestore().collection('otps').doc(email).set({
      otp,
      expiresAt,
      attempts: 0
    });

    await transporter.sendMail({
      from: '"Password Domain" <noreply@passworddomain.com>',
      to: email,
      subject: 'Your Verification OTP',
      html: `
        <h2>Password Domain Verification</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send OTP');
  }
});
exports.verifyEmailOTP = functions.https.onCall(async (data, context) => {
    const { email, otp } = data;
    const otpDoc = await admin.firestore().collection('otps').doc(email).get();
  
    if (!otpDoc.exists) {
      return { success: false, message: 'OTP expired or not found' };
    }
  
    const otpData = otpDoc.data();
    
    if (new Date() > otpData.expiresAt.toDate()) {
      await otpDoc.ref.delete();
      return { success: false, message: 'OTP has expired' };
    }
  
    if (otpData.attempts >= 3) {
      await otpDoc.ref.delete();
      return { success: false, message: 'Too many attempts' };
    }
  
    if (otpData.otp !== otp) {
      await otpDoc.ref.update({ attempts: otpData.attempts + 1 });
      return { success: false, message: 'Invalid OTP' };
    }
  
    await otpDoc.ref.delete();
    return { success: true };
  });
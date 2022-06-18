const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRETE = process.env.GOOGLE_CLIENT_SECRETE;
const REDIRECT_URI = process.env.GOOGEL_REDIRECT_URL;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

module.exports = async (email, subject, html) => {
  const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRETE, REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const accessToken = await oauth2Client.getAccessToken();
  try {
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRETE,
        refreshToken: REFRESH_TOKEN,
        user: process.env.EMAIL_CREDENTIAL,
        accessToken: accessToken,
        // pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: `Shop Media "no-reply@shopmedia.com"`,
      replyTo: "no-reply@shopmedia.com",
      to: email,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

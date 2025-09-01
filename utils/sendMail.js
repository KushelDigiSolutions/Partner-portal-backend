import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // .env file load karega

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // .env se
    pass: process.env.EMAIL_PASS, // .env se
  },
});

// Example send mail function
export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`, // sender address
      to, // receiver
      subject, // Subject line
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

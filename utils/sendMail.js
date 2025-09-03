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
      from: `"KRC Customizer" <${process.env.EMAIL_USER}>`, // sender address
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





// ✅ Email Templates
export const partnerEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f9fc; }
    .container { max-width:600px; margin:20px auto; background:#ffffff; border-radius:10px; 
                 overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .header { background:#4f46e5; padding:20px; text-align:center; color:#ffffff; }
    .content { padding:30px; color:#333; line-height:1.6; }
    .button { display:inline-block; margin-top:20px; padding:12px 24px; background:#4f46e5; 
              color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; }
    .footer { background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome, ${data.name}!</h1></div>
    <div class="content">
      <p>Thank you for applying to become our partner. 🎉</p>
      <p>Our team is reviewing your application and we’ll get back to you shortly.</p>
      <a href="${data.website}" class="button">Visit Your Website</a>
      <p style="margin-top:30px;">Best Regards,<br/>The Team</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Partner Program. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export const adminEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f9fc; }
    .container { max-width:600px; margin:20px auto; background:#ffffff; border-radius:10px; 
                 overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);}
    .header { background:#dc2626; padding:20px; text-align:center; color:#ffffff; }
    .content { padding:30px; color:#333; line-height:1.6; }
    .table { width:100%; border-collapse:collapse; margin-top:20px; }
    .table td { padding:10px; border-bottom:1px solid #eee; }
    .footer { background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🚀 New Partner Application</h1></div>
    <div class="content">
      <p>A new partner has submitted their application. Here are the details:</p>
      <table class="table">
        <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
        <tr><td><strong>Website:</strong></td><td><a href="${data.website}" target="_blank">${data.website}</a></td></tr>
        <tr><td><strong>Platform:</strong></td><td>${data.platform}</td></tr>
        <tr><td><strong>Affiliate Handle:</strong></td><td>${data.affiliate_handle}</td></tr>
        <tr><td><strong>Mobile:</strong></td><td>${data.mobilePhone}</td></tr>
        <tr><td><strong>Description:</strong></td><td>${data.description}</td></tr>
        <tr><td><strong>Additional Info:</strong></td><td>${data.additional_info || "N/A"}</td></tr>
      </table>
      <p style="margin-top:20px;">Please review and approve/reject this request.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Partner Program. Internal Notification Only.
    </div>
  </div>
</body>
</html>
`;


// sendMail("ak1540726@gmail.com","HEllo",partnerEmailTemplate("jame"))
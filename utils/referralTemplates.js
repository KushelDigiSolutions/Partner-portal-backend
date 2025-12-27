/**
 * =====================================================
 * GLOBAL BASE EMAIL WRAPPER (RESPONSIVE)
 * =====================================================
 */

const baseEmailWrapper = (title, headerColor, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>

<style>
  body {
    margin: 0;
    padding: 0;
    background: #f6f9fc;
    font-family: Arial, Helvetica, sans-serif;
  }

  .email-wrapper {
    width: 100%;
    padding: 20px 10px;
    box-sizing: border-box;
  }

  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .email-header {
    background: ${headerColor};
    color: #ffffff;
    padding: 22px 20px;
    text-align: center;
  }

  .email-header h1 {
    margin: 0;
    font-size: 22px;
    font-weight: bold;
  }

  .email-content {
    padding: 28px 24px;
    color: #333333;
    line-height: 1.6;
    font-size: 15px;
  }

  .email-content p {
    margin: 0 0 14px;
  }

  .btn {
    display: inline-block;
    background: ${headerColor};
    color: #ffffff !important;
    text-decoration: none;
    padding: 12px 22px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    margin-top: 16px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 18px;
  }

  .table td {
    padding: 10px;
    border-bottom: 1px solid #eeeeee;
    font-size: 14px;
  }

  .table td:first-child {
    font-weight: bold;
    color: #555;
    width: 40%;
  }

  .status {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    margin-top: 10px;
  }

  .status.success { background: #dcfce7; color: #166534; }
  .status.failed { background: #fee2e2; color: #991b1b; }
  .status.hold { background: #fef3c7; color: #92400e; }

  .email-footer {
    background: #f3f4f6;
    text-align: center;
    padding: 14px;
    font-size: 12px;
    color: #888888;
  }

  @media screen and (max-width: 600px) {
    .email-content {
      padding: 20px 16px;
    }
    .email-header h1 {
      font-size: 20px;
    }
  }
</style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>${title}</h1>
      </div>

      <div class="email-content">
        ${content}
      </div>

      <div class="email-footer">
        © ${new Date().getFullYear()} Partner Program. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * =====================================================
 * PARTNER APPLICATION SUBMITTED (PARTNER)
 * =====================================================
 */
export const partnerEmailTemplate = (data) =>
  baseEmailWrapper(
    `Welcome, ${data.name}!`,
    "#4f46e5",
    `
      <p>Thank you for applying to become our partner 🎉</p>
      <p>Our team is reviewing your application and will contact you soon.</p>

      <a href="https://krcustomizer.com" class="btn">
        Visit Our Website
      </a>

      <p style="margin-top:26px;">
        Best Regards,<br/>
        <strong>KR Customizer</strong>
      </p>
    `
  );

/**
 * =====================================================
 * NEW PARTNER APPLICATION (ADMIN)
 * =====================================================
 */
export const adminEmailTemplate = (data) =>
  baseEmailWrapper(
    "🚀 New Partner Application",
    "#4f46e5",
    `
      <p>A new partner has submitted an application:</p>

      <table class="table">
        <tr><td>Name</td><td>${data.name}</td></tr>
        <tr><td>Email</td><td>${data.email}</td></tr>
        <tr><td>Website</td><td>${data.website}</td></tr>
        <tr><td>Platform</td><td>${data.platform}</td></tr>
        <tr><td>Organization</td><td>${data.organization}</td></tr>
        <tr><td>Mobile</td><td>${data.mobilePhone}</td></tr>
        <tr><td>Description</td><td>${data.description}</td></tr>
        <tr><td>Additional Info</td><td>${data.additional_info || "N/A"}</td></tr>
      </table>

      <p style="margin-top:20px;">
        Please review and take action.
      </p>
       <a href="https://partner.krcustomizer.com" class="btn">
      Go To Partner Dashboard
      </a>
    `
  );

/**
 * =====================================================
 * PARTNER APPROVED – LOGIN DETAILS
 * =====================================================
 */
export const partnerApprovedTemplate = (partner, plainPassword, referenceLink) =>
  baseEmailWrapper(
    "🎉 Partner Account Approved",
    "#4f46e5",
    `
      <p>Dear <strong>${partner.name}</strong>,</p>
      <p>Your partner account has been <strong style="color:#4f46e5;">approved</strong>.</p>

      <table class="table">
        <tr><td>Email</td><td>${partner.email}</td></tr>
        <tr><td>Password</td><td><code>${plainPassword}</code></td></tr>
        <tr><td>Referral Code</td><td><code>${referenceLink}</code></td></tr>
      </table>

      <a href="https://partner.krcustomizer.com/login" class="btn">
        Login to Partner Dashboard
      </a>

      <p style="margin-top:20px;">Please change your password after logging in for security purposes.</p>
    `
  );

/**
 * =====================================================
 * PARTNER APPLICATION REJECTED
 * =====================================================
 */
export const partnerRejectedTemplate = (partner) =>
  baseEmailWrapper(
    "❌ Partnership Request Rejected",
    "#4f46e5",
    `
      <p>Dear <strong>${partner.name}</strong>,</p>

      <p>
        Thank you for your interest in our Partner Program.
        After careful review, we regret to inform you that your partnership request has been
        <strong style="color:#4f46e5;">rejected</strong>.
      </p>

      <p>
        This decision does not prevent you from applying again in the future.
        You are welcome to re-apply once you meet the required criteria.
      </p>

      <p style="margin-top:24px;">
        If you have any questions, feel free to reach out to our support team.
      </p>

      <p style="margin-top:24px;">
        Best regards,<br/>
        <strong>KR Customizer</strong>
      </p>
    `
  );

/**
 * =====================================================
 * REFERRAL SUBMITTED – THANK YOU (USER)
 * =====================================================
 */
export const userThankYouTemplate = (name) =>
  baseEmailWrapper(
    `Thank You, ${name}! 🎉`,
    "#4f46e5",
    `
      <p>Thank you for submitting your referral.</p>
      <p>Our team will review it and keep you updated.</p>

      <a href="https://krcustomizer.com" class="btn">
        Visit Our Website
      </a>
    `
  );

/**
 * =====================================================
 * NEW REFERRAL SUBMITTED (ADMIN)
 * =====================================================
 */
export const adminNotificationTemplate = (data) =>
  baseEmailWrapper(
    "📩 New Referral Submitted",
    "#4f46e5",
    `
      <table class="table">
        <tr><td>Name</td><td>${data.name}</td></tr>
        <tr><td>Email</td><td>${data.email}</td></tr>
        <tr><td>Store</td><td>${data.store_name}</td></tr>
        <tr><td>Platform</td><td>${data.platform}</td></tr>
      </table>
    `
  );

/**
 * =====================================================
 * NEW REFERRAL ASSIGNED (PARTNER)
 * =====================================================
 */
export const partnerNotificationTemplate = (partner, referral) =>
  baseEmailWrapper(
    "🤝 New Referral Assigned",
    "#4f46e5",
    `
      <p>Hello <strong>${partner.name}</strong>,</p>
      <p>A new referral has been assigned to you.</p>

      <table class="table">
        <tr><td>Store Name</td><td>${referral.store_name}</td></tr>
        <tr><td>Platform</td><td>${referral.platform}</td></tr>
      </table>
    `
  );

/**
 * =====================================================
 * PASSWORD RESET OTP
 * =====================================================
 */
export const passwordResetOtpTemplate = (otpCode, name = "User") =>
  baseEmailWrapper(
    "🔐 Password Reset OTP",
    "#4f46e5",
    `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your OTP for password reset is:</p>

      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2563eb;">${otpCode}</span>
      </div>

      <p style="color: #666; font-size: 13px;">This OTP will expire in <strong>10 minutes</strong>.</p>
      
      <p>If you did not request this, please ignore this email.</p>

      <p style="margin-top:24px;">
        Best regards,<br/>
        <strong>KR Customizer</strong>
      </p>
    `
  );

/**
 * =====================================================
 * REFERRAL STATUS UPDATED (USER / PARTNER)
 * =====================================================
 */
export const referralStatusTemplate = (name, status) => {
  const statusClass =
    status === "confirmed" ? "success" :
      status === "hold" ? "hold" : "failed";

  return baseEmailWrapper(
    "🔔 Referral Status Update",
    "#4f46e5",
    `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your referral status has been updated to:</p>

      <div class="status ${statusClass}">
        ${status.toUpperCase()}
      </div>
    `
  );
};


import { sendMail } from "./sendMail.js";

/**
 * =====================================================
 * TEST EMAIL TEMPLATES
 * =====================================================
 */

// Uncomment the function below to test sending emails
export const testSendAllEmails = async (sendMail) => {
  try {
    console.log("🚀 Starting single email test...\n");

    const testEmail = "sagar@kusheldigisolutions.com"; // change if needed

    // 🧱 Helper to wrap section with heading
    const section = (title, html) => `
      <div style="margin-bottom:40px;">
        <h2 style="
          border-bottom:2px solid #e5e7eb;
          padding-bottom:10px;
          color:#0f172a;
          font-family:Arial, Helvetica, sans-serif;
        ">
          ${title}
        </h2>
        <div style="margin-top:20px;">
          ${html}
        </div>
      </div>
    `;

    // 📨 Build single email body
    const combinedEmailBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Email Template Test</title>
      </head>
      <body style="background:#f8fafc;padding:30px;">

        ${section(
      "1. Partner Application (User)",
      partnerEmailTemplate({ name: "Aman Kumar" })
    )}

        ${section(
      "2. New Partner Application (Admin)",
      adminEmailTemplate({
        name: "Aman Kumar",
        email: "ak3722032@gmail.com",
        website: "https://www.johndoeagency.com",
        platform: "BigCommerce",
        organization: "John Doe Agency Pvt Ltd",
        mobilePhone: "+1-9876543210",
        description: "We help merchants grow their online stores.",
        additional_info: "Testing"
      })
    )}

        ${section(
      "3. Partner Approved",
      partnerApprovedTemplate(
        { name: "Aman Kumar", email: "ak3722032@gmail.com" },
        "abc12345",
        "PARTNER001"
      )
    )}

        ${section(
      "4. Partner Rejected",
      partnerRejectedTemplate({ name: "Aman Kumar" })
    )}

        ${section(
      "5. Referral Thank You (User)",
      userThankYouTemplate("Aman Verma")
    )}

        ${section(
      "6. New Referral (Admin)",
      adminNotificationTemplate({
        name: "Aman Verma",
        email: "vivekkansalvkvk@gmail.com",
        store_name: "Aman Online Store",
        platform: "BigCommerce"
      })
    )}

        ${section(
      "7. Referral Assigned (Partner)",
      partnerNotificationTemplate(
        { name: "John Doe" },
        { store_name: "Aman Online Store", platform: "BigCommerce" }
      )
    )}

        ${section(
      "8. Password Reset OTP",
      passwordResetOtpTemplate("123456", "Aman Kumar")
    )}

        ${section(
      "9. Referral Status Update",
      referralStatusTemplate("Aman Verma", "confirmed")
    )}

      </body>
      </html>
    `;

    // 📤 Send SINGLE email
    await sendMail(
      testEmail,
      "🧪 All Email Templates – Combined Preview",
      combinedEmailBody
    );

    console.log("✅ Single combined email sent successfully!");

  } catch (error) {
    console.error("❌ Error in single email test:", error);
    throw error;
  }
};


// testSendAllEmails(sendMail)
//   .then(() => {
//     console.log("🎉 All emails sent successfully!");
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error("💥 Failed to send emails:", error.message);
//     process.exit(1);
//   });
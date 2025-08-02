const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const app = require("../app");
const fs = require("fs");
const handlebars = require("handlebars");
const { Proposal, users } = require("../models");

const sendEmail = async ({ email, subject }) => {
  console.log("inside send email");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: Number(process.env.MAIL_PORT),
    secure: Boolean(true),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  let filePath = path.join(__dirname, "../../uploads/leadDate.xlsx");

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    attachments: [
      {
        filename: "leadDate.xlsx",
        path: filePath,
      },
    ],
  });
  console.log("sent");
};
const sendForgotPasswordEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: Number(process.env.MAIL_PORT),
    secure: Boolean(true),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    html: message,
  });
};

const sendClientPropoalEmail = async ({
  clientEmail,
  clientName,
  proposalLink,
  res,
}) => {
  try {
    // Fetch companyInfo (if not already passed, you can refactor to include it)
    const proposal = await Proposal.findById(proposalLink);
    const companyInfo = await users.findById(proposal.parentId);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${companyInfo?.companyName || "Your Company"}" <${
        process.env.MAIL_USER
      }>`,
      to: clientEmail,
      subject: `You have received a Proposal from ${
        companyInfo?.companyName || "Your Company"
      }`,
      html: `
  <div style="
    background-color: #f9f9f9;
    padding: 40px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ">
      <!-- Background Image -->
      <div style="
        background-image: url('${companyInfo?.ComapanyImageTwo}');
        background-size: cover;
        background-position: center;
        filter: opacity(0.08);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      "></div>

      <!-- Content Card -->
      <div style="
        position: relative;
        background-color: rgba(255, 255, 255, 0.92);
        padding: 30px;
        z-index: 1;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${companyInfo?.ComapanyImageOne}" alt="Company Logo" style="max-height: 60px;" />
        </div>

        <h2 style="text-align: center; color: #2b6cb0;">You're Invited to View a Proposal</h2>
        <p style="font-size: 16px; margin-top: 20px;">
          Hello <strong>${clientName}</strong>,
        </p>
        <p style="font-size: 15px;">
          You have received a new proposal from <strong>${companyInfo?.companyName}</strong>. Please click the button below to view and accept the proposal.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/client-proposal-view?proposalId=${proposalLink}" 
            style="
              background-color: #3182ce;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            ">
            View Proposal
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />

        <div style="font-size: 13px; color: #555;">
          <p>Regards,</p>
          <p><strong>${companyInfo?.companyName}</strong></p>
          <p>${companyInfo?.Address}, ${companyInfo?.City}, ${companyInfo?.State} - ${companyInfo?.Pincode}</p>
          <p>Email: ${companyInfo?.Email} | Phone: ${companyInfo?.Phone}</p>
          <p>Website: <a href="http://${companyInfo?.webURL}" style="color: #3182ce;">${companyInfo?.webURL}</a></p>
        </div>
      </div>
    </div>
  </div>
`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Proposal invitation sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email." });
  }
};

// Function to render an email template
async function renderTemplate(templateName, context) {
  const filePath = path.join(__dirname, `../views/emails/${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8");

  // Create a Handlebars template function
  const template = handlebars.compile(source);

  // Render the template with the provided context
  const htmlContent = template(context);

  return htmlContent;
}
const sendGreetingEmailToUser = async (
  recipient,
  subject,
  template,
  context
) => {
  // Render the email template with the provided context
  const htmlContent = await renderTemplate(template, context);
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: Number(process.env.MAIL_PORT),
      //secure: Boolean(true),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log(error.message);
  }
};
const sendGreetingEmailToAdmin = async (
  recipient,
  subject,
  template,
  context
) => {
  console.log(recipient, subject, template, context);
  try {
    // Render the email template with the provided context
    const htmlContent = await renderTemplate(template, context);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: Number(process.env.MAIL_PORT),
      secure: Boolean(true),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send the email
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully");

    // var mailOptions = {
    //   from: process.env.MAIL_USER,
    //   to: email,
    //   subject:
    //     "Welcome to Our Lead Management System! Password Update Required.!",
    //   template: "email",
    //   context: {
    //     name: name,
    //     link: link,
    //   },
    // };

    // transporter.use("compile", hbs(handlebarOptions));

    // await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  sendEmail,
  sendForgotPasswordEmail,
  sendGreetingEmailToUser,
  sendGreetingEmailToAdmin,
  sendClientPropoalEmail,
};

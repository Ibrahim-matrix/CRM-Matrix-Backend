const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const app = require("../app");
const fs = require("fs");
const handlebars = require("handlebars");

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
};

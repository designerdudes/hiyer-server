// Import SendMailClient from zeptomail
import { SendMailClient } from "zeptomail";

// Set the URL and token for the ZeptoMail API
const url = process.env.ZOHO_URL
const token = process.env.ZOHO_TOKEN

// Initialize the SendMailClient with the URL and token
let client = new SendMailClient({ url, token });

/**
 * Sends an email using ZeptoMail
 * @param {string} toAddress - The recipient's email address
 * @param {string} toName - The recipient's name
 * @param {string} subject - The email subject
 * @param {string} body - The email body content in HTML format
 */
export  const sendEmail = async (toAddress, toName, subject, body) => {
  const emailDetails = {
    from: {
      address: "noreply@hiyer.in",
      name: "noreply"
    },
    to: [
      {
        email_address: {
          address: toAddress,
          name: toName ? toName : "user"
        }
      }
    ],
    subject: subject,
    htmlbody:  `<div><b>${body}</b></div>`
  };

  try {
    const resp = await client.sendMail(emailDetails);
    console.log("Email sent successfully:", resp);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * Sends an OTP email using ZeptoMail
 * @param {string} toAddress - The recipient's email address
 * @param {string} toName - The recipient's name
 * @param {string} otp - The OTP to be sent
 */
export  const sendOtpEmail = async (toAddress, toName, otp) => {
    const subject = "One-Time-Password for your Email Verification";
    const body = `Thank you for choosing Hiyer. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes: ${otp}.`;
  
    await sendEmail(toAddress, toName, subject, body);
  };
  
  
 /**
 * Sends a verification success email using ZeptoMail
 * @param {string} toAddress - The recipient's email address
 * @param {string} toName - The recipient's name
 */
 export  const sendVerificationSuccessEmail = async (toAddress, toName) => {
    const subject = "Email Verification Successful";
    const body = `Congratulations ${toName}! Your email verification has been successfully completed.`;
  
    await sendEmail(toAddress, toName, subject, body);
  };


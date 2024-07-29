// // Import SendMailClient from zeptomail
// import { SendMailClient } from "zeptomail";

// // Set the URL and token for the ZeptoMail API
// const url = process.env.ZOHO_URL
// const token = process.env.ZOHO_TOKEN

// // Initialize the SendMailClient with the URL and token
// let client = new SendMailClient({ url, token });

// /**
//  * Sends an email using ZeptoMail
//  * @param {string} toAddress - The recipient's email address
//  * @param {string} toName - The recipient's name
//  * @param {string} subject - The email subject
//  * @param {string} body - The email body content in HTML format
//  */
// export  const sendEmail = async (toAddress, toName, subject, body) => {
//   const emailDetails = {
//     from: {
//       address: "noreply@hiyer.in",
//       name: "noreply"
//     },
//     to: [
//       {
//         email_address: {
//           address: toAddress,
//           name: toName ? toName : "user"
//         }
//       }
//     ],
//     subject: subject,
//     htmlbody:  `<div><b>${body}</b></div>`
//   };

//   try {
//     const resp = await client.sendMail(emailDetails);
//     console.log("Email sent successfully:", resp);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

// /**
//  * Sends an OTP email using ZeptoMail
//  * @param {string} toAddress - The recipient's email address
//  * @param {string} toName - The recipient's name
//  * @param {string} otp - The OTP to be sent
//  */
// export  const sendOtpEmail = async (toAddress, toName, otp) => {
//     const subject = "One-Time-Password for your Email Verification";
//     const body = `Thank you for choosing Hiyer. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes: ${otp}.`;
  
//     await sendEmail(toAddress, toName, subject, body);
//   };
  
  
//  /**
//  * Sends a verification success email using ZeptoMail
//  * @param {string} toAddress - The recipient's email address
//  * @param {string} toName - The recipient's name
//  */
//  export  const sendVerificationSuccessEmail = async (toAddress, toName) => {
//     const subject = "Email Verification Successful";
//     const body = `Congratulations ${toName}! Your email verification has been successfully completed.`;
  
//     await sendEmail(toAddress, toName, subject, body);
//   };

// Import SendMailClient from zeptomail
import { SendMailClient } from "zeptomail";

// Set the URL and token for the ZeptoMail API
const url = process.env.ZOHO_URL;
const token = process.env.ZOHO_TOKEN;

const {
  ZEPTO_MAIL_TEMPLATE_OTP,
  ZEPTO_MAIL_TEMPLATE_VERIFICATION_SUCCESS,
  ZEPTO_MAIL_TEMPLATE_WELCOME_ORG,
  ZEPTO_MAIL_TEMPLATE_WELCOME_USER,
  ZEPTO_MAIL_TEMPLATE_NEW_JOB_ALERT,
  ZEPTO_MAIL_TEMPLATE_NEW_JOB_ALERT_BY_USER,
  ZEPTO_MAIL_TEMPLATE_NEW_APPLICATION,
  ZEPTO_MAIL_TEMPLATE_NEW_RECOMMENDATION_FROM_USER,
  ZEPTO_MAIL_TEMPLATE_NEW_RECOMMENDATION_FROM_ORG,
  ZEPTO_MAIL_TEMPLATE_INVOICE,
  ZOHO_MAIL_TEMPLATE_STATUS_UPDATE,
  ZOHO_MAIL_TEMPLATE_NEW_JOB_AD_NOTIFICATION
} = process.env;

// Initialize the SendMailClient with the URL and token
let client = new SendMailClient({ url, token });

/**
 * Extracts the name from an email address.
 * @param {string} email - The email address to extract the name from.
 * @returns {string} - The name extracted from the email address.
 */
const extractNameFromEmail = (email) => {
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

/**
 * Sends an email using ZeptoMail with a specified template and merge info.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} [toName] - The recipient's name. If not provided, defaults to the name extracted from the email.
 * @param {string} subject - The email subject.
 * @param {string} templateKey - The key of the email template to use.
 * @param {object} mergeInfo - The merge info to populate the template.
 */
export const sendEmailWithTemplate = async (toAddress, toName, subject, templateKey, mergeInfo = {}) => {
  const name = toName || extractNameFromEmail(toAddress);
  const emailDetails = {
    mail_template_key: templateKey,
    from: {
      address: "noreply@hiyer.in",
      name: "noreply"
    },
    to: [
      {
        email_address: {
          address: toAddress,
          name: name
        }
      }
    ],
    subject: subject,
    merge_info: mergeInfo
  };

  try {
    const resp = await client.sendMail(emailDetails);
    console.log("Email sent successfully:", resp);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
/**
 * Sends an OTP email using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 * @param {string} otp - The OTP to be sent.
 */
export const sendOtpEmail = async (toAddress, userName, otp) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Your One Time Password for Login";
  const templateKey = ZEPTO_MAIL_TEMPLATE_OTP;  
  const mergeInfo = { OTP: otp, userName: name };
  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

/**
 * Sends a verification success email using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendVerificationSuccessEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Your Account is Verified!";
  const templateKey = ZEPTO_MAIL_TEMPLATE_VERIFICATION_SUCCESS; 
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(toAddress, userName, subject, templateKey, mergeInfo);
};

/**
 * Sends a welcome email to an organization using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendWelcomeOrgEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Welcome to Hiyer!";
  const templateKey = ZEPTO_MAIL_TEMPLATE_WELCOME_ORG; 
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(toAddress, userName, subject, templateKey, mergeInfo);
};

/**
 * Sends a welcome email to a user using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendWelcomeUserEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Welcome to Hiyer!";
  const templateKey = ZEPTO_MAIL_TEMPLATE_WELCOME_USER; 
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(toAddress, userName, subject, templateKey, mergeInfo);
};

/**
 * Sends a new job alert email using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendNewJobAlertEmail = async (toAddress, userName, job,orgId) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "New Job Alert";
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_JOB_ALERT;
  const mergeInfo = {
    orgId,
    jobId:job._id,
    userName: name,
    jobTitle: job.title,
    jobDescription: job.description || 'No description provided',
    jobType: job.jobType || 'No job type provided',
    experienceLevel: job.experienceLevel || 'No experience level provided'
  };

  await sendEmailWithTemplate(toAddress, name, subject, templateKey, mergeInfo);
};

/**
 * Sends a custom email using ZeptoMail with job and user details.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} organizationName - The organization's name.
 * @param {object} user - The user object containing name, phone, and profile picture.
 * @param {object} job - The job object containing title, description, job type, and experience level.
 */
export const sendNewJobAlertByUserEmail = async (toAddress, organizationName, user, job) => {
  const subject = "New Job Alert by User";
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_JOB_ALERT_BY_USER;  
  const mergeInfo = {
    organizationName:organizationName,
    userId:user._id,
    userName: `${user.name.first} ${user.name.last}`,
    jobTitle: job.title,
    jobDescription: job.description || 'N/A',
    jobType: job.jobType || 'N/A',
    experienceLevel: job.experienceLevel || 'N/A',
    userFullName: `${user.name.first} ${user.name.last}`,
    userPhone: user.phone.countryCode ? `${user.phone.countryCode} ${user.phone.number}` : 'N/A',
    userProfilePicture: user.profilePicture ? user.profilePicture.url : 'N/A'
  };

  await sendEmailWithTemplate(toAddress, organizationName, subject, templateKey, mergeInfo);
};


/**
 * Sends a notification email about a new job application.
 * @param {object} jobAds - The job ad details, including title and postedBy information.
 * @param {object} user - The user object containing name, email, and profile picture.
 */
export const sendNewApplicationEmail = async (jobAds, user) => {
  const { title, postedBy } = jobAds;
  const { email, name, profilePicture } = user;

  const organizationName = postedBy.name ;
  const applicantName = `${user.name.first} ${user.name.last}` || extractNameFromEmail(email.id);
  const toAddress = postedBy.contact.email ;

  const subject = `New Application for ${jobAds.title}`;
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_APPLICATION; 
  const mergeInfo = {
    userId: user._id,
    userPic: user.profilePicture?.imageUrl || 'N/A',
    userName: applicantName,
    jobTitle: jobAds.title,
    jobId: jobAds._id,
    organizationName: organizationName,
    userEmail: email.id
  }; 

  await sendEmailWithTemplate( jobAds.postedBy.contact.email,organizationName, subject, templateKey, mergeInfo);
};

/**
 * Sends a new job recommendation email from a user using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendNewRecommendationFromUserEmail = async (toUser,job ,fromUser) => {
  const name = `${toUser.name.first} ${toUser.name.last}` || extractNameFromEmail(toUser.email.id);
  const name2 = `${fromUser.name.first} ${fromUser.name.last}` || extractNameFromEmail(fromUser.email.id);


  const subject = "New Job Recommendation from User";
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_RECOMMENDATION_FROM_USER; 
  const mergeInfo = { 
    userName: name,
    jobTitle: job.title,
    jobId: job._id,
    userName2: name2,
    userId: fromUser._id,
    userprofilepic: fromUser.profilePicture.imageUrl,


  };
  await sendEmailWithTemplate(toUser.email.id, name, subject, templateKey, mergeInfo);

};

/**
 * Sends a new job recommendation email from an organization using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendNewRecommendationFromOrgEmail = async (toUser, job, fromUser) => {
  const name = `${toUser.name.first} ${toUser.name.last}` || extractNameFromEmail(toUser.email.id);
  const subject = "New Job Recommendation from Company";
  const templateKey = ZEPTO_MAIL_TEMPLATE_NEW_RECOMMENDATION_FROM_ORG; 
  const mergeInfo = { 
    userName: name,
    jobTitle: job.title,
    jobId: job._id,
    companyName: fromUser.name,
    companyId: fromUser._id,
    companyLogo: fromUser.logo,


  };

  await sendEmailWithTemplate(toUser.email.id, name, subject, templateKey, mergeInfo);
};

export const sendApplicantStatusUpdateEmail = async (user, jobAds, applicantStatus) => {
  const applicantName = `${user.name.first} ${user.name.last}` || extractNameFromEmail(user.email.id);
  const statusNotes = `Your application status has been updated to ${applicantStatus}.`;

  const subject = `Application Status Update for ${jobAds.title}`;
  const templateKey = ZOHO_MAIL_TEMPLATE_STATUS_UPDATE;
  const mergeInfo = {
    applicantName,
    applicantId:user._id,
    jobTitle:jobAds.title,
    jobId:jobAds._id,
    applicantStatus,
    statusNotes,
    companyName: jobAds.postedBy.name,
    companyId: jobAds.postedBy._id

  };

  await sendEmailWithTemplate(user.email.id, applicantName, subject, templateKey, mergeInfo);
};


/**
 * Sends an invoice email using ZeptoMail.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} userName - The recipient's name.
 */
export const sendInvoiceEmail = async (toAddress, userName) => {
  const name = userName || extractNameFromEmail(toAddress);
  const subject = "Order Confirmation";
  const templateKey = ZEPTO_MAIL_TEMPLATE_INVOICE; 
  const mergeInfo = { userName: name };
  await sendEmailWithTemplate(toAddress, userName, subject, templateKey, mergeInfo);
};
 

export const sendEmail = async (toAddress, userName) => { 
};

export const sendEmailAdNotification = async (email, jobDetails) => {
  const subject = "New Job Opportunity Available!";
  const templateKey =   ZOHO_MAIL_TEMPLATE_NEW_JOB_AD_NOTIFICATION; 
  
  const mergeInfo = {
    jobTitle: jobDetails.jobTitle,
    jobId: jobDetails.jobId,
    orgId: jobDetails.orgId,
    orgName: jobDetails.orgName,
    orgLogo: jobDetails.orgLogo,
    firstName: jobDetails.firstName || '',
    lastName: jobDetails.lastName || '',
    profilePictureUrl: jobDetails.profilePictureUrl || '',
  };

  await sendEmailWithTemplate(email, subject, templateKey, mergeInfo);
};

 
 
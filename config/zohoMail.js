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
export const sendEmail = async (toAddress, toName, subject, body) => {
  const emailDetails = {
    from: {
      address: "noreply@hiyer.in",
      name: "Hiyer"
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
    // htmlbody: `<div><b>${body}</b></div>`
    htmlbody: ` <html>
    <head>
        <style>
            // body {
            //     font-family: Arial, sans-serif;
            //     background-color: #f4f4f4;
            // }
            // .container {
            //     max-width: 600px;
            //     margin: 0 auto;
            //     padding: 20px;
            // }
            // .btn {
            //     display: inline-block;
            //     padding: 10px 20px;
            //     background-color: #007BFF;
            //     color: #fff;
            //     text-decoration: none;
            //     border-radius: 5px;
            // }
            // .img{
            //     width: 200px;
            //     height: 300px;
            // }
        </style>
        </head>
        <body>
        <table class="m_-5049272237331082851table--wrapper" align="center" cellpadding="0" cellspacing="0" border="0"
        width="700">
        <tbody>
            <tr>
                <td align="center" bgcolor="#2E3190" valign="top" style="
                
              background-color: #2E3190
            ">
                    <div>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 600px"
                            class="m_-5049272237331082851table--content">
                            <tbody>
                                <tr>
                                    <td align="center" valign="top" style="padding: 30px"
                                        class="m_-5049272237331082851logo">
                                        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tbody>
                                                <tr>
                                                    <td class="m_-5049272237331082851newLine">
                                                        <a href="https://www.hiyer.in/
                                                            target="_blank" style="display: flex;flex-wrap: wrap; text-align: center;align-items: center;gap: 16px;width: fit-content;margin: 0 auto;
                                                            text-decoration: none;"
                                                            data-saferedirecturl="https://www.hiyer.in/">
                                                            <img alt="Aplus Logo"
                                                                src="https://firebasestorage.googleapis.com/v0/b/aplus-laundry-storage.appspot.com/o/apluslaundry%2FSymbolWhite.svg?alt=media&token=0cd389ea-c6af-481d-b4f8-274a5ea8f1ba"
                                                                 width="70" style="
                                    display: block;
                                    font-family: Helvetica, Arial, sans-serif;
                                    color: #ffffff;
                                    font-size: 16px; 
                                  " border="0" class="CToWUd" data-bit="iit" /> <p style="
                                    font-family: Helvetica, Arial, sans-serif;
                                    height: fit-content;
                                    color: #ffffff;
                                    font-size: 20px; 
                                    font-weight: 900;
                                    
                                  " >Hiyer</p> 
                                                        </a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
      
      
            <tr>
                
                <td align="center"
                    bgcolor="#F6F6F6" valign="top" style="
            
            ">
            
                    <div>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 600px;margin: -1000px 0"
                            class="m_-5049272237331082851table--content">
                            <tbody>
                                <tr>
                                    <td bgcolor="#fff" align="left" valign="top"
                                        class="m_-5049272237331082851table--content--details"
                                        style="border-radius: 4px; padding: 40px; margin: 0 auto" >
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tbody>
        ${body}                                                
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" class="m_-5049272237331082851table--footer" valign="middle"
                                        style="padding-top: 50px">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tbody>
                                                <tr>
                                                    <td style="padding-bottom: 40px">
                                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" style="padding-bottom: 24px">
                                                                        <a href="https://www.hiyer.in/"
                                                                            target="_blank"
                                                                            data-saferedirecturl="https://www.hiyer.in/" style="text-decoration: none;"> <p>Hiyer</p> </a>
                                                                    </td>
                                                                    <td align="right" style="padding-bottom: 24px">
                                                                        <table style="
                                          list-style: none;
                                          margin: 0;
                                          overflow: hidden;
                                          padding: 0;
                                        ">
                                                                            <tbody>
                                                                                <tr> 
                                                                                    <td style="padding-right: 16px">
                                                                                        <a href="https://www.facebook.com/6300207721@Aplus6300"
                                                                                            target="_blank"
                                                                                            data-saferedirecturl="https://www.facebook.com/6300207721@Aplus6300"><img
                                                                                                alt="Hiyer on Facebook"
                                                                                                src="https://ci3.googleusercontent.com/meips/ADKq_NYoQfU8D-y84Pfi-wn5hQchI2BFlacfLRNmvd3Wk2YjV2CqlKOxps5cm5j1_j-sHImKKggl1jK0C3OonhJ8IbTgUqRLvnE_deI4OTAUJQKlVTQvfywjY5HNS8g=s0-d-e1-ft#https://cdn.getsimpl.com/images/email/transactions/simpl-facebook.png"
                                                                                                width="17"
                                                                                                class="CToWUd"
                                                                                                data-bit="iit" /></a>
                                                                                    </td>
                                                                                    <td style="padding-right: 16px">
                                                                                        <a href="https://www.instagram.com/hiyer.in/"
                                                                                            target="_blank"
                                                                                            data-saferedirecturl="https://www.instagram.com/hiyer.in/"><img
                                                                                                alt="Hiyer on Instagram"
                                                                                                src="https://ci3.googleusercontent.com/meips/ADKq_NZX0lknWQLRiBxtRLXhagocpcWiQcO5I2DUJD1qZ44GM9G20BdF8adSRxlVyzEfF6M6W6ZIlS5TFRlYd2tBYSTSjfZrcSCzZ_ys0m6rjesIGdxLANFgjSXaPZQJ=s0-d-e1-ft#https://cdn.getsimpl.com/images/email/transactions/simpl-instagram.png"
                                                                                                width="17"
                                                                                                class="CToWUd"
                                                                                                data-bit="iit" /></a>
                                                                                    </td>
                                                                                   
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <hr style="background: #888; border: 0; height: 1px" />
                                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top" style="
                                        padding-bottom: 24px;
                                        padding-top: 24px;
                                      ">
                                                                        <table style="
                                          list-style: none;
                                          margin: 0;
                                          padding: 0;
                                          font-family: Source Sans Pro,
                                            Helvetica, Arial, sans-serif;
                                          font-size: 16px;
                                          font-weight: 600;
                                          line-height: 20px;
                                        ">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td class="m_-5049272237331082851siteLink"
                                                                                        style="
                                                font-size: 16px;
                                                font-weight: normal;
                                                line-height: 18px;
                                                padding-right: 16px;
                                              ">
                                                                                        <a href="https://www.hiyer.in/"
                                                                                            style="
                                                  color: #888 !important;
                                                  display: block;
                                                  text-decoration: none;
                                                  text-transform: uppercase;
                                                " target="_blank" data-saferedirecturl="https://www.hiyer.in/">View
                                                                                            Dashboard</a>
                                                                                    </td>
                                                                                    <td class="m_-5049272237331082851siteLink"
                                                                                        style="
                                                font-size: 16px;
                                                font-weight: normal;
                                                line-height: 18px;
                                                padding-right: 16px;
                                              ">
                                                                                        <a href="https://www.hiyer.in/refund-&-returns"
                                                                                            style="
                                                  color: #888 !important;
                                                  display: block;
                                                  text-decoration: none;
                                                  text-transform: uppercase;
                                                " target="_blank" data-saferedirecturl="https://www.hiyer.in/refund-&-returns">
                                                Refunds & Returns</a>
                                                                                    </td>
                                                                                    <td class="m_-5049272237331082851siteLink"
                                                                                        style="
                                                font-size: 16px;
                                                font-weight: normal;
                                                line-height: 18px;
                                                padding-right: 16px;
                                              ">
                                                                                        <a href="https://www.hiyer.in/terms-and-conditions"
                                                                                            style="
                                                  color: #888 !important;
                                                  display: block;
                                                  text-decoration: none;
                                                  text-transform: uppercase;
                                                " target="_blank" data-saferedirecturl="https://www.hiyer.in/terms-and-conditions">Terms
                                                                                            & Conditions</a>
                                                                                    </td>
                                                                                    <td class="m_-5049272237331082851siteLink"
                                                                                        style="
                                                font-size: 16px;
                                                font-weight: normal;
                                                line-height: 18px;
                                              ">
                                                                                        <a href="https://www.hiyer.in/privacy-policy"
                                                                                            style="
                                                  color: #888 !important;
                                                  display: block;
                                                  text-decoration: none;
                                                  text-transform: uppercase;
                                                " target="_blank" data-saferedirecturl="https://www.hiyer.in/privacy-policy">Privacy
                                                                                            Policy</a>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" valign="top"
                                                                        style="padding-bottom: 24px">
                                                                        <table style="
                                          list-style: none;
                                          margin: 0;
                                          overflow: hidden;
                                        ">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td valign="top" style="
                                                height: 24px;
                                                padding: 0;
                                                padding-right: 12px;
                                              ">
                                                                                        <h3 style="
                                                  margin: 0;
                                                  padding: 0;
                                                  color: #888;
                                                  font-family: Source Sans Pro,
                                                    Helvetica, Arial, sans-serif;
                                                  font-size: 14px;
                                                  font-weight: normal;
                                                  line-height: 18px;
                                                ">
                                                                                            Get the app:
                                                                                        </h3>
                                                                                    </td>
                                                                                   
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <p style="
      margin: 0;
      padding: 8px 0 16px;
      font-family: Source Sans Pro, Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      line-height: 16px;
      color: #888;
      width: 80%;
      ">
      © Hiyer 2024. 1-1211/12, Main Road, Revenue Ward No. 1, Near Universal Shop, Kurnool Road, Chimakurthy, Andhra Pradesh-523226
      </p>
      
      <p style="
      margin: 0;
      padding: 8px 0 16px;
      font-family: Source Sans Pro, Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      line-height: 16px;
      color: #888;
      width: 80%;
      ">
      Developed and maintained by DesignerDudes Pvt. Ltd.
      </p>
      
      <p style="
      margin: 0;
      padding: 8px 0 16px;
      font-family: Source Sans Pro, Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      line-height: 16px;
      color: #888;
      ">
      For any queries, reach out to us at
      <a href="https://www.hiyer.in/contactUs" style="color: #444;" title="Link: hiyer.in/contactUs" target="_blank">
      hiyer.in/contactUs
      </a>
      </p>
      
      
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div align="center" bgcolor="#2E3190" valign="top" style="
                
            background-color: #2E3190;width:100%;padding: 20px 0;
          "></div>
                </td>
            </tr>
        </tbody>
      </table>
    
        
    </body>
    </html>
    `,
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
export const sendOtpEmail = async (toAddress, toName, otp) => {
  const subject = "One-Time-Password for your Email Verification";
  const body = `Thank you for choosing Hiyer. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes: ${otp}.`;

  await sendEmail(toAddress, toName, subject, body);
};


/**
* Sends a verification success email using ZeptoMail
* @param {string} toAddress - The recipient's email address
* @param {string} toName - The recipient's name
*/
export const sendVerificationSuccessEmail = async (toAddress, toName) => {
  const subject = "Email Verification Successful";
  const body = `Congratulations ${toName}! Your email verification has been successfully completed.`;

  await sendEmail(toAddress, toName, subject, body);
};


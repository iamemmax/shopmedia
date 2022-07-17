
const API_KEY = process.env.EMAIL_API;
const DOMAIN = process.env.DOMAIN;
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const mailgun = new Mailgun(formData);


  const sendBulkEmail =  async (email,subject, html, name, recipientId ) => {
    
    const client = await mailgun.client({username: 'api', key: API_KEY});
    (async () => {
    
  
    
    const messageData = {
      from: 'ShopMedia <hi@shopmedia.ng>',
      to: [email],
      subject: subject,
      html: html,
      'recipient-variables': JSON.stringify({
       email:[ {
          name,
          recipientId
        }]
      })
    
    };
    
   await client.messages.create(DOMAIN, messageData)
     .then((res) => {
       console.log(res);
     })
     .catch((err) => {
       console.error(err);
     });
    })()
}

  module.exports = sendBulkEmail

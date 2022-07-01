
const API_KEY = process.env.EMAIL_API;
const DOMAIN = process.env.DOMAIN;
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const mailgun = new Mailgun(formData);


  const sendEmail =  async (email, subject, html) => {
    
    const client = await mailgun.client({username: 'api', key: API_KEY});
    (async () => {
    
  
    
    const messageData = {
      from: 'shopMedia <hi@shopmedia.ng>',
      to: email,
      subject: subject,
      html: html,
    
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

  module.exports = sendEmail

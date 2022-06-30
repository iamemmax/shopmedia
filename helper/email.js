
const API_KEY = process.env.EMAIL_API;
const DOMAIN = process.env.DOMAIN;
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const mailgun = new Mailgun(formData);
  module.exports = async (email, subject, html) => {
    
    const client = mailgun.client({username: 'api', key: API_KEY});
    
    const messageData = {
      from: 'shop media <hi@shopmedia.ng>',
      to: email,
      subject: subject,
      text: html
    };
    
    client.messages.create(DOMAIN, messageData)
     .then((res) => {
       console.log(res);
     })
     .catch((err) => {
       console.error(err);
     });
  }
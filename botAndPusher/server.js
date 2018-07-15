const express = require('express')
const bodyParser = require('body-parser')
const Pusher = require('pusher')
const cors = require('cors')
require('dotenv').config()
const shortId = require('shortid')
const dialogFlow = require('./dialogFlow')

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: 'us2',
  encrypted: true
})

const destinationMap = new Map();
const budgetMap = new Map();
const sourceMap = new Map();
const d1 = new Map();

app.post('/message', async (req, res) => {
  // simulate actual db save with id and createdAt added
  const chat = {
    ...req.body,
    id: shortId.generate(),
    createdAt: new Date().toISOString()
  }
  // trigger this update to our pushers listeners
  pusher.trigger('chat-group', 'chat', chat)
  // console.log('chat', chat);

  // check if this message was invoking our bot, /bot
  if (!chat.message.startsWith('/bot')) {
    const message = chat.displayName + ": " + chat.message
    // console.log("sending to bot", message)
    const response = await dialogFlow.send(message)
    const botResponse = {
      message: 
        response.data.result.fulfillment.speech,
      displayName: 'Bot User',
      email: 'bot@we.com',
      createdAt: new Date().toISOString(),
      id: shortId.generate()
    }
    // pusher.trigger('chat-group', 'chat', botResponse)
    console.log('bot response', botResponse)
    var regExp = /\(([^)]+)\)/;
    if (botResponse.message.includes('destination')) {
      var matches = regExp.exec(botResponse.message);
      if (matches.length == 2) {
        var substrs = matches[1].split(',');
        destinationMap.set(substrs[0], substrs[1]);
      }
    }
    else if (botResponse.message.includes('budget')) {
      var matches = regExp.exec(botResponse.message);
      if (matches.length == 2) {
        var substrs = matches[1].split(',');
        budgetMap.set(substrs[0], substrs[1]);
      }
    }
    else if (botResponse.message.includes('source')) {
      var matches = regExp.exec(botResponse.message);
      if (matches.length == 2) {
        var substrs = matches[1].split(',');
        sourceMap.set(substrs[0], substrs[1]);
      }
    }
  }
  console.log('destination:', destinationMap);
  console.log('budget:', budgetMap);
  console.log('source:', sourceMap);

  for (var entry of sourceMap.entries()) {
    var person = entry[0];
    console.log('1');
    console.log(person);
    console.log(destinationMap.get(person));
    if (destinationMap.has(person)) {
      console.log('2');
      src = entry[1];
      dest = destinationMap.get(person);
      if (d1.has(dest)) {
        console.log('3');
        if (d1.get(dest).has(src)) {
          console.log('4');
          // do nothing
        }
        else {
          d1.get(dest).set(src, 0);
          console.log('5');
        }
      }
      else {
        console.log('6');
        d1.set(dest, new Map());
        d1.get(dest).set(src, 0);
      }
    }
    else {
      console.log('7');
    }
  }
  console.log(d1);
  res.send(chat);
})

app.post('/join', (req, res) => {
  const chat = {
    ...req.body,
    id: shortId.generate(),
    type: 'joined',
    createdAt: new Date().toISOString()
  }
  // trigger this update to our pushers listeners
  pusher.trigger('chat-group', 'chat', chat)
  res.send(chat)
})

app.listen(process.env.PORT || 2000, () => console.log('Listening at 2000'))

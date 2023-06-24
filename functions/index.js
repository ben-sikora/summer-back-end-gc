/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/*
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require('firebase-functions/params');
const { Configuration, OpenAIApi } = require("openai")

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld =
onRequest({ secrets: ["CHAT_GPT_API_KEY"] }, (request, response) => {
    const configuration = new Configuration({
        apiKey: process.env.CHAT_GPT_API_KEY,
    });
   logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });*/


const express = require("express");
const cors = require("cors");
const {onRequest} = require("firebase-functions/v2/https");
const {Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
  apiKey: process.env.CHAT_GPT_API_KEY,

});


const app = express();

const promptBeginning=
"Write a short detailed summary of the following thats"+
"no more than 2 sentences: \n \n";

const promptEnding= "\n \nSHORT DETAILED SUMMARY:";
app.use(express.json());
app.use(cors());

app.post("/upload-text", async (req, res) => {
  const text= req.body.input;
  const textArr= text.match(/(.|[\r\n]){1,6000}/g);
  let result=[];
  const openai = new OpenAIApi(configuration);
  const promises = textArr.map(async (comp) => {
    let promptSent="";
    promptSent = promptSent.concat(promptBeginning, comp, promptEnding);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: promptSent,
      temperature: .7,
      max_tokens: 500,
    });
    return response.data.choices[0].text;
  });
  result = await Promise.all(promises);
  const finalResult = result.join("");
  res.json({"response": finalResult});
});

app.get("/", (req, res) => {
  res.json({"response": "this is working"});
});

const api= onRequest({
  secrets: ["CHAT_GPT_API_KEY"],
  cors: true}, app);

module.exports = {
  api,
};

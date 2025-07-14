/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;
var msg = "";
var telefono = "";
var cuenta = "";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2)); // Log del payload completo

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // Número del remitente
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // Mensaje recibido
      let responding_number = req.body.entry[0].changes[0].value.metadata.display_phone_number; // Número al que responde

      // Mostrar en consola el número al que responde
      console.log("Número al que responde (display_phone_number):", responding_number);

      // Enviar mensaje de respuesta a través de la API de WhatsApp
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Ack: " + msg_body },
        },
        headers: { "Content-Type": "application/json" },
      });

      msg = msg_body;
      telefono = from;
      cuenta = phone_number_id;

      // Condicional para enviar los datos al servidor correspondiente
      if (responding_number === "346557467186") {
        // Enviar datos al otro servidor
        axios
          .post("https://glacier-truthful-heath.glitch.me/webhook", {
            msg: msg_body,
            phone: telefono,
            cuenta: cuenta,
            responding_number,
          })
          .then((response) => {
            console.log("Datos enviados al otro servidor exitosamente:");
            console.log("Respuesta del servidor:", response.data);
          })
          .catch((error) => {
            console.error("Error al enviar datos al otro servidor:", error.message);
          });
      } else {
        // Enviar datos al CRM
        request.post(
          {
            url: "https://www.sistemanacionaldeempleo.com/insertWhatsapp",
            form: { msg: msg_body, phone: telefono, cuenta: cuenta, responding_number },
          },
          function (err, httpResponse, body) {
            if (err) {
              console.error("Error al enviar datos al CRM:", err);
            } else {
              console.log("Datos enviados al CRM exitosamente:");
              console.log("Mensaje:", msg_body);
              console.log("Teléfono remitente:", telefono);
              console.log("Cuenta ID:", cuenta);
              console.log("Número al que responde:", responding_number);
            }
          }
        );
      }
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});



// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
app.get("/hola", (req, res) => {
  console.log(token);
  res.send(token);
});

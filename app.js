const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const app = express();
app.use(bodyParser.json());

app.use(express.static("public"));

const rabbitSettings = {
  protocol: "amqps",
  hostname: "localhost",
  port: 5672,
  username: "guest",
  password: "guest",
  vhost: "/",
};

const SUBMITTED_JOKES_QUEUE = "SUBMITTED_JOKES";

// Function to connect to RabbitMQ
async function connectToRabbitMQ() {
  const connection = await amqp.connect(rabbitSettings);
  const channel = await connection.createChannel();
  return { connection, channel };
}

// Endpoint to retrieve the joke UI and access the joke API
app.get(["/joke", "/joke/index.html"], async (req, res) => {
  const { channel } = await connectToRabbitMQ();
  const jokeType = req.query.type;
  let joke = null;

  // Fetch jokes until we find one that matches the requested type
  while (true) {
    const msg = await channel.get(SUBMITTED_JOKES_QUEUE, { noAck: false });
    if (msg) {
      joke = JSON.parse(msg.content.toString());
      if (joke.type === jokeType) {
        channel.ack(msg);
        break;
      }
    } else {
      break; // No more jokes in the queue
    }
  }

  if (joke) {
    res.json(joke);
  } else {
    res.json({ message: "No jokes available for this type" });
  }
});

// Endpoint to retrieve the submit UI and access the submit API
app.post(["/submit", "/submit/index.html"], async (req, res) => {
  // Example: Submit a joke to the queue
  const { channel } = await connectToRabbitMQ();
  const { joke, type } = req.body;
  const message = JSON.stringify({ joke, type });
  channel.sendToQueue(SUBMITTED_JOKES_QUEUE, Buffer.from(message));
  res.json({ message: "Joke submitted successfully" });
});

// Endpoint to retrieve the moderator UI and access the moderator API
app.get(["/mod", "/mod/index.html"], async (req, res) => {
  // Example: Fetch a joke from the queue for moderation
  const { channel } = await connectToRabbitMQ();
  const msg = await channel.get(SUBMITTED_JOKES_QUEUE, { noAck: false });
  if (msg) {
    const joke = JSON.parse(msg.content.toString());
    channel.ack(msg);
    // Send the joke to the client
    res.json(joke);
  } else {
    res.json({ message: "No jokes available for moderation" });
  }
});

app.listen(4000, () => {
  console.log("RabbitMQ microservice listening on port 4000");
});

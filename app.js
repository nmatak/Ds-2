const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const port = 4000;
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("public"));
app.use('/moderate-microservice', express.static('path/to/moderate-microservice'));

const queue = "SUBMITTED_JOKES";
const uniqueJokeTypes = new Set(); // Step 1: Define a Set to store unique joke types

// Function to connect to RabbitMQ
const connectToRabbitMQ = async () => {
 let connection;
 let channel;
 try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
    console.log("Connection established!");
 } catch (err) {
    console.warn(err);
 }
 return { channel }; // Return the channel object
};

// Endpoint to retrieve the joke UI and access the joke API
app.get(["/joke", "/joke/index.html"], async (req, res) => {
 const { channel } = await connectToRabbitMQ();
 const jokeType = req.query.type;
 let joke = null;

 // Fetch jokes until we find one that matches the requested type
 while (true) {
    const msg = await channel.get(queue, { noAck: false });
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
    res.json({
      setup: joke.setup,
      punchline: joke.punchline,
      type: joke.type
    });
 } else {
    res.json({ message: "No jokes available for this type" });
 }
});

// Endpoint to submit a joke to the queue
app.post(["/sub", "/sub/index.html"], async (req, res) => {
 const { channel } = await connectToRabbitMQ();
 const { setup, punchline, type } = req.body;
 const message = JSON.stringify({ setup, punchline, type });
 channel.sendToQueue(queue, Buffer.from(message));
 uniqueJokeTypes.add(type); // Step 2: Add the joke type to the set
 res.json({ message: "Joke submitted for moderation" });
});

// Endpoint to add a new joke type
app.post("/addType", async (req, res) => {
  const { type } = req.body;
  if (type) {
      uniqueJokeTypes.add(type);
      res.json({ message: "New joke type added successfully" });
  } else {
      res.status(400).json({ message: "Type is required" });
  }
});

// Endpoint to moderate a joke
app.post(["/mod", "/mod/index.html"], async (req, res) => {
 const { channel } = await connectToRabbitMQ();
 const { setup, punchline, type } = req.body;
 // Placeholder for moderation process
 const moderatedSetup = setup; // Moderate setup here
 const moderatedPunchline = punchline; // Moderate punchline here
 const message = JSON.stringify({ setup: moderatedSetup, punchline: moderatedPunchline, type });
 channel.sendToQueue(queue, Buffer.from(message));
 uniqueJokeTypes.add(type); // Step 2: Add the joke type to the set
 res.json({ message: "Joke moderated and submitted" });
});

// New endpoint to retrieve all unique joke types
app.get("/types", (req, res) => {
 res.json({ types: Array.from(uniqueJokeTypes) });
});

app.listen(port, () => {
 console.log(`Server running at http://localhost:${port}`);
});

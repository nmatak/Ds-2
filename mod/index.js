document.addEventListener('DOMContentLoaded', function() {
    const submitJokeButton = document.getElementById('submitJoke');
    const deleteJokeButton = document.getElementById('deleteJoke');
    const addNewTypeButton = document.getElementById('addNewType');

    submitJokeButton.addEventListener('click', async function() {
        const setup = document.getElementById('moderateSetup').value;
        const punchline = document.getElementById('moderatePunchline').value;
        const jokeType = document.getElementById('jokeType').value;
        const joke = { setup, punchline, type: jokeType };

        // Send the joke to RabbitMQ
        await sendJokeToRabbitMQ(joke);
    });

    deleteJokeButton.addEventListener('click', async function() {
        await deleteJokeFromRabbitMQ();
    });

    addNewTypeButton.addEventListener('click', function() {
        const jokeTypeSelect = document.getElementById('jokeType');
        const newOption = document.createElement('option');
        newOption.value = 'newType'; // Set a unique value for the new option
        newOption.text = 'New Type'; // Set the display text for the new option
        jokeTypeSelect.add(newOption); // Add the new option to the select element
    });
});

async function sendJokeToRabbitMQ(joke) {
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'MODERATED_JOKES';
    const message = JSON.stringify(joke);

    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log("Joke sent to RabbitMQ");
}

async function deleteJokeFromRabbitMQ() {
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'MODERATED_JOKES';

    // Fetch the joke from the queue without acknowledging it
    const msg = await channel.get(queue, { noAck: true });
    if (msg) {
        console.log("Joke deleted from RabbitMQ");
    } else {
        console.log("No jokes available in the queue");
    }
}

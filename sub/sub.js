document.addEventListener('DOMContentLoaded', function() {
    // Assuming you have input fields with IDs 'moderateSetup' and 'moderatePunchline'
    const moderateSetupInput = document.getElementById('moderateSetup');
    const moderatePunchlineInput = document.getElementById('moderatePunchline');

    // Listen for the click event on the "Submit Joke" button
    document.querySelector('.submitJoke').addEventListener('click', function() {
        // Retrieve the values from the joke setup and punchline input fields
        const jokeSetup = document.getElementById('jokeSetup').value;
        const jokePunchline = document.getElementById('jokePunchline').value;

        // Update the moderate joke fields with the retrieved values
        moderateSetupInput.value = jokeSetup;
        moderatePunchlineInput.value = jokePunchline;
    });
});

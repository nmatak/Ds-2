document.addEventListener('DOMContentLoaded', function() {
    const getJokeButton = document.getElementById('getJoke');
    const jokeTypeSelect = document.getElementById('jokeType');
    const jokeContainer = document.getElementById('jokeContainer');

    getJokeButton.addEventListener('click', async function() {
        const jokeType = jokeTypeSelect.value;
        const joke = await fetchJokeByType(jokeType);
        displayJoke(joke);
    });
});

async function fetchJokeByType(jokeType) {
    const response = await fetch(`/joke?type=${jokeType}`);
    if (response.ok) {
        const joke = await response.json();
        return joke;
    } else {
        console.error('Failed to fetch joke:', response.statusText);
        return null;
    }
}

function displayJoke(joke) {
    if (joke) {
        jokeContainer.innerHTML = `
            <div class="joke-setup">${joke.setup}</div>
            <div class="joke-punchline">${joke.punchline}</div>
        `;
    } else {
        jokeContainer.innerHTML = '<p>No jokes available for this type.</p>';
    }
}

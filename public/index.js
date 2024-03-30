document.addEventListener("DOMContentLoaded", function () {
  const getJokeButton = document.getElementById("getJoke");
  const jokeTypeSelect = document.getElementById("jokeType");
  const jokeContainer = document.getElementById("jokeContainer");
  console.log("DOM fully loaded and parsed");
  // Fetch joke types on page load
  fetchJokeTypes();

  if (getJokeButton) {
    getJokeButton.addEventListener("click", async function () {
      const jokeType = jokeTypeSelect.value;
      const joke = await fetchJokeByType(jokeType);
      displayJoke(joke);
    });
  }

  // Check if elements exist before adding event listeners
  if (document.getElementById("submitJoke")) {
    document
      .getElementById("submitJoke")
      .addEventListener("click", submitModJoke);
  }
  if (document.getElementById("submitSubJoke")) {
    document
      .getElementById("submitSubJoke")
      .addEventListener("click", submitSubJoke);
  }
  if (document.getElementById("submitAnotherSubJoke")) {
    document
      .getElementById("submitAnotherSubJoke")
      .addEventListener("click", submitAnotherSubJoke);
  }
  if (document.getElementById("addNewType")) {
    document
      .getElementById("addNewType")
      .addEventListener("click", function () {
        // Your existing code for adding a new type
      });
  }
  if (document.getElementById("submitAnotherModJoke")) {
    document
      .getElementById("submitAnotherModJoke")
      .addEventListener("click", submitAnotherModJoke);
  }

  // Check both localStorage and sessionStorage for a submitted joke
  const localSubmittedJoke = localStorage.getItem("submittedJoke");
  const sessionSubmittedJoke = sessionStorage.getItem("submittedJoke");

  // Use the first non-null value found
  const submittedJoke = localSubmittedJoke || sessionSubmittedJoke;

  if (submittedJoke) {
    const joke = JSON.parse(submittedJoke);
    document.getElementById("jokeType").value = joke.type;
    document.getElementById("moderateSetup").value = joke.setup;
    document.getElementById("moderatePunchline").value = joke.punchline;
  }
});

async function fetchJokeTypes() {
  try {
    const response = await fetch("http://localhost:4000/types");
    if (response.ok) {
      const data = await response.json();
      const jokeTypeSelect = document.getElementById("jokeType");
      data.types.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        jokeTypeSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch joke types:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching joke types:", error);
  }
}
async function fetchJokeByType(jokeType) {
  try {
    const response = await fetch(
      `http://localhost:4000/joke?type=${encodeURIComponent(jokeType)}`
    );
    if (response.ok) {
      const data = await response.json();
      console.log("Fetched joke:", data); // Log the fetched joke data
      return data;
    } else {
      console.error("Failed to fetch joke:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching joke:", error);
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
    jokeContainer.innerHTML = "<p>No jokes available for this type.</p>";
  }
}

function submitModJoke() {
  const jokeType = document.getElementById("jokeType").value;
  const setup = document.getElementById("moderateSetup").value;
  const punchline = document.getElementById("moderatePunchline").value;

  const joke = {
    type: jokeType,
    setup: setup,
    punchline: punchline,
  };

  // Submit joke to server
  fetch("http://localhost:4000/sub", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(joke),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
      // Clear session storage and reset fields
      sessionStorage.removeItem("submittedJoke");
      document.getElementById("jokeType").value = "";
      document.getElementById("moderateSetup").value = "";
      document.getElementById("moderatePunchline").value = "";

      // Hide container 1 and show container 2
      const container1 = document.getElementById("container");
      const container2 = document.getElementById("container2");
      container1.style.display = "none";
      container2.style.display = "block";
    })
    .catch((error) => console.error("Error submitting joke:", error));
}

function submitAnotherModJoke() {
  const container1 = document.getElementById("container");
  const container2 = document.getElementById("container2");
  document.getElementById("modh1").innerText = "Waiting for new Joke";
  const setup = document.getElementById("moderateSetup");
  const punchline = document.getElementById("moderatePunchline");
  setup.value = "";
  punchline.value = "";
  container1.style.display = "block";
  container2.style.display = "none";
}

document
  .getElementById("submitModJoke")
  .addEventListener("click", submitModJoke);

document
  .getElementById("submitAnotherModJoke")
  .addEventListener("click", submitAnotherModJoke);

document.getElementById("addNewType").addEventListener("click", function () {
  // Create a new input field for the joke type
  const newTypeInput = document.createElement("input");
  newTypeInput.type = "text";
  newTypeInput.id = "newType"; // Ensure this id is unique
  newTypeInput.placeholder = "Add a new joke type";
  newTypeInput.style.padding = "20px 20px";
  newTypeInput.style.fontSize = "16px";
  newTypeInput.style.backgroundColor = "#007bff";
  newTypeInput.style.color = "#fff";
  newTypeInput.style.outline = "none";
  newTypeInput.style.border = "none";
  newTypeInput.style.backgroundColor = "white";
  newTypeInput.style.marginLeft = "3px";
  newTypeInput.style.marginBottom = "10px";
  newTypeInput.style.marginTop = "10px";
  newTypeInput.style.width = "100%";
  newTypeInput.style.color = "black";
  newTypeInput.style.position = "relative";

  // Insert the new input field before the existing setup input field
  const existingSetupInput = document.getElementById("moderateSetup");
  existingSetupInput.parentNode.insertBefore(newTypeInput, existingSetupInput);

  // Add event listener to the input field to capture its value
  newTypeInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      // Check if the value is not empty or just whitespace
      fetch("http://localhost:4000/addType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: this.value }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(this.value);
          // Optionally, refresh the joke types dropdown
          console.log("Type added successfully");
        })
        .catch((error) => console.error("Error adding new type:", error));
    }
  });
});

function submitSubJoke() {
  console.log("submitSubJoke called");
  const jokeType = document.getElementById("jokeType").value;
  const setup = document.getElementById("moderateSubSetup").value;
  const punchline = document.getElementById("moderateSubPunchline").value;

  const joke = {
    type: jokeType,
    setup: setup,
    punchline: punchline,
  };

  // Store joke data in localStorage
  localStorage.setItem("submittedJoke", JSON.stringify(joke));
  alert("Joke Submitted Successfully!");
  console.log("Joke Submitted Successfully!");

  const container1 = document.getElementById("container");
  const container2 = document.getElementById("container2");
  container1.style.display = "none";
  container2.style.display = "block";
}
document
  .getElementById("submitSubJoke")
  .addEventListener("click", submitSubJoke);

function submitAnotherSubJoke() {
  const container1 = document.getElementById("container");
  const container2 = document.getElementById("container2");
  document.getElementById("subh1").innerText = "Waiting for new Joke";
  document.getElementById("moderateSubSetup").value = "";
  document.getElementById("moderateSubPunchline").value = "";

  container1.style.display = "block";
  container2.style.display = "none";
}

// Ensure this event listener is only added once
document
  .getElementById("submitAnotherSubJoke")
  .addEventListener("click", submitAnotherSubJoke);

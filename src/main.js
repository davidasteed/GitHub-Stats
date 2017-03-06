// do basic validation and store command-line arguments
let argument1, argument2;

if (process.argv[2]) {
  argument1 = process.argv[2];
} else {
  console.log("Please enter a username");
  return;
}

// NOTE testing
// build the complete GitHub user url by concatenation
let githubURL = 'https://api.github.com/users/';
githubURL += argument1;

// store the GitHub personal access token
if (process.argv[3]) {
  argument2 = process.argv[3];
} else {
  console.log("Please enter an API key");
  return;
}

// fetch from GitHub
let fetch = require("node-fetch");

// fetch the /users/:username endpoint
let promiseUsername = fetch(
  githubURL,
  {
    method: "GET",
    header: {
      Authorization: "token " + process.argv[3]
    }
  }
)

// do work on the return object
promiseUsername.then(function handleResponse(responseObj) {

  // NOTE: testing
  console.log("Debug:  The username responseObj contains:", responseObj.status);

  // do basic validation on the HTTP status code contained in the responseObj
  if (responseObj.status > 199 && responseObj.status < 300) {
    // The first promise was met, and HTTP response code indicates a potentially successful return object.
    //
    // Make a new promise:  store the raw text in JSON format,
    // and only process the then() function if that promise is met:
    // printData() will check print the username and location if specified
    responseObj.json().then(
      function printData(returnObject){
        if(returnObject.name) {
          console.log("\nActual name: ", returnObject.name);
        } else {
          console.log("Actual name: not specified");
        }

        if(returnObject.location) {
          console.log("Location: ", returnObject.location);
        } else {
          console.log("Location: not specified");
        }
      }
    );
  } else {
    console.log("\nFailed to retrieve username and location:");
    console.log("HTTP response code ", responseObj.status, " was received from the server");
  }
});


// perform new promise/fetch to derive an answer for "List the repo they own with the most stars"
let githubURLSuffix = "/repos";
let promiseRepo = fetch (
  githubURL + githubURLSuffix,
  {
    method: "GET",
    header: {
      Authorization: "token " + process.argv[3]
    }
  }
)

// confirm if the fetch for the repo was successful
promiseRepo.then(
  function handleRepo(repoObj) {
    console.log("Debug:  The promiseRepo fetch return a status code of", repoObj.status);
    if (repoObj.status > 199 && repoObj.status < 300) {
      // do work
      console.log("\n");
    } else {
      console.log("\nFailed to determine which owned repository had the most stars: ");
      console.log("HTTP response code ", repoObj.status, " was received from the server");
    }


  }
);

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
          console.log("\nActual name: not specified");
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
    if (repoObj.status > 199 && repoObj.status < 300) {
      // start new promise to attempt to convert the response Object into JSON format
      // and only process the then() if the promise is kept
      repoObj.json().then(
        function workOnRepo(repoObject){
          // algorithm:
          // copy the stargazers_count into their own array, and determine the max values
          let allStargazers_Count = [];
          for (let i = repoObject.length - 1; i >= 0; i--) {
            allStargazers_Count.push(repoObject[i].stargazers_count)
          }

          function getMaxOfArray(thisArray) {
            return Math.max.apply(null, thisArray);
          }

          let maxStargazers_Count = getMaxOfArray(allStargazers_Count);

          // then loop over the repoObject and match on that max value,
          // and then pull the corresponding repo name into an array
          let matchingRepos = [];
          for (let i = repoObject.length - 1; i >= 0; i--) {
            if (repoObject[i].stargazers_count === maxStargazers_Count) {
              matchingRepos.push(repoObject[i].name)
            }
          }

          // (to provide for chance that more than one repo has the same # of stargazers_count
          // NOTE:  we need to format the output to account for zero stars
          console.log("\nThe highest count of stars awarded to a repository is ", maxStargazers_Count), ",";
          console.log("and the following repositories matched this count:");
          matchingRepos.forEach(
            function printName(thisElement) {
              console.log(thisElement);
            }
          );

            // Question 3:  "For the repo they own with the most stars, print out EACH CONTRIBUTOR'S login ."
            // This question relies upon the previous promise/then object still being accessible
            // NOTE:  we need to loop over all matchingRepos, not just the first

            let basicPrefix = "https://api.github.com";
            let contribPrefix = "/repos/";
            let contribSuffix = "/contributors";

            console.log("\nDebug: The URL to fetch is: ", basicPrefix + contribPrefix + argument1 + "/" + matchingRepos[0] + contribSuffix);
            let promiseContributor = fetch(
              basicPrefix + contribPrefix + argument1 + "/" + matchingRepos[0] + contribSuffix,
              {
                method: "GET",
                header: {
                  Authorization: "token " + process.argv[3]
                }
              }
            );

            for (let i = matchingRepos.length - 1; i >= 0; i--) {
            promiseContributor.then(
              function handleResponse(contribObj) {
                if (contribObj.status > 199 && contribObj.status < 300) {
                  // start new promise to convert to JSON format
                  contribObj.json().then(
                    function contribPeek(currentObj){
                      console.log("Debug: the object contains: ", currentObj);

                      // print each each contributor's logion
                      console.log("Debug:  the login is: ", currentObj[i].login);
                      console.log("\nFor the", matchingRepos[i], "repository,");
                      for (let j = currentObj.length - 1; j >= 0; j--) {
                          console.log("the login name for each contributor is: ", currentObj[j].login);
                      }
                    }
                  );
                } else {
                console.log("\nFailed to determine the contributor with the second-most contributors");
                console.log("HTTP response code", contribObj.status, " was received from the server");
              }
          } // end of promise contributor internal function
        );
        } // end loop here

      }
      );

    } else {
      console.log("\nFailed to determine which owned repository had the most stars: ");
      console.log("HTTP response code ", repoObj.status, " was received from the server");
    }
  }
);

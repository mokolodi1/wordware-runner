// test/script.js

import WordwareRunner from 'wordware-runner'

// This is for Teo, the creator of In Town as a test of his own use case (the reason this was created).
// Context: intown.at/teo
if (process.env.IN_TOWN_BOT_ID) {
  console.log("Running In Town bot...");
  const travelPlansData = {
    inputs: {
      raw_travel_plans: "SF Jan 11 to Feb 16, Cancun until March 2, then NYC",
      current_location: {
        short_name: "NYC",
        long_name: "New York City",
        id: 1,
        google_place_feature_type: "city"
      },
      home_location: {
        google_place_feature_type: "city",
        place_id: 1,
        long_name: "New York City",
        short_name: "NYC"
      }
    },
    version: "^1.0"
  };

  const wordwareRunner = new WordwareRunner(process.env.WORDWARE_API_KEY, process.env.IN_TOWN_BOT_ID);

  const result = await wordwareRunner.run(travelPlansData);
  console.log("In Town bot returned with: ", JSON.parse(result.outputs[result.outputs.length - 1].output));
}

// A simple wikipedia bot that looks up the term "Roman empire"
console.log("Running Wikipedia bot...");
const wikipediaBot = new WordwareRunner(process.env.WORDWARE_API_KEY, "c046a7b1-3e4f-4429-a003-a92d5f212bbc")
const wikipediaResult = await wikipediaBot.run({ inputs: { term: "Roman empire" } });
console.log("Wikipedia bot returned with: ", wikipediaResult);

// A simple bot that says "tell me about..." and generates with GPT4
console.log("Running Tell Me About bot...");
const tellMeAboutBot = new WordwareRunner(process.env.WORDWARE_API_KEY, "935c9b0c-6d03-4f3e-9907-feae489e83d6")
let updateCount = 0;
const tellMeAboutResult = await tellMeAboutBot.run({ inputs: { term: "Roman empire" } }, (type, intermediateResult) => {
  updateCount++;
  if (updateCount % 100 === 0) {
    console.log("Latest Tell Me About output so far: ```\n", intermediateResult.outputs[intermediateResult.outputs.length - 1].output, "\n```");
  }
});
console.log("Tell Me About bot returned with: ", tellMeAboutResult);

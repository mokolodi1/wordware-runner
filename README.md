# Wordware Runner

This allows you to run Wordware apps.

I expect this package to be a stop-gap measure until Wordware comes out with an official Javascript package.

## Examples

### Tell me about... bot

This bot is a simple bot that says "tell me about..." and generates with GPT4.

```js
const tellMeAboutBot = new WordwareRunner(process.env.WORDWARE_API_KEY, "935c9b0c-6d03-4f3e-9907-feae489e83d6")

// Print out the current output every 100 chunks
let updateCount = 0;
const tellMeAboutResult = await tellMeAboutBot.run({ inputs: { term: "Roman empire" } }, (type, intermediateResult) => {
  updateCount++;
  if (updateCount % 100 === 0) {
    console.log("Latest Tell Me About output so far: ", intermediateResult.outputs[0].output);
  }
});

// In this case, we know there's only one output, so just access it directly
console.log("Tell Me About bot returned with: ", tellMeAboutResult.outputs[0].output);
```

## Limitations

I've built this out for my specific current use case. Please feel free to reach out or make changes as you see fit with a PR.

### Known limitations

- Only works with a single prompt (not sure if multiple "prompt" values are possible)

## Development

To test locally:

```bash
cd test

# IN_TOWN_BOT_ID is optional - the tests will run without that test if you're someone other than an In Town employee
# Generate your own WORDWARE_API_KEY at https://app.wordware.ai
IN_TOWN_BOT_ID=XXX WORDWARE_API_KEY=XXX node script.js
```

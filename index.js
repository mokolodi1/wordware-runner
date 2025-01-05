class WordwareRunner {
  constructor(apiKey, appId) {
    this.apiKey = apiKey;
    this.appId = appId;
  }

  async run(inputs, intermediateUpdate = null) {
    // Don't do anything if it's not a function
    if (typeof intermediateUpdate !== "function") {
      if (intermediateUpdate) {
        console.warn("Intermediate update is not a function, but is not null. Ignoring it.");
      }
      intermediateUpdate = (type, intermediateResult) => {};
    }

    return new Promise(async (resolve, reject) => {
      const response = await fetch(`https://app.wordware.ai/api/released-app/${this.appId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
      });

      const result = {
        isDone: false,
        outputs: [],
      }
      const lastOutput = () => { return result.outputs[result.outputs.length - 1] }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (reader) {
        let done = false;

        let unparsedRemainder = "";
        while (!done) {
          const { done: innerDone, value: readValue } = await reader.read();
          let decoded = decoder.decode(readValue, { stream: !innerDone });

          if (unparsedRemainder !== "") {
            decoded = unparsedRemainder + decoded;
            unparsedRemainder = "";
          }

          const lines = decoded.split("\n");
          for (const line of lines) {
            if (line.trim() === "") {
              continue;
            }
            
            // Try to parse the line as JSON, otherwise keep reading until we can
            // NOTE: this is very much not robust, but it's good enough for now
            let parsedValue;
            try {
              parsedValue = JSON.parse(line);
              unparsedRemainder = "";
            } catch (e) {
              unparsedRemainder = line;
              continue;
            }

            if (parsedValue["type"] !== "chunk") {
              console.warn("Type is not chunk: ", parsedValue);
              continue;
            }

            if (parsedValue["type"] === "chunk") {
              const chunkValue = parsedValue["value"];

              if (chunkValue["type"] === "chunk") {
                if (result.outputs.length === 0) {
                  console.warn("No output started before chunk received");
                  continue;
                }

                lastOutput().output += chunkValue["value"];

                intermediateUpdate("chunk", result);
              } else if (chunkValue["type"] === "generation") {
                if (chunkValue["state"] === "start") {
                  result.outputs.push({
                    hasCompleted: false,
                    label: chunkValue["label"],
                    isStructured: chunkValue["isStructured"],
                    label: chunkValue["label"],
                    id: chunkValue["id"],
                    output: "",
                  });
                } else if (chunkValue["state"] === "done") {
                  lastOutput().hasCompleted = true;
                } else {
                  console.warn("Unknown generation state: ", chunkValue["state"]);
                  continue;
                }

                intermediateUpdate("generation", result);
              } else if (chunkValue["type"] === "prompt") {
                if (chunkValue["state"] === "start") {
                  if (result.outputs.length !== 0) {
                    throw new Error("More than one prompt started - currently the tool only supports one prompt");
                  }

                  // NOTE: no intermediate update if prompt started
                  continue;
                } else if (chunkValue["state"] === "complete") {
                  if (!lastOutput().hasCompleted) {
                    console.warn("Prompt completed before output completed");
                  }

                  // TODO: do we do anything with the outputs?
                } else {
                  console.warn("Unknown prompt state: ", chunkValue["state"]);
                  continue;
                }

                intermediateUpdate("prompt", result);
              } else if (chunkValue["type"] === "outputs") {
                // TODO: do we do anything with the outputs?
              } else if (chunkValue["type"] === "code") {
                result.outputs.push({
                  hasCompleted: true,
                  label: chunkValue["label"],
                  isStructured: false,
                  logs: chunkValue["logs"],
                  output: chunkValue["output"],
                  id: chunkValue["id"],
                  error: chunkValue["error"],
                });
              } else {
                console.warn("Unknown chunk type: ", chunkValue["type"], chunkValue);
              }
            } else {
              console.warn("Type of top-level line is not chunk: ", parsedValue);
            }
          }

          done = innerDone;
        }

        result.isDone = true;
        intermediateUpdate("done", result);
        
        resolve(result);
      }
    });
  }
}


module.exports = WordwareRunner

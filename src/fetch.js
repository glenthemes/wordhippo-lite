const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const port = 3000;
const output_url = "/:word"
const WordHippo = require('wordhippo')

app.use(cors());

// HOMEPAGE [1/2]: show stuff (or lackthereof)
app.use(express.static(path.join(__dirname, "../dist")));

// HOMEPAGE [2/2]
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get(output_url, async (req, res) => {
  try {
    let word = req.params.word;

    WordHippo.getWord(word).then(wordObj => {
      // auto fallback to error msg if word doesn't exist
      // fill all keys (e.g. syn/ant) with the error msg so that's all the user sees
      let errorText = "An error occurred. Please double-check your spelling and try again!"
      let wordRes = {
        definition: errorText,
        related: errorText,
        opposites: errorText,
        sentences: errorText,
        isError: true
      }

      // if the word exists, it will ALWAYS have a "definition" key
      if(typeof wordObj == "object"){
        if(wordObj.definition && wordObj.definition !== ""){
          wordRes = wordObj
        }
      }

      res.send(wordRes)
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// start server/port/localhost
app.listen(port, () => {
  console.log(`localhost:${port}`)
})

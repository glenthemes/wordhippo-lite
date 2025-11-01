document.addEventListener("DOMContentLoaded", () => {
  /*-------- BASIC FUNCS  --------*/
  // get root
  let getRoot = VAR => getComputedStyle(document.documentElement).getPropertyValue(VAR).trim().replace(/^['"]|['"]$/g,"");

  // set root
  let setRoot = (VAR_NAME, VAR_VAL) => {
    document.documentElement.style.setProperty(VAR_NAME,VAR_VAL);
  }

  // get speed (ms/s -> int)
  let getSpeed=e=>{let r,t=Number(e.replace(/[^\d\.]*/g,""));return"s"==e.toLowerCase().replace(/[^a-z]/g,"")?1000*t:t};

  const container = document.querySelector(".container")
  const form = document.getElementById("hippo-form")
  const textField = form.querySelector("input#word")
  const loading = form.querySelector(".loading")
  const res_area = document.querySelector(".result-area")

  const fadeSpeed = getSpeed(getRoot("--Loading-Fade-Speed")) || 250

  // when empty == invalid word / fetch not complete
  // when NOT empty == word found / fetch complete
  let currentWord = ""
  let currentObj = {}
  
  /*-------- FORM SUBMIT --------*/
  form.addEventListener("submit", e => {
    e.preventDefault()

    let whatWord = textField.value
    let getWhatTemp = form.querySelector(`input[name="p"]:checked`)?.value // if user clicks another radio, this will be overriden

    // clean the word
    whatWord = whatWord.trim()
    whatWord = whatWord.includes(" ") ? whatWord.split(" ")[0] : whatWord
    textField.value = whatWord // update text field value with cleaned version (e.g. "rock bottom" -> simply "rock")

    // NOTE TO SELF: the next bit (clear res + show loading) was wrapped in:
    // if(whatWord !== currentWord)
    // but i took it out bc it didn't work in the first place
    
    // clear results area
    res_area.classList.remove("vis")
    setTimeout(() => {
      res_area.textContent = ""
    },fadeSpeed)

    // show "loading..."
    loading.classList.add("vis")

    setTimeout(() => {
      fetch(`/${whatWord}`)
      .then(r => r.json())
      .then(hippo_result => {
        let res = hippo_result

        currentWord = whatWord
        currentObj = res

        showStuff({
          obj: currentObj,
          type: getWhatTemp
        })
      })//end fetch
      .catch(err => console.error(err));
    },fadeSpeed)

  })//end submit

  /*-------- ON CHANGE --------*/
  // def / syn / ant / sentences
  let radios = form.querySelectorAll(`input[name="p"]`)
  radios?.forEach(radio => {
    radio.addEventListener("change", () => {
      if(currentWord !== "" && Object.keys(currentObj).length){
        // hide results area
        res_area.classList.remove("vis")

        setTimeout(() => {
          // clear current area
          res_area.textContent = ""
        },fadeSpeed)

        // make sure the text field (i.e. user types in the word) is NOT empty
        // in the case that they clear the text field, but click another radio
        // otherwise it'll look like it's giving e.g. synonyms for an empty word
        if(res_area.innerHTML.trim() !== ""){
          textField.value = currentWord
        }

        if(res_area.innerHTML.trim() !== ""){
          setTimeout(() => {
            showStuff({
              obj: currentObj,
              type: radio.value
            })
          },fadeSpeed)
        }

        
      }//end: only show (or change) results if fetch has been completed
    })//end radio onChange
  })//end radios forEach

  /*-------- SHOW STUFF --------*/
  // show (e.g. syn/ant) based on chosen radio opt
  function showStuff(stuff){
    let json = stuff.obj
    let type = stuff.type
    
    // definition
    if(type == "definition"){
      let def = json.definition
      let p = document.createElement("p")
      json.isError && json.isError === true ? p.classList.add("error-msg") : null
      p.classList.add("def")

      // prepend word as BOLD (as long as it's not an error)
      if(!(json.isError && json.isError === true)){
        p.innerHTML = def.slice(-1) !== "." ? `<b>${json.word}:</b> ${def}.` : `<b>${json.word}:</b> ${def}`
      }

      res_area.append(p)
    }

    // synonyms
    else if(type == "related"){
      let syns = json.related
      if(Array.isArray(syns)){
        for(let syn of syns){
          let tile = document.createElement("span")
          tile.classList.add("syn")
          tile.textContent = syn
          res_area.append(tile)
        }
      } else { res_area.textContent = syns } // fallback if it's a string not an array
    }

    // antonyms
    else if(type == "opposites"){
      let ants = json.opposites
      if(Array.isArray(ants)){
        for(let ant of ants){
          let tile = document.createElement("span")
          tile.classList.add("ant")
          tile.textContent = ant
          res_area.append(tile)
        }
      } else { res_area.textContent = ants } // fallback if it's a string not an array
    }

    // sentences
    else if(type == "sentences"){
      let sentences = json.sentences
      if(Array.isArray(sentences)){
        for(let sentence of sentences){
          // show sentences that aren't the "Show More Sentences" wordhippo button
          if(sentence !== "Show More Sentences"){
            let para = document.createElement("p")
            para.classList.add("sentence")
            para.innerHTML = sentence.replaceAll(json.word,`<b>${json.word}</b>`) // bold current word in sentences
            res_area.append(para)
          }
        }
      } else { res_area.textContent = sentences } // fallback if it's a string not an array
    }

    // fallback: anything else
    else {
      res_area.textContent = "An error occurred. Please double-check your spelling and try again."
    }

    // LASTLY [1/2]: hide "loading..."
    loading.classList.remove("vis")

    // LASTLY [2/2]: show results area
    setTimeout(() => {
      res_area.classList.add("vis")
    },fadeSpeed)
    
  }//end showStuff func

  /*-------- FORM RESET --------*/
  form.addEventListener("reset", e => {
    // clear results area
    res_area.classList.remove("vis")
    setTimeout(() => {
      res_area.textContent = ""
    },fadeSpeed)
    
  })
})//end DOMContentLoaded

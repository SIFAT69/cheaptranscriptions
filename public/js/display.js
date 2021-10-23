
  // TODO:
  // custom confidence thresholds
  // add playback editing for low confidence words
  //    - audio playback (start/ stop/ speed)
  //    - shifting input on red words as they come up in speech
  //        - time dependent or in sequence
  // add custom speaker naming
  //    - and toggle live speaker during playback
  // improve speaker recognition/ correction
  // add toggle options
  // add error messages
  // adapt for when speaker detection is not enabled
  // create a form to find and replace speaker names
  // delete content div when new transript is loaded
  // create info box like this: https://codepen.io/Shokeen/pen/XXggZr
  // add autoscroll playback option
  // add infobox


  // load audio from file or url
  function getAudioUrl() {
    var audioUrl = document.getElementById("audioUrl").value;
    document.getElementById("audio").src = audioUrl;
  }


  function displayTranscript() {
    // clear any previous text from transcript box
    // the below clears but doesn't display the new data
    // document.getElementById("content").innerHTML = "";

    // get json transcript filename from user input (default transcript.json)
    var userFilename = document.getElementById("user-filename").value;
    var json = userFilename;
    


    $.getJSON(json, function(data) {
      // data is the JSON string
      var results = data.results;
      var transcript_raw = JSON.stringify(results.transcripts[0].transcript);
      

      // create an array of start times for each speaker
      var speaker_times = [];
      var segments = results.speaker_labels.segments;
      for (var i = 0; i < segments.length; i++) {
        speaker = [];
        speaker.push(segments[i].speaker_label);
        speaker.push(segments[i].start_time);
        speaker_times.push(speaker);
      };

      // assign variables for use in for loop below
      var text = "";
      var speaker_counter = 0;
      var new_speaker = "";

      // loop through and append each word
      for (var i = 0; i < results.items.length; i++) {
        // get data from JSON string
        word = results.items[i].alternatives[0].content;
        confidence = results.items[i].alternatives[0].confidence;
        word_start_time = results.items[i].start_time;
        type = results.items[i].type;

        // ensure punctuation characters don't have spaces before them
        if (type == "pronunciation") {
          space = " ";
        } else if (type == "punctuation") {
          space = "";
        };

        // make sure first word has a speaker - may be unecessary
        if (i == 0) {
          // find out and set the speaker counter for the first word
          while (Number(speaker_times[speaker_counter][1]) < Number(word_start_time)) {
            speaker_counter++;
          };
          // changed
          //speaker_counter = speaker_counter - 1;

          //TODO deal with: Uncaught TypeError: Cannot read property '0' of undefined

          new_speaker = speaker_times[speaker_counter][0];
          $('.speaker').before("<span class='speaker-header'>Speaker " + speaker_counter + ":</span>");
          $('.speaker').before("<br><br>");
        };

        // add line break if speaker changes
        if ((speaker_counter < speaker_times.length) && (i != 0)) {
          if (Number(speaker_times[speaker_counter][1]) < Number(word_start_time)) {
            // TODO only display if speaker changes for less than a specified amount of time
            // default minumum time set to 1 sec
            var min_time = 2;
            if (speaker_times[speaker_counter + 1] && (Number(speaker_times[speaker_counter + 1][1]) - Number(speaker_times[speaker_counter][1]) > min_time)) {

              // only display if speaker has actually changed
              if (new_speaker != speaker_times[speaker_counter][0]) {
                new_speaker = speaker_times[speaker_counter][0];
                var printspeaker = new_speaker.split('_')[1];
                $('.speaker').before("<br><br>");
                $('.speaker').before("<span style='font-weight: bold'>Speaker " + printspeaker + ":</span>");
                $('.speaker').before("<br><br>");
              };
            };
            speaker_counter++;
          };
        };

        // print each word
        text = space + word;

        // appeand text to speaker div
        // if confidence if below 90% color word red
        if ((confidence > 0.95) || (type == "punctuation")) {
          $('.speaker').before(text);
        } else if ((confidence > 0.90) || (type == "punctuation")) {
          $('.speaker').before("<span class='l95'>" + text + "</span>");
        } else {
          $('.speaker').before("<span class='l90'>" + text + "</span>");
        };



        //for (var i = 0; i < speaker_times.length; i++) {
        //console.log(speaker_times[i]);
        //}

      };

      var obj = JSON.stringify(results);
      $('.raw').html(transcript_raw);
      $('.whole').html(obj);

    });

  };



  // copy to clipboard
  function CopyToClipboard(containerid) {
    // Create a new textarea element and give it id='temp_element'
    var textarea = document.createElement('textarea');
    textarea.id = 'temp_element';
    // Optional step to make less noise on the page, if any!
    textarea.style.height = 0;
    // Now append it to your page somewhere, I chose <body>
    document.body.appendChild(textarea);
    // Give our textarea a value of whatever inside the div of id=containerid
    textarea.value = document.getElementById(containerid).innerText;
    // Now copy whatever inside the textarea to clipboard
    var selector = document.querySelector('#temp_element');
    selector.select();
    document.execCommand('copy');
    // Remove the textarea
    document.body.removeChild(textarea);
  };

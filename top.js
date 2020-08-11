// goto requires an id on TR.   clicking table cell requires id on TD
var activeId="";
var subtitles = [];
var subtitleCount=0;
var currentSession=0;
var currentIdx;
var playing=false;
var xhttp = new XMLHttpRequest();
var borders=true;
var scrolling=true;

function toggleScroll() {
  let scrollbox = document.getElementById("scrollbox"); 
  scrolling = scrollbox.checked;
}

function showdate() {
  console.log("its " + getTime());
}

function getTime() {
  let mydate = new Date();
  let mytime = mydate.getTime();
  return mytime;
}



async function playFromBeginning() {
  currentSession++;
  scrollToTop();
  vlcSeek(0);
  await sleep(100)
  vlcPause();
  playSubtitles(currentSession, 0);
}

function scrollToTop() {
  parent.frames["bottom"].self.scroll(0,0 );
}

function bringToView(id){
  console.log("bringToView called for >" + id + "<");
  var element = parent.frames["bottom"].document.getElementById(id);  // go to table element <tr id="gohere">
  console.log("found element = " + element.id)

  var headerOffset = 295;
  var elementPosition = element.getBoundingClientRect().top;

  var offsetPosition = elementPosition - headerOffset;
  console.log("current pos=" + elementPosition + " bringing to position " + offsetPosition)

  if (scrolling) {
    parent.frames["bottom"].window.scrollBy({ top: offsetPosition, behavior: "smooth" });
  }

  // highlight
  if (activeId !="") {   parent.frames["bottom"].document.getElementById(activeId).style.backgroundColor='white'; }
  element.style.backgroundColor='yellow';
  activeId=id;
}

function syncToPaused() { playing=false; }

function testseek() {
  xhttp.open("GET", "/vlcseek?0" , true);
  xhttp.send();
  console.log("sent vlcseek!")
}

function pause() {
  vlcPause();
  playing=!playing;
  console.log("now playing=" + playing);
  if (playing) {
    stop();
  }
}

function vlcPause() {
  xhttp.open("GET", "/vlcpause", true);
  xhttp.send();
  console.log("sent vlcpause!")
}

function vlcSeek(ms) {
  xhttp.open("GET", "/vlcseek?" + Number(ms), true);
  xhttp.send();
  console.log("sent vlcseek to " + ms)
}

async function goto(idx) {
  currentSession++;
  // console.log("cursesssion now is " + currentSession );
  console.log("will go to " + idx);
  status("will go to " + idx);
  
  
  let currentTime = subtitles[Number(idx)].start;

  console.log("will go to idx=" + idx + " time=" + subtitles[Number(idx)].start  );

  if (true) {
    vlcSeek(currentTime);
    await sleep(100);

    if (!playing) {
      playing=true;
      vlcPause();
    }

    playSubtitles(currentSession, idx);
    status("resumed at " + currentTime)
  }
}

function stop() {
  currentSession++;
  vlcPause();
  status("Stopped...")
}

async function playSubtitles(session, idx) {
  console.log("playSubtitles idx=" + idx );
  idx=Number(idx);
  let curtime;
  if (idx==0) {
    curtime=0;
    idx=1;
  } else {
    curtime = subtitles[Number(idx)].start;
  }

  //for (i=0; i<subtitles.length; i++) {
  do {
    currentIdx=idx;
    document.getElementById('cuelabel').innerHTML = Number(idx);
//     console.log("noww for idx=" + idx);
//  console.log("cnnt=" + subtitles.length); 
//  console.log("start=" + subtitles[idx].start);
    
    
    
    console.log("ses=" + session + " waiting to display idx " + idx + " at " + subtitles[idx].start + " cur=" + curtime + " => " + (Number(subtitles[idx].start) - Number(curtime))   );
    await sleep(   Number(subtitles[idx].start) - Number(curtime)  );
    if (session != currentSession) return;
console.log("!!!!now2 to call bringtoview for idx=" + idx + " and " + Number(subtitles[idx].index));

  //bringToView("r" + Number(subtitles[idx].index))
  bringToView("r" + idx)
  console.log("waiting to clear at " + subtitles[idx].end + "=>" + (Number(subtitles[idx].end) - Number(subtitles[idx].start)) );
    await sleep(Number(subtitles[idx].end) - Number(subtitles[idx].start) );
    if (session != currentSession) return;
    //bringToView("r" + Number(subtitles[i].index))
    curtime = Number(subtitles[idx].end);
  } while (idx++ < subtitles.length )
  console.log("done");
}



// simulate play
async function testplay() {
  console.log("starting to display");
  let curtime = 0;
  for (i=0; i<subtitles.length; i++) {
     console.log("waiting to display....start=" + subtitles[i].start + " cur=" + curtime + " => " + (Number(subtitles[i].start) - Number(curtime))   );
     await sleep(   Number(subtitles[i].start) - Number(curtime)  );
     fun1(subtitles[i].text);
     console.log("waiting to clear...end= " + subtitles[i].end + " and " + subtitles[i].start + "=>" + (Number(subtitles[i].end) - Number(subtitles[i].start)) );
     await sleep(Number(subtitles[i].end) - Number(subtitles[i].start) );
     fun1("");
     curtime = Number(subtitles[i].end);
  }
  console.log("done");
}

function show_subtitles() {
  console.log("NOW AGAIN");
  let flen = subtitles.length;                                  

  for (i = 0; i < flen; i++) {
     console.log(subtitles[i].index + " -> start=" + subtitles[i].start  + " end=" + subtitles[i].end ); // + "\n" + subtitles[i].text
  }
}


async function status(text) {
  document.getElementById("status").innerHTML = text;
  await sleep(2000);
  document.getElementById("status").innerHTML = "...";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addspanish() {
  //  parent.frames["bottom"].document.getElementById("my-table-id")
  parent.frames["bottom"].document.getElementById("d1b").innerHTML = "test";
}

function loadSecondFromText(text) {
  var lines = text.split('\n');
  let count=0;
  for(var line = 0; line < lines.length; line++){
    let idx=0;
    console.log("LINE: " + lines[line]);
    try {
      if (line>0) {
        [idx,dummy] = lines[line++].split(' ');
      } else {
        idx = lines[line++].replace(/[^ -~]+/g, "");  // only filter unprintables from first line
      }
      console.log("read idx=" + idx );
      let times = lines[line++]; 
/*
      let [starttime, endtime] = times.split(" --> ");
      let [hms, milliseconds] = starttime.split(",");
      let [hours, minutes, seconds] = hms.split(":");
      let absolutestart = Number(milliseconds) + Number(1000*seconds) + Number(60000*minutes) + Number(3600000*hours);
      console.log ("h=" + hours + " m=" + minutes + " s=" + seconds + " milli=" + milliseconds + " =" + absolutestart );

      [hms, milliseconds] = endtime.split(",");
      [hours, minutes, seconds] = hms.split(":");
      let absoluteend = Number(milliseconds) + Number(1000*seconds) + Number(60000*minutes) + Number(3600000*hours);
      console.log ("h=" + hours + " m=" + minutes + " s=" + seconds + " milli=" + milliseconds + " =" + absoluteend );
*/
      let text = lines[line++];

      while (lines[line].length > 1)  {
        console.log("added extra text for " + idx);
        text = text + "\n" + lines[line++];
      }

      parent.frames["bottom"].document.getElementById("d" + Number(idx-1) + "b").innerHTML = text;
      count++;

    } catch (ex) {
      try {
        console.log("exception for idx= " + idx + " ->" + ex);
      } catch (e) {}
    }
    status("Added " + count + " subtitles");

    document.getElementById("overlay").style.visibility = "hidden";
  }
}


function myfilter() {
  input_string = "ï»¿1";
  console.log(" first its " + input_string)
  str = input_string.replace(/[^ -~]+/g, "");
  console.log(" now its " + str)
}






function loadLocalFile(evt) {
  subtitles = [];
  console.log("loading3 file");
  let filedebug=true;

  var file = evt.target.files[0];   
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) { 
      loadFromText(reader.result);
    }
    reader.readAsText(file);
  } else { 
    alert("Failed to load file");
  }
}





function loadFirst() {
  var url = prompt("Enter URL for subtitles file", "julias.srt");
  if (url != null) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         loadFromText(http.responseText);
      }
    };
    http.open("GET", url, true);
    http.send();  
  }
}

function loadSecond() {
  var url = prompt("Enter URL for subtitles file", "julia-english.srt");
  if (url != null) {
    var http = new XMLHttpRequest();
    http.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        loadSecondFromText( http.responseText );
      }
    };
    http.open("GET", url, true);
    http.send();  
  }
}


function autoloadFirst() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       loadFromText(http.responseText);
    }
  };
  http.open("GET", "julia-spanish.srt", true);
  http.send();  
}

function autoloadSecond() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       loadSecondFromText(http.responseText);
    }
  };
  http.open("GET", "julia-enTranslated.srt", true);
  http.send();  
}



function loadFromText(text) {
   
  var filedebug=false;
  if (filedebug) console.log("kwrr starting httpfile=");
  var lines = text.split('\n');
  for(var line = 0; line < lines.length; line++){
    //console.log("LINE: " + lines[line]);
    let idx=0;
    try {
      if (line > 0) {
        idx = lines[line++];
      } else {
        idx = lines[line++].replace(/[^ -~]+/g, "");  // only filter unprintables from first line
      }

      if (filedebug) console.log("read idx=" + idx );
      let times = lines[line++]; 

      let [starttime, endtime] = times.split(" --> ");
      let [hms, milliseconds] = starttime.split(",");
      let [hours, minutes, seconds] = hms.split(":");
      let absolutestart = Number(milliseconds) + Number(1000*seconds) + Number(60000*minutes) + Number(3600000*hours);
      if (filedebug) console.log ("h=" + hours + " m=" + minutes + " s=" + seconds + " milli=" + milliseconds + " =" + absolutestart );

      [hms, milliseconds] = endtime.split(",");
      [hours, minutes, seconds] = hms.split(":");
      let absoluteend = Number(milliseconds) + Number(1000*seconds) + Number(60000*minutes) + Number(3600000*hours);
      // if (filedebug) console.log ("h=" + hours + " m=" + minutes + " s=" + seconds + " milli=" + milliseconds + " =" + absoluteend );

      let text = lines[line];

      while (text.length<2) {  // cases where blank lines follow time line 
        text = lines[++line];  
        console.debug("had to skip lines to get to text for " + text)
      }
      line++;

      while (lines[line].length > 1)  {
        if (filedebug) console.log("added extra text for " + idx);
        text = text + "\n" + lines[line++];
      }

      createTableRow(Number(idx-1), text);

      let subtitle = { "index": idx, "start": absolutestart, "end": absoluteend } // , "text": text
      subtitles.push(subtitle); 
      subtitleCount++;

    } catch (ex) {
      try {
        console.log("exception for idx= " + idx + " ->" + ex);
      } catch (e) {}
    }
  }
  status("Loaded " + subtitleCount + " subtitles");
createScriptElement();
console.log("done loading script")

}




function createTableRow(idx, text) {
  let table = parent.frames["bottom"].document.getElementById("my-table-id");
  let tr =  parent.frames["bottom"].document.createElement('tr');   
  let idr =  "r" + Number(idx);
  tr.setAttribute("id", idr);
  let td1 =  parent.frames["bottom"].document.createElement('td');
  td1.setAttribute("id", "d" + idx + "a");
  let td2 = parent.frames["bottom"].document.createElement('td');
  td2.setAttribute("id", "d" + Number(idx) + "b");
  let text1 = parent.frames["bottom"].document.createTextNode(text);
  let text2 = parent.frames["bottom"].document.createTextNode('');
  td1.appendChild(text1);
  td2.appendChild(text2);
  tr.appendChild(td1);
  tr.appendChild(td2);
  table.appendChild(tr);
  parent.frames["bottom"].document.body.appendChild(table)
}


function togglePasteDiv() {
  el = document.getElementById("overlay");
  el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}


function createScriptElement() {
//    let table = parent.frames["bottom"].document.getElementById("my-table-id");

  var script = parent.frames["bottom"].document.createElement("script");
  script.type = "text/javascript";
  script.src = "bottom.js";
  script.onload = function(){ console.log("loaded"); };
  parent.frames["bottom"].document.body.appendChild(script);
}

function toggleBorders() {
  let widthstr;
  borders = !borders;
  if (borders) {
    widthstr="1px";
  } else {
    widthstr="0px";
    console.log("dkjfd")
  }
  var x = parent.frames["bottom"].document.querySelectorAll("TD");

  var i;
  for (i = 0; i < x.length; i++) {
    x[i].style.border=widthstr;
  }
}

document.getElementById('fileinput').addEventListener('change', loadLocalFile, false);

document.onkeypress = function (e) {
  e = e || window.event;
  if (e.code == "Space") {
    pause();
    stop();
  }
};
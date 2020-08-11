console.log("loading bottom.js")
//document.getElementById("myp").innerHTML="bottom.js was loaded";


function onRowClick(tableId, callback) {
  console.log ("onrowclick called with id=" + tableId );

  var table = document.getElementById(tableId),
      rows = table.getElementsByTagName("tr"),
      i;
  for (i = 0; i < rows.length; i++) {
      table.rows[i].onclick = function (row) {
          return function () {
              callback(row);
          };
      }(table.rows[i]);
  }
};
 

onRowClick("my-table-id", function (row){
      let value = row.getElementsByTagName("td")[0].id;
      [dummy,idx]  = value.split(/[dab]/);
      console.log ("bottomframe val=" + value)
      parent.frames.topframe.goto(idx);
  });

//document.getElementById("myp").innerHTML="bottom.js was initialized.";







 var table = document.getElementById('my-table-id');
 resizableGrid(table);

//var tables = document.getElementsByClassName('flexiCol');
// var tables = document.getElementsByTagName('table');
// for (var i=0; i<tables.length;i++){
//  resizableGrid(tables[i]);
// }

function resizableGrid(table) {
 var row = table.getElementsByTagName('tr')[0],
 cols = row ? row.children : undefined;
 if (!cols) return;
 
 table.style.overflow = 'hidden';
 
 var tableHeight = table.offsetHeight;
 
 for (var i=0;i<cols.length;i++){
  var div = createDiv(tableHeight);
  cols[i].appendChild(div);
  cols[i].style.position = 'relative';
  setListeners(div);
 }

 function setListeners(div){
  var pageX,curCol,nxtCol,curColWidth,nxtColWidth;

  div.addEventListener('mousedown', function (e) {
   curCol = e.target.parentElement;
   nxtCol = curCol.nextElementSibling;
   pageX = e.pageX; 
 
   var padding = paddingDiff(curCol);
 
   curColWidth = curCol.offsetWidth - padding;
   if (nxtCol)
    nxtColWidth = nxtCol.offsetWidth - padding;
  });

  div.addEventListener('mouseover', function (e) {
   e.target.style.borderRight = '2px solid #0000ff';
  })

  div.addEventListener('mouseout', function (e) {
   e.target.style.borderRight = '';
  })

  document.addEventListener('mousemove', function (e) {
   if (curCol) {
    var diffX = e.pageX - pageX;
 
    if (nxtCol)
     nxtCol.style.width = (nxtColWidth - (diffX))+'px';

    curCol.style.width = (curColWidth + diffX)+'px';
   }
  });

  document.addEventListener('mouseup', function (e) { 
   curCol = undefined;
   nxtCol = undefined;
   pageX = undefined;
   nxtColWidth = undefined;
   curColWidth = undefined
  });
 }
 
 function createDiv(height){
  var div = document.createElement('div');
  div.style.top = 0;
  div.style.right = 0;
  div.style.width = '5px';
  div.style.position = 'absolute';
  div.style.cursor = 'col-resize';
  div.style.userSelect = 'none';
  div.style.height = height + 'px';
  return div;
 }
 
 function paddingDiff(col){
 
  if (getStyleVal(col,'box-sizing') == 'border-box'){
   return 0;
  }
 
  var padLeft = getStyleVal(col,'padding-left');
  var padRight = getStyleVal(col,'padding-right');
  return (parseInt(padLeft) + parseInt(padRight));

 }

 function getStyleVal(elm,css){
  return (window.getComputedStyle(elm, null).getPropertyValue(css))
 }
};

function toggleBorders() {
document.getElementById('id1').style.color = 'red';
}

document.onkeypress = function (e) {
  e = e || window.event;
  if (e.code == "Space" && e.target == document.body) {
      e.preventDefault();
      parent.frames.topframe.pause();
      parent.frames.topframe.stop();
  }
};

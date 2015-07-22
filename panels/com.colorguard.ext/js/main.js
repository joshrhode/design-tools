/*===============================================================
    
    Josh Rhode — http://kult.house

    Colorguard
    Photoshop CC
    ———
===============================================================*/

var csInterface = new CSInterface();
var btnApply = window.document.getElementById('btn-apply');
var btnFolder = window.document.getElementById('btn-folder');
var btnForeground = window.document.getElementById('btn-foreground');

var colorList = '';

function getColorInputs() {
	var inputFind =  window.document.getElementsByClassName('input-find');
	var inputReplace =  window.document.getElementsByClassName('input-replace');
	
	for(var i = 0; i < inputFind.length; ++i) {
		if(isHexColor(inputFind[i].value) && isHexColor(inputReplace[i].value)) {
			csInterface.evalScript('addColorToTable("' + inputFind[i].value + '","' + inputReplace[i].value + '")');
		}
	}	
}

function isHexColor(hex) {
  	return (typeof hex === "string") && hex.length === 6 && ! isNaN( parseInt(hex, 16) );
}

btnForeground.onclick = function() {
	csInterface.evalScript('ColorGuard(1)');
}


btnApply.onclick = function() {
	getColorInputs();
	csInterface.evalScript('ColorGuard(2)');
}

btnFolder.onclick = function() {
	getColorInputs();
	csInterface.evalScript('ColorGuard(3)');
}
// Get a reference to a CSInterface object
var csInterface = new CSInterface();
var btnFire = window.document.getElementById('btn-fire');

btnFire.onclick = function() {
	csInterface.evalScript('FriendlyFire()');
}
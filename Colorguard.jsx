/*===============================================================
    
    Josh Rhode — http://kult.house

    Colorguard
    Photoshop CC
    ———
    
    This script will automatically update the fill colors
    of all shape/vector layers in your PSD based on
    a table you can easily modify in the script.

    Why? I hacked this script together to help with a large
    rebranding project. We have hundreds of PSDs and needed
    a fast way to update the color palette across
    all of them instantly.

    1.  Inside of this script, add the list of colors you want
    	to find and replace inside of the 'colorTable' array. 
    	
    	Example: Want to replace all yellow colors with blue,
    	and all red with green? Simple.
	
		var colorTable = [['ffff00', '0000ff'],
						['ff0000', '00ff00']];

    2.  Run this script!

    INSTALL
    ———

    Add the script to the \Presets\Scripts\ folder
    within your Photoshop CC folder.

    Run the script by hitting File -> Scripts
    in the Photoshop menu.


===============================================================
					FIND	->	REPLACE
===============================================================*/
var colorTable = [['ffffff',	'f6f7fb'],
				  ['000000',	'40526a']];

var doc;

function main() {  

	if (app.documents.length == 0) {
		alert('Please open a document before continuing.');
		return;
	}
	
	doc = app.activeDocument;
	
	progressWindow = createProgressWindow('Coloring...');
	progressStep = Math.round(100 / doc.layers.length);
	progressWindow.show();

	colorizeLayers();

	progressWindow.close();

}

function colorizeLayers() {
	

	var numProcessed = 0;

	// get number of layers;  
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
	var applicationDesc = executeActionGet(ref);  
	var totalLayers = applicationDesc.getInteger(stringIDToTypeID('numberOfLayers'));  
	
	// process the layers;  
	for(var i = 0; i <= totalLayers; i++) {  
		try {  

		var ref = new ActionReference();  
		ref.putIndex( charIDToTypeID('Lyr '), i);
		var layerDesc = executeActionGet(ref);  

		var layerKind = layerDesc.getString(stringIDToTypeID('layerKind'));  

		if(layerKind == 4)
			numProcessed += inspectLayer(ref, i);
		  
		progressWindow.bar.value = (100 / (progressStep / i));

		} catch(e) {}  
	}

	alert('Total shape colors updated: ' + numProcessed);

}



function inspectLayer(ref, refIndex) {
	var currentColor = getFillColor(ref).rgb.hexValue;
	for(var i = 0; i < colorTable.length; ++i) {
		if(currentColor == colorTable[i][0].toUpperCase()) {
			setFillColor(refIndex, colorTable[i][1]);
			return 1;
		}
	}
	return 0;
}

 
function setFillColor(refIndex, newColor) {
	
	var setColor =  new SolidColor;  
	setColor.rgb.hexValue = newColor;  

	var desc = new ActionDescriptor();  
	var ref = new ActionReference();  
	ref.putIndex(stringIDToTypeID('contentLayer'), refIndex);
	desc.putReference( charIDToTypeID('null'), ref );  

	var fillDesc = new ActionDescriptor();  
	var colorDesc = new ActionDescriptor();  
	colorDesc.putDouble( charIDToTypeID('Rd  '), setColor.rgb.red );  
	colorDesc.putDouble( charIDToTypeID('Grn '), setColor.rgb.green );  
	colorDesc.putDouble( charIDToTypeID('Bl  '), setColor.rgb.blue );  
	fillDesc.putObject( charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc );  
	desc.putObject( charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc );  
	executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );  

}
 
function getFillColor(ref){
	
	var newRef = executeActionGet( ref );
	var list =  newRef.getList( charIDToTypeID( "Adjs" ) ) ;
	var solidColorLayer = list.getObjectValue(0);        
	var color = solidColorLayer.getObjectValue(charIDToTypeID('Clr ')); 
	var fillcolor = new SolidColor;
	fillcolor.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
	fillcolor.rgb.green = color.getDouble(charIDToTypeID('Grn '));
	fillcolor.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
	return fillcolor;

}

// progress bar
function createProgressWindow(title, message, min, max) {
	var win;
	win = new Window('palette', title);
	win.bar = win.add('progressbar', undefined, min, max);
	win.bar.preferredSize = [200, 20];
	return win;
};

main();
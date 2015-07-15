/*===============================================================
    
    Josh Rhode — http://kult.house

    Colorguard
    Photoshop CC
    ———
    
    Add a list of colors you want to find and replace.
    This script will automatically update the fill colors
    of every vector/shape and text layer in your PSDs.

    Why? I hacked this script together to help with a large
    rebranding project. We have hundreds of PSDs and needed
    a fast way to update the color palette across
    all of them instantly.


	HOW IT WORKS
    ———
	
	If you have an active PSD open, this script
	will only target your active PSD.

	If you close all of your documents, the script
	will let you select a folder, then it will
	automatically open and update every PSD inside of it.

	It won't save the files - that's up to you :)


	HOW TO USE IT
    ———
	
    1.  Down in this script, edit the list of colors you want
    	to find and replace inside of the 'colorTable' array. 
    	
    	Example: Your client's brand color used to be blue.
    	They want it to be red. You have 250 PSDs. No problem:
		[{find:'0000ff', replace:'ff000'}];

    2.  Run this script!


    INSTALL
    ———

    Add the script to the \Presets\Scripts\ folder
    within your Photoshop CC folder.

    Run the script by hitting File -> Scripts
    in the Photoshop menu.

===============================================================*/

var colorTable =

	[{find:'ffffff', replace:'f6f7fb'},
	{find:'000000', replace:'40526a'}];
	//add/remove as many color replacements as you want!

var doc;
var numProcessed = 0;

function main() {  

	setupColorObjects();

	 if (app.documents.length > 0) {
        	    
	    doc = app.activeDocument;
	    activeLayer = doc.activeLayer;

	    colorizeLayers();
	    
	    alert('Total shape colors updated: ' + numProcessed);

    } else if (app.documents.length == 0) {
    
	    var sourceFolder = Folder.selectDialog ('Select the folder of PSDs you want to update.', Folder.myDocuments);
	    	if(sourceFolder == null) return;

	    var files = sourceFolder.getFiles('*.psd');
	    	if(files == null || files.length == 0) return;
		
	    for (var i = 0; i < files.length; i++) {
	        var f = files[i];
	        if (f instanceof Folder)
	            continue;

	        doc = app.open (f);
	        colorizeLayers();
	    }

	    alert('Total shape colors updated: ' + numProcessed + ' in ' + files.length + ' files');

	}
	
}

function setupColorObjects() {
	for(var i = 0; i < colorTable.length; ++i) {
		
		var findColor = new SolidColor,
			replaceColor = new SolidColor;
		
		findColor.rgb.hexValue = colorTable[i].find.toUpperCase();  
		colorTable[i].find = findColor;

		replaceColor.rgb.hexValue = colorTable[i].replace.toUpperCase();  
		colorTable[i].replace = replaceColor;


	}
}

function colorizeLayers() {
		
	// get number of layers;  
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
	var descApplication = executeActionGet(ref);  
	var totalLayers = descApplication.getInteger(stringIDToTypeID('numberOfLayers'));  

	//start a progress window
	progressWindow = createProgressWindow('Coloring...');
	progressStep = Math.round(100 / totalLayers);
	progressWindow.show();
	
	// process the layers;  
	for(var i = 0; i <= totalLayers; i++) {  
		try {  
			var ref = new ActionReference();  
			ref.putIndex( charIDToTypeID('Lyr '), i);
			var descLayer = executeActionGet(ref);  

			var layerKind = descLayer.getString(stringIDToTypeID('layerKind'));  

			if(layerKind == 3 || layerKind == 4)
				numProcessed += inspectLayer(layerKind, descLayer, i);
			  
			progressWindow.bar.value = (100 / (progressStep / i));

		} catch(e) {}  
	}

	progressWindow.close();

}


//inspect the shape/text layer, compare its color, and if it's a match, update it
function inspectLayer(kind, descLayer, refIndex) {
	var currentColor;
	//it's a shape layer!
	if(kind == 4) {
		currentColor = getFillColor(descLayer);
		for(var i = 0; i < colorTable.length; ++i) {
			if(currentColor.rgb.hexValue == colorTable[i].find.rgb.hexValue) {
				setFillColor(refIndex, colorTable[i].replace);
				return 1;
			}
		}
	//it's a text layer!
	} else if (kind == 3) {
		currentColor = getTextColor(descLayer);
		for(var i = 0; i < colorTable.length; ++i) {
			if(currentColor.rgb.hexValue == colorTable[i].find.rgb.hexValue) {
				setTextColor(refIndex, colorTable[i].replace);
				return 1;
			}
		}
	}
	return 0;
}

//return a photoshop SolidColor object
function parseColor(color) {
	var colorObject = new SolidColor;
	colorObject.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
	colorObject.rgb.green = color.getDouble(charIDToTypeID('Grn '));
	colorObject.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
	return colorObject;
}


function setTextColor(refIndex, newColor) {

	var descLayer = new ActionDescriptor();  
	var refLayer = new ActionReference();
	refLayer.putProperty( charIDToTypeID( "Prpr" ), charIDToTypeID( "TxtS" ) );
	refLayer.putIndex( charIDToTypeID( "TxLr" ), refIndex );
	descLayer.putReference( charIDToTypeID('null'), refLayer );
	
	var textDesc = new ActionDescriptor();
	textDesc.putInteger( stringIDToTypeID( "textOverrideFeatureName" ), 808466226 );
	textDesc.putInteger( stringIDToTypeID( "typeStyleOperationType" ), 3 );
	
	var colorDesc = new ActionDescriptor();  
	colorDesc.putDouble( charIDToTypeID('Rd  '), newColor.rgb.red );  
	colorDesc.putDouble( charIDToTypeID('Grn '), newColor.rgb.green );  
	colorDesc.putDouble( charIDToTypeID('Bl  '), newColor.rgb.blue );  

	textDesc.putObject( charIDToTypeID( "Clr " ), charIDToTypeID( "RGBC" ), colorDesc );
	descLayer.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "TxtS" ), textDesc );
	executeAction( charIDToTypeID( "setd" ), descLayer, DialogModes.NO );

}

function getTextColor(descLayer){
	
	var list =  descLayer.getObjectValue(charIDToTypeID("Txt ")) ;  
	var tsr =  list.getList(charIDToTypeID("Txtt")) ;  
	var tsr0 =  tsr.getObjectValue(0) ;  
	var textStyle = tsr0.getObjectValue(charIDToTypeID("TxtS"));  
	var color = textStyle.getObjectValue(charIDToTypeID('Clr '));   
	
	return parseColor(color);
	
}
 
function setFillColor(refIndex, newColor) {
	
	var desc = new ActionDescriptor();  
	var ref = new ActionReference();  
	ref.putIndex(stringIDToTypeID('contentLayer'), refIndex);
	desc.putReference( charIDToTypeID('null'), ref );  

	var fillDesc = new ActionDescriptor();  
	var colorDesc = new ActionDescriptor();  
	colorDesc.putDouble( charIDToTypeID('Rd  '), newColor.rgb.red );  
	colorDesc.putDouble( charIDToTypeID('Grn '), newColor.rgb.green );  
	colorDesc.putDouble( charIDToTypeID('Bl  '), newColor.rgb.blue );  
	fillDesc.putObject( charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc );  
	desc.putObject( charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc );  
	executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );  

}
 
function getFillColor(descLayer){
	
	var list =  descLayer.getList( charIDToTypeID( "Adjs" ) ) ;
	var solidColorLayer = list.getObjectValue(0);        
	var color = solidColorLayer.getObjectValue(charIDToTypeID('Clr ')); 
	return parseColor(color);

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
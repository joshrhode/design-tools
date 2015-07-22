/*===============================================================
    
    Josh Rhode — http://kult.house

    Colorguard
    Photoshop CC
    ———
===============================================================*/


var colorTable = [];

var doc;
var numProcessed = 0;

function addColorToTable(f,r) {
	var findColor = new SolidColor,
	replaceColor = new SolidColor;

	findColor.rgb.hexValue = f;
	replaceColor.rgb.hexValue = r;

	colorTable.push({find:findColor, replace:replaceColor});
}

function ColorGuard(mode) {  


	doc = app.activeDocument;

	if (mode == 1 && app.documents.length > 0) {
        applyForegroundColors();

	} else if (mode == 2 && app.documents.length > 0) {
        replaceLayerColors();
	    alert('Total colors found and replaced: ' + numProcessed);
	
	} else if (mode == 3) {
    
	    var sourceFolder = Folder.selectDialog ('Select the folder of PSDs you want to update.', Folder.myDocuments);
	    	if(sourceFolder == null) return;

	    var files = sourceFolder.getFiles('*.psd');
	    	if(files == null || files.length == 0) return;
		
	    for (var i = 0; i < files.length; i++) {
	        var f = files[i];
	        if (f instanceof Folder)
	            continue;

	        doc = app.open (f);
	        replaceLayerColors();
	    }

	    alert('Total colors found and replaced: ' + numProcessed + ' in ' + files.length + ' files');

	}
	
}


function replaceLayerColors() {
		
	// get number of layers;  
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
	var descApplication = executeActionGet(ref);  
	var totalLayers = descApplication.getInteger(stringIDToTypeID('numberOfLayers'));  

	// process the layers;  
	for(var i = 0; i <= totalLayers; i++) {  
		try {  
			var ref = new ActionReference();  
			ref.putIndex( charIDToTypeID('Lyr '), i);
			var descLayer = executeActionGet(ref);  

			var layerKind = descLayer.getString(stringIDToTypeID('layerKind'));  

			if(layerKind == 3 || layerKind == 4)
				numProcessed += colorizeLayerByTable(layerKind, descLayer, i);

		} catch(e) {}  
	}

}

function applyForegroundColors() {

	 var refLayers = new ActionReference();
     refLayers.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
     var descLayers = executeActionGet(refLayers);
     if( descLayers.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
          descLayers = descLayers.getList( stringIDToTypeID( 'targetLayers' ));
          var c = descLayers.count;
          for(var i=0;i<c;i++){

          	   	var index = descLayers.getReference(i).getIndex();
          	   	var ref = new ActionReference();  
				ref.putIndex( charIDToTypeID('Lyr '), index);
				var descLayer = executeActionGet(ref);  
				var layerKind = descLayer.getString(stringIDToTypeID('layerKind'));  

				if(layerKind == 3 || layerKind == 4)
					colorizeLayerByForeground(layerKind, index);

          }
     }

}

//inspect the shape/text layer and color it accordingly
function colorizeLayerByForeground(kind, refIndex) {
	var currentColor;
	//it's a shape layer!
	if(kind == 4) {
		setFillColor(refIndex, app.foregroundColor);
		return 1;
	//it's a text layer!
	} else if (kind == 3) {
		setTextColor(refIndex, app.foregroundColor);
		return 1;
	}
	return 0;
}


//inspect the shape/text layer, compare its color, and if it's a match, update it
function colorizeLayerByTable(kind, descLayer, refIndex) {
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

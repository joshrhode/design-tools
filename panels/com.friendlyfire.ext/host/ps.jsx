/*===============================================================
    
    Josh Rhode — http://kult.house

    Friendly Fire
    Photoshop CC
    ———
    
    This script will automatically select all text layers
    in a PSD that match each other based on their similarities.


===============================================================*/


var activeLayer,
    doc;

var selectedLayerName = '',
    selectedFont = '',
    selectedSize = '';

function FriendlyFire() {  

    if (app.documents.length == 0) {
        alert('Please open a document before continuing.');
        return;
    }
    
    doc = app.activeDocument;
    activeLayer = doc.activeLayer;

    if (activeLayer.kind != LayerKind.TEXT) {
        alert('Please select a single textfield for this script to run.');
        return;
    }

    getSelectedFontDetails();
    selectSimilarLayers();

}  

function getSelectedFontDetails() {
    var result = activeLayer.textItem; 
    selectedLayerName = activeLayer.name;
    selectedFont = result.font;
    selectedSize = result.size;
}

function selectSimilarLayers() {
    
    // get number of layers;  
    var ref = new ActionReference();  
    ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
    var applicationDesc = executeActionGet(ref);  
    var totalLayers = applicationDesc.getInteger(stringIDToTypeID('numberOfLayers'));  
    
    // process the text layers;  
    var theLayers = new Array;  
    for(var i = 0; i <= totalLayers; i++) {  
        try {  
            var ref = new ActionReference();  
            ref.putIndex( charIDToTypeID( 'Lyr ' ), i);
            var layerDesc = executeActionGet(ref);  
            var layerSet = typeIDToStringID(layerDesc.getEnumerationValue(stringIDToTypeID('layerSection')));  
            var isBackground = layerDesc.getBoolean(stringIDToTypeID('background'));  
            
            // if not layer group collect values;  
            if (layerSet != 'layerSectionEnd') {  
                
                var textDesc = layerDesc.getObjectValue(stringIDToTypeID('textKey'));  
                var textStyle = textDesc.getList(stringIDToTypeID('textStyleRange')).getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle'))
                
                var textSize =  textStyle.getDouble(stringIDToTypeID('size'));  
                if (textDesc.hasKey(stringIDToTypeID('transform'))) {  
                    var mFactor = textDesc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );  
                    textSize = (textSize * mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');  
                }  

                var textFont = textStyle.getString(stringIDToTypeID('fontPostScriptName'));
                
                var theName = layerDesc.getString(stringIDToTypeID('name'));  
                var theID = layerDesc.getInteger(stringIDToTypeID('layerID'));  

                if(textSize == selectedSize && textFont == selectedFont) {
                    addLayerToSelection(ref);
                }
            }
            
        } catch(e) {}  
    }      
}

function addLayerToSelection(ref) {
    var idslct = charIDToTypeID( 'slct' );
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID( 'null' );
    desc.putReference( idnull, ref );
    var idselectionModifier = stringIDToTypeID( 'selectionModifier' );
    var idselectionModifierType = stringIDToTypeID( 'selectionModifierType' );
    var idaddToSelection = stringIDToTypeID( 'addToSelection' );
    desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
    var idMkVs = charIDToTypeID( 'MkVs' );
    desc.putBoolean( idMkVs, false );
    executeAction( idslct, desc, DialogModes.NO );
}

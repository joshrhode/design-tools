
/*===============================================================
    
    Josh Rhode — http://kult.house

    Friendly Fire
    Photoshop CC
    ———
    
    This script allows you to select all text layers in a PSD
    that match each other based on their similarities.

    1.  Select a text layer anywhere in your PSD
    2.  Run this script
    3.  The script finds all other text layers that match the
        FONT NAME and FONT SIZE, and then selects them for you.

    You can further augment this script by adding more
    properties to compare too.
   

    INSTALL
    ———

    Add the script to the \Presets\Scripts\ folder
    within your Photoshop CC folder.

    Run the script by hitting File -> Scripts
    in the Photoshop menu.


    FOOTNOTE
    ———

    Photoshop scripting is terrible. I first wrote
    this thing entirely using the DOM, which worked,
    but was insanely slow.

    This is the result of lots of my own hackery and toying
    around, and I honestly can't believe it still
    works (for me).


===============================================================*/

var activeLayer,
    doc;

var selectedLayerName = '',
    selectedFont = '',
    selectedSize = '';

function main() {  

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

    progressWindow = createProgressWindow('Firing...');
    progressStep = Math.round(100 / doc.layers.length);
    progressWindow.show();

    getSelectedFontDetails();
    selectSimilarLayers();

    progressWindow.close();

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
    for(var m = 0; m <= totalLayers; m++) {  
        try {  
            var ref = new ActionReference();  
            ref.putIndex( charIDToTypeID( 'Lyr ' ), m);
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

// progress bar
function createProgressWindow(title, message, min, max) {
    var win;
    win = new Window('palette', title);
    win.bar = win.add('progressbar', undefined, min, max);
    win.bar.preferredSize = [200, 20];
    return win;
};

main();

/*===============================================================
    
    Josh Rhode — http://kult.house

    RETYPER
    PHOTOSHOP CC

    Super basic tool for updating/refining typography
    in all textfields in every PSD in a given directory.

    Tweak, mix, match based on your own brand styleguide.

    USAGE

    1 —
    Setup your primary type sizes in the typeScale array.

    2 —
    Choose the new font to be set.
    Make sure you use the PostScript name of the font.
    Mac/Windows provides this info in the file properties.

    3 —
    In the 'updateLayerTypography' function, add cases
    for each of your type sizes. You can massage the 
    kerning, tracking, leading, etc.

    INSTALL

    Add the script to the \Presets\Scripts\ folder
    within your Photoshop CC folder.

    Run the script by hitting File -> Scripts
    in the Photoshop menu.

===============================================================*/

var typeScale = [9,13,15,18,24];
var newFont = 'Graphik-Regular';

function main () {

    if (app.documents.length > 0) {
        alert ('Close all open documents before running this script.');
        return;
    }
    
    var sourceFolder = Folder.selectDialog ('Please choose the location of the source image files.', Folder.myDocuments);
    var files = sourceFolder.getFiles('*.psd');
       
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f instanceof Folder)
            continue;

        var doc = app.open (f);
        updateAllLayers(doc, 0);
    }

}

function updateAllLayers (layerParent, level){
    
    for (var i = layerParent.layers.length - 1; i >= 0; i--) {
        var currentLayer = layerParent.layers[i];
        if (currentLayer.typename != 'ArtLayer') {
            updateAllLayers(currentLayer, level + 1)
        } else if (currentLayer.kind == LayerKind.TEXT) {
            style = currentLayer.textItem; 
            updateLayerTypography(style);
        }
    }

}

function updateLayerTypography (style){
    
    if(style.contents.length == 0)
        return;

    style.font = newFont;
    numlines = style.contents.split(/\r\n|\r|\n/).length; 
    
    var pointSize = nearestPointsize(style.size);
    style.size = UnitValue(pointSize,'pt');

    switch(pointSize) {
        case '24 pt':
            style.tracking = -10;
            if(style.kind == TextType.PARAGRAPHTEXT) style.leading = '28 pt';
            break;
        case '18 pt':
            style.tracking = 0;
            style.antiAliasMethod = AntiAlias.SMOOTH;
            if(style.kind == TextType.PARAGRAPHTEXT) style.leading = '23 pt';
            break;
        case '15 pt':
            style.tracking = 0;
            style.antiAliasMethod = AntiAlias.SMOOTH;
            if(style.kind == TextType.PARAGRAPHTEXT) style.leading = '21 pt'; 
            break;
        case '13 pt':
            style.tracking = -5;
            style.antiAliasMethod = AntiAlias.CRISP;
            if(style.kind == TextType.PARAGRAPHTEXT) style.leading = '19 pt';
            break;
        case '9 pt':
            style.antiAliasMethod = AntiAlias.SMOOTH;
            if(numlines <= 1) style.tracking = 75;
            if(style.kind == TextType.PARAGRAPHTEXT) style.leading = '14 pt';
            break;
    }
    
}

function nearestPointsize(num) {
    
    if (!(typeScale) || typeScale.length == 0)
        return null;
    if (typeScale.length == 1)
        return i[0];

    for (var i = 1; i < typeScale.length; i++) {
        if (typeScale[i] > num) {
            var p = typeScale[i-1];
            var c = typeScale[i]
            return Math.abs( p-num ) < Math.abs( c-num ) ? p : c;
        }
    }
    return typeScale[typeScale.length-1];
}

main();
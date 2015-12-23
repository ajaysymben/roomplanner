var path = require( "path" );
var server = require( "can-ssr/server" );
var api = require( "./api" );
var bodyParser = require( "body-parser" );
var exec = require( "child_process" ).exec;

server({
  path: path.join( __dirname, '..' ),
  configure: function ( app ) {

    app.use( bodyParser.urlencoded({ extended: true }) );
    app.use( bodyParser.json({limit: '5mb'}) );

    // app.get( '/initdbtables', api.createDatabaseTables );
    // app.get( '/initdbtables2', api.createDatabaseTables2 );
    // app.get( '/destroydatabase', api.dropDatabaseTables );
    // app.get( '/oneoffquery', api.oneoffquery );
    app.get( '/addclient', api.addClient );
    app.post( '/addclient', api.doAddClient );
    app.get( '/manage', api.getManage );
    app.post( '/manage', api.doManage );
    app.get( '/manageitems', api.manageItemsGET );
    app.post( '/manageitems', api.manageItemsPOST );
    app.get( '/managesaveformfields', api.manageFieldsGET );
    app.post( '/managesaveformfields', api.manageFieldsPOST );

    app.get( '/catsubcat', api.getCategorySubcategory );
    app.post( '/catresizeable', api.setCatResizeable );
    app.get( '/verticalplacement', api.getVerticalPlacements );
    app.post( '/verticalplacement', api.addVerticalPlacements );

    app.get( '/clients', api.getClient );
    app.get( '/rooms', api.roomsGET );
    app.post( '/rooms', api.saveRoom );
    app.get( '/items', api.getItems );
    app.get( '/saveformfields', api.getSFFields );

    if ( process.argv.indexOf( "--develop" ) !== -1 ) {
      //is dev mode so do live reload
      var child = exec( "node_modules/.bin/steal-tools live-reload", {
        cwd: process.cwd()
      });

      child.stdout.pipe( process.stdout );
      child.stderr.pipe( process.stderr );
    }
  }
}).listen( process.env.PORT || 8087 );
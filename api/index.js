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
    // app.get( '/destroydatabase', api.dropDatabaseTables );
    app.get( '/addclient', api.addClient );
    app.post( '/addclient', api.doAddClient );
    app.get( '/manage', api.getManage );
    app.post( '/manage', api.doManage );
    app.get( '/rooms', api.roomsGET );
    app.post( '/rooms', api.saveRoom );
    app.get( '/items', api.getItems );
    app.post( '/email', api.sendEmail );

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
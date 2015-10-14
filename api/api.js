var mysql = require( "mysql" );

var getConnection = function () {
  return mysql.createConnection({
    host     : process.env.DBHOST,
    user     : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DBNAME
  });
};

exports.getRooms = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT 1 + 0 AS solution', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send([
      {name:'Hello'},
      {name:'World'},
      {name: rows[0].solution },
      process.argv
    ]);

    connection.destroy();
  });
};

exports.saveRoom = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT 1 + 10 AS solution', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send([
      {name:'Hello'},
      {name:'World'},
      {name: rows[0].solution },
      req.body
    ]);

    connection.destroy();
  });
};

exports.getItems = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT 1 + 1 AS solution', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send([
      {name:'Hello'},
      {name:'World'},
      {name: rows[0].solution }
    ]);

    connection.destroy();
  });
};

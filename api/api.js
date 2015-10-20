var mysql = require( "mysql" );

var getConnection = function () {
  return mysql.createConnection({
    host     : process.env.DBHOST,
    user     : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DBNAME
  });
};

var fcs = function ( fn ) { //functionalCommentString
  /*!Function By James Atherton - http://geckocodes.org/?hacker=James0x57 */
  /*!You are free to copy and alter however you'd like so long as you leave the credit intact! =)*/
  return fn.toString().replace(/^(\r?\n|[^\/])*\/\*!?(\r?\n)*|\s*\*\/(\r|\n|.)*$/gi,"");
};

var Queue = function () {
  this.index = -1;
  this.q = Array.prototype.slice.call( arguments );
};

Queue.prototype.then = function ( fn ) {
  this.q[ this.q.length ] = fn;
  return this;
};

Queue.prototype.go = function ( fn ) {
  if ( fn ) this.then( fn );
  if ( this.q[ this.index + 1 ] ) {
    this.index++;
    this.q[ this.index ]( this.go.bind( this ) );
  }
  return this;
};

/*
  ### database tables ###
    itemCategory -> id, category, created, updated
    itemSubcategory -> id, catid, subcategory, created, updated
    verticalplacement -> id, alias, zindex
    items -> id, catid, subcatid, itemname, item, width, depth, vertid, unitprice, created, updated
    rooms -> id, email, roomname, room, width, depth, created, updated
*/
exports.createDatabaseTables = function ( req, res ) {
  var connection = getConnection();

  new Queue( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE itemCategory (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          category VARCHAR(255) NOT NULL,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id)
        )
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE itemSubcategory (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          catid MEDIUMINT NOT NULL,
          subcategory VARCHAR(255) NOT NULL,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id),
          CONSTRAINT fk_catid FOREIGN KEY (catid) REFERENCES itemCategory(id)
        )
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE verticalplacement (
          id SMALLINT NOT NULL AUTO_INCREMENT,
          alias VARCHAR(255) NOT NULL,
          zindex TINYINT NOT NULL,
          PRIMARY KEY (id)
        )
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE items (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          catid MEDIUMINT NOT NULL,
          subcatid MEDIUMINT NULL,
          itemname VARCHAR(255) NOT NULL,
          item MEDIUMTEXT NOT NULL,
          width SMALLINT UNSIGNED,
          depth SMALLINT UNSIGNED,
          vertid SMALLINT NOT NULL,
          unitprice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (catid) REFERENCES itemCategory(id),
          FOREIGN KEY (subcatid) REFERENCES itemSubcategory(id),
          FOREIGN KEY (vertid) REFERENCES verticalplacement(id)
        )
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE rooms (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL,
          roomname VARCHAR(255) NOT NULL,
          room LONGTEXT NOT NULL,
          width SMALLINT UNSIGNED,
          depth SMALLINT UNSIGNED,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id)
        )
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).go( function ( next ) {
    connection.query( 'SELECT 1 AS solution', function ( err, rows, fields ) {
      if (err) throw err;
     
      res.send({ success: true });

      connection.destroy();
    });
  });
};

exports.getRooms = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT * FROM rooms', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send([
      {name:'Hello'},
      {name:'World'},
      //{name: rows[0].solution },
      process.argv,
      err,
      rows,
      fields
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

  connection.query( 'SELECT * FROM items', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send([
      {name:'Hello'},
      {name:'World'},
      //{name: rows[0].solution },
      err,
      rows,
      fields
    ]);

    connection.destroy();
  });
};

exports.sendEmail = function ( req, res ) {
  var nodemailer = require('nodemailer');
  // https://github.com/andris9/Nodemailer
  // http://nodemailer.com/

  var transporter = nodemailer.createTransport();
  //var transporter = nodemailer.createTransport({
  //  service: 'gmail',
  //  auth: {
  //      user: '*****',
  //      pass: '*****'
  //  }
  //});
  transporter.sendMail({
      from: 'stevetryba@4gig.com',
      to: 'james@bitovi.com',
      subject: 'hello',
      text: 'hello world!'
  }, function ( error, info ) {
    if ( error ) {
      res.send( { success: false, info: info, error: error } );
      return;
    }
    res.send( { success: true, info: info } );
  });
}

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
    clients -> id, logo, name, itemsscaleable
    itemCategory -> id, clientid, category, created, updated
    itemSubcategory -> id, catid, subcategory, created, updated
    verticalplacement -> id, clientid, alias, zindex
    items -> id, clientid, catid, subcatid, itemname, item, width, depth, vertid, unitprice, created, updated
    rooms -> id, clientid, email, roomname, room, width, depth, created, updated
*/
exports.createDatabaseTables = function ( req, res ) {
  var connection = getConnection();

  new Queue( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE clients (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          logo MEDIUMTEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          itemsscaleable TINYINT(1) DEFAULT 1,
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
        CREATE TABLE itemCategory (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          clientid MEDIUMINT NOT NULL,
          category VARCHAR(255) NOT NULL,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (clientid) REFERENCES clients(id)
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
          clientid MEDIUMINT NOT NULL,
          alias VARCHAR(255) NOT NULL,
          zindex TINYINT NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (clientid) REFERENCES clients(id)
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
          clientid MEDIUMINT NOT NULL,
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
          FOREIGN KEY (vertid) REFERENCES verticalplacement(id),
          FOREIGN KEY (clientid) REFERENCES clients(id)
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
          clientid MEDIUMINT NOT NULL,
          email VARCHAR(255) NOT NULL,
          roomname VARCHAR(255) NOT NULL,
          room LONGTEXT NOT NULL,
          width SMALLINT UNSIGNED,
          depth SMALLINT UNSIGNED,
          created DATETIME DEFAULT NULL,
          updated TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (clientid) REFERENCES clients(id)
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

exports.dropDatabaseTables = function ( req, res ) {
  var connection = getConnection();

  new Queue( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE rooms
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE items
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE itemSubcategory
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE itemCategory
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE verticalplacement
      */}),
      function ( err, rows, fields ) {
        if (err) throw err;
        next();
      }
    );
  }).then( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        DROP TABLE clients
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

exports.addClient = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT * FROM clients', function ( err, rows, fields ) {
    if (err) throw err;
   
    res.send(
      fcs(function(){/*!
        <form action="/addclient" method="POST">
          SVG Logo sourcecode:<br>
          <textarea name="logo"></textarea><br>
          <br>
          Client Name:<br>
          <input type="text" name="name"><br>
          <br>
          Can client's items be scaled? (check if yes, uncheck if no)<br>
          <input type="checkbox" name="itemsscaleable" value="1"><br>
          <br>
          <input type="submit" value="Create client"><br>
        </form><br>
        <br>
        Current clients:<br>
        <pre>
      */}) + JSON.stringify( rows, null, 2 ) + "</pre>"
    );

    connection.destroy();
  });

};

exports.doAddClient = function ( req, res ) {
  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      INSERT INTO clients ( logo, name, itemsscaleable )
      VALUES ( ?, ?, ? )
    */}),
    [ req.body.logo || "", req.body.name || "ERR NO NAME", !!( req.body.itemsscaleable || 0 ) + 0 ],
    function ( err, result ) {
      if (err) throw err;

      res.send({ success: true, newClientId: result.insertId });

      connection.destroy();
    }
  );
};

exports.getRooms = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.query.clientid ) && validParams;
  validParams = req.query.email && req.query.email.length > 4 && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();

  connection.query(
    'SELECT * FROM rooms r WHERE r.clientid = ? AND r.email = ?',
    [ parseInt( req.query.clientid || 0 ), req.query.email ],
    function ( err, rows, fields ) {
      if (err) throw err;
     
      res.send( { success: true, data: rows } );

      connection.destroy();
    }
  );
};

exports.saveRoom = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.body.clientid ) && validParams;
  validParams = req.body.email && req.body.email.length > 4 && validParams;
  //validParams = req.body.roomname && validParams;
  validParams = req.body.room && req.body.room.length > 20 && validParams;
  validParams = req.body.width && parseInt( req.body.width ) && parseInt( req.body.width ) > 0 && validParams;
  validParams = req.body.depth && parseInt( req.body.depth ) && parseInt( req.body.depth ) > 0 && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.body });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      INSERT INTO rooms ( clientid, email, roomname, room, width, depth, created )
      VALUES ( ?, ?, ?, ?, ?, ?, ? )
    */}),
    [
      parseInt( req.body.clientid ),
      req.body.email,
      req.body.roomname || "Room name not provided.",
      req.body.room,
      parseInt( req.body.width ),
      parseInt( req.body.depth ),
      Date.now()
    ],
    function ( err, result ) {
      if (err) throw err;

      res.send({ success: true, newRoomId: result.insertId });

      connection.destroy();
    }
  );
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

var mysql = require( "mysql" );

var getConnection = function () {
  var connection = mysql.createConnection({
    host     : process.env.DBHOST,
    user     : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DBNAME
  });

  connection.query(
    fcs(function(){/*!
      SELECT concat('KILL ', id, ';') AS kills
      FROM information_schema.processlist
      WHERE Command = 'Sleep'
        AND Time >= 5
    */}),
    function ( err, rows, fields ) {
      if (err) throw err;

      for ( var i = 0; i < rows.length; i++ ) {
        connection.query( rows[ i ].kills, function () {} );
      }
    }
  );

  return connection;
};

/*
var destroyConnection = function ( connection ) {
  connection.query( "KILL CONNECTION_ID()", function () { connection.destroy(); } );
};
*/

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


exports.oneoffquery = function ( req, res ) {
  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      INSERT INTO rooms ( clientid, email, roomname, room, width, depth, created )
      SELECT 12, email, roomname, room, width, depth, created
      FROM rooms
      WHERE clientid = 2
        AND email = 'preplanned'
    */}),
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, newRoomId: result.insertId });
    }
  );
};

/*
  ### database tables ###
    clients -> id, logo, name, contactemail, address
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
          logo VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          contactemail VARCHAR(255) NOT NULL,
          address TEXT NULL,
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
          item VARCHAR(255) NOT NULL,
          width SMALLINT UNSIGNED,
          depth SMALLINT UNSIGNED,
          vertid SMALLINT NOT NULL,
          itemnumber VARCHAR(255) NULL,
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

      connection.destroy();
     
      res.send({ success: true });
    });
  });
};

exports.createDatabaseTables2 = function ( req, res ) {
  var connection = getConnection();

  new Queue( function ( next ) {
    connection.query( 
      fcs(function(){/*!
        CREATE TABLE saveformfields (
          id MEDIUMINT NOT NULL AUTO_INCREMENT,
          label VARCHAR(255) NOT NULL,
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
        CREATE TABLE clientsxsavefields (
          clientid MEDIUMINT NOT NULL,
          savefieldid MEDIUMINT NOT NULL,
          required TINYINT(1) DEFAULT 0,
          FOREIGN KEY (clientid) REFERENCES clients(id),
          FOREIGN KEY (savefieldid) REFERENCES saveformfields(id)
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
        CREATE TABLE saveformdata (
          roomid MEDIUMINT NOT NULL AUTO_INCREMENT,
          savefieldid MEDIUMINT NOT NULL,
          value MEDIUMTEXT NOT NULL,
          FOREIGN KEY (roomid) REFERENCES rooms(id),
          FOREIGN KEY (savefieldid) REFERENCES saveformfields(id)
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

      connection.destroy();
     
      res.send({ success: true });
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

      connection.destroy();
     
      res.send({ success: true });
    });
  });
};




var adminHeader = fcs(function(){/*!
  <style type="text/css">
    * {
      font-family: sans-serif;
      -ms-box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      border: none;
      padding: 0px;
      margin: 0px;
    }

    body {
      background-color: #C2C2C2;
    }

    .header-bar {
      display: block;
      padding: 5px;
      height: 50px;
      line-height: 40px;
      vertical-align: middle;
      background-color: #4E4E4E;
      color: #FFFFFF;
      position: relative;
    }

    .header-bar ul {
      list-style: none;
      display: inline-block;
    }

    .header-bar .right-nav {
      position: absolute;
      right: 0;
    }

    .header-bar li {
      padding-left: 15px;
      padding-right: 15px;
      display: inline-block;
      cursor: pointer;
    }

    .header-bar li:hover {
      color: rgb( 134, 171, 199 );
    }

    .main-body {
      padding: 40px;
    }

    .page-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 20px;
    }
  </style>
  <div class="header-bar">
    <ul>
      <li onclick="window.location='/manage';">Manage Rooms</li>
      <li onclick="window.location='/addclient';">Manage Clients</li>
      <li onclick="window.location='/manageitems';">Manage Items and Categories</li>
    </ul>
  </div>
  <div class="main-body">
*/});

var adminFooter = fcs(function(){/*!
  </div>
*/});




exports.addClient = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT * FROM clients', function ( err, rows, fields ) {
    if (err) throw err;

    connection.destroy();
   
    res.send(
      adminHeader +
      fcs(function(){/*!
        <style type="text/css">
          input[type='text'] {
            padding: 10px;
            font-size: 13px;
            width: 300px;
          }

          textarea {
            padding: 10px;
            font-size: 13px;
            width: 300px;
            height: 120px;
          }

          .create-button {
            background-color: #00AA00;
            margin: 10px;
            padding: 10px;
            cursor: pointer;
            border: 1px outset #007700;
            color: #FFFFFF;
            font-size: 16px;
            border-radius: 3px;
          }
        </style>
        <div class="page-title">Create a new Client</div>
        <form action="/addclient" method="POST">
          Path to logo file (svg, jpg, png, etc..):<br>
          <input type="text" name="logo" value="/src/logos/"><br>
          <br>
          Client Name:<br>
          <input type="text" name="name"><br>
          <br>
          Client contact email:<br>
          <input type="text" name="contactemail"><br>
          <br>
          Address for the footer of the print page:<br>
          <textarea name="address"></textarea><br>
          <br>
          <input class="create-button" type="submit" value="Create client"><br>
        </form><br>
        <br>
        Current clients:<br>
        <pre>
      */}) + JSON.stringify( rows, null, 2 ) + "</pre>" + adminFooter
    );
  });

};

exports.doAddClient = function ( req, res ) {
  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      INSERT INTO clients ( logo, name, contactemail )
      VALUES ( ?, ?, ? )
    */}),
    [ req.body.logo || "", req.body.name || "ERR NO NAME", req.body.contactemail || "ERR NO EMAIL" ],
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, newClientId: result.insertId });
    }
  );
};

exports.getManage = function ( req, res ) {
  var connection = getConnection();

  var getRowHTML = function ( row ) {
    var html = "<div class='row'>";
    html += "<div class='small'><input name='roomid' type='checkbox' value='" + row.id + "'> " + row.id + "</div>";
    html += "<div class='small'>" + row.clientid + "</div>";
    html += "<div>" + row.clientname + "</div>";
    html += "<div>" + row.email + "</div>";
    html += "<div>" + row.roomname + "</div>";
    html += "<div class='small'>" + row.width + "</div>";
    html += "<div class='small'>" + row.length + "</div>";
    html += "<div>" + row.updated + "</div>";
    return html + "</div>";
  };

  connection.query(fcs(function(){/*!
        SELECT r.id, r.clientid, c.name AS clientname
            , r.email, r.roomname
            , r.width, r.depth as length
            , r.created, r.updated
        FROM rooms r
          INNER JOIN clients c ON r.clientid = c.id
      */}), function ( err, rows, fields ) {
    if (err) throw err;

    var resp = fcs(function(){/*!
      <div class="page-title">Manage Rooms</div>
      <style type="text/css">
        .row {
          display: block;
          word-wrap: no-wrap;
          border-bottom: 1px solid #777;
          font-size: 0px;
        }
        .row > * {
          display: inline-block;
          width: 200px;
          padding: 2px;
          font-size: 13px;
          vertical-align: middle;
        }
        .row > .small {
          width: 75px;
        }
        .delete-button {
          background-color: #AA0000;
          margin: 10px;
          padding: 10px;
          cursor: pointer;
          border: 1px outset #770000;
          color: white;
          font-size: 16px;
          border-radius: 3px;
        }
      </style>
      <form action="/manage" method="POST">

        <div class='row'>
          <div class="small">id</div>
          <div class="small">clientid</div>
          <div>clientname</div>
          <div>email</div>
          <div>roomname</div>
          <div class="small">width</div>
          <div class="small">length</div>
          <div>updated</div>
        </div>
        @roomlist@
        <input class="delete-button" type="submit" value="Delete selected rooms"><br>
      </form><br>
      <br>
    */});
    for ( var i = 0; i < rows.length; i++ ) {
      resp = resp.replace( "@roomlist@", getRowHTML( rows[ i ] ) + "@roomlist@" );
    }
    resp = resp.replace( "@roomlist@", "" );

    connection.destroy();

    res.send( adminHeader + resp + adminFooter );
  });
};

exports.doManage = function ( req, res ) {
  var roomids = req.body.roomid;
  if ( roomids && typeof roomids.join === "function" ) {
    roomids = roomids.join( "" );
  }
  roomids += "";
  roomids = roomids.replace( /[^\d,]/g, "" ).replace( /,,|^,|,$/, "" );
  if ( !roomids || !roomids.length ) {
    res.send( {success: false, err: "roomids invalid" } );
    return;
  }

  var connection = getConnection();

  connection.query(
    'DELETE FROM rooms WHERE id IN ( '+roomids+' )',
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, msg: result.affectedRows + " rooms deleted." });
    }
  );
};

exports.manageItemsGET = function ( req, res ) {
  var connection = getConnection();

  connection.query( 'SELECT id, name FROM clients', function ( err, rows, fields ) {
    if (err) throw err;

    connection.destroy();

    var clientDD = "";
    for ( var i = 0; i < rows.length; i++ ) {
      clientDD += '<option value="' + rows[ i ].id + '">' + rows[ i ].name + '</option>';
    }
   
    res.send(
      adminHeader +
      fcs(function(){/*!
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <style type="text/css">
          input[type='text'],
          select {
            padding: 10px;
            font-size: 13px;
            width: 300px;
          }

          textarea {
            padding: 10px;
            font-size: 13px;
            width: 300px;
            height: 120px;
          }

          .create-button {
            display: inline-block;
            background-color: #00AA00;
            margin: 10px;
            padding: 10px;
            cursor: pointer;
            border: 1px outset #007700;
            color: #FFFFFF;
            font-size: 16px;
            border-radius: 3px;
          }

          tr, td {
            vertical-align: top;
          }
        </style>
        <div class="page-title">Manage Items and Categories</div>
        <form action="/manageitems" method="POST">
          Select a client to get started:<br>
          <select id="clientdropdown" name="clientid">
            <option value="0" disabled selected>Select a client</option>
            @clientDD@
          </select><br>
          <br>
          <hr style="border-bottom: 4px outset #CCCCCC;">
          <br>
          <table width="100%">
          <tr>
            <td width="50%">
              verticalplacement / layers:<br>
              <div id="verticalOutput"></div>
            </td>
            <td width="50%">
              Add a new vertical placement layer:<br>
              Alias: <input type="text" name="vertalias"><br>
              zindex ( 0 based ): <input type="text" name="vertzindex"><br>
              <input class="create-button" type="submit" value="Create vertical placement layer"><br>
            </td>
          </tr>
          </table><br>
          <br>
          <hr style="border-bottom: 4px outset #CCCCCC;">
          <br>
          <table width="100%">
          <tr>
            <td width="50%">
              Select a category:<br>
              <div id="categoryOutput">
                <select name="category">
                  <option value="0" disabled selected>Select a category</option>
                </select>
              </div>
            </td>
            <td width="50%">
              OR add a new category:<br>
              <input type="text" name="categoryname"><br>
              <input class="create-button" type="submit" value="Create category"><br>
            </td>
          </tr>
          </table><br>
          <br>
          <hr style="border-bottom: 4px outset #CCCCCC;">
          <br>
          <table width="100%">
          <tr>
            <td width="50%">
              Subcategories:<br>
              <div id="subcategoryOutput">TODO: List of selected cat's subcats here</div>
            </td>
            <td width="50%">
              Add a new subcategory:<br>
              <input type="text" name="subcategoryname"><br>
              TODO: <input class="create-button" type="submit" value="Create subcategory"><br>
            </td>
          </tr>
          </table><br>
          <br>
          <hr style="border-bottom: 4px outset #CCCCCC;">
          <br>
          Copy the text from a spreadsheet and paste it here:<br>
          <textarea id="spreadsheetdata" name="spreadsheetdata"></textarea><br>
          <br>
          <div id="parsedatabutton" class="create-button">Parse Spreadsheet Data</div><br>

          <table id="datatable" width="100%"></table>

          <div id="submititems" class="create-button">Replace ALL Items for this client with this list.</div><br>
        </form><br>

        <script type="text/javascript">
          var categoriesSubcategories = [];
          var verticalplacements = [];
          var sSObj = [];

          $( "#submititems" ).hide();

          function getCatId( category ) {
            for ( var i = 0; i < categoriesSubcategories.length; i++ ) {
              if ( categoriesSubcategories[ i ].category === category ) {
                return categoriesSubcategories[ i ].catid;
              }
            }
            return null;
          }

          function getVertId( layer ) {
            for ( var i = 0; i < verticalplacements.length; i++ ) {
              if ( verticalplacements[ i ].zindex === layer ) {
                return verticalplacements[ i ].id;
              }
            }
            return verticalplacements[ 0 ].id;
          }

          function populateCategoryDD() {
            var categoryOutput = '<select name="category"><option value="0" disabled selected>Select a category</option>';
            var lastCat = 0;

            for ( var i = 0; i < categoriesSubcategories.length; i++ ) {
              var cat = categoriesSubcategories[ i ];
              if ( cat.catid === lastCat ) {
                continue;
              }
              categoryOutput += '<option value="' + cat.catid + '">' + cat.category + '</option>';
            }

            $( "#categoryOutput" ).html( categoryOutput + "</select>" );
            //TODO: onchange, load subcats and allow adding to those
          }

          function populateVerticalList() {
            var output = "(id) alias [layer]<br>";
            for ( var i = 0; i < verticalplacements.length; i++ ) {
              output += "(" + verticalplacements[ i ].id + ") " + verticalplacements[ i ].alias;
              output += " [" + verticalplacements[ i ].zindex + "]<br>";
            }
            $( "#verticalOutput" ).html( output );
          }

          $( "#clientdropdown" ).on( "change", function () {
            var clientid = $(this).val();
            categoriesSubcategories = [];
            verticalplacements = [];

            var jqXHR = $.ajax({
              url: "/catsubcat?clientid=" + clientid,
              type: 'GET',
              contentType: 'application/json',
              dataType: 'json',
              cache: false
            });

            jqXHR.then( function ( catsubcats ) {
              if ( !catsubcats || !catsubcats.data || !catsubcats.data.length ) {
                console.log( "Could not load catsubcats info, or it is empty." );
                return;
              }
              categoriesSubcategories = catsubcats.data;
              populateCategoryDD();
            });

            var jqXHR2 = $.ajax({
              url: "/verticalplacement?clientid=" + clientid,
              type: 'GET',
              contentType: 'application/json',
              dataType: 'json',
              cache: false
            });

            jqXHR2.then( function ( vertplacements ) {
              if ( !vertplacements || !vertplacements.data || !vertplacements.data.length ) {
                console.log( "Could not load vertplacements info, or it is empty." );
                return;
              }
              verticalplacements = vertplacements.data;
              populateVerticalList();
            });

          });

          $( "#submititems" ).on( "click", function () {
            var clientid = parseInt( $( "#clientdropdown" ).val() || 0 );

            if ( !clientid ) {
              alert( "Select a client first." );
              return;
            }

            if ( !categoriesSubcategories.length ) {
              alert( "no categories exist" );
              return;
            }
            
            if ( !verticalplacements.length ) {
              alert( "no vertical placements / layers exist" );
              return;
            }

            $( "#submititems" ).hide();

            var jqXHR = $.ajax({
              url: "/manageitems",
              type: 'POST',
              data: JSON.stringify( { clientid: clientid, items: sSObj } ),
              contentType: 'application/json',
              dataType: 'json',
              cache: false
            });

            jqXHR.then(function ( resp ) {
              if ( resp && resp.success ) {
                alert( "Items updated!" );
              } else {
                alert( "Items not updated, something went wrong. See console." );
                console.log( resp );
              }
            });
          });

          var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
          };

          function escapeHtml(string) {
            return String(string).replace(/[&<>"'\/]/g, function (s) {
              return entityMap[s];
            });
          }

          $( "#parsedatabutton" ).on( "click", function () {
            var clientid = $( "#clientdropdown" ).val();
            if ( !clientid ) {
              alert( "Select a client first" );
              return;
            }
            var sSData = $( "#spreadsheetdata" ).val();
            
            sSData = sSData.replace(
              /^([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t\$?([^\t]*)\t([^\t]*)\t([^\t]*)$/gim,
              '{ url: "/src/svgs/$1", itemname: "$2", category: "$3", subcategory: "$4", forceWidth: $5, forceHeight: $6, unitprice: $7, itemnumber: "$8", layer: $9 - 1 },'
            );

            sSData = sSData.replace( /^.*(forceWidth|forceHeight|layer): (- 1)?,.*$\n/gim, "" );

            sSData = sSData.replace( /(url: "\/src\/svgs\/)([^"]*)(", itemname: )("",)/gim, '$1$2$3"$2",' );

            sSData = sSData.replace( /unitprice: ,/gim, "unitprice: 0," );

            sSData = sSData.replace( /(unitprice: \d*),(\d+)/gim, "$1$2" );

            sSData = sSData.replace( /\s+,/gim, "," );

            sSData = sSData.replace( /(: "[^"]*)"([^,]+)/gim, '$1\\"$2' );

            sSData = sSData.replace( / category: ""/gim, ' category: "[ERR NO CATEGORY]"' );

            sSData = "[" + sSData + "]";

            //console.log( sSData );
            
            sSObj = eval( sSData );

            var tableOutputSkel = '<tr style="@style@"><td></td><td></td>';
            tableOutputSkel += '<td>@filename@</td><td>@itemname@</td><td>@category@ (@catid@)</td><td>@subcategory@</td>';
            tableOutputSkel += '<td>@width@</td><td>@depth@</td><td>@unitprice@</td><td>@Item#@</td><td>@Layer@ (@vertid@)</td>';
            tableOutputSkel += '</tr>';

            var tableOutput = tableOutputSkel.replace( /@/g, "" );

            $( "#submititems" ).show();
            var i, row, rowOut, catid, style;
            for ( i = 0; i < sSObj.length; i++ ) {
              row = sSObj[ i ];
              style = "";
              rowOut = tableOutputSkel;
              rowOut = rowOut.replace( /@filename@/gi, escapeHtml(row.url) );
              rowOut = rowOut.replace( /@itemname@/gi, escapeHtml(row.itemname) );

              rowOut = rowOut.replace( /@category@/gi, escapeHtml(row.category) );
              rowOut = rowOut.replace( /@subcategory@/gi, escapeHtml(row.subcategory) );

              row.catid = getCatId( row.category );
              if ( !row.catid ) {
                style += "background-color:red;";
                $( "#submititems" ).hide();
              }
              rowOut = rowOut.replace( /@catid@/gi, row.catid );
              //TODO: also update the row to have subcatid assigend to it at this point

              rowOut = rowOut.replace( /@width@/gi, row.forceWidth );
              rowOut = rowOut.replace( /@depth@/gi, row.forceHeight );

              rowOut = rowOut.replace( /@unitprice@/gi, row.unitprice );
              rowOut = rowOut.replace( /@Item#@/gi, row.itemnumber );

              if ( row.layer < 0 ) row.layer = 0;
              rowOut = rowOut.replace( /@Layer@/gi, row.layer );
              row.vertid = getVertId( row.layer );
              rowOut = rowOut.replace( /@vertid@/gi, row.vertid );

              rowOut = rowOut.replace( /@style@/gi, style );
              tableOutput += rowOut;
            }

            $( "#datatable" ).html( tableOutput );
          });
        </script>
        <br>
      */}).replace(
        /@clientDD@/g, clientDD
      ) + adminFooter
    );
  });

};

var doAddCategory = function ( req, res ) {
  var connection = getConnection();

  var clientid = parseInt( req.body.clientid );
  var category = req.body.categoryname;

  connection.query(
    fcs(function(){/*!
      INSERT INTO itemCategory ( clientid, category )
      VALUES ( ?, ? )
    */}),
    [ clientid, category ],
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, newCategoryId: result.insertId });
    }
  );
};

var replaceClientItems = function ( req, res ) {
  var clientid = parseInt( req.body.clientid );
  var items = req.body.items;

  if ( !( clientid && items && items.length ) ) {
    return res.send({ success: false, params: req.body });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      DELETE FROM items
      WHERE clientid = ?
    */}),
    [ clientid ],
    function ( err, result ) {
      if (err) throw err;

      var qry = fcs(function(){/*!
        INSERT INTO items
          ( clientid, catid, subcatid, itemname, item, width, depth, vertid, unitprice )
        VALUES
      */});

      for ( var i = 0; i < items.length; i++ ) {
        var item = items[ i ];
        var insertvals = [
          clientid,
          item.catid,
          item.subcatid || null,
          item.itemname,
          item.url,
          item.forceWidth,
          item.forceHeight,
          item.vertid,
          item.unitprice || 0
        ];

        qry += "\n( " + connection.escape( insertvals ) + " ),";
      }

      //turn last row , into ; to signify end of inserts
      qry = qry.replace( /,$/, ";" );

      connection.query(
        qry,
        function ( err, result ) {
          connection.destroy();

          res.send({ success: true, newCategoryId: result.insertId });
        }
      );
    }
  );
};

exports.manageItemsPOST = function ( req, res ) {
  if ( req.body.categoryname && parseInt( req.body.clientid ) ) {
    return doAddCategory( req, res );
  }

  if ( parseInt( req.body.clientid ) && parseInt( req.body.vertzindex ) > -1 && req.body.vertalias ) {
    return exports.addVerticalPlacements( req, res );
  }

  if ( parseInt( req.body.clientid ) && req.body.items && req.body.items.length ) {
    return replaceClientItems( req, res );
  }

  res.send({ success: false, params: req.body });
};





exports.getCategorySubcategory = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.query.clientid ) && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      SELECT c.id AS catid, c.category, s.id AS subcatid, s.subcategory
      FROM itemCategory c
        LEFT JOIN itemSubcategory s ON c.id = s.catid
      WHERE c.clientid = ?
    */}),
    [ parseInt( req.query.clientid || 0 ) ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
     
      res.send( { success: true, data: rows } );
    }
  );
};

exports.getVerticalPlacements = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.query.clientid ) && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      SELECT v.id, v.alias, v.zindex
      FROM verticalplacement v
      WHERE v.clientid = ?
    */}),
    [ parseInt( req.query.clientid || 0 ) ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
     
      res.send( { success: true, data: rows } );
    }
  );
};

exports.addVerticalPlacements = function ( req, res ) {
  var clientid = parseInt( req.body.clientid );
  var alias = req.body.vertalias;
  var zindex = parseInt( req.body.vertzindex );

  if ( !( clientid && alias && zindex >= 0 ) ) {
    return res.send({ success: false, params: req.body });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      INSERT INTO verticalplacement ( clientid, alias, zindex )
      VALUES ( ?, ?, ? )
    */}),
    [ clientid, alias, zindex ],
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, newVertId: result.insertId });
    }
  );
};


var getRoomsFull = function ( req, res ) {
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

      connection.destroy();
      
      res.send( { success: true, data: rows } );
    }
  );
};

var getRooms = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.query.clientid ) && validParams;
  validParams = req.query.email && req.query.email.length > 4 && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();

  connection.query(
    'SELECT r.id, r.roomname, r.width, r.depth, r.updated FROM rooms r WHERE r.clientid = ? AND r.email = ?',
    [ parseInt( req.query.clientid || 0 ), req.query.email ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
     
      res.send( { success: true, data: rows } );
    }
  );
};

var getOneRoom = function ( req, res ) {
  var validParams = true;
  validParams = parseInt( req.query.roomid ) && validParams;

  if ( !validParams ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();
  connection.query(
    'SELECT r.id, r.roomname, r.width, r.depth, r.updated, r.room FROM rooms r WHERE r.id = ?',
    [ parseInt( req.query.roomid || 0 ) ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
     
      res.send( { success: true, data: rows } );
    }
  );
};

exports.roomsGET = function ( req, res ) {
  if ( parseInt( req.query.roomid || 0 ) ) {
    return getOneRoom( req, res );
  }

  if ( ( req.query.email || "" ) === "preplanned" ) {
    return getRoomsFull( req, res );
  }
  
  return getRooms( req, res );
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
      Date.now() //TODO: this should probably be 'new Date()' so mysql plugin escapes correctly
    ],
    function ( err, result ) {
      if (err) throw err;

      connection.destroy();

      res.send({ success: true, newRoomId: result.insertId });
    }
  );
};

exports.getClient = function ( req, res ) {
  var clientid = parseInt( req.query.clientid || 0 );

  if ( !clientid ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();

  connection.query(
    fcs(function(){/*!
      SELECT id, logo, name, contactemail
      FROM clients
      WHERE id = ?
    */}),
    [ clientid ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
     
      res.send( { success: true, data: rows } );
    }
  );
};

exports.getItems = function ( req, res ) {
  var clientid = parseInt( req.query.clientid || 0 );

  if ( !clientid ) {
    return res.send({ success: false, params: req.query });
  }

  var connection = getConnection();
  // CONCAT( '/src/svgs/', i.item ) AS url
  connection.query(
    fcs(function(){/*!
      SELECT i.id, i.catid, i.subcatid, i.itemname
        , i.item AS url
        , c.category
        , COALESCE( s.subcategory, '' ) AS subcategory
        , i.width AS forceWidth
        , i.depth AS forceHeight
        , i.unitprice
        , COALESCE( i.itemnumber, '' ) AS itemnumber
        , v.zindex AS layer
      FROM items i
        INNER JOIN verticalplacement v ON v.id = i.vertid AND v.clientid = i.clientid
        INNER JOIN itemCategory c ON c.id = i.catid AND c.clientid = i.clientid
        LEFT JOIN itemSubcategory s ON s.id = i.subcatid AND s.catid = i.catid
      WHERE i.clientid = ?
    */}),
    [ clientid ],
    function ( err, rows, fields ) {
      if (err) throw err;

      connection.destroy();
       
      res.send( { success: true, data: rows } );
    }
  );
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

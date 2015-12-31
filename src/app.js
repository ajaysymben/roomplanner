import AppMap from "can-ssr/app-map";
import route from "can/route/";
import 'can/map/define/';
import 'can/route/pushstate/';
import Roomplan from './models/roomplan';

const AppViewModel = AppMap.extend({
  define: {
    title: {
      value: 'svg-roomplanner',
      serialize: false
    },
    partsMenuExpanded: {
      value: true,
      serialize: false
    },
    savedRoomsList: {
      value: [],
      serialize: false
    },
    message: {
      value: "",
      serialize: false
    },
    showReturnButtonOnMessage: {
      value: true,
      serialize: false
    },
    partsByCategory: {
      serialize: false
    },
    clientInfo: {
      serialize: false
    },
    saveFields: {
      serialize: false
    },
    show3DButton: {
      serialize: false,
      get: function () {
        var loc = window.location.href.toLowerCase();
        var showIt = false;
        if ( loc.indexOf( "localhost" ) !== -1 ) {
          showIt = true;
        }
        if ( loc.indexOf( "3d" ) !== -1 ) {
          showIt = true;
        }
        return showIt;
      }
    },
    roomname: {
      value: "",
      serialize: false
    },
    preSavedRooms: {
      value: [],
      serialize: false
    },
    itemSummary: {
      //TODO: Use DB ID instead of itemname
      get: (function(){
        var partsByCategory = [];
        var itemSummary = [];

        var findSummaryPartById = function ( id ) {
          for ( var i = 0; i < itemSummary.length; i++ ) {
            if ( itemSummary[ i ].itemname === id ) {
              return itemSummary[ i ];
            }
          }
          return null;
        };

        var findPartById = function ( id ) {
          var c, catparts, s, subcatparts, p;
          for ( c = 0; c < partsByCategory.length; c++ ) {
            catparts = partsByCategory[ c ].parts;
            for ( p = 0; p < catparts.length; p++ ) {
              if ( catparts[ p ].itemname === id ) {
                return catparts[ p ];
              }
            }
            catparts = partsByCategory[ c ].subcategories;
            for ( s = 0; s < catparts.length; s++ ) {
              subcatparts = catparts[ s ].parts;
              for ( p = 0; p < subcatparts.length; p++ ) {
                if ( subcatparts[ p ].itemname === id ) {
                  return subcatparts[ p ];
                }
              }
            }
          }
          return null;
        };

        return function ( items ) {
          partsByCategory = this.attr( "partsByCategory" );
          itemSummary = [];

          var partsInPlan = $( ".planning-area interactive-svg svg > g > g" );
          var itemSummaryTotal = 0;

          partsInPlan.each(function ( x, item ) {
            var idFromItem = this.getAttribute( "data-part-title" );
            var summaryEntry = findSummaryPartById( idFromItem );
            if ( summaryEntry ) {
              itemSummaryTotal += (parseFloat( summaryEntry.unitprice ) || 0);
              summaryEntry.qty++;
            } else if ( idFromItem ) {
              var part = findPartById( idFromItem );

              if ( part ) {
                part = part.serialize();
                part.qty = 1;
                itemSummaryTotal += (parseFloat( part.unitprice ) || 0);
                itemSummary.push( part );
              }
            }
          });

          this.attr( "itemSummaryTotal", itemSummaryTotal.toFixed( 2 ) );

          return itemSummary;
        };
      })(),
      serialize: false
    },
    menuAction: {
      value: "gettingstarted",
      set: function ( newValue ) {
        if ( newValue === "print" ) {
          $( "html, body" ).addClass( "printing" );
          setTimeout(function () { window.print(); }, 250);
        } else {
          $( "html, body" ).removeClass( "printing" );
        }
        return newValue;
      },
      serialize: false
    },

    isvgConfig: {
      value: {
        isRunningInBrowser: !( typeof process === "object" && {}.toString.call(process) === "[object process]" ),

        layers: 5,

        //SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch or whatever )
        scalarUnitsToViewBoxPoints: 10,

        //grid lines every x units
        gridLinesEvery: 12,

        //dimensions in inches
        //width: 40 * 12,
        height: 30 * 12,

        //specify what element parts in the svg can be interacted with
        iQueryString: "> g > g"
      },
      serialize: false
    },

    itemSummaryTotal: {
      value: 0,
      serialize: false
    },

    isRunningInBrowser: {
      value: !( typeof process === "object" && {}.toString.call(process) === "[object process]" ),
      serialize: false
    }
    //isRunningInNode: typeof process === "object" && {}.toString.call(process) === "[object process]",
    //isRunningInNode2: typeof module !== 'undefined' && module.exports,
  },

  init: function () {
    var vm = this;
    can.route( ":clientid" );
    can.route( ":clientid/:roomid" );
    //can.route.bind( 'change', function ( ev, attr, how, newVal, oldVal ) {
    can.route.ready();

    var clientid = parseInt( can.route.attr( "clientid" ) ) || 2;
    var roomid = parseInt( can.route.attr( "roomid" ) ) || 0;

    //overwrite url specified clientid and default with domain specific client
    //TODO: make subdomain lookup dynamic -- send it to the server and fetch with client query
    if ( window.location.href.indexOf( "flinnsci" ) !== -1 ) {
      clientid = 12;
    }

    can.route.attr( "clientid", clientid );

    if ( roomid ) {
      can.route.attr( "roomid", roomid );
    }

    can.route.ready();

    if ( !vm.attr( "isRunningInBrowser" ) ) {
      return;
    }

    var jqXHR = $.ajax({
      url: "/clients?clientid=" + clientid,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    });

    jqXHR.then( function ( client ) {
      if ( !client || !client.data || !client.data.length ) {
        console.log( "Could not load client info." );
        return;
      }
      vm.attr( "clientInfo", client.data[ 0 ] );

      $.ajax({
        url: "/saveformfields?clientid=" + clientid,
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        cache: false
      }).then( function ( fields ) {
        vm.attr( "saveFields", fields.data );
      });
    });

    if ( roomid ) {
      jqXHR.then( function () {
        vm.loadRoomFromID( roomid );
      });
    }
  },

  loadItemSummary: function () {
    this.attr( "itemSummary", null );
    this.attr( "itemSummary" );
    this.attr( "itemSummaryTotal" );
  },

  extendedPrice: function ( qty, price ) {
    return ( qty * price ).toFixed( 2 );
  },

  createRoom: function () {
    var roomname = $( ".room-name" ).val();

    var width = ( parseFloat( $( ".width-feet" ).val() ) || 0 ) * 12;
    width += ( parseFloat( $( ".width-inches" ).val() ) || 0 );

    var length = ( parseFloat( $( ".length-feet" ).val() ) || 0 ) * 12;
    length += ( parseFloat( $( ".length-inches" ).val() ) || 0 );

    if ( length > 0 && width > 0 ) {
      this.attr( "isvgConfig.width", 0 ); //removes isvg from the dom, clearing anything there
      this.attr( "isvgConfig.svg", null ); //makes sure no previously set svg is used as basis

      this.attr( "roomname", roomname );
      this.attr( "isvgConfig.height", length );
      this.attr( "isvgConfig.width", width );
      this.attr( "menuAction", "none" );
    }
  },

  saveRoom: function () {
    var clientid = this.attr( "clientInfo.id" );
    if ( !clientid ) {
      console.log( "No client info loaded" );
      return;
    }
    var vm = this;
    var postData = {
      clientid: clientid,
      room: $( "<div/>" ).append( $( ".planning-area interactive-svg svg" ).clone() ).html(),
      width: this.attr( "isvgConfig.width" ),
      depth: this.attr( "isvgConfig.height" ),
      roomname: $( ".room-name" ).val() || $( ".room-firstandlastname" ).val(),
      email: $( ".room-email" ).val(),
      formdata: []
    };

    var fields = vm.attr( "saveFields" );
    var value = "";
    if ( fields && fields.length ) {
      for ( var i = 0; i < fields.length; i++ ) {
        if ( !fields[ i ].included ) continue;
        value = "";

        switch ( fields[ i ].id ) {
          case 2:
            value = $( ".room-name" ).val();
          break;
          case 12:
            value = $( ".room-firstandlastname" ).val();
          break;
          case 22:
            value = $( ".room-email" ).val();
          break;
          case 32:
            value = $( ".room-phone" ).val();
          break;
          case 42:
            value = $( ".room-school" ).val();
          break;
          case 52:
            value = $( ".room-state" ).val();
          break;
          case 62:
            value = $( ".room-zip" ).val();
          break;
          case 72:
            value = $( ".room-timeframe:checked" ).val();
          break;
          case 82:
            value = $( ".room-comments" ).val();
          break;
        }

        if ( fields[ i ].required && !value ) {
          alert( fields[ i ].label + " is required." );
          return null;
        }

        //todo: prompt for pw if email is "preplanned"

        postData.formdata.push({
          fieldid: fields[ i ].id,
          label: fields[ i ].label,
          value: value
        });
      }
    }

    vm.attr( "showPrintButtonOnMessage", false );
    vm.attr( "showReturnButtonOnMessage", false );
    vm.attr( "message", "Saving..." );
    vm.attr( "menuAction", "message" );

    return Roomplan.create(
      postData,
      function ( data ) {
        vm.attr( "showPrintButtonOnMessage", true );
        vm.attr( "showReturnButtonOnMessage", true );
        vm.attr( "message", "Save Successful!" );
        vm.attr( "menuAction", "message" );
      },
      function ( data ) {
        vm.attr( "showPrintButtonOnMessage", false );
        vm.attr( "showReturnButtonOnMessage", true );
        vm.attr( "message", "Save Failed.<br>Please try again in a moment." );
        vm.attr( "menuAction", "message" );
        console.log( data );
      }
    );
  },

  searchRooms: function () {
    var email = $( ".room-email" ).val();
    if ( !email ) {
      return;
    }

    var clientid = this.attr( "clientInfo.id" );
    if ( !clientid ) {
      console.log( "No client info loaded" );
      return;
    }

    var vm = this;

    return Roomplan.findAll({
      clientid: clientid,
      email: email
    }).then(function ( rooms ) {
      var i, room, updated, title, hours, minutes, ampm;

      if ( !rooms || !rooms.length ) {
        vm.attr( "savedRoomsList", [{ id:0, title: "No rooms found with the provided email address." }] );
        return rooms;
      }

      for ( i = 0; i < rooms.length; i++ ) {
        room = rooms[ i ];
        updated = new Date( room.attr( "updated" ) );
        title = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"][ updated.getMonth() ];
        title += ". " + updated.getDate() + ", " + updated.getFullYear();

        hours = updated.getHours();
        minutes = updated.getMinutes();
        ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;

        title += " " + hours + ':' + minutes + ampm + " - ";
        title += room.attr( "roomname" );
        room.attr( "title", title ); //"Oct. 30, 2015 10:00am - This Is A Long Science Room Name"
      }

      vm.attr( "savedRoomsList", rooms );
    });
  },

  loadRoomFromID: function ( roomid ) {
    var vm = this;
    return Roomplan.findOne({
      roomid: roomid
    }).then(function ( roominfo ) {
      //TODO: save if dirty first
      vm.attr( "isvgConfig.width", 0 );
      vm.attr( "isvgConfig.svg", $( "<div/>" ).html( roominfo.room ).find( "svg" ) );
      vm.attr( "isvgConfig.height", roominfo.depth );
      vm.attr( "isvgConfig.width", roominfo.width );
      vm.attr( "roomname", roominfo.roomname );
      vm.attr( "menuAction", "none" );
    });
  },

  deleteRoom: function ( roomid, title ) {
    var email = $( ".room-email" ).val();
    if ( !email ) {
      alert( "Please enter your email address to delete this room." );
      return;
    }
    var doit = confirm( "Permanately Delete this room? \n" + title );
    console.log( doit );
    //TODO make it
  },

  menuActionNone: function () {
    this.attr( "menuAction", "none" );
  },

  menuActionPrint: function () {
    this.attr( "menuAction", "print" );
  },

  menuActionToggle3D: function () {
    if ( this.attr( "menuAction" ) === "none" ) {
      this.attr( "menuAction", "3d" );
    } else {
      this.attr( "menuAction", "none" );
    }
  },

  cloneRoomSVGTo: function ( el ) {
    $( el ).append( $( ".planning-area interactive-svg svg" ).clone() );

    var unitWidth = this.attr( "isvgConfig.width" );
    var unitHeight = this.attr( "isvgConfig.height" );

    var printWidth = 7;
    var printHeight = printWidth * unitHeight / unitWidth;

    if ( printHeight > 9 ) {
      printHeight = 9;
      printWidth = printHeight * unitWidth / unitHeight;
    }

    $( el ).css({ height: printHeight + "in", width: printWidth + "in" });
  }

});

export default AppViewModel;

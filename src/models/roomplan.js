import can from 'can';

export const Roomplan = can.Model.extend({
  parseModels: function ( data ) {
    return data;
  },

  findOne: function ( params, success, error ) {
    if ( !params.roomid ) {
      console.log( "bad call to roomplan - findOne" );
      return null;
    }

    return $.ajax({
      url: can.sub( "/rooms?roomid={roomid}", params, true ),
      type: 'GET',
      dataType: 'json',
      cache: false
    }).then(function ( roominfo ) {
      if ( roominfo.data ) {
        if ( roominfo.data.length ) {
          return roominfo.data[ 0 ];
        }
        return roominfo.data;
      }
      return roominfo;
    });
  },

  findAll: function ( params, success, error ) {
    return $.ajax({
      url: can.sub( "/rooms?clientid={clientid}&email={email}", params, true ),
      //data: JSON.stringify( params ),
      type: 'GET',
      dataType: 'json',
      cache: false
    }).then( function ( rooms ) {
      return rooms;
    }).fail( function ( ) {
      return [];
    });
  },

  create: function ( params, success, error ) {
    var jqXHR = $.ajax({
      url: "/rooms",
      data: JSON.stringify( params ),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    });

    if ( success ) jqXHR.then( success );
    if ( error ) jqXHR.fail( error );

    return jqXHR;
  },

  //TODO: fix urls and use these in app
  update: function ( params, success, error ) {
    return $.ajax({
      url: "/roomplan",
      data: JSON.stringify( params ),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    }).then( function ( room ) {
      return room;
    });
  },

  destroy: function ( params, success, error ) {
    return $.ajax({
      url: "/roomplan",
      data: JSON.stringify( params ),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    }).then( function ( room ) {
      return room;
    });
  }
}, {});

export default Roomplan;

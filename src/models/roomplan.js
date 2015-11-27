import can from 'can';

export const Roomplan = can.Model.extend({
  parseModels: function ( data ) {
    return data;
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

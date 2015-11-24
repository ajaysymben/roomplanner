import AppMap from "can-ssr/app-map";
import route from "can/route/";
import 'can/map/define/';
import 'can/route/pushstate/';

const AppViewModel = AppMap.extend({
  define: {
    title: {
      value: 'svg-roomplanner',
      serialize: false
    },
    partsMenuExpanded: {
      value: true,
      serialize: false
    }
  },

  menuAction: "new",

  isRunningInBrowser: !( typeof process === "object" && {}.toString.call(process) === "[object process]" ),
  //isRunningInNode: typeof process === "object" && {}.toString.call(process) === "[object process]",
  //isRunningInNode2: typeof module !== 'undefined' && module.exports,

  isvgConfig: {
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

  roomname: "",

  createRoom: function () {
    var roomname = $( ".room-name" ).val();

    var width = ( parseFloat( $( ".width-feet" ).val() ) || 0 ) * 12;
    width += ( parseFloat( $( ".width-inches" ).val() ) || 0 );

    var length = ( parseFloat( $( ".length-feet" ).val() ) || 0 ) * 12;
    length += ( parseFloat( $( ".length-inches" ).val() ) || 0 );

    if ( length > 0 && width > 0 ) {
      this.attr( "isvgConfig.width", 0 ); //removes isvg from the dom, clearing anything there

      this.attr( "roomname", roomname );
      this.attr( "isvgConfig.height", length );
      this.attr( "isvgConfig.width", width );
      this.attr( "menuAction", "none" );
    }
  },

  saveRoom: function () {
    var postData = {
      clientid: 2, //TODO: use app's client info
      room: $( "<div/>" ).append( $( ".planning-area interactive-svg svg" ).clone() ).html(),
      width: this.attr( "isvgConfig.width" ),
      depth: this.attr( "isvgConfig.height" ),
      roomname: $( ".room-name" ).val(),
      email: $( ".room-email" ).val()
    };

    return $.ajax({
      url: "/rooms",
      data: JSON.stringify( postData ),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    }).then( function ( resp ) {
      //TODO: get rid of this log
      console.log( "room saved response", resp );
    });
  },

  menuActionNone: function () {
    this.attr( "menuAction", "none" );
  }

});

export default AppViewModel;

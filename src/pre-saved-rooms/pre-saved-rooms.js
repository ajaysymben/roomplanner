import Component from 'can/component/';
import 'can/map/define/';
import './pre-saved-rooms.less!';
import template from './pre-saved-rooms.stache!';
import Roomplan from '../models/roomplan';

export const ViewModel = Roomplan.extend({}, {
  define: {
    message: {
      value: 'This is the pre-saved-rooms component'
    }
  },
  //rooms: [],
  loadRoom: function ( el, roominfo ) {
    //TODO: save if dirty first
    this.attr( "isvgConfig.width", 0 );

    this.attr( "isvgConfig.svg", $( el ).find( "svg" ) );
    this.attr( "isvgConfig.height", roominfo.depth );
    this.attr( "isvgConfig.width", roominfo.width );
    this.attr( "roomname", roominfo.roomname );
    this.attr( "menuAction", "none" );
  },
  insertSVG: function ( el, svgHTML ) {
    var svg = $( svgHTML ).appendTo( el );
    if ( svg.width() < svg.height() ) {
      svg[0].setAttribute( "class", "constrain-height" );
    } else {
      svg[0].setAttribute( "class", "constrain-width" );
    }
  },
  valueInFeetAndInches: function ( value ) {
    var ft = ~~( value / 12 );
    var inches = parseFloat( ( value - ft * 12 ).toFixed( 2 ).replace( /0+$/, "" ).replace( /\.$/, "" ) );
    if ( inches >= 12 ) {
      ft++;
      inches = 0;
    }
    if ( !inches ) {
      return ft + "'";
    }
    return ft + "' " + inches + '"';
  }
});

export default Component.extend({
  tag: 'pre-saved-rooms',
  viewModel: ViewModel,
  template,
  events: {
    "inserted": function ( $el, ev ) {
      var vm = this.viewModel;
      if ( !vm ) return;

      if ( !vm.attr( "isvgConfig.isRunningInBrowser" ) ) {
        return;
      }

      //console.log( "pre-saved-rooms.js", vm.attr( "clientInfo.id" ) );
      if ( vm.attr( "rooms" ) && vm.attr( "rooms" ).length ) {
        return;
      }
      Roomplan.findAll({
        clientid: vm.attr( "clientInfo.id" ),
        email: "preplanned"
      }).then(function ( rooms ) {
        vm.attr( "rooms", rooms );
      });
    }
  }
});
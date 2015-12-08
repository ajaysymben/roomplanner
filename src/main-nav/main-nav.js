import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './main-nav.less!';
import template from './main-nav.stache!';

export const ViewModel = Map.extend({
	define: {
		message: {
			value: 'This is the main-nav component'
		}
	},
	//clientLogo: "/src/logos/flinn-logo.svg",
	//clientLogo: "/src/logos/ScienceRoomPlanner-LogoV1.jpg",

	setAction: function ( newState ) {
		//console.log(newState)
		this.attr( "menuAction", newState );
	}
});

export default Component.extend({
	tag: 'main-nav',
	viewModel: ViewModel,
	template,
	events: {
		".icon-menu-toggle click": function () {
			var vm = this.viewModel;
			var curState = vm.attr( "partsMenuExpanded" );
			//console.log( curState, "->", !curState );
			vm.attr( "partsMenuExpanded", !curState );
			setTimeout( function () {
				var isvg = $( "interactive-svg" );
				if ( isvg.length ) {
					can.trigger( isvg, "resize" );
				}
			}, 500);
		}
	}
});
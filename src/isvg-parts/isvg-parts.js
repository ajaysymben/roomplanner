import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './isvg-parts.less!';
import template from './isvg-parts.stache!';


var supportTouch = !window._phantom && "ontouchend" in document;

// Use touch events or map it to mouse events
var startEvent = supportTouch ? "touchstart" : "mousedown";
var stopEvent = supportTouch ? "touchend" : "mouseup";
var moveEvent = supportTouch ? "touchmove" : "mousemove";

export const ViewModel = Map.extend({
	define: {
		message: {
			value: 'This is the interactive-svg-parts component'
		}
	},

	svgPartGhost: null,
	currentPartInfo: null,
	currentISVGHover: null,
	currentInteractionOn: null,

	insertSVGPart: function ( el, svgUrl ) {
		if ( svgUrl ) {
			$.get(
				svgUrl,
				(function ( data ) {
					if ( !data || !data.getElementsByTagName ) {
						this.parentNode.style.display = "none";
						console.log( "svg file missing:", svgUrl );
						return;
					}
					this.appendChild( data.getElementsByTagName( "svg" )[ 0 ] );
				}).bind( el )
			);
		}
	}
});


	// options: ( pos and dimensions are based on Units )
	// layer
	// centerXPos, centerYPos //if not specified, newSVGEl is aligned to top-left corner
	// forceWidth //if forceHeight is not used, scale is uniform based on forceWidth
	// forceHeight //if forceWidth is not used, scale is uniform based on forceHeight
	// useScale //forceWidth and forceHeight need to not be used
	// useScaleX, useScaleY //forceWidth and forceHeight need to not be used
	//addFromSVGAsGroup: function ( newSVGEl, options ) {

export default Component.extend({
	tag: 'interactive-svg-parts',
	viewModel: ViewModel,
	template,
	events: {
		"{scope} config.parts": function () {
			var vm = this.viewModel;
			if ( !vm ) return;

			var config = vm.config;
			if ( !config || !config.parts || !config.parts.length ) {
				return;
			}

			vm.attr( "parts", config.parts );
		},

		[".isvg-part " + startEvent]: function ( $el, ev ) {
			ev.preventDefault();
			var touches = ev.originalEvent.touches;
			var pageX = ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
			var pageY = ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;

			var vm = this.viewModel;
			if ( vm.config && vm.config.onBeforeStartMove ) vm.config.onBeforeStartMove();
			vm.attr( "currentInteractionOn", "newsvgpart" );
			vm.attr( "$isvg", $( "interactive-svg" ) );

			var svgPartGhost = document.createElement( "div" );
			svgPartGhost.appendChild( $el.find( "svg" ).clone()[ 0 ] );
			svgPartGhost.className = "isvg-part-ghost";

			$( "body" ).append( svgPartGhost );
			$( svgPartGhost ).css({
				left: pageX - svgPartGhost.offsetWidth / 2,
				top: pageY - svgPartGhost.offsetHeight / 2
			});

			vm.attr( "svgPartGhost", svgPartGhost );
			vm.attr( "currentPartInfo", vm.attr( "parts" )[ $el.prevAll().length ] );
		},

		["{document} " + moveEvent]: function ( $el, ev ) {
			var touches = ev.originalEvent.touches;
			var pageX = ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
			var pageY = ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;

			var vm = this.viewModel;
			if ( vm.attr( "currentInteractionOn" ) !== "newsvgpart" ) return;

			ev.preventDefault();
			var $isvgs = vm.attr( "$isvg" );
			var svgPartGhost = vm.attr( "svgPartGhost" );

			if ( !svgPartGhost ) return;

			$( svgPartGhost ).css({
				left: pageX - svgPartGhost.offsetWidth / 2,
				top: pageY - svgPartGhost.offsetHeight / 2
			});

			var curISVG = null;
			$isvgs.each(function ( i, el ) {
				var elPos = el.getBoundingClientRect();
				if ( elPos.left <= pageX && pageX <= elPos.right && elPos.top <= pageY && pageY <= elPos.bottom ) {
					curISVG = el;
				}
			});

			vm.attr( "currentISVGHover", curISVG );

			if ( !curISVG ) return;
			//TODO: scale ghost to $( curISVG ).viewModel().scale
		},

		["{document} " + stopEvent]: function ( $el, ev ) {
			var vm = this.viewModel;
			if ( vm.attr( "currentInteractionOn" ) !== "newsvgpart" ) return;

			var svgPartGhost = vm.attr( "svgPartGhost" );
			var curISVG = vm.attr( "currentISVGHover" );

			if ( svgPartGhost && curISVG ) {
				var isvgVM = $( curISVG ).viewModel();
				var scalarUnitsToPx = isvgVM.attr( "scalarUnitsToPx" );
				var touches = ev.originalEvent.changedTouches;
				var pageX = ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
				var pageY = ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;
				var curUnitsX = ( pageX - $( curISVG ).offset().left ) / scalarUnitsToPx;
				var curUnitsY = ( pageY - $( curISVG ).offset().top ) / scalarUnitsToPx;
				var options = vm.attr( "currentPartInfo" ).serialize();
				options.centerXPos = curUnitsX;
				options.centerYPos = curUnitsY;

				isvgVM.addFromSVGAsGroup( $( svgPartGhost ).find( "svg" ), options );
			}

			$( ".isvg-part-ghost" ).remove();
			vm.attr( "svgPartGhost", null );
			vm.attr( "currentPartInfo", null );
			vm.attr( "currentISVGHover", null );
			vm.attr( "currentInteractionOn", null );

			if ( vm.config && vm.config.onAfterStopMove ) vm.config.onAfterStopMove();
		}
	}
});

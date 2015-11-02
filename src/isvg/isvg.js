import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './isvg.less!';
import template from './isvg.stache!';

/*
		noSelection: function(elm) {
			elm = elm || this.delegate
			document.documentElement.onselectstart = function() {
				// Disables selection
				return false;
			};
			document.documentElement.unselectable = "on";
			this.selectionDisabled = (this.selectionDisabled ? this.selectionDisabled.add(elm) : $(elm));
			this.selectionDisabled.css('-moz-user-select', '-moz-none');
		},

		selection: function() {
			if(this.selectionDisabled) {
				document.documentElement.onselectstart = function() {};
				document.documentElement.unselectable = "off";
				this.selectionDisabled.css('-moz-user-select', '');
			}
		},
*/

// function to clear the window selection if there is one
var clearSelection = window.getSelection ? function(){
	window.getSelection().removeAllRanges()
} : function(){};

var supportTouch = !window._phantom && "ontouchend" in document;

// Use touch events or map it to mouse events
var startEvent = supportTouch ? "touchstart" : "mousedown";
var stopEvent = supportTouch ? "touchend" : "mouseup";
var moveEvent = supportTouch ? "touchmove" : "mousemove";

export const ViewModel = Map.extend({
	/*
		Expects config passed in through one-way parent -> child binding with attributes:
	    "isRunningInBrowser" true if not ssr, must be true to fully work,

			//the svg element to load from, optional
	    "svg"

			//number of layers the interactive svg has or should use, default is 0 (no layers)
	    "layers"

	    //SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch or whatever )
	    "scalarUnitsToViewBoxPoints" default: 10

	    //grid lines every x units
	    "gridLinesEvery" default is 1 but it only shows a grid if the value is > 1

	    //dimensions in units ( inches, cm, or whatever )
	    "height"
	    "width"

	    //interactive items query string; specifies what svg parts can be interacted with
	    "iQueryString" default with layers: "> g > *", default without layers: "> *"
	*/

	//scalarUnitsToPx * units = px at current size
	scalarUnitsToPx: 1, //set on inserted and on window resize via this.setUnitScaleSizes()

	//scalarPxToViewBoxPoints * px at current size = viewBoxPoints
	scalarPxToViewBoxPoints: 10, //set on inserted and on window resize via this.setUnitScaleSizes()

	//scalarUnitsToViewBoxPoints * units = viewBoxPoints. Not effected from window resize.
	scalarUnitsToViewBoxPoints: 10, //set during init event from config

	pointIsInSvgPart: function ( svgPart, xUnits, yUnits, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		var geo = svgPartInfo.geo;
		var sUtVBP = this.attr( "scalarUnitsToViewBoxPoints" );
		var xVBP = xUnits * sUtVBP;
		var yVBP = yUnits * sUtVBP;

		if ( ( xVBP - geo.A.x ) * geo.bax + ( yVBP - geo.A.y ) * geo.bay < 0 ) return false;
		if ( ( xVBP - geo.B.x ) * geo.bax + ( yVBP - geo.B.y ) * geo.bay > 0 ) return false;
		if ( ( xVBP - geo.A.x ) * geo.cax + ( yVBP - geo.A.y ) * geo.cay < 0 ) return false;
		if ( ( xVBP - geo.C.x ) * geo.cax + ( yVBP - geo.C.y ) * geo.cay > 0 ) return false;

		return true
	},

	rotatePoint: function ( px, py, angle, cx, cy ) {
		var s = Math.sin( angle );
		var c = Math.cos( angle );

		px -= cx;
		py -= cy;

		return {
			x: px * c - py * s + cx,
			y: px * s + py * c + cy
		};
	},

	setGeometryInfo: function ( info ) {
		info.geo = {};
		//bottom left corner
		info.geo.A = this.rotatePoint( info.translateX + info.viewBoxPointsOffsetX, info.translateY + info.viewBoxPointsOffsetY + info.viewBoxPointsHeight, info.rotation, info.translateX + info.viewBoxPointsCenterOffsetX, info.translateY + info.viewBoxPointsCenterOffsetY + info.viewBoxPointsHeight );
		//top left corner
		info.geo.B = this.rotatePoint( info.translateX + info.viewBoxPointsOffsetX, info.translateY + info.viewBoxPointsOffsetY, info.rotation, info.translateX + info.viewBoxPointsCenterOffsetX, info.translateY + info.viewBoxPointsCenterOffsetY );
		//top right corner
		info.geo.C = this.rotatePoint( info.translateX + info.viewBoxPointsOffsetX + info.viewBoxPointsWidth, info.translateY + info.viewBoxPointsOffsetY, info.rotation, info.translateX + info.viewBoxPointsCenterOffsetX + info.viewBoxPointsWidth, info.translateY + info.viewBoxPointsCenterOffsetY );
		
		info.geo.bax = info.geo.B.x - info.geo.A.x;
		info.geo.bay = info.geo.B.y - info.geo.A.y;
		info.geo.cax = info.geo.C.x - info.geo.A.x;
		info.geo.cay = info.geo.C.y - info.geo.A.y;
	},

	scaleUpdatedSetDimensions: function ( svgPartInfo ) {
		svgPartInfo.viewBoxPointsWidth = svgPartInfo.partOriginalWidth * svgPartInfo.scaleX;
		svgPartInfo.viewBoxPointsHeight = svgPartInfo.partOriginalHeight * svgPartInfo.scaleY;

		svgPartInfo.unitsWidth = svgPartInfo.viewBoxPointsWidth / this.attr( "scalarUnitsToViewBoxPoints" );
		svgPartInfo.unitsHeight = svgPartInfo.viewBoxPointsHeight / this.attr( "scalarUnitsToViewBoxPoints" );

		svgPartInfo.pxWidth = svgPartInfo.unitsWidth * this.attr( "scalarUnitsToPx" );
		svgPartInfo.pxHeight = svgPartInfo.unitsHeight * this.attr( "scalarUnitsToPx" );

		svgPartInfo.viewBoxPointsOffsetX = svgPartInfo.x * svgPartInfo.scaleX;
		svgPartInfo.viewBoxPointsOffsetY = svgPartInfo.y * svgPartInfo.scaleY;
		svgPartInfo.viewBoxPointsCenterOffsetX = svgPartInfo.viewBoxPointsWidth / 2 + svgPartInfo.viewBoxPointsOffsetX;
		svgPartInfo.viewBoxPointsCenterOffsetY = svgPartInfo.viewBoxPointsHeight / 2 + svgPartInfo.viewBoxPointsOffsetY;
	},

	partsDataValid: 0,

	getPartInfo: function ( svgPart ) {
		var $svgPart = $( svgPart );
		var cachedData = $svgPart.data( "info" );
		var partsDataValid = this.attr( "partsDataValid" );
		if ( cachedData && partsDataValid === cachedData.valid ) {
			return cachedData;
		}
		svgPart = $svgPart[ 0 ];

		var bboxInfo = svgPart.getBBox();

		var info = {
			valid: partsDataValid,
			rotation: 0,
			translateX: 0,
			translateY: 0,
			scaleX: 1,
			scaleY: 1,
			partOriginalWidth: bboxInfo.width,
			partOriginalHeight: bboxInfo.height,
			x: bboxInfo.x,
			y: bboxInfo.y
		};

		var transform = null;
		var transforms = svgPart.transform.baseVal;
		var len = transforms.length || transforms.numberOfItems;

		for ( var i = 0; i < len; i++ ) {
			transform = transforms[ i ] || transforms.getItem( i );
			switch ( transform.type ) {
				case SVGTransform.SVG_TRANSFORM_TRANSLATE:
					info.translateX = transform.matrix.e;
					info.translateY = transform.matrix.f;
				break;
				case SVGTransform.SVG_TRANSFORM_SCALE:
					info.scaleX = transform.matrix.a;
					info.scaleY = transform.matrix.d;
				break;
				case SVGTransform.SVG_TRANSFORM_ROTATE:
					info.rotation = transform.angle;
				break;
			}
		}

		this.scaleUpdatedSetDimensions( info );
		this.setGeometryInfo( info );

		$svgPart.data( "info", info );
		return info;
	},

	loadAllPartsData: function () {
		var $svg = this.attr( "$svg" );
		var iQueryString = this.attr( "iQueryString" );
		var $parts = $svg.find( iQueryString );

		var vm = this;
		$parts.each(function () {
			vm.getPartInfo( this );
		});
	},

	selectedParts: null,
	mouseMoveLastPos: {
		unitsX: -1,
		unitsY: -1
	},

	setTransform: function ( svgPart, info ) {
		var transform = "rotate( " + info.rotation + " ";
		transform += ( info.translateX + info.viewBoxPointsCenterOffsetX ) + " ";
		transform += ( info.translateY + info.viewBoxPointsCenterOffsetY ) + " ) ";
		transform += "translate( " + info.translateX + " " + info.translateY + " ) ";
		transform += "scale( " + info.scaleX + " " + info.scaleY + " )";

		$( svgPart )[ 0 ].setAttribute( "transform", transform );
	},

	// params:
	// svgPart, scale, svgPartInfo
	// svgPart, scaleX, scaleY, svgPartInfo
	scalePartFromCenterTo: function ( svgPart, scaleX, scaleY, info ) {
		if ( typeof scaleY !== "number" ) {
			info = scaleY;
			scaleY = scaleX;
		}
		if ( !info ) info = this.getPartInfo( svgPart );

		var centerUnitX = ( info.translateX + info.viewBoxPointsCenterOffsetX ) / this.attr( "scalarUnitsToViewBoxPoints" );
		var centerUnitY = ( info.translateY + info.viewBoxPointsCenterOffsetY ) / this.attr( "scalarUnitsToViewBoxPoints" );

		info.scaleX = scaleX;
		info.scaleY = scaleY;

		this.scaleUpdatedSetDimensions( info );

		//adjust position so the scale looked from the center of its location
		this.moveCenterOfPartTo( svgPart, centerUnitX, centerUnitY, info );
	},

	// params:
	// svgPart, xUnits, 0, svgPartInfo // aspect ratio is preserved
	// svgPart, 0, yUnits, svgPartInfo // aspect ratio is preserved
	// svgPart, xUnits, yUnits, svgPartInfo
	sizePartFromCenterTo: function ( svgPart, xUnits, yUnits, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		var scaleX = xUnits * this.attr( "scalarUnitsToViewBoxPoints" ) / svgPartInfo.partOriginalWidth;
		var scaleY = yUnits ? yUnits * this.attr( "scalarUnitsToViewBoxPoints" ) / svgPartInfo.partOriginalHeight : scaleX;

		if ( !scaleX ) scaleX = scaleY;

		this.scalePartFromCenterTo( svgPart, scaleX, scaleY, svgPartInfo );
	},

	rotatePartAboutCenterTo: function ( svgPart, angle, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.rotation = angle;

		this.setTransform( svgPart, svgPartInfo );
	},

	movePartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.attr( "scalarUnitsToViewBoxPoints" ) - svgPartInfo.viewBoxPointsOffsetX;
		svgPartInfo.translateY = unitY * this.attr( "scalarUnitsToViewBoxPoints" ) - svgPartInfo.viewBoxPointsOffsetY;

		this.setTransform( svgPart, svgPartInfo );
	},

	moveCenterOfPartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.attr( "scalarUnitsToViewBoxPoints" ) - svgPartInfo.viewBoxPointsCenterOffsetX;
		svgPartInfo.translateY = unitY * this.attr( "scalarUnitsToViewBoxPoints" ) - svgPartInfo.viewBoxPointsCenterOffsetY;

		this.setTransform( svgPart, svgPartInfo );
	},

	moveByUnitsDifference: function ( svgParts, difUnitsX, difUnitsY ) {
		var vm = this;
		var scalarUnitsToViewBoxPoints = this.attr( "scalarUnitsToViewBoxPoints" );
		var lastInfo = null;
		var lastThis = null;
		$( svgParts ).each(function () {
			var info = vm.getPartInfo( this );
			if( info === lastInfo || this === lastThis ) {
				console.log( info, this );
			}
			lastThis = this;
			lastInfo = info;
			vm.movePartTo(
				this,
				( info.translateX + info.viewBoxPointsOffsetX ) / scalarUnitsToViewBoxPoints + difUnitsX,
				( info.translateY + info.viewBoxPointsOffsetY ) / scalarUnitsToViewBoxPoints + difUnitsY,
				info
			);
		});
	},

	getLayer: function ( i ) {
		if ( !this.attr( "layers" ) ) {
			return this.attr( "$svg" );
		}
		var $svg = this.attr( "$svg" );
		var layers = $svg.find( "> g" ).length;
		if ( layers <= i ) {
			this.attr( "layers", i + 1 );
			while ( layers <= i ) {
				$svg.append( document.createElementNS( "http://www.w3.org/2000/svg", "g" ) );
				layers++;
			}
		}
		return $svg.find( "> g" ).eq( i );
	},

	cloneInnerElements: function ( destinationNode, sourceNode ) {
		//TODO: scope all rules in any <style> tags... (random id)
		$( sourceNode ).children().clone().appendTo( destinationNode );
	},

	moveInnerElements: function ( destinationNode, sourceNode ) {
		$( sourceNode ).children().appendTo( destinationNode );
	},

	// options: ( pos and dimensions are based on Units )
	// layer
	// centerXPos, centerYPos //if not specified, newSVGEl is aligned to top-left corner
	// forceWidth //if forceHeight is not used, scale is uniform based on forceWidth
	// forceHeight //if forceWidth is not used, scale is uniform based on forceHeight
	// useScale //forceWidth and forceHeight need to not be used
	// useScaleX, useScaleY //forceWidth and forceHeight need to not be used
	addFromSVGAsGroup: function ( newSVGEl, options ) {
		options = options || {};
		var layer = options.layer || 0;
		var centerXPos = options.centerXPos;
		var centerYPos = options.centerYPos;
		var forceWidth = options.forceWidth;
		var forceHeight = options.forceHeight;
		var useScaleX = options.useScaleX || options.useScale;
		var useScaleY = options.useScaleY || options.useScale;

		var svgEl = this.attr( "$svg" )[ 0 ];
		var g = document.createElementNS( "http://www.w3.org/2000/svg", "g" );

		this.cloneInnerElements( g, newSVGEl );

		this.getLayer( layer ).append( g );

		var info = this.getPartInfo( g );

		if ( typeof forceWidth === "number" && forceWidth ) {
			useScaleX = forceWidth * this.attr( "scalarUnitsToViewBoxPoints" ) / info.partOriginalWidth;
			if ( typeof forceHeight === "number" && forceHeight ) {
				useScaleY = forceHeight * this.attr( "scalarUnitsToViewBoxPoints" ) / info.partOriginalHeight;
			} else {
				useScaleY = useScaleX;
			}
		} else if ( typeof forceHeight === "number" && forceHeight ) {
			useScaleY = forceHeight * this.attr( "scalarUnitsToViewBoxPoints" ) / info.partOriginalHeight;
			useScaleX = useScaleY;
		}

		if ( useScaleY && !useScaleX ) {
			useScaleX = useScaleY;
		}

		this.scalePartFromCenterTo( g, useScaleX || 1, useScaleY || useScaleX || 1, info );

		if ( typeof centerXPos === "undefined" && typeof centerYPos === "undefined" ) {
			this.movePartTo( g, 0, 0, info );
		} else {
			this.moveCenterOfPartTo( g, centerXPos || 0, centerYPos || 0, info );
		}
	},

	setUnitScaleSizes: function ( $isvg ) {
		var margin = 20;
		var maxWidth = $isvg.parent().width() - margin - margin;
		var maxHeight = $isvg.parent().height() - margin - margin;

		var heightFromMaxWidth = maxWidth / this.attr( "width" ) * this.attr( "height" );
		var widthFromMaxHeight = maxHeight * this.attr( "width" ) / this.attr( "height" );

		var bgSize = 0;
		// bgSize has to be an integer in Chrome and FF to correctly display the grid (gradient), IE and
		// Safari worked correctly without that constraint, but had to math it this way for consistency.

		if ( heightFromMaxWidth <= maxHeight ) {
			bgSize = ~~( ( heightFromMaxWidth / this.attr( "height" ) ) * this.attr( "gridLinesEvery" ) );
		} else if ( widthFromMaxHeight <= maxWidth ) {
			bgSize = ~~( ( widthFromMaxHeight / this.attr( "width" ) ) * this.attr( "gridLinesEvery" ) );
		}

		//scalarUnitsToPx = px / units; scalarUnitsToPx * units = px
		this.attr( "scalarUnitsToPx", bgSize / this.attr( "gridLinesEvery" ) );
		this.attr( "scalarPxToViewBoxPoints", this.attr( "scalarUnitsToViewBoxPoints" ) / this.attr( "scalarUnitsToPx" ) );

		$isvg.css({
			width: this.attr( "scalarUnitsToPx" ) * this.attr( "width" ) + "px",
			height: this.attr( "scalarUnitsToPx" ) * this.attr( "height" ) + "px"
		});

		bgSize = bgSize + "px";
		bgSize = bgSize + " " + bgSize;

		this.attr( "$svg" ).css({
			"background-size": bgSize
		});
	}
});

export default Component.extend({
	tag: 'interactive-svg',
	viewModel: ViewModel,
	template,
	events: {
		"init": function () {
			var vm = this.viewModel;
			if ( !vm ) return;

			var config = vm.config || {};

			if ( typeof config.isRunningInBrowser === "undefined" ) {
				vm.attr( "isRunningInBrowser", !( typeof process === "object" && {}.toString.call(process) === "[object process]" ) );
			} else {
				vm.attr( "isRunningInBrowser", !!( config.isRunningInBrowser ) );
			}

			vm.attr( "layers", config.layers || 0 );

			//SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch, cm, or whatever )
			vm.attr( "scalarUnitsToViewBoxPoints", config.scalarUnitsToViewBoxPoints || 10 );

			//grid lines every x units
			if ( !config.gridLinesEvery || config.gridLinesEvery <= 1 ) {
				vm.attr( "showGrid", false );
				config.gridLinesEvery = 1;
			} else {
				vm.attr( "showGrid", true );
			}
			vm.attr( "gridLinesEvery", config.gridLinesEvery || 1 );

			//dimensions in "units" ( inches )
			vm.attr( "width", config.width || 30 * 12 );
			vm.attr( "height", config.height || 24 * 12 );

			//interactive items query string
			if ( vm.attr( "layers" ) ) {
				vm.attr( "iQueryString", config.iQueryString || "> g > *" );
			} else {
				vm.attr( "iQueryString", config.iQueryString || "> *" );
			}
		},

		"inserted": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			var layers = vm.attr( "layers" );
			var layerCount = 0;
			var config = vm.attr( "config" ) || {};
			var svgEl = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );

			if ( config.svg ) {
				this.cloneInnerElements( svgEl, config.svg );

				layerCount = $( svgEl ).find( "> g" ).length;
				var hasLayers = layerCount === $( svgEl ).find( "> *" ).length;
				if ( layers && hasLayers && layerCount > layers ) {
					// if "layers" and $svg has more layers than "layers", update "layers" to be bigger
					vm.attr( "layers", layerCount );
					layers = layerCount;
				} else if ( layers && !hasLayers ) {
					//doesn't have layers but needs them, so anything already needs to go to a layer
					var layer0 = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
					this.moveInnerElements( layer0, svgEl );
					svgEl.appendChild( layer0 );

					layerCount = 1;
				}
			}
			// if $svg is new, add "layers" layers
			// if $svg has layers already, make sure $svg has at least "layers" layers
			while ( layerCount < layers ) {
				svgEl.appendChild( document.createElementNS( "http://www.w3.org/2000/svg", "g" ) );
				layerCount++;
			}

			vm.attr( "$svg", $( svgEl ) );
			this.element.append( vm.attr( "$svg" ) );

			vm.setUnitScaleSizes( this.element );

			if ( vm.attr( "showGrid" ) ) {
				svgEl.setAttribute( "class", "showGrid" );
			} else {
				svgEl.setAttribute( "class", "" );
			}

			//The viewBox only needs to be set once. Using vanilla setAttribute because "viewBox" is case sensitive.
			svgEl.setAttribute(
				"viewBox",
				"0 0 "
					+ vm.attr( "width" ) * vm.attr( "scalarUnitsToViewBoxPoints" )
					+ " "
					+ vm.attr( "height" ) * vm.attr( "scalarUnitsToViewBoxPoints" )
			);
		},

		"{window} resize": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setUnitScaleSizes( this.element );
			vm.attr( "partsDataValid", 0 );
		},

		[startEvent]: function ( $isvg, ev ) {
			//ev.preventDefault();
			var vm = this.viewModel;
			var iQueryString = vm.attr( "iQueryString" );
			var $svg = vm.attr( "$svg" );
			var $parts = $svg.find( iQueryString );
			var selectedParts = [];
			var scalarPxToViewBoxPoints = vm.attr( "scalarPxToViewBoxPoints" );
			var touches = ev.originalEvent.touches;
			var pageX = ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
			var pageY = ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;
			var clickViewBoxPointsX = ( pageX - $isvg.offset().left ) * scalarPxToViewBoxPoints;
			var clickViewBoxPointsY = ( pageY - $isvg.offset().top ) * scalarPxToViewBoxPoints;

			var scalarUnitsToViewBoxPoints = vm.attr( "scalarUnitsToViewBoxPoints" );

			if ( !vm.attr( "partsDataValid" ) ) {
				vm.attr( "partsDataValid", Date.now() );
				vm.loadAllPartsData();
			}
			$parts.each(function () {
				var info = vm.getPartInfo( this );
				var topLeftX = info.translateX + info.viewBoxPointsOffsetX;
				var topLeftY = info.translateY + info.viewBoxPointsOffsetY;

				var clickInXRange = ( topLeftX <= clickViewBoxPointsX );
				clickInXRange &= ( (topLeftX + info.viewBoxPointsWidth) >= clickViewBoxPointsX );

				var clickInYRange = ( topLeftY <= clickViewBoxPointsY );
				clickInYRange &= ( (topLeftY + info.viewBoxPointsHeight) >= clickViewBoxPointsY );
				if ( clickInXRange && clickInYRange ) {
					selectedParts.push( this );
				}
				//if ( vm.pointIsInSvgPart( this, clickViewBoxPointsX / scalarUnitsToViewBoxPoints, clickViewBoxPointsY / scalarUnitsToViewBoxPoints, info ) ) {
				//	selectedParts.push( this );
				//}
			});
			console.log(selectedParts.length);
			if ( selectedParts.length ) {
				vm.attr( "selectedParts", selectedParts );
			}
		},

		[moveEvent]: function ( $isvg, ev ) {
			ev.preventDefault();
			var vm = this.viewModel;
			var selectedParts = vm.attr( "selectedParts" );
			if ( !selectedParts || !selectedParts.length ) {
				return;
			}
			var scalarUnitsToPx = vm.attr( "scalarUnitsToPx" );
			var touches = ev.originalEvent.touches;
			var pageX = ev.pageX || touches && touches[ 0 ] && touches[ 0 ].pageX || 0;
			var pageY = ev.pageY || touches && touches[ 0 ] && touches[ 0 ].pageY || 0;
			var curUnitsX = ( pageX - $isvg.offset().left ) / scalarUnitsToPx;
			var curUnitsY = ( pageY - $isvg.offset().top ) / scalarUnitsToPx;
			var lastPos = vm.attr( "mouseMoveLastPos" );
			vm.attr( "mouseMoveLastPos", { unitsX: curUnitsX, unitsY: curUnitsY } );
			var difUnitsX = lastPos.unitsX === -1 ? 0 : curUnitsX - lastPos.unitsX;
			var difUnitsY = lastPos.unitsY === -1 ? 0 : curUnitsY - lastPos.unitsY;

			vm.moveByUnitsDifference( selectedParts, difUnitsX, difUnitsY );
		},

		["{document} " + moveEvent]: function ( $isvg, ev ) {
			if ( supportTouch ) ev.preventDefault();
		},

		[stopEvent]: function ( $isvg, ev ) {
			var vm = this.viewModel;
			var selectedParts = vm.attr( "selectedParts" );
			vm.attr( "selectedParts", null );
			vm.attr( "mouseMoveLastPos", { unitsX: -1, unitsY: -1 } );
		},

		["{document} " + stopEvent]: function ( $isvg, ev ) {
			var vm = this.viewModel;
			var selectedParts = vm.attr( "selectedParts" );
			vm.attr( "selectedParts", null );
			vm.attr( "mouseMoveLastPos", { unitsX: -1, unitsY: -1 } );
		}
	}
});
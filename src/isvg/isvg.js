import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './isvg.less!';
import template from './isvg.stache!';

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
	    "gridLinesEvery" default: 12

	    //dimensions in units ( inches, cm, or whatever )
	    "height"
	    "width"

	    //interactive items query string; specifies what svg parts can be interacted with
	    "iQueryString" default with layers: "> g > *", default without layers: "> *"
	*/
	define: {
		message: {
			value: 'This is the interactive-svg component'
		}
	},

	//scalarUnitsToPx * units = px at current size
	scalarUnitsToPx: 1, //set on inserted and on window resize via this.setUnitScaleSizes()

	//scalarPxToViewBoxPoints * px at current size = viewBoxPoints
	scalarPxToViewBoxPoints: 10, //set on inserted and on window resize via this.setUnitScaleSizes()

	//scalarUnitsToViewBoxPoints * units = viewBoxPoints. Not effected from window resize.
	scalarUnitsToViewBoxPoints: 10, //set during init event from config

	scaleUpdatedSetDimensions: function ( svgPartInfo ) {
		svgPartInfo.viewBoxPointsWidth = svgPartInfo.partOriginalWidth * svgPartInfo.scaleX;
		svgPartInfo.viewBoxPointsHeight = svgPartInfo.partOriginalHeight * svgPartInfo.scaleY;

		svgPartInfo.unitsWidth = svgPartInfo.viewBoxPointsWidth / this.scalarUnitsToViewBoxPoints;
		svgPartInfo.unitsHeight = svgPartInfo.viewBoxPointsHeight / this.scalarUnitsToViewBoxPoints;

		svgPartInfo.pxWidth = svgPartInfo.unitsWidth * this.scalarUnitsToPx;
		svgPartInfo.pxHeight = svgPartInfo.unitsHeight * this.scalarUnitsToPx;

		svgPartInfo.viewBoxPointsOffsetX = svgPartInfo.x * svgPartInfo.scaleX;
		svgPartInfo.viewBoxPointsOffsetY = svgPartInfo.y * svgPartInfo.scaleY;
		svgPartInfo.viewBoxPointsCenterOffsetX = svgPartInfo.viewBoxPointsWidth / 2 + svgPartInfo.viewBoxPointsOffsetX;
		svgPartInfo.viewBoxPointsCenterOffsetY = svgPartInfo.viewBoxPointsHeight / 2 + svgPartInfo.viewBoxPointsOffsetY;
	},

	getPartInfo: function ( svgPart ) {
		var bboxInfo = svgPart.getBBox();

		var info = {
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

		for ( var i = 0; i < transforms.length; i++ ) {
			transform = transforms[ i ];
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

		return info;
	},

	setTransform: function ( svgPart, info ) {
		var transform = "rotate( " + info.rotation + " ";
		transform += ( info.translateX + info.viewBoxPointsCenterOffsetX ) + " ";
		transform += ( info.translateY + info.viewBoxPointsCenterOffsetY ) + " ) ";
		transform += "translate( " + info.translateX + " " + info.translateY + " ) ";
		transform += "scale( " + info.scaleX + " " + info.scaleY + " )";

		svgPart.setAttribute( "transform", transform );
	},

	// params:
	// svgPart, scale, svgPartInfo
	// svgPart, scaleX, scaleY, svgPartInfo
	scalePartFromCenterTo: function ( svgPart, scaleX, scaleY, svgPartInfo ) {
		if ( typeof scaleY !== "number" ) {
			svgPartInfo = scaleY;
			scaleY = scaleX;
		}
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		var centerUnitX = ( svgPartInfo.translateX + svgPartInfo.viewBoxPointsCenterOffsetX ) / this.scalarUnitsToViewBoxPoints;
		var centerUnitY = ( svgPartInfo.translateY + svgPartInfo.viewBoxPointsCenterOffsetY ) / this.scalarUnitsToViewBoxPoints;

		svgPartInfo.scaleX = scaleX;
		svgPartInfo.scaleY = scaleY;

		this.scaleUpdatedSetDimensions( svgPartInfo );

		//adjust position so the scale looked from the center of its location
		this.moveCenterOfPartTo( svgPart, centerUnitX, centerUnitY, svgPartInfo );
	},

	sizePartFromCenterTo: function ( svgPart, xUnits, yUnits, svgPartInfo ) {
		if ( typeof yUnits !== "number" ) {
			svgPartInfo = yUnits;
			yUnits = xUnits;
		}
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		var scaleX = xUnits * this.scalarUnitsToViewBoxPoints / svgPartInfo.partOriginalWidth;
		var scaleY = yUnits * this.scalarUnitsToViewBoxPoints / svgPartInfo.partOriginalHeight;

		this.scalePartFromCenterTo( svgPart, scaleX, scaleY, svgPartInfo );
	},

	rotatePartAboutCenterTo: function ( svgPart, angle, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.rotation = angle;

		this.setTransform( svgPart, svgPartInfo );
	},

	movePartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsOffsetX;
		svgPartInfo.translateY = unitY * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsOffsetY;

		this.setTransform( svgPart, svgPartInfo );
	},

	moveCenterOfPartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsCenterOffsetX;
		svgPartInfo.translateY = unitY * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsCenterOffsetY;

		this.setTransform( svgPart, svgPartInfo );
	},

	getLayer: function ( i ) {
		if ( !this.attr( "layers" ) ) {
			return this.attr( "$svg" );
		}

		var layers = this.attr( "$svg" ).find( "> g" ).length;
		if ( layers < i ) {
			this.attr( "layers", i );
			while ( layers < i ) {
				svgEl.appendChild( document.createElementNS( "http://www.w3.org/2000/svg", "g" ) );
				layers++;
			}
		}
		return this.attr( "$svg" ).find( "> g" ).eq( i );
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
			useScaleX = forceWidth * this.scalarUnitsToViewBoxPoints / info.partOriginalWidth;
			if ( typeof forceHeight === "number" && forceHeight ) {
				useScaleY = forceHeight * this.scalarUnitsToViewBoxPoints / info.partOriginalHeight;
			} else {
				useScaleY = useScaleX;
			}
		} else if ( typeof forceHeight === "number" && forceHeight ) {
			useScaleY = forceHeight * this.scalarUnitsToViewBoxPoints / info.partOriginalHeight;
			useScaleX = useScaleY;
		}

		this.scalePartFromCenterTo( g, useScaleX || 1, useScaleY || useScaleX || 1, info );

		if ( typeof centerXPos === "undefined" ) {
			this.movePartTo( g, 0, 0, info );
		} else {
			this.moveCenterOfPartTo( g, centerXPos || 0, centerYPos || 0, info );
		}
	},

	setUnitScaleSizes: function ( $isvg ) {
		var margin = 20;
		var maxWidth = $isvg.parent().width() - margin - margin;
		var maxHeight = $isvg.parent().height() - margin - margin;

		var heightFromMaxWidth = maxWidth / this.width * this.height;
		var widthFromMaxHeight = maxHeight * this.width / this.height;

		var bgSize = 0;
		// bgSize has to be an integer in Chrome and FF to correctly display the grid (gradient), IE and
		// Safari worked correctly without that constraint, but had to math it this way for consistency.

		if ( heightFromMaxWidth <= maxHeight ) {
			bgSize = ~~( ( heightFromMaxWidth / this.height ) * this.gridLinesEvery );
		} else if ( widthFromMaxHeight <= maxWidth ) {
			bgSize = ~~( ( widthFromMaxHeight / this.width ) * this.gridLinesEvery );
		}

		//scalarUnitsToPx = px / units; scalarUnitsToPx * units = px
		this.scalarUnitsToPx = bgSize / this.gridLinesEvery;
		this.scalarPxToViewBoxPoints = this.scalarUnitsToViewBoxPoints / this.scalarUnitsToPx;

		$isvg.css({
			height: this.scalarUnitsToPx * this.height + "px",
			width: this.scalarUnitsToPx * this.width + "px"
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

			vm.attr( "isRunningInBrowser", !!( config.isRunningInBrowser ) );

			vm.attr( "layers", config.layers || 0 );

			//SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch, cm, or whatever )
			vm.attr( "scalarUnitsToViewBoxPoints", config.scalarUnitsToViewBoxPoints || 10 );

			//grid lines every x units
			if ( config.gridLinesEvery === 0 ) {
				vm.attr( "showGrid", false );
			} else {
				vm.attr( "showGrid", true );
			}
			vm.attr( "gridLinesEvery", config.gridLinesEvery || 12 );

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


			var testSvg = $( "#testSvg" );
			vm.addFromSVGAsGroup( testSvg );
			vm.addFromSVGAsGroup( testSvg, { layer: 4 } );
			vm.addFromSVGAsGroup( testSvg );
			vm.addFromSVGAsGroup( testSvg );
			vm.addFromSVGAsGroup( testSvg );
			var $isvgParts = vm.attr( "$svg" ).find( vm.attr( "iQueryString" ) );
			var info = vm.getPartInfo( $isvgParts[ 0 ] );
			vm.moveCenterOfPartTo( $isvgParts[ 0 ], 6 * 12, 3 * 12, info );
			vm.rotatePartAboutCenterTo( $isvgParts[ 0 ], 305, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 4 ] );
			vm.scalePartFromCenterTo( $isvgParts[ 4 ], 4, info );
			vm.moveCenterOfPartTo( $isvgParts[ 4 ], 15 * 12, 12 * 12, info );
			vm.rotatePartAboutCenterTo( $isvgParts[ 4 ], 0, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 2 ] );
			vm.movePartTo( $isvgParts[ 2 ], 14 * 12 + 6, 19 * 12 + 6, info );
			vm.rotatePartAboutCenterTo( $isvgParts[ 2 ], -180, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 3 ] );
			vm.movePartTo( $isvgParts[ 3 ], 23 * 12, 5 * 12, info );
			vm.rotatePartAboutCenterTo( $isvgParts[ 3 ], 45, info );
			console.log( info );
		},

		"{window} resize": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setUnitScaleSizes( this.element );
		}
	}
});
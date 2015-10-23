import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './isvg.less!';
import template from './isvg.stache!';

export const ViewModel = Map.extend({
	/*
		Expects config passed in through one-way parent -> child binding with attributes:
	    "isRunningInBrowser" true if not ssr, must be true to fully work,

	    //SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch or whatever )
	    "scalarUnitsToViewBoxPoints" default: 10

	    //grid lines every x units
	    "gridLinesEvery" default: 12

	    //dimensions in units ( inches, cm, or whatever )
	    "height"
	    "width"

	    //interactive items query string; specifies what svg parts can be interacted with
	    "iQueryString" default: "> *"
	*/
	define: {
		message: {
			value: 'This is the interactive-svg component'
		}
	},

	//scalarUnitsToPx * units = px at current size
	scalarUnitsToPx: 1, //set on inserted and on window resize via this.setScaleSizes()

	//scalarPxToViewBoxPoints * px at current size = viewBoxPoints
	scalarPxToViewBoxPoints: 10, //set on inserted and on window resize via this.setScaleSizes()

	//scalarUnitsToViewBoxPoints * units = viewBoxPoints. Not effected from window resize.
	scalarUnitsToViewBoxPoints: 10, //set during init event from config

	scaleUpdatedSetDimensions: function ( svgPartInfo ) {
		svgPartInfo.viewBoxPointsWidth = svgPartInfo.partOriginalWidth * svgPartInfo.scaleX;
		svgPartInfo.viewBoxPointsHeight = svgPartInfo.partOriginalHeight * svgPartInfo.scaleY;

		svgPartInfo.unitsWidth = svgPartInfo.viewBoxPointsWidth / this.scalarUnitsToViewBoxPoints;
		svgPartInfo.unitsHeight = svgPartInfo.viewBoxPointsHeight / this.scalarUnitsToViewBoxPoints;

		svgPartInfo.pxWidth = svgPartInfo.unitsWidth * this.scalarUnitsToPx;
		svgPartInfo.pxHeight = svgPartInfo.unitsHeight * this.scalarUnitsToPx;
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

	setTransform: function ( svgPart, svgPartInfo ) {
		var transform = "rotate( " + svgPartInfo.rotation + " ";
		transform += ( svgPartInfo.translateX + svgPartInfo.viewBoxPointsWidth / 2 ) + " ";
		transform += ( svgPartInfo.translateY + svgPartInfo.viewBoxPointsHeight / 2 ) + " ) ";
		transform += "translate( " + svgPartInfo.translateX + " " + svgPartInfo.translateY + " ) ";
		transform += "scale( " + svgPartInfo.scaleX + " " + svgPartInfo.scaleY + " )";

		svgPart.setAttribute( "transform", transform );
	},

	// params:
	// svgPart, scaleX, scaleY, svgPartInfo
	// or
	// svgPart, scale, svgPartInfo
	scalePartTo: function ( svgPart, scaleX, scaleY, svgPartInfo ) {
		if ( typeof scaleY !== "number" ) {
			svgPartInfo = scaleY;
			scaleY = scaleX;
		}
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		var centerUnitX = ( svgPartInfo.translateX + svgPartInfo.viewBoxPointsWidth / 2 ) / this.scalarUnitsToViewBoxPoints;
		var centerUnitY = ( svgPartInfo.translateY + svgPartInfo.viewBoxPointsHeight / 2 ) / this.scalarUnitsToViewBoxPoints;

		svgPartInfo.scaleX = scaleX;
		svgPartInfo.scaleY = scaleY;

		this.scaleUpdatedSetDimensions( svgPartInfo );

		//adjust position so the scale looked from the center of its location
		this.moveCenterOfPartTo( svgPart, centerUnitX, centerUnitY, svgPartInfo );
	},

	rotatePartTo: function ( svgPart, angle, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.rotation = angle;

		this.setTransform( svgPart, svgPartInfo );
	},

	movePartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.scalarUnitsToViewBoxPoints;
		svgPartInfo.translateY = unitY * this.scalarUnitsToViewBoxPoints;

		this.setTransform( svgPart, svgPartInfo );
	},

	moveCenterOfPartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getPartInfo( svgPart );

		svgPartInfo.translateX = unitX * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsWidth / 2;
		svgPartInfo.translateY = unitY * this.scalarUnitsToViewBoxPoints - svgPartInfo.viewBoxPointsHeight / 2;

		this.setTransform( svgPart, svgPartInfo );
	},

	setScaleSizes: function ( $isvg ) {
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

			var config = vm.config;

			vm.attr( "isRunningInBrowser", !!( config && config.isRunningInBrowser ) );

			//SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch, cm, or whatever )
			vm.attr( "scalarUnitsToViewBoxPoints", config && config.scalarUnitsToViewBoxPoints || 10 );

			//grid lines every x units
			if ( config && config.gridLinesEvery === 0 ) {
				vm.attr( "showGrid", false );
			} else {
				vm.attr( "showGrid", true );
			}
			vm.attr( "gridLinesEvery", config && config.gridLinesEvery || 12 );

			//dimensions in "units" ( inches )
			vm.attr( "width", config && config.width || 30 * 12 );
			vm.attr( "height", config && config.height || 24 * 12 );

			//interactive items query string
			vm.attr( "iQueryString", config && config.iQueryString || "> *" );
		},

		"inserted": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.attr( "$svg", this.element.find( "svg" ) );

			vm.setScaleSizes( this.element );

			var svgEl = vm.attr( "$svg" )[ 0 ];
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



			var $isvgParts = vm.attr( "$svg" ).find( vm.attr( "iQueryString" ) );
			var info = vm.getPartInfo( $isvgParts[ 0 ] );
			vm.moveCenterOfPartTo( $isvgParts[ 0 ], 6 * 12, 3 * 12, info );
			vm.rotatePartTo( $isvgParts[ 0 ], 305, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 1 ] );
			vm.moveCenterOfPartTo( $isvgParts[ 1 ], 15 * 12, 12 * 12, info );
			vm.rotatePartTo( $isvgParts[ 1 ], 0, info );
			vm.scalePartTo( $isvgParts[ 1 ], 4, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 2 ] );
			vm.movePartTo( $isvgParts[ 2 ], 14 * 12 + 6, 19 * 12 + 6, info );
			vm.rotatePartTo( $isvgParts[ 2 ], -180, info );
			console.log( info );

			info = vm.getPartInfo( $isvgParts[ 3 ] );
			vm.movePartTo( $isvgParts[ 3 ], 23 * 12, 5 * 12, info );
			vm.rotatePartTo( $isvgParts[ 3 ], 45, info );
			console.log( info );
		},

		"{window} resize": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setScaleSizes( this.element );
		}
	}
});
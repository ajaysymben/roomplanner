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
	    "viewBoxPointsPerUnit" default: 10

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

	//scalar * units = px at current size
	scalar: 1, //maxDimensionSize == dimensionSize ( 120 px = 120 units )

	getElementInfo: function ( svgPart ) {
		var bboxInfo = svgPart.getBBox();

		var info = {
			rotation: 0,
			translateX: 0,
			translateY: 0,
			scaleX: 1,
			scaleY: 1,
			height: bboxInfo.height,
			width: bboxInfo.width,
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

		info.centerOffsetX = 0.5 * info.width * info.scaleX;
		info.centerOffsetY = 0.5 * info.height * info.scaleY;

		return info;
	},

	setTransform: function ( svgPart, svgPartInfo ) {
		var transform = "rotate( " + svgPartInfo.rotation + " ";
		transform += ( svgPartInfo.translateX + svgPartInfo.centerOffsetX ) + " ";
		transform += ( svgPartInfo.translateY + svgPartInfo.centerOffsetY ) + " ) ";
		transform += "translate( " + svgPartInfo.translateX + " " + svgPartInfo.translateY + " ) ";
		transform += "scale( " + svgPartInfo.scaleX + " " + svgPartInfo.scaleY + " )";

		svgPart.setAttribute( "transform", transform );
	},

	scalePartTo: function ( svgPart, scaleX, scaleY, svgPartInfo ) {
		if ( typeof scaleY !== "number" ) {
			svgPartInfo = scaleY;
			scaleY = scaleX;
		}
		if ( !svgPartInfo ) svgPartInfo = this.getElementInfo( svgPart );

		svgPartInfo.scaleX = scaleX;
		svgPartInfo.scaleY = scaleY;

		this.setTransform( svgPart, svgPartInfo );
	},

	rotatePartTo: function ( svgPart, angle, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getElementInfo( svgPart );

		svgPartInfo.rotation = angle;

		this.setTransform( svgPart, svgPartInfo );
	},

	movePartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getElementInfo( svgPart );

		svgPartInfo.translateX = unitX * this.viewBoxPointsPerUnit;
		svgPartInfo.translateY = unitY * this.viewBoxPointsPerUnit;

		this.setTransform( svgPart, svgPartInfo );
	},

	moveCenterOfPartTo: function ( svgPart, unitX, unitY, svgPartInfo ) {
		if ( !svgPartInfo ) svgPartInfo = this.getElementInfo( svgPart );

		svgPartInfo.translateX = unitX * this.viewBoxPointsPerUnit - svgPartInfo.centerOffsetX;
		svgPartInfo.translateY = unitY * this.viewBoxPointsPerUnit - svgPartInfo.centerOffsetY;

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

		this.scalar = bgSize / this.gridLinesEvery;

		$isvg.css({
			height: this.scalar * this.height + "px",
			width: this.scalar * this.width + "px"
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
			vm.attr( "viewBoxPointsPerUnit", config && config.viewBoxPointsPerUnit || 10 );

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
					+ vm.attr( "width" ) * vm.attr( "viewBoxPointsPerUnit" )
					+ " "
					+ vm.attr( "height" ) * vm.attr( "viewBoxPointsPerUnit" )
			);



			var $isvgParts = vm.attr( "$svg" ).find( vm.attr( "iQueryString" ) );
			var info = vm.getElementInfo( $isvgParts[ 0 ] );
			vm.moveCenterOfPartTo( $isvgParts[ 0 ], 6 * 12, 3 * 12, info );
			vm.rotatePartTo( $isvgParts[ 0 ], 305, info );

			info = vm.getElementInfo( $isvgParts[ 1 ] );
			vm.moveCenterOfPartTo( $isvgParts[ 1 ], 15 * 12, 12 * 12, info );
			vm.rotatePartTo( $isvgParts[ 1 ], 0, info );
			vm.scalePartTo( $isvgParts[ 1 ], 4, info );

			info = vm.getElementInfo( $isvgParts[ 2 ] );
			vm.movePartTo( $isvgParts[ 2 ], 14 * 12 + 6, 19 * 12 + 6, info );
			vm.rotatePartTo( $isvgParts[ 2 ], -180, info );

			info = vm.getElementInfo( $isvgParts[ 3 ] );
			vm.movePartTo( $isvgParts[ 3 ], 23 * 12, 5 * 12, info );
			vm.rotatePartTo( $isvgParts[ 3 ], 45, info );
		},

		"{window} resize": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setScaleSizes( this.element );
		}
	}
});
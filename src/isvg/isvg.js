import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './isvg.less!';
import template from './isvg.stache!';

export const ViewModel = Map.extend({
	/*
		Expects properties passed in through one-way parent -> child binding:
			height
			width
			isRunningInBrowser
	*/
	define: {
		message: {
			value: 'This is the interactive-svg component'
		}
	},

	//scalar * units = px at current size
	scalar: 1, //maxDimensionSize == dimensionSize ( 120 px = 120 units )

	//grid lines every x units
	gridLinesEvery: 12,

	//SVG's viewBox points ( sort of like pixels ) per 1 unit ( inch or whatever )
	viewBoxPointsPerUnit: 10,

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

		$isvg.find( "svg" ).css({
			"background-size": bgSize
		});
	}
});

export default Component.extend({
	tag: 'interactive-svg',
	viewModel: ViewModel,
	template,
	events: {
		"inserted": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setScaleSizes( this.element );

			//The viewBox only needs to be set once. Using vanilla setAttribute because "viewBox" is case sensitive.
			this.element.find( "svg" )[ 0 ].setAttribute(
				"viewBox",
				"0 0 " + vm.width * vm.viewBoxPointsPerUnit + " " + vm.height * vm.viewBoxPointsPerUnit
			);

			var x = vm.getElementInfo( this.element.find( "svg > g" )[ 0 ] );
			vm.moveCenterOfPartTo( this.element.find( "svg > g" )[ 0 ], 6 * 12, 3 * 12, x );
			//console.log( x );
			vm.rotatePartTo( this.element.find( "svg > g" )[ 0 ], 180, x );
		},
		"{window} resize": function () {
			var vm = this.viewModel;
			if ( !vm || !vm.isRunningInBrowser ) return;

			vm.setScaleSizes( this.element );
		}
	}
});
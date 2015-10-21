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
			if ( !this.viewModel || !this.viewModel.isRunningInBrowser ) return;
			this.viewModel.setScaleSizes( this.element );
		},
		"{window} resize": function () {
			if ( !this.viewModel || !this.viewModel.isRunningInBrowser ) return;
			this.viewModel.setScaleSizes( this.element );
		}
	}
});
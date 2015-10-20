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

		var useHeight = 0;
		var useWidth = 0;

		if ( heightFromMaxWidth <= maxHeight ) {
			useHeight = heightFromMaxWidth;
			useWidth = maxWidth;
			this.scalar = heightFromMaxWidth / this.height;
		} else if ( widthFromMaxHeight <= maxWidth ) {
			useHeight = maxHeight;
			useWidth = widthFromMaxHeight
			this.scalar = widthFromMaxHeight / this.width;
		}

		$isvg.css({
			height: useHeight + "px",
			width: useWidth + "px"
		});

		var bgSize = this.scalar * this.gridLinesEvery;
		bgSize = bgSize + "px";
		bgSize = bgSize + " " + bgSize;

		// var bgSize = 100 * this.scalar * this.gridLinesEvery / useWidth + "% ";
		// bgSize = bgSize + ( 100 * this.scalar * this.gridLinesEvery / useHeight ) + "%";

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
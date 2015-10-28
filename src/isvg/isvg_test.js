import QUnit from 'steal-qunit';
import { ViewModel } from './isvg';

var $dom = $("<div/>").appendTo( "body" ); //$( "#qunit-fixture" );

var fcs = function ( fn ) { //functionalCommentString
  /*!Function By James Atherton - http://geckocodes.org/?hacker=James0x57 */
  /*!You are free to copy and alter however you'd like so long as you leave the credit intact! =)*/
  return fn.toString().replace(/^(\r?\n|[^\/])*\/\*!?(\r?\n)*|\s*\*\/(\r|\n|.)*$/gi,"");
};

var svgItemHTML = fcs(function(){/*
  <svg id="testSvg" width="100%" height="100%">
    <style xmlns="http://www.w3.org/2000/svg" type="text/css">
      .st0{fill:#3982A5;}
      .st1{fill:#FFFFFF;}
      .st2{fill:#0C0110;}
    </style>
    <path class="st0" d="M35.9,51.6h106.8h7.2l7.6-28.4v0H36.3l0,0l-7.6,28.4H35.9z M49.6,37.3c-0.7,2.5-3.3,4.6-5.8,4.6   s-4-2.1-3.4-4.6c0.7-2.5,3.3-4.6,5.8-4.6C48.8,32.7,50.3,34.7,49.6,37.3z M61.9,37.3c-0.7,2.5-3.3,4.6-5.8,4.6s-4-2.1-3.4-4.6   c0.7-2.5,3.3-4.6,5.8-4.6C61.1,32.7,62.6,34.7,61.9,37.3z M135.2,42H73.6l2.5-9.5h61.5L135.2,42z"></path>
    <polygon class="st1" points="135.2,42 73.6,42 76.2,32.5 137.7,32.5  "></polygon>
    <polygon class="st2" points="73.3,69.3 73.2,69.3 67.8,89.6 67.8,89.6 90.5,89.6 96,69.3  "></polygon>
    <polygon class="st2" points="142.8,51.6 142.8,51.6 138,69.3 118.8,69.3 118.7,69.3 113.3,89.6 113.4,89.6 132.6,89.6 127.4,108.8    108.1,108.8 113.3,89.6 90.6,89.6 90.5,89.6 85.4,108.8 62.6,108.8 67.8,89.6 45.1,89.6 45,89.6 39.8,108.8 20.6,108.8 25.8,89.6    45,89.6 50.4,69.3 31.2,69.3 35.9,51.6 35.9,51.6 28.7,51.6 23.1,72.6 23.1,72.4 4.6,141.2 6.8,141.4 24.3,115.8 132.7,115.8    149.9,51.6  "></polygon>
    <g>
      <polygon class="st2" points="55.1,51.6 50.4,69.3 50.5,69.3 73.2,69.3 77.9,51.6 78,51.6   "></polygon>
      <polygon class="st2" points="100.7,51.6 96,69.3 96.1,69.3 118.7,69.3 123.5,51.6   "></polygon>
    </g>
    <path class="st2" d="M49.6,37.3c-0.7,2.5-3.3,4.6-5.8,4.6s-4-2.1-3.4-4.6c0.7-2.5,3.3-4.6,5.8-4.6C48.8,32.7,50.3,34.7,49.6,37.3z"></path>
    <path class="st2" d="M61.9,37.3c-0.7,2.5-3.3,4.6-5.8,4.6s-4-2.1-3.4-4.6c0.7-2.5,3.3-4.6,5.8-4.6C61.1,32.7,62.6,34.7,61.9,37.3z"></path>
  </svg>
*/});

$dom.html( svgItemHTML );
var $testSvg = $dom.find( "#testSvg" );

QUnit.testStart( function( details ) {
  //console.log( "Now running: ", details.module, details.name );
  $( "<div data-testname='" + details.name + "' style='width:600px; height:600px;'></div>" ).appendTo( $dom )
});
QUnit.testDone( function( details ) {
  //console.log( "Now finishing: ", details.module, details.name );
  $dom.find( "div[data-testname='" + details.name + "']" ).remove();
});

var initAndRender = function ( config ) {
  var template = can.stache( '<interactive-svg {config}="isvgConfig"></interactive-svg>' );
  var frag = template({
    isvgConfig: config || {}
  });
  var $div = $dom.find( "div[data-testname='" + this.testName + "']" );
  $div.append( frag );
  return $div.find( "interactive-svg" ).viewModel();
};

// ViewModel unit tests
QUnit.module('svg-roomplanner/isvg');

QUnit.test( "Setup works", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test );

  ok( isvgVM && isvgVM.attr && isvgVM.attr( "isRunningInBrowser" ), "viewModel exists and knows it isRunningInBrowser" );
  ok( isvgVM.attr( "showGrid" ) === false, "showGrid is false" );
  ok( isvgVM.attr( "layers" ) === 0, "layers is 0" );
  ok( isvgVM.attr( "scalarUnitsToViewBoxPoints" ) === 10, "scalarUnitsToViewBoxPoints is 10" );
  ok( isvgVM.attr( "width" ) && isvgVM.attr( "height" ), "width and height are defined" );
  ok( isvgVM.attr( "iQueryString" ) === "> *", "iQueryString for identifying what elements are interactive is set" );
  ok( isvgVM.attr( "$svg" ) && isvgVM.attr( "$svg" ).is( "body svg" ), "$svg is set and the element is in DOM" );
  ok( isvgVM.attr( "$svg" )[ 0 ].getAttribute( "viewBox" ).length, "'viewBox' is defined on the svg element" );
});

QUnit.test( "Config works - layers", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    layers: 2
  });

  ok( isvgVM.attr( "layers" ) === 2, "layers is 2" );
  ok( isvgVM.attr( "iQueryString" ) === "> g > *", "iQueryString for identifying what elements are interactive is set for layers" );
  ok( isvgVM.attr( "$svg" ).find( "> g" ).length === 2, "svg element has 2 'g' tags" );
  ok( isvgVM.attr( "$svg" ).find( "> *" ).length === 2, "svg element has no other direct decendants" );
});

QUnit.test( "Config works - scalarUnitsToViewBoxPoints, width, and height", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 50,
    height: 25,
    scalarUnitsToViewBoxPoints: 2
  });

  var viewBoxValue = isvgVM.attr( "$svg" )[ 0 ].getAttribute( "viewBox" );

  ok( isvgVM.attr( "width" ) === 50, "width is 50 units" );
  ok( isvgVM.attr( "height" ) === 25, "height is 25 units" );
  ok( isvgVM.attr( "scalarUnitsToViewBoxPoints" ) === 2, "scalarUnitsToViewBoxPoints is 2" );
  ok( viewBoxValue === "0 0 100 50", "viewBox is '0 0 100 50'" );
});

QUnit.test( "Config works - iQueryString", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    iQueryString: "*"
  });

  ok( isvgVM.attr( "iQueryString" ) === "*", "iQueryString is set" );
});

QUnit.test( "Config works - gridLinesEvery", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    gridLinesEvery: 12
  });

  ok( isvgVM.attr( "showGrid" ) === true, "showGrid is true" );
  ok( isvgVM.attr( "gridLinesEvery" ) === 12, "gridLinesEvery is 12" );
  ok( isvgVM.attr( "$svg" ).css( "background-size" ).length, "svg background-size is set" );
});

QUnit.test( "scalars are correct and agree", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 15,
    height: 20,
    scalarUnitsToViewBoxPoints: 10
  });

  var $isvg = isvgVM.attr( "$svg" ).width( "100%" ).height( "100%" ).parent();

  var viewBoxWidth = isvgVM.attr( "$svg" )[ 0 ].getAttribute( "viewBox" ).replace( /0 0 ([\.\d]+) ([\.\d]+)/, "$1" );
  var viewBoxHeight = isvgVM.attr( "$svg" )[ 0 ].getAttribute( "viewBox" ).replace( /0 0 ([\.\d]+) ([\.\d]+)/, "$2" );

  var utv = isvgVM.attr( "scalarUnitsToViewBoxPoints" );
  var utp = isvgVM.attr( "scalarUnitsToPx" );
  var ptv = isvgVM.attr( "scalarPxToViewBoxPoints" );

  ok( utv, "scalarUnitsToViewBoxPoints is set" );
  ok( utp, "scalarUnitsToPx is set" );
  ok( ptv, "scalarPxToViewBoxPoints is set" );

  ok( isvgVM.attr( "width" ) * utv === parseFloat( viewBoxWidth ), "scalarUnitsToViewBoxPoints is correct 1/2" );
  ok( isvgVM.attr( "height" ) * utv === parseFloat( viewBoxHeight ), "scalarUnitsToViewBoxPoints is correct 2/2" );

  ok( isvgVM.attr( "width" ) * utp === $isvg.width(), "scalarUnitsToPx is correct 1/2" );
  ok( isvgVM.attr( "height" ) * utp === $isvg.height(), "scalarUnitsToPx is correct 2/2" );

  ok( parseFloat( viewBoxWidth ) / ptv === $isvg.width(), "scalarPxToViewBoxPoints is correct 1/2" );
  ok( parseFloat( viewBoxHeight ) / ptv === $isvg.height(), "scalarPxToViewBoxPoints is correct 2/2" );

  ok( utv / utp === ptv, "Scalars agree" );
});

QUnit.test( "addFromSVGAsGroup works - no options", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 15,
    height: 20,
    scalarUnitsToViewBoxPoints: 10
  });

  ok( isvgVM.attr( "$svg" ).find( "> *" ).length === 0, "svg is empty" );
  isvgVM.addFromSVGAsGroup( $testSvg );
  ok( isvgVM.attr( "$svg" ).find( "> *" ).length === 1, "svg has one element" );
  ok( isvgVM.attr( "$svg" ).find( "> g" ).length === 1, "the element is a g tag" );
});

QUnit.test( "getPartInfo works - no options when added", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 15,
    height: 20,
    scalarUnitsToViewBoxPoints: 10
  });
  isvgVM.addFromSVGAsGroup( $testSvg );
  var $part = isvgVM.attr( "$svg" ).find( "> g" );
  var info = isvgVM.getPartInfo( $part );

  ok( info, "have info" );
  ok( info.rotation === 0, "info.rotation is correct [ " + info.rotation + " ]" );
  ok( info.translateX && ( info.translateX + info.x === 0 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( info.translateY && ( info.translateY + info.y === 0 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( info.scaleX === 1, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( info.scaleY === 1, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( info.viewBoxPointsWidth === info.partOriginalWidth, "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( info.viewBoxPointsHeight === info.partOriginalHeight, "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 15, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 11, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 428, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 330, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( info.viewBoxPointsOffsetX === info.x, "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( info.viewBoxPointsOffsetY === info.y, "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 81, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 82, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup works - layers", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 15,
    height: 20,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  ok( $svg.find( "> *" ).length === 2, "svg has 2 layers" );
  ok( $svg.find( "> g > *" ).length === 0, "layers are empty" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 1 } );
  ok( $svg.find( "> *" ).length === 2, "svg still has 2 layers" );
  ok( $svg.find( "> g" ).eq( 0 ).find( "> *").length === 0, "layer 0 has no elements" );
  ok( $svg.find( "> g" ).eq( 1 ).find( "> *").length === 1, "layer 1 has 1 element" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 4 } );
  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 4 } );
  ok( $svg.find( "> *" ).length === 5, "svg has 5 layers" );
  ok( $svg.find( "> g" ).eq( 1 ).find( "> *").length === 1, "layer 1 has 1 element" );
  ok( $svg.find( "> g" ).eq( 4 ).find( "> *").length === 2, "layer 4 has 2 elements" );

  ok( $svg.find( "> g" ).eq( 0 ).find( "> *").length === 0, "layer 0 has no elements" );
  isvgVM.addFromSVGAsGroup( $testSvg );
  ok( $svg.find( "> g" ).eq( 0 ).find( "> *").length === 1, "layer not specified, so 0 now has 1 element" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - centerXPos, centerYPos", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 1500,
    height: 2000,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, centerXPos: 15, centerYPos: 9 } );
  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( $part.length === 1, "svg part found with iQueryString" );
  var translateXUnits = ( info.translateX + info.viewBoxPointsOffsetX ) / isvgVM.scalarUnitsToViewBoxPoints;
  var translateYUnits = ( info.translateY + info.viewBoxPointsOffsetY ) / isvgVM.scalarUnitsToViewBoxPoints;
  var tXUShouldBe = 15 - info.unitsWidth / 2;
  var tYUShouldBe = 9 - info.unitsHeight / 2;
  ok( translateXUnits.toFixed( 3 ) === tXUShouldBe.toFixed( 3 ), "info.translateX is correct - both set" );
  ok( translateYUnits.toFixed( 3 ) === tYUShouldBe.toFixed( 3 ), "info.translateY is correct - both set" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, centerXPos: 15 } );
  $part = $svg.find( isvgVM.attr( "iQueryString" ) ).last();
  info = isvgVM.getPartInfo( $part );

  translateXUnits = ( info.translateX + info.viewBoxPointsOffsetX ) / isvgVM.scalarUnitsToViewBoxPoints;
  translateYUnits = ( info.translateY + info.viewBoxPointsOffsetY ) / isvgVM.scalarUnitsToViewBoxPoints;
  tXUShouldBe = 15 - info.unitsWidth / 2;
  tYUShouldBe = 0 - info.unitsHeight / 2;
  ok( translateXUnits.toFixed( 3 ) === tXUShouldBe.toFixed( 3 ), "info.translateX is correct - centerYPos not set" );
  ok( translateYUnits.toFixed( 3 ) === tYUShouldBe.toFixed( 3 ), "info.translateY is correct - centerYPos not set" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, centerYPos: 9 } );
  $part = $svg.find( isvgVM.attr( "iQueryString" ) ).last();
  info = isvgVM.getPartInfo( $part );

  translateXUnits = ( info.translateX + info.viewBoxPointsOffsetX ) / isvgVM.scalarUnitsToViewBoxPoints;
  translateYUnits = ( info.translateY + info.viewBoxPointsOffsetY ) / isvgVM.scalarUnitsToViewBoxPoints;
  tXUShouldBe = 0 - info.unitsWidth / 2;
  tYUShouldBe = 9 - info.unitsHeight / 2;
  ok( translateXUnits.toFixed( 3 ) === tXUShouldBe.toFixed( 3 ), "info.translateX is correct - centerXPos not set" );
  ok( translateYUnits.toFixed( 3 ) === tYUShouldBe.toFixed( 3 ), "info.translateY is correct - centerXPos not set" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - forceWidth, forceHeight uniform changes", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, forceWidth: 15.29 * 2, forceHeight: 11.82 * 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - forceWidth, forceHeight non uniform changes", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, forceWidth: 15.29 * 2, forceHeight: 11.82 / 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( info.scaleY.toFixed( 1 ) === "0.5", "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y / 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight / 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 5, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 11, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 41, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - forceWidth only so uniform changes", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, forceWidth: 15.29 * 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - forceHeight only so uniform changes", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, forceHeight: 11.82 * 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - useScale", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, useScale: 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - useScaleX only so is uniform", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, useScaleX: 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});


QUnit.test( "addFromSVGAsGroup & getPartInfo works - useScaleY only so is uniform", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, useScaleY: 2 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( Math.round( info.scaleY ) === 2, "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight * 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 23, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 47, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 164, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "addFromSVGAsGroup & getPartInfo works - useScaleX, useScaleY non uniform changes", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10,
    layers: 2
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { layer: 0, useScaleX: 2, useScaleY: 0.5 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  ok( Math.round( info.scaleX ) === 2, "info.scaleX is correct [ " + info.scaleX + " ]" );
  ok( info.scaleY.toFixed( 1 ) === "0.5", "info.scaleY is correct [ " + info.scaleY + " ]" );
  ok( ~~( info.partOriginalWidth ) === 152, "info.partOriginalWidth is correct [ " + info.partOriginalWidth + " ]" );
  ok( ~~( info.partOriginalHeight ) === 118, "info.partOriginalHeight is correct [ " + info.partOriginalHeight + " ]" );
  ok( ~~( info.x ) === 4, "info.x is correct [ " + info.x + " ]" );
  ok( ~~( info.y ) === 23, "info.y is correct [ " + info.y + " ]" );
  ok( ( info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( info.x * 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( ( info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( info.y / 2 ).toFixed( 3 ), "info.viewBoxPointsOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );
  ok( ( info.viewBoxPointsWidth ).toFixed( 3 ) === ( info.partOriginalWidth * 2 ).toFixed( 3 ), "info.viewBoxPointsWidth is correct [ " + info.viewBoxPointsWidth + " ]" );
  ok( ( info.viewBoxPointsHeight ).toFixed( 3 ) === ( info.partOriginalHeight / 2 ).toFixed( 3 ), "info.viewBoxPointsHeight is correct [ " + info.viewBoxPointsHeight + " ]" );
  ok( ~~( info.unitsWidth ) === 30, "info.unitsWidth is correct [ " + info.unitsWidth + " ]" );
  ok( ~~( info.unitsHeight ) === 5, "info.unitsHeight is correct [ " + info.unitsHeight + " ]" );
  ok( ~~( info.pxWidth ) === 61, "info.pxWidth is correct [ " + info.pxWidth + " ]" );
  ok( ~~( info.pxHeight ) === 11, "info.pxHeight is correct [ " + info.pxHeight + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetX ) === 162, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsCenterOffsetX + " ]" );
  ok( ~~( info.viewBoxPointsCenterOffsetY ) === 41, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsCenterOffsetY + " ]" );
});

QUnit.test( "rotatePartAboutCenterTo works", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );

  isvgVM.rotatePartAboutCenterTo( $part, 45 );

  var info = isvgVM.getPartInfo( $part );
  var tXVBPShouldBe = ( 75 - info.unitsWidth / 2 ) * isvgVM.scalarUnitsToViewBoxPoints - info.viewBoxPointsOffsetX;
  var tYVBPShouldBe = ( 100 - info.unitsHeight / 2 ) * isvgVM.scalarUnitsToViewBoxPoints - info.viewBoxPointsOffsetY;
  ok( info.rotation === 45, "info.rotation is correct [ " + info.rotation + " ]" );
  ok( info.translateX.toFixed( 3 ) === tXVBPShouldBe.toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( info.translateY.toFixed( 3 ) === tYVBPShouldBe.toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( info.viewBoxPointsCenterOffsetX === info.viewBoxPointsWidth / 2 + info.viewBoxPointsOffsetX, "info.viewBoxPointsCenterOffsetX is correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( info.viewBoxPointsCenterOffsetY === info.viewBoxPointsHeight / 2 + info.viewBoxPointsOffsetY, "info.viewBoxPointsCenterOffsetY is correct [ " + info.viewBoxPointsOffsetY + " ]" );

  isvgVM.rotatePartAboutCenterTo( $part, 180, info );

  ok( info.rotation === 180, "info.rotation is correct [ " + info.rotation + " ]" );
  ok( info.translateX.toFixed( 3 ) === tXVBPShouldBe.toFixed( 3 ), "info.translateX is still correct [ " + info.translateX + " ]" );
  ok( info.translateY.toFixed( 3 ) === tYVBPShouldBe.toFixed( 3 ), "info.translateY is still correct [ " + info.translateY + " ]" );
  ok( info.viewBoxPointsCenterOffsetX === info.viewBoxPointsWidth / 2 + info.viewBoxPointsOffsetX, "info.viewBoxPointsCenterOffsetX is still correct [ " + info.viewBoxPointsOffsetX + " ]" );
  ok( info.viewBoxPointsCenterOffsetY === info.viewBoxPointsHeight / 2 + info.viewBoxPointsOffsetY, "info.viewBoxPointsCenterOffsetY is still correct [ " + info.viewBoxPointsOffsetY + " ]" );
});

QUnit.test( "scalePartFromCenterTo works - scale", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  var tXVBPOldPos = info.translateX + info.viewBoxPointsOffsetX;
  var tYVBPOldPos = info.translateY + info.viewBoxPointsOffsetY;

  var oldWidthVBP = info.viewBoxPointsWidth;
  var oldHeightVBP = info.viewBoxPointsHeight;

  var centerXVBPOldPos = info.translateX + info.viewBoxPointsCenterOffsetX;
  var centerYVBPOldPos = info.translateY + info.viewBoxPointsCenterOffsetY;

  isvgVM.scalePartFromCenterTo( $part, 2, info );

  ok( ( info.translateX + info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( tXVBPOldPos - oldWidthVBP / 2 ).toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( ( info.translateY + info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( tYVBPOldPos - oldHeightVBP / 2 ).toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( ( info.translateX + info.viewBoxPointsCenterOffsetX ).toFixed( 3 ) === centerXVBPOldPos.toFixed( 3 ), "Center point X did not change [ " + centerXVBPOldPos + " ]" );
  ok( ( info.translateY + info.viewBoxPointsCenterOffsetY ).toFixed( 3 ) === centerYVBPOldPos.toFixed( 3 ), "Center point Y did not change [ " + centerYVBPOldPos + " ]" );
});

QUnit.test( "scalePartFromCenterTo works - scaleX and scaleY", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  var tXVBPOldPos = info.translateX + info.viewBoxPointsOffsetX;
  var tYVBPOldPos = info.translateY + info.viewBoxPointsOffsetY;

  var oldWidthVBP = info.viewBoxPointsWidth;
  var oldHeightVBP = info.viewBoxPointsHeight;

  var centerXVBPOldPos = info.translateX + info.viewBoxPointsCenterOffsetX;
  var centerYVBPOldPos = info.translateY + info.viewBoxPointsCenterOffsetY;

  isvgVM.scalePartFromCenterTo( $part, 0.5, 1.5, info );

  ok( ( info.translateX + info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( tXVBPOldPos + oldWidthVBP / 4 ).toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( ( info.translateY + info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( tYVBPOldPos - oldHeightVBP / 4 ).toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( ( info.translateX + info.viewBoxPointsCenterOffsetX ).toFixed( 3 ) === centerXVBPOldPos.toFixed( 3 ), "Center point X did not change [ " + centerXVBPOldPos + " ]" );
  ok( ( info.translateY + info.viewBoxPointsCenterOffsetY ).toFixed( 3 ) === centerYVBPOldPos.toFixed( 3 ), "Center point Y did not change [ " + centerYVBPOldPos + " ]" );
});

QUnit.test( "sizePartFromCenterTo works - xUnits, 0 ( uniform aspect ratio based on width change )", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  var tXVBPOldPos = info.translateX + info.viewBoxPointsOffsetX;
  var tYVBPOldPos = info.translateY + info.viewBoxPointsOffsetY;

  var oldWidthVBP = info.viewBoxPointsWidth;
  var oldHeightVBP = info.viewBoxPointsHeight;

  var centerXVBPOldPos = info.translateX + info.viewBoxPointsCenterOffsetX;
  var centerYVBPOldPos = info.translateY + info.viewBoxPointsCenterOffsetY;

  isvgVM.sizePartFromCenterTo( $part, info.unitsWidth * 2, 0, info );

  ok( info.scaleX.toFixed( 1 ) === "2.0", "scaleX is correct" );
  ok( info.scaleY.toFixed( 1 ) === "2.0", "scaleY is correct" );
  ok( ( info.translateX + info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( tXVBPOldPos - oldWidthVBP / 2 ).toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( ( info.translateY + info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( tYVBPOldPos - oldHeightVBP / 2 ).toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( ( info.translateX + info.viewBoxPointsCenterOffsetX ).toFixed( 3 ) === centerXVBPOldPos.toFixed( 3 ), "Center point X did not change [ " + centerXVBPOldPos + " ]" );
  ok( ( info.translateY + info.viewBoxPointsCenterOffsetY ).toFixed( 3 ) === centerYVBPOldPos.toFixed( 3 ), "Center point Y did not change [ " + centerYVBPOldPos + " ]" );
});

QUnit.test( "sizePartFromCenterTo works - 0, yUnits ( uniform aspect ratio based on height change )", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  var tXVBPOldPos = info.translateX + info.viewBoxPointsOffsetX;
  var tYVBPOldPos = info.translateY + info.viewBoxPointsOffsetY;

  var oldWidthVBP = info.viewBoxPointsWidth;
  var oldHeightVBP = info.viewBoxPointsHeight;

  var centerXVBPOldPos = info.translateX + info.viewBoxPointsCenterOffsetX;
  var centerYVBPOldPos = info.translateY + info.viewBoxPointsCenterOffsetY;

  isvgVM.sizePartFromCenterTo( $part, 0, info.unitsHeight * 2, info );

  ok( info.scaleX.toFixed( 1 ) === "2.0", "scaleX is correct" );
  ok( info.scaleY.toFixed( 1 ) === "2.0", "scaleY is correct" );
  ok( ( info.translateX + info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( tXVBPOldPos - oldWidthVBP / 2 ).toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( ( info.translateY + info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( tYVBPOldPos - oldHeightVBP / 2 ).toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( ( info.translateX + info.viewBoxPointsCenterOffsetX ).toFixed( 3 ) === centerXVBPOldPos.toFixed( 3 ), "Center point X did not change [ " + centerXVBPOldPos + " ]" );
  ok( ( info.translateY + info.viewBoxPointsCenterOffsetY ).toFixed( 3 ) === centerYVBPOldPos.toFixed( 3 ), "Center point Y did not change [ " + centerYVBPOldPos + " ]" );
});

QUnit.test( "sizePartFromCenterTo works - xUnits and yUnits", function ( assert ) {
  var isvgVM = initAndRender.call( assert.test, {
    width: 150,
    height: 200,
    scalarUnitsToViewBoxPoints: 10
  });

  var $svg = isvgVM.attr( "$svg" );

  isvgVM.addFromSVGAsGroup( $testSvg, { centerXPos: 75, centerYPos: 100 } );

  var $part = $svg.find( isvgVM.attr( "iQueryString" ) );
  var info = isvgVM.getPartInfo( $part );

  var tXVBPOldPos = info.translateX + info.viewBoxPointsOffsetX;
  var tYVBPOldPos = info.translateY + info.viewBoxPointsOffsetY;

  var oldWidthVBP = info.viewBoxPointsWidth;
  var oldHeightVBP = info.viewBoxPointsHeight;

  var centerXVBPOldPos = info.translateX + info.viewBoxPointsCenterOffsetX;
  var centerYVBPOldPos = info.translateY + info.viewBoxPointsCenterOffsetY;

  isvgVM.sizePartFromCenterTo( $part, info.unitsWidth * 0.5, info.unitsHeight * 1.5, info );

  ok( info.scaleX.toFixed( 1 ) === "0.5", "scaleX is correct" );
  ok( info.scaleY.toFixed( 1 ) === "1.5", "scaleY is correct" );
  ok( ( info.translateX + info.viewBoxPointsOffsetX ).toFixed( 3 ) === ( tXVBPOldPos + oldWidthVBP / 4 ).toFixed( 3 ), "info.translateX is correct [ " + info.translateX + " ]" );
  ok( ( info.translateY + info.viewBoxPointsOffsetY ).toFixed( 3 ) === ( tYVBPOldPos - oldHeightVBP / 4 ).toFixed( 3 ), "info.translateY is correct [ " + info.translateY + " ]" );
  ok( ( info.translateX + info.viewBoxPointsCenterOffsetX ).toFixed( 3 ) === centerXVBPOldPos.toFixed( 3 ), "Center point X did not change [ " + centerXVBPOldPos + " ]" );
  ok( ( info.translateY + info.viewBoxPointsCenterOffsetY ).toFixed( 3 ) === centerYVBPOldPos.toFixed( 3 ), "Center point Y did not change [ " + centerYVBPOldPos + " ]" );
});

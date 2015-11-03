import { ViewModel } from './isvg';

var $dom = $("<div/>").appendTo( "body" );

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


var initAndRender = function ( config ) {
  var template = can.stache( '<interactive-svg {config}="isvgConfig"></interactive-svg>' );
  var frag = template({
    isvgConfig: config || {}
  });
  $dom.append( frag );
  return $dom.find( "interactive-svg" ).viewModel();
};

var vm = initAndRender({
  //grid lines every x units
  gridLinesEvery: 12,

  //dimensions in inches
  width: 30 * 12,
  height: 24 * 12,

  iQueryString: "> g"
});

var $testSvg = $( "#testSvg" );
vm.addFromSVGAsGroup( $testSvg );
vm.addFromSVGAsGroup( $testSvg, { layer: 4 } );
vm.addFromSVGAsGroup( $testSvg );
vm.addFromSVGAsGroup( $testSvg );
vm.addFromSVGAsGroup( $testSvg );

var $isvgParts = vm.attr( "$svg" ).find( vm.attr( "iQueryString" ) );
var info = vm.getPartInfo( $isvgParts[ 0 ] );
vm.moveCenterOfPartTo( $isvgParts[ 0 ], 6 * 12, 3 * 12, info );
vm.rotatePartAboutCenterTo( $isvgParts[ 0 ], 305, info );
//console.log( info );

info = vm.getPartInfo( $isvgParts[ 4 ] );
vm.scalePartFromCenterTo( $isvgParts[ 4 ], 4, info );
vm.moveCenterOfPartTo( $isvgParts[ 4 ], 15 * 12, 12 * 12, info );
vm.rotatePartAboutCenterTo( $isvgParts[ 4 ], 0, info );
//console.log( info );

info = vm.getPartInfo( $isvgParts[ 2 ] );
vm.movePartTo( $isvgParts[ 2 ], 14 * 12 + 6, 19 * 12 + 6, info );
vm.rotatePartAboutCenterTo( $isvgParts[ 2 ], -180, info );
//console.log( info );

info = vm.getPartInfo( $isvgParts[ 3 ] );
vm.movePartTo( $isvgParts[ 3 ], 23 * 12, 5 * 12, info );
vm.rotatePartAboutCenterTo( $isvgParts[ 3 ], 45, info );
//console.log( info );
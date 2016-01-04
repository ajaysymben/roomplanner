import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './view-3d.less!';
import template from './view-3d.stache!';

export const ViewModel = Map.extend({
  //define: {
  //  message: {
  //    value: 'This is the view-3d component'
  //  }
  //},

  convertSVGPointFor3DCoordSystem: function ( x, y ) {
    var depth = this.attr( "floorDepth" );
    //translate from a 2D
    //  where 0,0 [x,y] is left-top corner and 10,10 is towards the right-bottom corner
    //to 3D
    //  where 0,-depth [x,z] is left-top corner, and 10,0 is towards the right-bottom corner
    return {
      x: x,
      z: y - depth,
      y: 0
    };
  },

  guideCameraTo: function ( x, y, z, whileLookingAt, speed ) {
    var vm = this;
    var camera = this.attr( "camera" );

    var unitsMoveXPerTick = ( x - camera.position.x ) * speed;
    var unitsMoveZPerTick = ( z - camera.position.z ) * speed;

    var unitsMoveYPerTick = ( y - camera.position.y ) * speed;

    var animate = function () {
      var count = 0;

      camera.position.x += unitsMoveXPerTick;
      if ( ( unitsMoveXPerTick > 0 && camera.position.x >= x ) || ( unitsMoveXPerTick < 0 && camera.position.x <= x ) ) {
        camera.position.x = x;
        count++;
      }

      camera.position.z += unitsMoveZPerTick;
      if ( ( unitsMoveZPerTick > 0 && camera.position.z >= z ) || ( unitsMoveZPerTick < 0 && camera.position.z <= z ) ) {
        camera.position.z = z;
        count++;
      }

      camera.position.y += unitsMoveYPerTick;
      if ( ( unitsMoveYPerTick > 0 && camera.position.y >= y ) || ( unitsMoveYPerTick < 0 && camera.position.y <= y ) ) {
        camera.position.y = y;
        count++;
      }

      camera.lookAt( whileLookingAt );

      if ( count !== 3 ) {
        requestAnimationFrame( animate );
      }
      //else {
      //  console.log( "finished!" );
      //}

      vm.render();
    };

    animate();
  },

  positionCamera3: function () {
    var camera = this.attr( "camera" );
    var lookAt = new THREE.Vector3( this.attr( "floorWidth" ) / 2, 12 * 4, - this.attr( "floorDepth" ) / 2 );

    camera.position.x = this.attr( "floorWidth" ) / 2;
    camera.position.z = 0;
    camera.position.y = 12 * 5.5;
    camera.lookAt( lookAt );
  },

  positionCamera2: function () {
    var camera = this.attr( "camera" );
    var lookAt = new THREE.Vector3( this.attr( "floorWidth" ) / 2, 12, - this.attr( "floorDepth" ) / 2 );

    camera.position.x = this.attr( "floorWidth" );
    camera.position.z = 12 * 35; //pull camera back 35 ft
    camera.position.y = 12 * 50; //push camera into the air 50 ft
    camera.lookAt( lookAt );
  },

  positionCamera: function () {
    var vm = this;
    var camera = this.attr( "camera" );
    var lookAt = new THREE.Vector3( this.attr( "floorWidth" ) / 2, 12, - this.attr( "floorDepth" ) / 2 );
    var lookAt2 = new THREE.Vector3( this.attr( "floorWidth" ) / 2, 12 * 4, - this.attr( "floorDepth" ) / 2 );

    camera.position.x = this.attr( "floorWidth" ) / 2;
    camera.position.z = 12 * 55; //pull camera back 55 ft
    camera.position.y = 12 * 80; //push camera into the air 80 ft
    camera.lookAt( lookAt );
    
    setTimeout(function () {
      vm.guideCameraTo( vm.attr( "floorWidth" ), 12 * 50, 12 * 35, lookAt, 0.02 );
    }, 1500 );
    
    setTimeout(function () {
      vm.guideCameraTo( vm.attr( "floorWidth" ) / 2, 12 * 5.5, 12 * 5, lookAt2, 0.02 );
    }, 6000 );
    
    setTimeout(function () {
      vm.guideCameraTo( vm.attr( "floorWidth" ), 12 * 50, 12 * 35, lookAt, 0.02 );
    }, 9000 );
  },

  render: function () {
    this.attr( "renderer" ).render( this.attr( "scene" ), this.attr( "camera" ) );
  },

  /*
    $( "view-3d" ).viewModel().positionCamera();
    $( "view-3d" ).viewModel().drawGrid();
    $( "view-3d" ).viewModel().drawFloorOutline();
  */

  //left and right is -+ x
  //forward and backward is -+ z ( NOTE: backwards is positive z )
  //up and down is +- y

  drawFloorOutline: function () {
    var depth = this.attr( "floorDepth" );
    var width = this.attr( "floorWidth" );

    //var floor = new THREE.Mesh(
    //  new THREE.BoxGeometry( width, 6, depth ),
    //  new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    //);
    //floor.translateX( width / 2 );
    //floor.translateY( -6 );
    //floor.translateZ( -depth / 2 );
    //this.attr( "scene" ).add( floor );

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

    var color = new THREE.Color( 0x000000 );

    var lefttop = this.convertSVGPointFor3DCoordSystem( 0, 0 );
    var righttop = this.convertSVGPointFor3DCoordSystem( width, 0 );
    var leftbottom = this.convertSVGPointFor3DCoordSystem( 0, depth );
    var rightbottom = this.convertSVGPointFor3DCoordSystem( width, depth );

    geometry.vertices.push(
      new THREE.Vector3( righttop.x, 0, righttop.z ), new THREE.Vector3( lefttop.x, 0, lefttop.z ),
      new THREE.Vector3( lefttop.x, 0, lefttop.z ), new THREE.Vector3( leftbottom.x, 0, leftbottom.z ),
      new THREE.Vector3( leftbottom.x, 0, leftbottom.z ), new THREE.Vector3( rightbottom.x, 0, rightbottom.z ),
      new THREE.Vector3( rightbottom.x, 0, rightbottom.z ), new THREE.Vector3( righttop.x, 0, righttop.z )
    );
    geometry.colors.push(
      color, color,
      color, color,
      color, color,
      color, color
    );

    this.attr( "scene" ).add( new THREE.LineSegments( geometry, material ) );
  },

  drawGrid: function () {
    var depth = this.attr( "floorDepth" );
    var width = this.attr( "floorWidth" );
    var step = this.attr( "gridLinesEvery" );

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

    var color = new THREE.Color( 0x888888 );
    var temp1 = null;
    var temp2 = null;

    //draw depth grid lines ( svg top to bottom lines )
    for ( var i = 0; i <= width; i += step ) {
      temp1 = this.convertSVGPointFor3DCoordSystem( i, 0 );
      temp2 = this.convertSVGPointFor3DCoordSystem( i, depth );
      geometry.vertices.push(
        new THREE.Vector3( temp1.x, 0, temp1.z ), new THREE.Vector3( temp2.x, 0, temp2.z )
      );
      geometry.colors.push( color, color );
    }

    //draw horizontal grid lines ( svg left to right lines )
    for ( var i = 0; i <= depth; i += step ) {
      temp1 = this.convertSVGPointFor3DCoordSystem( 0, i );
      temp2 = this.convertSVGPointFor3DCoordSystem( width, i );
      geometry.vertices.push(
        new THREE.Vector3( temp1.x, 0, temp1.z ), new THREE.Vector3( temp2.x, 0, temp2.z )
      );
      geometry.colors.push( color, color );
    }

    this.attr( "scene" ).add( new THREE.LineSegments( geometry, material ) );
  },

  randomColor: function () {
    var x = 0, color = "";
    x = ~~( Math.random() * 6 ) * 0x33;
    color += x.toString( 16 );
    x = ~~( Math.random() * 6 ) * 0x33;
    color += x.toString( 16 );
    x = ~~( Math.random() * 6 ) * 0x33;
    color += x.toString( 16 );
    return color;
  },

  insertDAE: function ( filepath, scene, xPos, yPos, zPos, rotationDeg ) {
    var loader = new THREE.ColladaLoader();
    var dae;
    loader.options.convertUpAxis = true;

    loader.load( filepath, function ( collada ) {
      //TODO: turn loader into a promise, map filename to this promise so future requests use the same data via dae.clone()
      dae = collada.scene;
      dae.scale.x = dae.scale.y = dae.scale.z = 1.0;
      dae.position.set( xPos, yPos, zPos );
      dae.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rotationDeg * -0.0174533 );
      scene.add( dae );
    });
  },

  get3DData: function ( partTitle ) {
    partTitle = partTitle.toLowerCase();

    var data3D = {
      height: 12 * 3,
      yPos: 12 * 1.5
    };

    if ( partTitle.indexOf( "table" ) !== -1 ) {
      data3D.height = 4;
      data3D.yPos = 12 * 3 + 4;
      data3D.color = parseInt( "B9B288", 16 );
    } else if ( partTitle.indexOf( "softwall" ) !== -1 ) {
      data3D.height = 12 * 8;
      data3D.yPos = 12 * 4;
      data3D.color = parseInt( "000000", 16 );
    } else if ( partTitle.indexOf( "column" ) !== -1 ) {
      data3D.height = 12 * 8;
      data3D.yPos = 12 * 4;
      data3D.color = parseInt( "000000", 16 );
    } else if ( partTitle.indexOf( "post" ) !== -1 ) {
      data3D.height = 12 * 8;
      data3D.yPos = 12 * 4;
      data3D.color = parseInt( "000000", 16 );
    } else if ( partTitle.indexOf( "hood" ) !== -1 ) {
      data3D.yPos = 12 * 5;
    } else if ( partTitle.indexOf( "door" ) !== -1 ) {
      data3D.height = 12 * 6;
      data3D.yPos = 12 * 3;
      data3D.color = parseInt( "FFFFFF", 16 );
    } else if ( partTitle.indexOf( "chair" ) !== -1 ) {
      data3D.height = 12 * 2;
      data3D.yPos = 12 * 1;
    } else if ( partTitle.indexOf( "stool" ) !== -1 ) {
      data3D.height = 12 * 2;
      data3D.yPos = 12 * 1;
      data3D.color = parseInt( "1375B2", 16 );
    } else if ( partTitle === "drain" ) {
      data3D.height = 2;
      data3D.yPos = 1;
    } else if ( partTitle.indexOf( "window" ) !== -1 ) {
      data3D.height = 12 * 4;
      data3D.yPos = 12 * 5;
      data3D.color = parseInt( "FFFFFF", 16 );
    } else if ( partTitle === "fire extinguisher" ) {
      data3D.height = 12;
      data3D.yPos = 12 * 2;
      data3D.color = parseInt( "C20101", 16 );
    } else if ( partTitle.indexOf( "wall" ) !== -1 ) {
      data3D.height = 12 * 4;
      data3D.yPos = 12 * 5;
    } else if ( partTitle === "instructor's bench, 8'" ) {
      data3D.color = parseInt( "BED8BF", 16 );
    } else if ( partTitle.indexOf( 'base cabinet' ) !== -1 ) {
      data3D.color = parseInt( "FEE8B2", 16 );
    }

    if ( false && partTitle === '48"l wall cabinet' ) {
      data3D.dae = "/src/daes/shelf.dae";
    }

    return data3D;
  },

  initAfterInsert: function () {
    var vm = this;
    var $el = vm.attr( "element" );
    var camera, scene, renderer;
    var geometry, material, mesh;

    camera = new THREE.PerspectiveCamera( 30, $el.width() / $el.height(), 1, 10000 );
    camera.position.z = 1000;

    var colorMap = {};

    scene = new THREE.Scene();

    var partsInfo = vm.attr( "partsData" );
    var i, info, temp, color, data3D;
    for ( i = 0; i < partsInfo.length; i++ ) {
      info = partsInfo[ i ];
      if ( !colorMap[ info.partTitle ] ) {
        colorMap[ info.partTitle ] = parseInt( this.randomColor(), 16 ); //0xff0000;
      }
      color = colorMap[ info.partTitle ];

      data3D = this.get3DData( info.partTitle );
      if ( data3D.color ) color = data3D.color;

      temp = this.convertSVGPointFor3DCoordSystem( info.unitsCenterX, info.unitsCenterY );

      if ( data3D.dae ) {
        vm.insertDAE( data3D.dae, scene, temp.x, data3D.yPos, temp.z, info.rotation );
      } else {
        geometry = new THREE.BoxGeometry( info.unitsWidth, data3D.height, info.unitsHeight );
        material = new THREE.MeshBasicMaterial({
          color: color,
          //wireframe: true
        });

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        mesh.translateX( temp.x );
        mesh.translateY( data3D.yPos );
        mesh.translateZ( temp.z );
        mesh.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), info.rotation * -0.0174533 );
      }
    }

    //var light = new THREE.AmbientLight( 0xffffff );
    //scene.add( light );

    //var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    //directionalLight.position.set( 0, 1, 0 );
    //scene.add( directionalLight );

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( $el.width(), $el.height() );
    renderer.setClearColor( 0xC8C8C8, 1 );

    vm.attr( "camera", camera );
    vm.attr( "scene", scene );
    vm.attr( "renderer", renderer );
    $el.append( renderer.domElement );

    /*var animate = function () {

      // note: three.js includes requestAnimationFrame shim
      requestAnimationFrame(animate);

      //mesh.rotation.x += 0.01;
      //mesh.rotation.y += 0.02;

      renderer.render(scene, camera);

    };
    animate();*/

    vm.positionCamera();
    vm.drawGrid();
    vm.drawFloorOutline();

    vm.render();
  }
});

export default Component.extend({
  tag: 'view-3d',
  viewModel: ViewModel,
  template,
  events: {
    inserted: function () {
      var vm = this.viewModel;
      if ( !vm ) return;

      var isvgVM = $( "interactive-svg" ).viewModel();
      vm.attr( "isvgVM", isvgVM );
      vm.attr( "floorDepth", isvgVM.attr( "height" ) ); //in units ( inches )
      vm.attr( "floorWidth", isvgVM.attr( "width" ) ); //in units
      vm.attr( "gridLinesEvery", isvgVM.attr( "gridLinesEvery" ) ); //in units, spacing of grid lines
      vm.attr( "partsData", isvgVM.loadAllPartsData() );
      vm.attr( "element", this.element );
      vm.initAfterInsert();
    }
  }
});
import * as THREE from './vendors/three.js-131/build/three.module.js';
const PathController = (scene, _props = {}) => {
	const props = {

	}

	Object.assign(props, props)

	const UP = new THREE.Vector3(0, 1, 0)
  	const AXIS = new THREE.Vector3(0,0,1)
  	const ARC_SEGMENTS = 200

  	const path = new THREE.CurvePath()
  	const point = new THREE.Vector3()
	const splineHelperObjects = []
	const splines = {}
	const geometry = new THREE.BoxBufferGeometry( .1,.1,.1 )

	let fraction = 0
	
	let positions = []
	let position
	let splinePointsLength = 4
	let objectOnPath
	let updateObjectPos = false
	let spn = 0

	let _isPlaying = false
	let _debug = false

	const addSplineObject = (_parent, position ) => {
		console.log('addSplineObject')

		const material = new THREE.MeshLambertMaterial( { 
			color: /*Math.random() **/ 0xff0000,
			depthWrite:false,
			transparent:true,

		 } );
		const object = new THREE.Mesh( geometry, material );

		object.name = 'Handle_' + (spn++)
		object.visible = false

		if ( position ) {
			object.position.copy( position );
		} else {
			object.position.x = Math.random() * 100 - 50;
			object.position.y = Math.random() * 60;
			object.position.z = Math.random() * 80 - 40;
		}

		_parent.add( object );
		
		splineHelperObjects.push( object );

		return object;
	}

	const addPoint = (_parent) => {
		splinePointsLength ++;
		positions.push( addSplineObject(_parent).position );

		updateSplineOutline();
	}

	const updateSplineOutline = () => {
		for ( const k in splines ) {
			const spline = splines[ k ];

			const splineMesh = spline.mesh;
			const position = splineMesh.geometry.attributes.position;

			for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {
				const t = i / ( ARC_SEGMENTS - 1 );
				spline.getPoint( t, point );
				position.setXYZ( i, point.x, point.y, point.z );

			}

			position.needsUpdate = true;
		}
	}

	const load =  (_parent, new_positions ) => {

		while ( new_positions.length > positions.length ) {
			addPoint(_parent);
		}

		while ( new_positions.length < positions.length ) {
			removePoint(_parent);
		}

		for ( let i = 0; i < positions.length; i ++ ) {
			positions[ i ].copy( new_positions[ i ] );
		}

		updateSplineOutline();
	}

	const base = {
		init: (_objectOnPath, _parent, _curvePathData) => {
			objectOnPath = _objectOnPath
			//objectOnPath.scale.set(4,4,4)

			//_parent.add(objectOnPath)

			for ( let i = 0; i < splinePointsLength; i ++ ) {
				addSplineObject(_parent, positions[ i ] );
			}

			positions.length = 0;

			for ( let i = 0; i < splinePointsLength; i ++ ) {
				positions.push( splineHelperObjects[ i ].position );
			}

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );

			let curve = new THREE.CatmullRomCurve3( positions );
			curve.curveType = 'catmullrom';
			curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
				color: 0xff0000,
				opacity: 0.,
				transparent:true
			} ) );

			//curve.mesh.castShadow = true;
			splines.uniform = curve;

			path.add(curve)

			for ( const k in splines ) {
				const spline = splines[ k ];
				_parent.add( spline.mesh );
			}

			load(_parent, _curvePathData)
		},
		update: (delta, scrollVal) => {
			if(!updateObjectPos) return 

			//fraction += 0.001;
		    
		    
			/*const newPosition = path.getPoint(fraction);
		    const tangent = path.getTangent(fraction);
		    
		    objectOnPath.position.copy(newPosition);
		    AXIS.crossVectors( UP , tangent ).normalize();
		    
		    const radians = Math.acos( UP.dot( tangent ) );
		    
		    objectOnPath.quaternion.setFromAxisAngle( AXIS, radians );*/

		    var p1 = path.getPoint(scrollVal % 1);
		  	var p2 = path.getPoint((scrollVal + 0.02) % 1);

		  	objectOnPath.position.x = p1.x;
		  	objectOnPath.position.y = p1.y + .175;
		  	objectOnPath.position.z = p1.z;
		  	objectOnPath.lookAt(p2.x, p2.y + .185, p2.z);

		  	//objectOnPath.rotateX(Math.PI / 2)
		  	//objectOnPath.rotateZ(Math.PI / 2)
		},
		getPositionAt:(t) => {
			return path.getPoint(t);
		},
		play: () => {
			//fraction = 0
			updateObjectPos = true
			_isPlaying = true
		},
		pause: () => {
			updateObjectPos = false
			_isPlaying = false
		},
		reload:() => {
			const pnts = []

			for(let i=0; i<spn; i++){
				const obj = scene.getObjectByName('Handle_' + i)
				pnts.push(obj.position)
			}

			load(pnts)
		}
	}

	Object.defineProperty(base , 'isPlaying', {
		get: () => {
			return _isPlaying
		},
		set: (value) => {
			_isPlaying = value
		}
	})

	Object.defineProperty(base , 'debug', {
		get: () => {
			return _debug
		},
		set: (value) => {
			
			for(let i=0; i<spn; i++){
				const obj = scene.getObjectByName('Handle_' + i)
				//obj.visible = value
			}

			for ( const k in splines ) {
				const spline = splines[ k ];

				const splineMesh = spline.mesh;
				splineMesh.material.opacity = (value == true) ? 0 : 0
			}
			
			_debug = value
		}
	})
	return base
}

export default PathController;

const MouseController = (_props = {}) => {
	const props = {

	}

	Object.assign(props, _props)

	const raycaster = new THREE.Raycaster()
	const rayOrigin = new THREE.Vector2(0,0)
	const tapPosition = new THREE.Vector2()
	
	let cursorLocation = new THREE.Vector3(0,0,0)

	let domElement, camera, scene
	let isMouseDown = false

	const getMousePos = (e) => {

		tapPosition.x = (e.clientX / window.innerWidth) * 2 - 1
        tapPosition.y = - (e.clientY / window.innerHeight) * 2 + 1
    
        raycaster.setFromCamera(tapPosition, camera)
    	
        const intersects = raycaster.intersectObjects(scene.children)
    	
        if (intersects.length >= 1) {
          	
          	for(let i=0; i<intersects.length; i++){
          		if(intersects[i].object.name.indexOf('Handle')!= -1){
          			//console.log('Find handle')

          			document.dispatchEvent(new CustomEvent('mouse3DEvent', {
							detail:{
								type:e.type,
								point:intersects[i].point,
								object:intersects[i].object
							}
						}
					))
          		}
          	}
        }
	}

	const mouseDownHandler = (e) => {
		//console.log('mouseDownHandler')
		isMouseDown = true
		getMousePos(e)
	}

	const mouseUpHandler = (e) => {
		isMouseDown = false
		getMousePos(e)
	}

	const mouseMoveHandler = (e) => {
		if( isMouseDown )
			getMousePos(e)
	}


	const base = {
		init: (_camera, _render, _scene) => {
			domElement = _render.domElement
			camera = _camera
			scene = _scene

			domElement.addEventListener('mousedown', mouseDownHandler, false)
			domElement.addEventListener('mouseup', mouseUpHandler, false)
			domElement.addEventListener('mousemove', mouseMoveHandler, false)
		},
		update: () => {
			
		} 
 	}

	return base
}
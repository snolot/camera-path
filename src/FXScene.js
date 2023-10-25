import * as THREE from './vendors/three.js-131/build/three.module.js';
import { RenderPass } from './vendors/three.js-131/examples/jsm/postprocessing/RenderPass.js';

const FXScene = (renderer, composer, clearColor, useOrtho = false) => {

	let _camera;

	if(!useOrtho){
		_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000 );
		_camera.position.z = 5;
	} else {
		_camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1);
	}
	
	// Setup _scene
	const _scene = new THREE.Scene();
	_scene.add( new THREE.AmbientLight( 0x555555 ) );

	const light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	_scene.add( light );
	//_scene.add( mesh );
	let _pass = new RenderPass(_scene, _camera);
	_pass.enabled = false;

	composer.addPass(_pass);

	const renderTargetParameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	};

	const _fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters );
	
	const render = ( delta, rtt ) => {

		renderer.setClearColor( clearColor );

		if ( rtt ) {
			if(_pass.enabled) 
				_pass.enabled=false;

			renderer.setRenderTarget( _fbo );
			renderer.clear();
			//composer.render();
			renderer.render( _scene, _camera );
		} else {
			//console.log(composer)
			if(!_pass.enabled)
				_pass.enabled = true;

			renderer.setRenderTarget( null );
			//renderer.render( _scene, _camera );
			composer.render();
		}
	};

	const base = {
		render,

	};

	Object.defineProperty(base, 'fbo', {
		get:() => _fbo,
	});

	Object.defineProperty(base, 'scene', {
		get:() => _scene,
	});

	Object.defineProperty(base, 'camera', {
		get:() => _camera,
	});

	Object.defineProperty(base, 'pass', {
		get:() => _pass,
	});

	return base;
};

export default FXScene;
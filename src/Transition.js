import * as THREE from './vendors/three.js-131/build/three.module.js';
import { RenderPass } from './vendors/three.js-131/examples/jsm/postprocessing/RenderPass.js';

import { TWEEN } from './vendors/three.js-131/examples/jsm/libs/tween.module.min.js';

const Transition = (renderer, composer, sceneA, sceneB) => {
	
	const _transitionParams = {
		'useTexture': true,
		'transition': 0,
		'texture': 3,
		'cycle': false,
		'animate': true,
		'threshold': 0.3
	};

	const _scene = new THREE.Scene();
	const width = window.innerWidth;
	const height = window.innerHeight;
	const _camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, - 10, 10 );

	const textures = [];
	let _pass = new RenderPass(_scene, _camera);
	_pass.enabled = false;

	composer.addPass(_pass);

	const loader = new THREE.TextureLoader();

	for ( let i = 0; i < 6; i ++ ) {
		textures[ i ] = loader.load( './images/transition' + ( i + 1 ) + '.png' );
	}

	const material = new THREE.ShaderMaterial({
		uniforms: {
			tDiffuse1: {
				value: null
			},
			tDiffuse2: {
				value: null
			},
			mixRatio: {
				value: 0.0
			},
			threshold: {
				value: 0.1
			},
			useTexture: {
				value: 1
			},
			tMixTexture: {
				value: textures[ 0 ]
			}
		},
		vertexShader: [

			'varying vec2 vUv;',

			'void main() {',

			'vUv = vec2( uv.x, uv.y );',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

			'}'
		].join( '\n' ),
		fragmentShader: [

			'uniform float mixRatio;',

			'uniform sampler2D tDiffuse1;',
			'uniform sampler2D tDiffuse2;',
			'uniform sampler2D tMixTexture;',

			'uniform int useTexture;',
			'uniform float threshold;',

			'varying vec2 vUv;',

			'void main() {',

			'	vec4 texel1 = texture2D( tDiffuse1, vUv );',
			'	vec4 texel2 = texture2D( tDiffuse2, vUv );',

			'	if (useTexture==1) {',

			'		vec4 transitionTexel = texture2D( tMixTexture, vUv );',
			'		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;',
			'		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);',

			'		gl_FragColor = mix( texel1, texel2, mixf );',

			'	} else {',

			'		gl_FragColor = mix( texel2, texel1, mixRatio );',

			'	}',

			'}'
		].join( '\n' )
	} );

	const geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
	const mesh = new THREE.Mesh( geometry, material );
	_scene.add( mesh );

	material.uniforms.tDiffuse1.value = sceneA.fbo.texture;
	material.uniforms.tDiffuse2.value = sceneB.fbo.texture;

	let needsTextureChange = false;

	const launchTransition = (isBack = false) => {
		new TWEEN.Tween( _transitionParams )
		.to( { transition: (isBack ? 0 : 1) }, 1500 )
		//.repeat( Infinity )
		.delay( 500 )
		/*.yoyo( true )*/
		.start();
	};

	const setTextureThreshold = ( value ) => {
		material.uniforms.threshold.value = value;
	};

	const useTexture = ( value ) => {
		material.uniforms.useTexture.value = value ? 1 : 0;
	};

	const setTexture = ( i ) => {
		material.uniforms.tMixTexture.value = textures[ i ];
	};

	const render = ( delta ) => {
		if ( _transitionParams.animate ) {
			
			if ( _transitionParams.cycle ) {
				if ( _transitionParams.transition == 0 || _transitionParams.transition == 1 ) {
					if ( needsTextureChange ) {
						_transitionParams.texture = ( _transitionParams.texture + 1 ) % textures.length;
						material.uniforms.tMixTexture.value = textures[ _transitionParams.texture ];
						needsTextureChange = false;
					}
				} else {
					needsTextureChange = true;
				}
			} else {
				needsTextureChange = true;
			}
		}

		material.uniforms.mixRatio.value = _transitionParams.transition;

		// Prevent render both scenes when it's not necessary
		if ( _transitionParams.transition == 0 ) {
			sceneB.render( delta, false );
		} else if ( _transitionParams.transition == 1 ) {
			sceneA.render( delta, false );
		} else {

			sceneA.render( delta, true );
			sceneB.render( delta, true );
			renderer.setRenderTarget( null );
			renderer.clear();

			renderer.render( _scene, _camera );
		}
	};

	const base = {
		render,
		setTexture,
		useTexture,
		setTextureThreshold,
		launchTransition
	};

	Object.defineProperty(base, 'transitionParams', {
		get:() => _transitionParams, 
	});

	Object.defineProperty(base, 'camera', {
		get:() => _camera, 
	});

	Object.defineProperty(base, 'scene', {
		get:() => _scene, 
	});

	return base;
};

export default Transition;

import * as THREE from './vendors/three.js-131/build/three.module.js';
import {GLTFLoader} from './vendors/three.js-131/examples/jsm/loaders/GLTFLoader.js';
import { RGBMLoader } from './vendors/three.js-131/examples/jsm/loaders/RGBMLoader.js';

const Model = ({ renderer, position }) => {
	const loader = new GLTFLoader();
	const rgbmUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ];
	let rgbmCubeMap, rgbmCubeRenderTarget;
	let model, mixer, animations, actions = [];
	let pmremGenerator;

	const init = async() => {
		

		return new Promise(async(resolve) => {
			loader.load('./iqos_anim.glb', gltf => {
				model = gltf.scene; 
				model.position.copy(position);

				animations = gltf.animations;
				mixer = new THREE.AnimationMixer(model);

				for(let i=0; i<animations.length; i++){
					const action = mixer.clipAction(animations[i]);

					actions.push(action);
					action.play().paused = true;
				};

				model.traverse((child) => {
					if (child.isMesh) {
						
						child.receiveShadow = true;
						child.castShadow = true;
						child.material = child.material.clone()
						child.material.transparent=true;
						child.material.opacity=1;
						child.userData.color = child.material.color.clone();
					}
				});

				model.position.y -= 7;
				model.rotateX(-Math.PI * .5);
			    model.rotateZ(Math.PI * .5);
			    
			    model.scale.set(50,50,50);

			    pmremGenerator = new THREE.PMREMGenerator( renderer );

				THREE.DefaultLoadingManager.onLoad = function ( ) {
					pmremGenerator.dispose();
					resolve(model);
				};

				rgbmCubeMap = new RGBMLoader()
					.setPath( './textures/cube/pisaRGBM16/' )
					.loadCubemap( rgbmUrls, function () {
						rgbmCubeMap.encoding = THREE.RGBM16Encoding;
						rgbmCubeRenderTarget = pmremGenerator.fromCubemap( rgbmCubeMap );

					model.traverse(child => {
						if(child.isMesh) {
							child.material.envMap = rgbmCubeRenderTarget.texture;
							child.material.needsUpdate = true;
							child.material.envMapIntensity= .72
						}
					});
				});
				
				pmremGenerator.compileCubemapShader();
				
			});
		});
	};

	const update = ({delta, scroll}) => {
		if(mixer){
			mixer.update(delta);
		}

		model.rotateZ(.01);
		
		for (let i = 0; i < actions.length; i += 1) {
            const action = actions[i];
            action.time = THREE.MathUtils.lerp(
                action.time,
                action.getClip().duration * scroll,
                0.2,
            );
        }
	};

	const base = {
		init,
		update,
	};

	return base;
};

export default Model;

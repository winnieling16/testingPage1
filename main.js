// Import necessary functions and objects
import { loadGLTF } from "/tutorial2-Winnie/libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

// Function to initialize MindARThree instance
const initializeMindAR = () => {
  return new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: '/tutorial2-Winnie/assets/targets/targetstesting.mind',
  });
};

// Function to set up lighting for the scene
const setupLighting = (scene) => {
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
};

// Function to load and configure a 3D model with optional rotation
const loadAndConfigureModel = async (path, scale, position, rotation = { x: 0, y: 0, z: 0 }) => {
  const model = await loadGLTF(path);
  model.scene.scale.set(scale.x, scale.y, scale.z);
  model.scene.position.set(position.x, position.y, position.z);
  model.scene.rotation.set(rotation.x, rotation.y, rotation.z);

  // If the model has animations, set up an animation mixer
  if (model.animations && model.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model.scene);
    const action = mixer.clipAction(model.animations[0]);
    action.play();
    model.mixer = mixer;
  }

  return model;
};

// Function to set up the anchor with the model
const setupAnchor = (mindarThree, anchorIndex, model) => {
  const anchor = mindarThree.addAnchor(anchorIndex);
  anchor.group.add(model.scene);
};

// Function to start rendering loop
const startRenderingLoop = (renderer, scene, camera, models) => {
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    models.forEach((model) => {
      if (model.mixer) {
        model.mixer.update(delta);
      }
    });
    renderer.render(scene, camera);
  });
};

// Main function to start the AR experience
document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    const mindarThree = initializeMindAR();
    const { renderer, scene, camera } = mindarThree;

    setupLighting(scene);

    const alienModel = await loadAndConfigureModel(
      //'/tutorial2-Winnie/assets/models/alien.glb',
	  '/tutorial2-Winnie/assets/models/Environment 2(with cloud -y axis version 1).glb',
      { x: 0.1, y: 0.1, z: 0.1 },
      { x: 0, y: -0.4, z: 0 },
      { x: 0, y: Math.PI / 2, z: 0 }  // Rotate to face forward
    );
	const avocadoModel = await loadAndConfigureModel(
      '/tutorial2-Winnie/assets/models/avocado.glb',
     { x: 0.05, y:  0.05, z:  0.05},
      { x: 0, y:  -0.4, z: 0 }
    );
    const colaModel = await loadAndConfigureModel(
      '/tutorial2-Winnie/assets/models/cola/scene.gltf',
      { x: 5.5, y: 5.5, z: 5.5},
      { x: 0, y: -0.4, z: 0 }
    );
    const cupcakeModel = await loadAndConfigureModel(
      '/tutorial2-Winnie/assets/models/cupcake/scene.gltf',
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 0, y: -0.4, z: 0 }
    );
    

    setupAnchor(mindarThree, 0, alienModel);
    setupAnchor(mindarThree, 1, avocadoModel);
    setupAnchor(mindarThree, 2, colaModel);
    setupAnchor(mindarThree, 3, cupcakeModel);

    await mindarThree.start();
    startRenderingLoop(renderer, scene, camera, [alienModel, avocadoModel, colaModel, cupcakeModel]);
  };

  start();
});

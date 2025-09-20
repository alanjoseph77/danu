import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// VARIABLES
let theme = 'light';
let bookCover = null;
let lightSwitch = null;
let titleText = null;
let subtitleText = null;
let mixer;
let isMobile = window.matchMedia('(max-width: 992px)').matches;
let canvas = document.querySelector('.experience-canvas');
const loaderWrapper = document.getElementById('loader-wrapper');
let clipNames = [
  'fan_rotation',
  'fan_rotation.001',
  'fan_rotation.002',
  'fan_rotation.003',
  'fan_rotation.004',
];
let projects = [
  {
    image: 'textures/project-spaze.webp',
    url: 'https://www.spaze.social/',
  },
  {
    image: 'textures/project-myteachers.jpg',
    url: 'https://myteachers.com.au/',
  },
  {
    image: 'textures/project-wholesale.jpg',
    url: 'https://wholesale.com.np/',
  },
  {
    image: 'textures/project-pelotero.jpg',
    url: 'https://www.peloterosenlaweb.com/',
  },
];
let aboutCameraPos = {
  x: 0.12,
  y: 0.2,
  z: 0.55,
};
let aboutCameraRot = {
  x: -1.54,
  y: 0.13,
  z: 1.41,
};
let projectsCameraPos = {
  x: 1,
  y: 0.45,
  z: 0.01,
};
let projectsCameraRot = {
  x: 0.05,
  y: 0.05,
  z: 0,
};

// SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
let defaultCameraPos = {
  x: 1.009028643133046,
  y: 0.5463638814987481,
  z: 0.4983449671971262,
};
let defaultCamerRot = {
  x: -0.8313297556598935,
  y: 0.9383399492446749,
  z: 0.7240714481613063,
};
camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// STATS
// const stats = new Stats();
// document.querySelector('.experience').appendChild(stats.dom);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.9;
controls.maxDistance = 1.6;
controls.minAzimuthAngle = 0.2;
controls.maxAzimuthAngle = Math.PI * 0.78;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// LOAD MODEL & ASSET
// const loadingManager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  'models/room.glb',
  function (room) {
    // hide loader on loade
    loaderWrapper.style.display = 'none';

    // load video
    const video = document.createElement('video');
    video.src = 'textures/arcane.mp4';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    // create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    room.scene.children.forEach((child) => {
      // disable shadow by wall
      if (child.name !== 'Wall') {
        child.castShadow = true;
      }
      child.receiveShadow = true;

      if (child.children) {
        child.children.forEach((innerChild) => {
          // disable shadow by book cover & switch btn
          if (innerChild.name !== 'Book001' && innerChild.name !== 'Switch') {
            innerChild.castShadow = true;
          }

          // add texture to book cover
          if(innerChild.name === 'Book001') {
            const bookCoverTexture = new THREE.TextureLoader().load(
              'textures/book-cover.png'
            );
            bookCoverTexture.flipY = false;
            innerChild.material = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
              color: 0xffffff,
              map: bookCoverTexture,
            });
          }

          innerChild.receiveShadow = true;
        });
      }

      if (child.name === 'Stand') {
        child.children[0].material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
        video.play();
      }

      // transparent texture for glass
      if (child.name === 'CPU') {
        child.children[0].material = new THREE.MeshPhysicalMaterial();
        child.children[0].material.roughness = 0;
        child.children[0].material.color.set(0x999999);
        child.children[0].material.ior = 3;
        child.children[0].material.transmission = 2;
        child.children[0].material.opacity = 0.8;
        child.children[0].material.depthWrite = false;
        child.children[0].material.depthTest = false;
        child.children[1].material = new THREE.MeshPhysicalMaterial();
        child.children[1].material.roughness = 0;
        child.children[1].material.color.set(0x999999);
        child.children[1].material.ior = 3;
        child.children[1].material.transmission = 1;
        child.children[1].material.opacity = 0.8;
        child.children[1].material.depthWrite = false;
        child.children[1].material.depthTest = false;
      }

      if (child.name === 'Book') {
        bookCover = child.children[0];

        // adding texture to book
        const bookTexture = new THREE.TextureLoader().load(
          'textures/book-inner.jpg'
        );
        bookTexture.flipY = false;
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: bookTexture,
        });
      }

      if (child.name === 'SwitchBoard') {
        lightSwitch = child.children[0];
      }
    });

    scene.add(room.scene);
    animate();

    // add animation
    mixer = new THREE.AnimationMixer(room.scene);
    const clips = room.animations;
    clipNames.forEach((clipName) => {
      const clip = THREE.AnimationClip.findByName(clips, clipName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
    });

    loadIntroText();

    // add event listeners
    aboutMenuListener();
    projectsMenuListener();
    init3DWorldClickListeners();
    initResponsive(room.scene);
  },
  function (error) {
    console.error(error);
  }
);

// ADD LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const roomLight = new THREE.PointLight(0xffffff, 2.5, 10);
roomLight.position.set(0.3, 2, 0.5);
roomLight.castShadow = true;
roomLight.shadow.radius = 5;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
roomLight.shadow.camera.far = 2.5;
// roomLight.shadow.camera.fov = 100;
roomLight.shadow.bias = -0.002;
scene.add(roomLight);
// add light for pc fans
const fanLight1 = new THREE.PointLight(0xff0000, 30, 0.2);
const fanLight2 = new THREE.PointLight(0x00ff00, 30, 0.12);
const fanLight3 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight4 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight5 = new THREE.PointLight(0x00ff00, 30, 0.05);
fanLight1.position.set(0, 0.29, -0.29);
fanLight2.position.set(-0.15, 0.29, -0.29);
fanLight3.position.set(0.21, 0.29, -0.29);
fanLight4.position.set(0.21, 0.19, -0.29);
fanLight5.position.set(0.21, 0.08, -0.29);
scene.add(fanLight1);
scene.add(fanLight2);
scene.add(fanLight3);
scene.add(fanLight4);
scene.add(fanLight5);
// add point light for text on wall
const pointLight1 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight2 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight3 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight4 = new THREE.PointLight(0xff0000, 0, 1.1);
pointLight1.position.set(-0.2, 0.6, 0.24);
pointLight2.position.set(-0.2, 0.6, 0.42);
pointLight3.position.set(-0.2, 0.6, 0.01);
pointLight4.position.set(-0.2, 0.6, -0.14);
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);
scene.add(pointLight4);

// SETUP HELPERS
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// const gridHelper = new THREE.GridHelper(30, 30);
// scene.add(gridHelper);
// const shadowCameraHelper = new THREE.CameraHelper(roomLight.shadow.camera);
// scene.add(shadowCameraHelper);
// const pointLightHelper = new THREE.PointLightHelper(fanLight3, 0.03);
// scene.add(pointLightHelper);

// ADD GUI
// const gui = new dat.GUI();
// const options = {
//   lightX: 0,
//   lightY: 0.08,
//   lightZ: 0,
// };
// gui.add(options, 'lightX').onChange((e) => {
//   mobileLight.position.setX(e);
// });
// gui.add(options, 'lightY').onChange((e) => {
//   mobileLight.position.setY(e);
// });
// gui.add(options, 'lightZ').onChange((e) => {
//   mobileLight.position.setZ(e);
// });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
  // stats.update();
}

function loadIntroText() {
  const loader = new FontLoader();
  loader.load('fonts/unione.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const titleGeo = new TextGeometry('HAPPY BIRTHDAY DANU', {
      font: font,
      size: 0.06,
      height: 0.01,
    });
    titleText = new THREE.Mesh(titleGeo, textMaterials);
    titleText.rotation.y = Math.PI * 0.5;
    titleText.position.set(-0.27, 0.55, 0.5);
    scene.add(titleText);
  });

  loader.load('fonts/helvatica.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const subTitleGeo = new TextGeometry(
      'Wishing You Joy, Laughter & Amazing Adventures!',
      {
        font: font,
        size: 0.016,
        height: 0,
      }
    );
    subtitleText = new THREE.Mesh(subTitleGeo, textMaterials);
    subtitleText.rotation.y = Math.PI * 0.5;
    subtitleText.position.set(-0.255, 0.5, 0.5);
    scene.add(subtitleText);
  });
}

function switchTheme(themeType) {
  if (themeType === 'dark') {
    lightSwitch.rotation.z = Math.PI / 7;
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');

    // main lights
    gsap.to(roomLight.color, {
      r: 0.27254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(ambientLight.color, {
      r: 0.17254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(roomLight, {
      intensity: 1.5,
    });
    gsap.to(ambientLight, {
      intensity: 0.3,
    });

    // fan lights
    gsap.to(fanLight5, {
      distance: 0.07,
    });

    // text color
    gsap.to(titleText.material[0].color, {
      r: 8,
      g: 8,
      b: 8,
      duration: 0,
    });
    gsap.to(titleText.material[1].color, {
      r: 5,
      g: 5,
      b: 5,
      duration: 0,
    });
    gsap.to(subtitleText.material[0].color, {
      r: 8,
      g: 8,
      b: 8,
      duration: 0,
    });
    gsap.to(subtitleText.material[1].color, {
      r: 5,
      g: 5,
      b: 5,
      duration: 0,
    });

    // text light
    gsap.to(pointLight1, {
      intensity: 0.6,
    });
    gsap.to(pointLight2, {
      intensity: 0.6,
    });
    gsap.to(pointLight3, {
      intensity: 0.6,
    });
    gsap.to(pointLight4, {
      intensity: 0.6,
    });
  } else {
    lightSwitch.rotation.z = 0;
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    // main light
    gsap.to(roomLight.color, {
      r: 1,
      g: 1,
      b: 1,
    });
    gsap.to(ambientLight.color, {
      r: 1,
      g: 1,
      b: 1,
    });
    gsap.to(roomLight, {
      intensity: 2.5,
    });
    gsap.to(ambientLight, {
      intensity: 0.6,
    });

    // fan light
    gsap.to(fanLight5, {
      distance: 0.05,
    });

    // text color
    gsap.to(titleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(titleText.material[1].color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0,
    });
    gsap.to(subtitleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(subtitleText.material[1].color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0,
    });

    // text light
    gsap.to(pointLight1, {
      intensity: 0,
    });
    gsap.to(pointLight2, {
      intensity: 0,
    });
    gsap.to(pointLight3, {
      intensity: 0,
    });
    gsap.to(pointLight4, {
      intensity: 0,
    });
  }
}

function enableOrbitControls() {
  controls.enabled = true;
}

function disableOrbitControls() {
  controls.enabled = false;
}

function enableCloseBtn() {
  document.getElementById('close-btn').style.display = 'block';
}

function disableCloseBtn() {
  document.getElementById('close-btn').style.display = 'none';
}

function loadBirthdayIframe() {
  // Create iframe if it doesn't exist
  let birthdayIframe = document.getElementById('birthday-iframe');
  if (!birthdayIframe) {
    birthdayIframe = document.createElement('iframe');
    birthdayIframe.id = 'birthday-iframe';
    birthdayIframe.src = './birthday.html'; // Use relative path
    birthdayIframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 10000;
      background: white;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    `;
    
    // Add loading event handler
    birthdayIframe.onload = function() {
      console.log('Birthday iframe loaded successfully!');
    };
    
    birthdayIframe.onerror = function() {
      console.error('Failed to load birthday iframe');
      // Fallback: redirect to birthday page
      window.open('./birthday.html', '_blank');
    };
    
    // Add close button for iframe with better styling
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: fixed;
      top: 25px;
      right: 25px;
      width: 60px;
      height: 60px;
      border: 3px solid white;
      background: rgba(255, 107, 53, 0.9);
      color: white;
      font-size: 35px;
      font-weight: bold;
      cursor: pointer;
      border-radius: 50%;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
    `;
    
    closeBtn.addEventListener('click', () => {
      birthdayIframe.style.opacity = '0';
      setTimeout(() => {
        birthdayIframe.style.display = 'none';
        closeBtn.style.display = 'none';
      }, 500);
    });
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 107, 53, 1)';
      closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
      closeBtn.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 107, 53, 0.9)';
      closeBtn.style.transform = 'scale(1) rotate(0deg)';
      closeBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });
    
    document.body.appendChild(birthdayIframe);
    document.body.appendChild(closeBtn);
  }
  
  // Show the iframe with fade in effect
  birthdayIframe.style.display = 'block';
  const closeBtn = birthdayIframe.nextElementSibling;
  if (closeBtn) closeBtn.style.display = 'flex';
  
  setTimeout(() => {
    birthdayIframe.style.opacity = '1';
  }, 50);
}

function resetBookCover() {
  if (!bookCover) return;

  gsap.to(bookCover.rotation, {
    x: 0,
    duration: 1.5,
  });
}

function resetProjects() {
  // Reset birthday card and button if they exist
  if (window.birthdayCard) {
    gsap.to(window.birthdayCard.material, {
      opacity: 0,
      duration: 1,
    });
    gsap.to(window.birthdayCard.position, {
      y: window.birthdayCard.position.y - 0.05,
      duration: 1,
    });
    gsap.to(window.birthdayCard.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0,
      delay: 1,
    });
  }
  
  if (window.birthdayButton) {
    gsap.to(window.birthdayButton.material, {
      opacity: 0,
      duration: 1,
    });
    gsap.to(window.birthdayButton.position, {
      y: 0.15, // Reset to original position outside the card
      duration: 1,
    });
    gsap.to(window.birthdayButton.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0,
      delay: 1,
    });
  }
  
  // Hide birthday iframe if it exists
  const birthdayIframe = document.getElementById('birthday-iframe');
  if (birthdayIframe) {
    birthdayIframe.style.display = 'none';
  }
}

function resetCamera() {
  resetBookCover();
  resetProjects();
  disableCloseBtn();
  gsap.to(camera.position, {
    ...defaultCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...defaultCamerRot,
    duration: 1.5,
  });
  gsap.delayedCall(1.5, enableOrbitControls);

  // reset dimmed light for about display
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 2.5,
      duration: 1.5,
    });
  }
}

function cameraToAbout() {
  if (!bookCover) return;

  gsap.to(camera.position, {
    ...aboutCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...aboutCameraRot,
    duration: 1.5,
  });
  gsap.to(bookCover.rotation, {
    x: Math.PI,
    duration: 1.5,
    delay: 1.5,
  });

  // prevent about text clutter due to bright light
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 1,
      duration: 1.5,
    });
  }
}

function aboutMenuListener() {
  document.getElementById('about-menu').addEventListener('click', function (e) {
    e.preventDefault();
    disableOrbitControls();
    resetProjects();
    cameraToAbout();
    gsap.delayedCall(1.5, enableCloseBtn);
  });
}

function projectsMenuListener() {
  // Create a big birthday card instead of multiple project cards
  const birthdayCardGeometry = new THREE.PlaneGeometry(1.2, 0.8);
  
  // Create canvas for custom birthday card texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 342;
  const ctx = canvas.getContext('2d');
  
  // Draw birthday card background
  const gradient = ctx.createLinearGradient(0, 0, 512, 342);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.5, '#ff8e8e');
  gradient.addColorStop(1, '#ffa8a8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 342);
  
  // Add decorative border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 472, 302);
  
  // Add main text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Happy Birthday', 256, 130);
  
  ctx.font = 'bold 36px Arial';
  ctx.fillText('Dear', 256, 180);
  
  // Add click instruction
  ctx.font = '20px Arial';
  ctx.fillStyle = '#ffe6e6';
  ctx.fillText('Click the button below to celebrate!', 256, 250);
  
  // Create texture from canvas
  const birthdayTexture = new THREE.CanvasTexture(canvas);
  
  const birthdayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: birthdayTexture,
    transparent: true,
    opacity: 0.0,
  });
  
  const birthdayCard = new THREE.Mesh(birthdayCardGeometry, birthdayMaterial);
  birthdayCard.name = 'birthdayCard';
  birthdayCard.position.set(0.5, 0.7, -1.15);
  birthdayCard.scale.set(0, 0, 0);
  
  // Store the birthday card reference
  window.birthdayCard = birthdayCard;
  scene.add(birthdayCard);
  
  // Create birthday button
  const buttonGeometry = new THREE.PlaneGeometry(0.5, 0.18);
  
  // Create button canvas with improved design
  const buttonCanvas = document.createElement('canvas');
  buttonCanvas.width = 400;
  buttonCanvas.height = 144;
  const buttonCtx = buttonCanvas.getContext('2d');
  
  // Draw button background with better gradient and shadow
  const buttonGradient = buttonCtx.createLinearGradient(0, 0, 400, 144);
  buttonGradient.addColorStop(0, '#ff6b35');
  buttonGradient.addColorStop(0.5, '#f7931e');
  buttonGradient.addColorStop(1, '#ff6b35');
  buttonCtx.fillStyle = buttonGradient;
  
  // Add shadow effect
  buttonCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  buttonCtx.shadowBlur = 10;
  buttonCtx.shadowOffsetX = 3;
  buttonCtx.shadowOffsetY = 3;
  
  // Draw rounded rectangle
  buttonCtx.beginPath();
  buttonCtx.roundRect(10, 10, 380, 124, 20);
  buttonCtx.fill();
  
  // Reset shadow for text
  buttonCtx.shadowColor = 'transparent';
  buttonCtx.shadowBlur = 0;
  buttonCtx.shadowOffsetX = 0;
  buttonCtx.shadowOffsetY = 0;
  
  // Add border
  buttonCtx.strokeStyle = '#ffffff';
  buttonCtx.lineWidth = 3;
  buttonCtx.beginPath();
  buttonCtx.roundRect(10, 10, 380, 124, 20);
  buttonCtx.stroke();
  
  // Add main button text with better styling
  buttonCtx.fillStyle = '#ffffff';
  buttonCtx.font = 'bold 28px Arial';
  buttonCtx.textAlign = 'center';
  buttonCtx.textBaseline = 'middle';
  
  // Add text shadow
  buttonCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  buttonCtx.shadowBlur = 4;
  buttonCtx.shadowOffsetX = 2;
  buttonCtx.shadowOffsetY = 2;
  
  buttonCtx.fillText('🎉 CELEBRATE! 🎉', 200, 72);
  
  // Add smaller subtitle
  buttonCtx.font = 'bold 16px Arial';
  buttonCtx.fillText('Click for Birthday Fun!', 200, 100);
  
  const buttonTexture = new THREE.CanvasTexture(buttonCanvas);
  const buttonMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: buttonTexture,
    transparent: true,
    opacity: 0.0,
  });
  
  const birthdayButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
  birthdayButton.name = 'birthdayButton';
  birthdayButton.userData = {
    action: 'loadBirthday'
  };
  birthdayButton.position.set(0.5, 0.15, -1.14); // Moved further down, outside the card
  birthdayButton.scale.set(0, 0, 0);
  
  // Store the birthday button reference
  window.birthdayButton = birthdayButton;
  scene.add(birthdayButton);
  
  // Add button hover animation
  let buttonHovered = false;
  window.addEventListener('mousemove', (event) => {
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    
    const intersects = raycaster.intersectObjects([birthdayButton]);
    
    if (intersects.length > 0 && !buttonHovered) {
      buttonHovered = true;
      // Scale up on hover
      gsap.to(birthdayButton.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      // Add glow effect
      gsap.to(birthdayButton.material, {
        opacity: 1.2,
        duration: 0.3
      });
      document.body.style.cursor = 'pointer';
    } else if (intersects.length === 0 && buttonHovered) {
      buttonHovered = false;
      // Scale back to normal
      gsap.to(birthdayButton.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      gsap.to(birthdayButton.material, {
        opacity: 1,
        duration: 0.3
      });
      document.body.style.cursor = 'default';
    }
  });

  document
    .getElementById('projects-menu')
    .addEventListener('click', function (e) {
      e.preventDefault();
      disableOrbitControls();
      resetBookCover();
      gsap.to(camera.position, {
        ...projectsCameraPos,
        duration: 1.5,
      });
      gsap.to(camera.rotation, {
        ...projectsCameraRot,
        duration: 1.5,
      });
      gsap.delayedCall(1.5, enableCloseBtn);

      // Animate and show birthday card and button
      birthdayCard.scale.set(1, 1, 1);
      birthdayButton.scale.set(1, 1, 1);
      
      gsap.to(birthdayCard.material, {
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
      });
      
      gsap.to(birthdayButton.material, {
        opacity: 1,
        duration: 1.5,
        delay: 2.0,
      });
      
      gsap.to(birthdayCard.position, {
        y: birthdayCard.position.y + 0.05,
        duration: 1,
        delay: 1.5,
      });
      
      gsap.to(birthdayButton.position, {
        y: birthdayButton.position.y + 0.05,
        duration: 1,
        delay: 2.0,
      });
      
      // Add pulsing animation to the button
      gsap.delayedCall(2.5, () => {
        gsap.to(birthdayButton.scale, {
          x: 1.05,
          y: 1.05,
          z: 1.05,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });
      });
    });
}

function init3DWorldClickListeners() {
  const mousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let intersects;

  window.addEventListener('click', function (e) {
    // store value set to prevent multi time update in foreach loop
    const newTheme = theme === 'light' ? 'dark' : 'light';

    // prevent about focus on button click which are positioned above book in mobile view
    const closeBtn = document.getElementById('close-btn');
    const projectsBtn = document.getElementById('projects-menu');
    if (
      e.target === closeBtn ||
      closeBtn.contains(e.target) ||
      e.target === projectsBtn ||
      projectsBtn.contains(e.target)
    ) {
      return false;
    }

    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach((intersect) => {
      if (intersect.object.name === 'project') {
        intersect.object.userData.url &&
          window.open(intersect.object.userData.url);
      }
      
      if (intersect.object.name === 'birthdayButton') {
        console.log('Birthday button clicked!'); // Debug log
        
        // Add click animation feedback
        gsap.to(intersect.object.scale, {
          x: 0.9,
          y: 0.9,
          z: 0.9,
          duration: 0.1,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(intersect.object.scale, {
              x: 1.1,
              y: 1.1,
              z: 1.1,
              duration: 0.2,
              ease: "back.out(1.7)"
            });
          }
        });
        
        // Try to load birthday iframe, with fallback
        try {
          loadBirthdayIframe();
          console.log('Iframe loading initiated');
        } catch (error) {
          console.error('Iframe loading failed:', error);
          // Fallback: open in new tab
          window.open('./birthday.html', '_blank');
        }
      }

      if (
        intersect.object.name === 'Book' ||
        intersect.object.name === 'Book001'
      ) {
        disableOrbitControls();
        cameraToAbout();
        gsap.delayedCall(1.5, enableCloseBtn);
      }

      if (
        intersect.object.name === 'SwitchBoard' ||
        intersect.object.name === 'Switch'
      ) {
        theme = newTheme;
        switchTheme(theme);
      }
    });
  });
}

// RESPONSIVE
function initResponsive(roomScene) {
  if (isMobile) {
    roomScene.scale.set(0.95, 0.95, 0.95);
    aboutCameraPos = {
      x: 0.09,
      y: 0.23,
      z: 0.51,
    };
    aboutCameraRot = {
      x: -1.57,
      y: 0,
      z: 1.57,
    };

    // rect light
    // rectLight.width = 0.406;
    // rectLight.height = 0.3;
    // rectLight.position.z = -0.34;

    // project
    projectsCameraPos = {
      x: 1.1,
      y: 0.82,
      z: 0.5,
    };
    projectsCameraRot = {
      x: 0,
      y: 0,
      z: 1.55,
    };
    projects.forEach((project, i) => {
      project.mesh.position.z = -1.13;
    });

    controls.maxDistance = 1.5;
    controls.maxAzimuthAngle = Math.PI * 0.75;
  }
}

// close button
document.getElementById('close-btn').addEventListener('click', (e) => {
  e.preventDefault();
  resetCamera();
});

// contact menu
document.getElementById('contact-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document
    .querySelector('.contact-menu__dropdown')
    .classList.toggle('contact-menu__dropdown--open');
});

document.addEventListener('mouseup', (e) => {
  const container = document.querySelector('.contact-menu');
  if (!container.contains(e.target)) {
    container
      .querySelector('.contact-menu__dropdown')
      .classList.remove('contact-menu__dropdown--open');
  }
});

// update camera, renderer on resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

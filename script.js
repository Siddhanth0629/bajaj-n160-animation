console.clear();

// import * as THREE from  "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.157.0/three.module.js";
import { gsap } from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
// import {ScrollTrigger} from "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
// import threeGltfLoader from 'https://cdn.skypack.dev/three-gltf-loader';
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';



gsap.registerPlugin(ScrollTrigger);

// --- CONSTS
// console.log(ScrollTrigger);
const COLORS = {
	background: 'white',
	light: '#ffffff',
	sky: '#aaaaff',
	ground: '#88ff88'
}

const PI = Math.PI;

// --- SCENE

let size = { width: 0, height: 0 }

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.background);
scene.fog = new THREE.Fog(COLORS.background, 15, 20);

// --- RENDERER

const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector('.canvas-container');
container.appendChild( renderer.domElement );

// --- CAMERA

const camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 100);
camera.position.set(0, 2, 4);
let cameraTarget = new THREE.Vector3(0, 1, 0);

scene.add(camera);

// --- LIGHTS

const directionalLight = new THREE.DirectionalLight(COLORS.light, 2);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2, 5, 3);

scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight( COLORS.sky, COLORS.ground, 0.5 );
scene.add(hemisphereLight)

// --- FLOOR

const plane = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ground })
const floor = new THREE.Mesh(plane, floorMaterial);
floor.receiveShadow = true;
floor.rotateX(-Math.PI * 0.5)

scene.add(floor);

// let model;
// // GLTF Loader
// const gltfLoader = new THREE.GLTFLoader();
// gltfLoader.load("assets/witch.gltf", (gltf) => {
//   // Add the loaded model to the scene here if needed
//   const model = gltf.scene;
//   model.rotation.x = 0.6;
//   model.rotation.y = 0.6;
//   model.scale.set(0.4, 0.4, 0.4);
//   scene.add(model);
// });


const models = {};

const toLoad = [
    // {name:"witch",file:"assets/witch.gltf",group:new THREE.Group()},
    // {name:"bear",file:"assets/bear.gltf",group:new THREE.Group()}
    {name:"bike",file:"assets/bajaj.glb",group:new THREE.Group()}
];

function setupAnimation(){
    console.log('setup');
    // models.witch.position.x = 5
    // models.bear.position.x = -5
    models.bike.position.x = -5
    models.bike.rotation.set(0, Math.PI / 2, 0);
    models.bike.scale.set(2,2,2)
    ScrollTrigger.matchMedia({"(prefers-reduced-motion:no-preference)":desktopAnimation})
}

function desktopAnimation(){
    let section = 0;
    // const tl = gsap.timeline({
    //     default:{
    //         duration:1,
    //         ease:"power2.inOut"
    //     },
    //     ScrollTrigger:{
    //         trigger:".page",
    //         start:"top top",
    //         end:"bottom bottom",
    //         scrub:0.1,
    //     }
    // });
    // console.log("Witch",models.witch);
    // tl.to(models.witch.position,{x:1},section)
    // tl.to(models.bear.position,{x:-0.5},section)


    const tl = gsap.timeline({
        // Other timeline options
    });
    
    // tl.to(models.witch.position, { x: 1, scrub: true }, section);
    // tl.to(models.bear.position, { x: -0.5, scrub: true }, section);
    tl.to(models.bike.position, { x: 7, scrub: true }, section);

    
    ScrollTrigger.create({
        animation: tl,
        trigger: ".page",
        start: "top top",
        end: "bottom bottom",
        markers:true,
        // scrub:0.3
        scrub:true
    });
}

//Loading Model
const loadingManager = new THREE.LoadingManager(()=>{
    console.log('manager');
    setupAnimation();
});


const gltfLoader = new THREE.GLTFLoader(loadingManager);
toLoad.forEach(item=>{
    gltfLoader.load(item.file,(model)=>{
        console.log("model",model)
        // model.rotateX = 10
        // model.rotateY = 20
        model.scene.traverse(child=>{
            if(child instanceof THREE.Mesh){
                child.receiveShadow = true
                child.castShadow = true
            }
        })
        item.group.add(model.scene)
        scene.add(item.group);
        models[item.name] = item.group
    })
});


// --- ON RESIZE

const onResize = () => {
	size.width = container.clientWidth;
	size.height = container.clientHeight;

	camera.aspect = size.width / size.height
	camera.updateProjectionMatrix()

	renderer.setSize(size.width, size.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))	
}

window.addEventListener('resize', onResize)
onResize();

// --- TICK

const tick = () => {
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => tick())
}

tick();


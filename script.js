import * as THREE from 'three';
import { ParametricGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/geometries/ParametricGeometry.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let R = 1;
let t = 0;
let pauseAtT1 = false;
const segmentsU = 64; // number of segments in the "u" direction
const segmentsV = 256; // number of segments in the "v" direction

const canvas = document.getElementById('mainCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(7,4,0.3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1;  // Cannot zoom in closer than this
controls.maxDistance = 12;  // Cannot zoom out farther than this


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const sun = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sun);
// Dim ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Color, Intensity
scene.add(ambientLight);

// parametric functions
function ellipsoid(u,v,target){
  const theta = (0.5-u)* Math.PI*2 ;
  const morph = Math.max(0.0001,1-t);
  const zz = R*Math.cos(v*Math.PI)/Math.sqrt(morph);
  const radial = Math.sqrt(Math.max(0, R ** 2 - morph*zz ** 2)); // avoid NaN
  const minRadial = 1e-7;
  const r = Math.max(radial, minRadial); // avoid 0-radius degenerate ring
  target.set(
    r* Math.cos(theta),
    r* Math.sin(theta),
    zz
  );
}

function hyperboloid(u,v,target){
  const theta = (0.5-u)* Math.PI*2 ;
  const morph = Math.min(t-1,1);
  const zz = 12*R*Math.cos(v*Math.PI);
  const radial = Math.sqrt(Math.max(0, R ** 2 + morph*zz ** 2)); // avoid NaN
  const minRadial = 1e-7;
  const r = Math.max(radial, minRadial); // avoid 0-radius degenerate ring
  target.set(
    r* Math.cos(theta),
    r* Math.sin(theta),
    zz
  );
}

function towardCone(u,v,target){
  const theta = (0.5-u)* Math.PI*2 ;
  const morph = Math.max(3-t,0);
  const zz = 12*R*Math.cos(v*Math.PI);
  const radial = Math.sqrt(Math.max(0, (morph*R) ** 2 + zz ** 2)); // avoid NaN
  const minRadial = 1e-7;
  const r = Math.max(radial, minRadial); // avoid 0-radius degenerate ring
  target.set(
    r* Math.cos(theta),
    r* Math.sin(theta),
    zz
  );
}

function twoBlade1(u,v,target){
  const theta = (0.5-u)* Math.PI*2;
  const morph = Math.min(t-3,1);
  const zz = -morph * R - 12 * R * Math.cos(v/2 * Math.PI);
  const r = Math.sqrt(Math.max(1e-7, zz**2 -(morph*R) ** 2)); 
  // const zz = -morph * R * Math.cosh(Math.acosh(12*R**2/morph)*v);  // v ≥ 0
  // const r = morph * R * Math.sinh(Math.acosh(12*R**2/morph)*v);
  target.set(
    r* Math.cos(theta),
    r* Math.sin(theta),
    zz
  );
}

function twoBlade2(u,v,target){
  const theta = (0.5-u)* Math.PI*2;
  const morph = Math.min(t-3,1);
  const zz = morph * R + 12 * R * Math.cos(v/2 * Math.PI);
  const r = Math.sqrt(Math.max(1e-7, zz**2 -(morph*R) ** 2)); 
  // const zz = -morph * R * Math.cosh(Math.acosh(12*R**2/morph)*v);  // v ≥ 0
  // const r = morph * R * Math.sinh(Math.acosh(12*R**2/morph)*v);
  target.set(
    r* Math.cos(theta),
    r* Math.sin(theta),
    zz
  );
}

function towardSurface1(u,v,target){
  const theta = (0.5-u)* Math.PI*2;
  const morph = Math.max(5-t,0.01);
  const zz = - R - 12 * R * Math.cos(v/2 * Math.PI);
  const r = Math.sqrt(Math.max(1e-7, zz**2 - R** 2)); 
  // const zz = -morph * R * Math.cosh(Math.acosh(12*R**2/morph)*v);  // v ≥ 0
  // const r = morph * R * Math.sinh(Math.acosh(12*R**2/morph)*v);
  target.set(
    r* Math.cos(theta)/morph,
    r* Math.sin(theta)/morph,
    zz
  );
}

function towardSurface2(u,v,target){
  const theta = (0.5-u)* Math.PI*2;
  const morph = Math.max(5-t,0.01);
  const zz =  R + 12 * R * Math.cos(v/2 * Math.PI);
  const r = Math.sqrt(Math.max(1e-7, zz**2 - R** 2)); 
  // const zz = -morph * R * Math.cosh(Math.acosh(12*R**2/morph)*v);  // v ≥ 0
  // const r = morph * R * Math.sinh(Math.acosh(12*R**2/morph)*v);
  target.set(
    r* Math.cos(theta)/morph,
    r* Math.sin(theta)/morph,
    zz
  );
}


// function towardSurfaces(u,v,target){
//   const theta = (0.5-u)* Math.PI*2 ;
//   const morph = Math.max(5 - t,0.00001);
//   const zz = R + 12 * R * Math.cos(v * Math.PI);
//   const r = Math.sqrt(Math.max(1e-7, zz**2 -(R) ** 2)); 
//   target.set(
//     r* Math.cos(theta)/morph,
//     r* Math.sin(theta)/morph,
//     zz
//   );
// }

function towardSphere(u,v,target){
  const theta = (0.5-u)* Math.PI*2 ;
  const morph = Math.min(t-5,1);
  const zz = R * Math.cos(v * Math.PI);
  const r = Math.sqrt(Math.max(1e-7, (-1)*zz**2 +(R) ** 2)); 
  target.set(
    r* Math.cos(theta)/morph,
    r* Math.sin(theta)/morph,
    zz
  );
}



// Define your parametric geometry
const globeGeometry = new ParametricGeometry(ellipsoid, segmentsU, segmentsV);

// Create the material (without texture initially)
const material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide // optional
});
const material2 = new THREE.MeshPhongMaterial({      //flipped earth
  side: THREE.DoubleSide // optional
});
const material3 = new THREE.MeshPhongMaterial({      //upper blade hyperboloid
  side: THREE.DoubleSide // optional
});
const material4 = new THREE.MeshPhongMaterial({      //lower blade hyperboloid
  side: THREE.DoubleSide // optional
});
// Create the mesh from geometry and material
const globeMesh = new THREE.Mesh(globeGeometry, material);
const globeMesh2 = new THREE.Mesh(globeGeometry, material2);  //extra Mesh for the flipped earth
const bladeMesh1 = new THREE.Mesh(globeGeometry, material3);  //extra Mesh for the upper sheet
const bladeMesh2 = new THREE.Mesh(globeGeometry, material4);  //extra Mesh for the lower sheet



// Load texture and apply it to the material
const loader = new THREE.TextureLoader();
loader.load(
  'earth_MR.jpg',
  (texture) => {
    material.map = texture;         // assign texture to material (not geometry)
    material.needsUpdate = true;
    console.log('✅ Earth texture loaded');
  },
  undefined,
  (err) => {
    console.error('❌ Failed to load texture:', err);
  }
);

const loader2 = new THREE.TextureLoader();
loader2.load(
  'earth_flip.png',
  (texture) => {
    material2.map = texture;         // assign texture to material (not geometry)
    material2.needsUpdate = true;
    console.log('✅ Earth texture loaded');
  },
  undefined,
  (err) => {
    console.error('❌ Failed to load texture:', err);
  }
);
const loader3 = new THREE.TextureLoader();
loader3.load(
  'earth_upper.png',
  (texture) => {
    material3.map = texture;         // assign texture to material (not geometry)
    material3.needsUpdate = true;
    console.log('✅ Earth texture loaded');
  },
  undefined,
  (err) => {
    console.error('❌ Failed to load texture:', err);
  }
);
const loader4 = new THREE.TextureLoader();
loader4.load(
  'earth_lower.png',
  (texture) => {
    material4.map = texture;         // assign texture to material (not geometry)
    material4.needsUpdate = true;
    console.log('✅ Earth texture loaded');
  },
  undefined,
  (err) => {
    console.error('❌ Failed to load texture:', err);
  }
);

scene.add(globeMesh);
globeMesh.rotation.x = Math.PI / 2; // to change y-axis into z-axis
scene.add(globeMesh2);
globeMesh2.rotation.x = Math.PI / 2; // to change y-axis into z-axis
globeMesh2.geometry.dispose();
globeMesh2.visible = false;
scene.add(bladeMesh1);
bladeMesh1.rotation.x = Math.PI / 2; // to change y-axis into z-axis
bladeMesh1.geometry.dispose();
bladeMesh1.visible = false;
scene.add(bladeMesh2);
bladeMesh2.rotation.x = Math.PI / 2; // to change y-axis into z-axis
bladeMesh2.geometry.dispose();
bladeMesh2.visible = false;

function updateGeometry(time){
  if (time < 1){
    const newGeometry = new ParametricGeometry(ellipsoid, segmentsU, segmentsV);
    globeMesh.geometry.dispose();
    globeMesh2.geometry.dispose();             // dispose old geometry
    globeMesh.visible = true;
    globeMesh2.visible = false;
    bladeMesh1.visible = false;
    bladeMesh2.visible = false;
    globeMesh.geometry = newGeometry;         // assign new geometry
  }
  if (time >= 1 && time <=2){
    const newGeometry = new ParametricGeometry(hyperboloid, segmentsU, segmentsV);
    globeMesh.geometry.dispose();  
    globeMesh2.geometry.dispose();           // dispose old geometry
    bladeMesh1.geometry.dispose();
    bladeMesh2.geometry.dispose();
    globeMesh.visible = true;
    globeMesh2.visible = false;
    bladeMesh1.visible = false;
    bladeMesh2.visible = false;
    globeMesh.geometry = newGeometry;         // assign new geometry
  }
  if (time > 2 && time <=3){
    const newGeometry = new ParametricGeometry(towardCone, segmentsU, segmentsV);
    globeMesh.geometry.dispose();    
    globeMesh2.geometry.dispose();         // dispose old geometry
    bladeMesh1.geometry.dispose();
    bladeMesh2.geometry.dispose();
    globeMesh.visible = true;
    globeMesh2.visible = false;
    bladeMesh1.visible = false;
    bladeMesh2.visible = false;
    globeMesh.geometry = newGeometry;         // assign new geometry
  }
  if (time > 3 && time <=4){
    const newGeometry1 = new ParametricGeometry(twoBlade1, segmentsU, segmentsV);
    const newGeometry2 = new ParametricGeometry(twoBlade2, segmentsU, segmentsV);
    globeMesh.geometry.dispose();             // dispose old geometry
    globeMesh2.geometry.dispose(); 
    bladeMesh1.geometry.dispose();
    bladeMesh2.geometry.dispose();
    bladeMesh1.geometry = newGeometry1;         // assign new geometry
    bladeMesh2.geometry = newGeometry2;
    globeMesh.visible = false;
    globeMesh2.visible = false;
    bladeMesh1.visible=true;  
    bladeMesh2.visible=true;             
           
   
  }
  if (time > 4 && time <=5){
    const newGeometry1 = new ParametricGeometry(towardSurface1, segmentsU, segmentsV);
    const newGeometry2 = new ParametricGeometry(towardSurface2, segmentsU, segmentsV);
    globeMesh.geometry.dispose();             // dispose old geometry
    globeMesh2.geometry.dispose();
    bladeMesh1.geometry.dispose();
    bladeMesh2.geometry.dispose();
    bladeMesh1.geometry = newGeometry1;         // assign new geometry
    bladeMesh2.geometry = newGeometry2;
    globeMesh.visible = false;
    globeMesh2.visible = false;
    bladeMesh1.visible=true;  
    bladeMesh2.visible=true;   
  }
   if (time > 5){
    const newGeometry = new ParametricGeometry(towardSphere, segmentsU, segmentsV);
    globeMesh.geometry.dispose();    
    globeMesh2.geometry.dispose();         // dispose old geometry
    bladeMesh1.geometry.dispose();
    bladeMesh2.geometry.dispose();
    globeMesh.visible = false;
    bladeMesh1.visible=false;  
    bladeMesh2.visible=false;
    globeMesh2.geometry = newGeometry;         // assign new geometry
    globeMesh2.visible = true;
  }
  
}

// Animation state

let playing = false;

const latexDiv = document.getElementById('latexDisplay');

function updateLatex() {
  let latex = '';
  if(t==0){
    latex = `$ \\text{Bol}$ <br>
    <br> $x^2 + y^2 + z^2 = R^2$`
  }
  if(t>0 && t < 0.99){
    latex = `$ \\text{Ellipsoïde}$ <br>
    <br> $x^2 + y^2 + ${(Math.round(100*(1-t))/100).toFixed(2)} z^2 = R^2$`
  }
  if(Math.abs(t-1) < 0.001){
    latex = `$ \\text{Cilinder}$ <br>
    <br> $x^2 + y^2 \\cancel{+ 0.00z^2} = R^2$`
  }
  if(t>1.01 && t < 1.99){
    latex = `$ \\text{Hyperboloïde}$ <br>
    <br> $x^2 + y^2 - ${Math.abs((Math.round(100*(1-t))/100)).toFixed(2)} z^2 = R^2$`
  }
  if(Math.abs(t-2) <= 0.001){
    latex = `$ \\text{Hyperboloïde}$ <br>
    <br> $x^2 + y^2 - z^2 = R^2$`
  }
  if(t>2.01 && t < 2.99){
    latex = `$ \\text{Hyperboloïde}$ <br>
    <br> $x^2 + y^2 -  z^2 = ${Math.abs((Math.round(100*(3-t))/100)).toFixed(2)} R^2$`
  }
  if(Math.abs(t-3) <= 0.001){
    latex = `$ \\text{Kegel}$ <br>
    <br> $x^2 + y^2 - z^2 = 0$`
  }
  if(t>3.01 && t < 3.99){
    latex = `$ \\text{Tweebladige Hyperboloïde}$ <br>
    <br> $x^2 + y^2 -  z^2 = -${Math.abs((Math.round(100*(t-3))/100)).toFixed(2)} R^2$`
  }
  if(Math.abs(t-4) <= 0.001){
    latex = `$ \\text{Tweebladige Hyperboloïde}$ <br>
    <br> $x^2 + y^2 - z^2 = -R^2$`
  }
  if(t>4.01 && t < 4.99){
    latex = `$ \\text{Tweebladige Hyperboloïde}$ <br>
    <br> $ ${Math.abs((Math.round(100*(5-t))/100)).toFixed(2)}x^2 + ${Math.abs((Math.round(100*(5-t))/100)).toFixed(2)}y^2 -  z^2 = - R^2$`
  }
  if(Math.abs(t-5) <= 0.001){
    latex = `$ \\text{Twee evenwijdige vlakken}$ <br>
    <br> $\\cancel{0.00x^2} \\cancel{ + 0.00y^2} - z^2 = -R^2$<br>
    <br>$(z = R \\:\\:\\text{en}\\:\\:z=-R)$`
  }
  if(t>5.01 && t < 5.99){
    latex = `$ \\text{Ellipsoïde}$ <br>
    <br> $ -${Math.abs((Math.round(100*(5-t))/100)).toFixed(2)}x^2 - ${Math.abs((Math.round(100*(5-t))/100)).toFixed(2)}y^2 -  z^2 = - R^2$`
  }
  if(Math.abs(t-6) <= 0.001){
    latex = `$ \\text{Bol}$ <br>
    <br> $-x^2 - y^2 - z^2 = -R^2$`
  }
  latexDiv.innerHTML = latex;

  MathJax.typesetPromise();
}

// Buttons

const playPauseLabel = document.querySelector('#playPauseBtn .label');
const resetLabel = document.querySelector('#resetBtn .label');
const stepForwardLabel = document.querySelector('#stepForwardBtn .label');
const stepBackLabel = document.querySelector('#stepBackBtn .label');

document.getElementById('playPauseBtn').onclick = () => {
  playing = !playing;
  playPauseLabel.textContent = playing ? '⏸️' : '▶️';  // Pause or Play emoji
};

document.getElementById('resetBtn').onclick = () => {
  t = 0;
  playing = false;
  playPauseLabel.textContent = '▶️';  // Pause or Play emoji

  updateGeometry(t);
  updateLatex();
};

document.getElementById('stepForwardBtn').onclick = () => {
  if(playing){playing = !playing}
  playPauseLabel.textContent = '▶️';  // Pause or Play emoji
  t = Math.round(10*t)/10;
  t = Math.min(6,t+0.1);
  updateGeometry(t);
  updateLatex();
};

document.getElementById('stepBackBtn').onclick = () => {
  if(playing){playing = !playing}
  playPauseLabel.textContent = '▶️';  // Pause or Play emoji
  t = Math.round(10*t)/10;
  t = Math.max(0,t-0.1);
  updateGeometry(t);
  updateLatex();
};

function animate() {

  //camera position two planes:
  
      // x
      // : 
      // 2.83867090594759
      // y
      // : 
      // 1.4151222009830569
      // z
      // : 
      // 7.3443431730814215
  requestAnimationFrame(animate);
  if (playing) {
    // Pause when t reaches 1
    if (!pauseAtT1 && (Math.abs(t - 1) < 0.001 || Math.abs(t - 2) < 0.001 || Math.abs(t - 3) < 0.001 || Math.abs(t - 4) < 0.001)  || Math.abs(t - 5) < 0.001)  {
      pauseAtT1 = true;
      setTimeout(() => {
        t+=0.002
        pauseAtT1 = false; // Resume after delay
      }, 2000); // 1000 ms = 1 second
      return; // Skip updating this frame
    }
    if (!pauseAtT1){
      t+=0.002;
      updateGeometry(t);
      updateLatex();
    }
    if(t>6){
      playing = false;
      playPauseLabel.textContent = playing ? '⏸️' : '▶️';  // Pause or Play emoji

    }
  }

  sun.position.copy(camera.position);
  console.log(camera.position);
  sun.target.position.set(-1, -1, 0); 
  sun.target.updateMatrixWorld();

  globeMesh.rotation.z = -3*t;
  bladeMesh1.rotation.z = -3*t;
  bladeMesh2.rotation.z = -3*t;
  controls.update();
  renderer.render(scene, camera);
}
updateLatex();
animate();

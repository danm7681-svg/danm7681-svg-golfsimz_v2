import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, line, ballMesh;
let markerObjects = [];

window.init3DTracer = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    scene = new THREE.Scene();

    // Sky gradient using scene background color + fog
    scene.background = new THREE.Color(0x87CEEB);  // Sky blue
    scene.fog = new THREE.Fog(0xc8e6ff, 200, 400); // Distant haze

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-15, 25, -10);
    camera.lookAt(0, 0, 80);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 80);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controls.update();

    // ---- LIGHTING ----
    // Sun
    const sun = new THREE.DirectionalLight(0xfff5e8, 3.0);
    sun.position.set(80, 60, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 300;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);

    // Ambient / sky bounce
    const ambient = new THREE.AmbientLight(0x8eb8ff, 0.6);
    scene.add(ambient);

    // Hemisphere (sky + ground color blend)
    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x3d6e1e, 0.5);
    scene.add(hemi);

    // ---- GROUND ----
    // Main ground (rough grass)
    const groundGeo = new THREE.PlaneGeometry(500, 400);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x3d7a2a,
        roughness: 0.9,
        metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, 150);
    ground.receiveShadow = true;
    scene.add(ground);

    // Fairway
    const fairwayGeo = new THREE.PlaneGeometry(30, 320);
    const fairwayMat = new THREE.MeshStandardMaterial({
        color: 0x5a9e4b,
        roughness: 0.6,
        metalness: 0.02,
    });
    const fairway = new THREE.Mesh(fairwayGeo, fairwayMat);
    fairway.rotation.x = -Math.PI / 2;
    fairway.position.set(0, 0, 150);
    fairway.receiveShadow = true;
    scene.add(fairway);

    // First cut (light rough)
    const firstCutGeo = new THREE.PlaneGeometry(12, 320);
    const firstCutMat = new THREE.MeshStandardMaterial({
        color: 0x4a8c3a,
        roughness: 0.75,
        metalness: 0.01,
    });
    const firstCutL = new THREE.Mesh(firstCutGeo, firstCutMat);
    firstCutL.rotation.x = -Math.PI / 2;
    firstCutL.position.set(-21, 0.005, 150);
    firstCutL.receiveShadow = true;
    scene.add(firstCutL);
    const firstCutR = new THREE.Mesh(firstCutGeo, firstCutMat);
    firstCutR.rotation.x = -Math.PI / 2;
    firstCutR.position.set(21, 0.005, 150);
    firstCutR.receiveShadow = true;
    scene.add(firstCutR);

    // Tee box
    const teeGeo = new THREE.PlaneGeometry(6, 8);
    const teeMat = new THREE.MeshStandardMaterial({ 
        color: 0xdddddd, 
        roughness: 0.4, 
        metalness: 0.05 
    });
    const teeBox = new THREE.Mesh(teeGeo, teeMat);
    teeBox.rotation.x = -Math.PI / 2;
    teeBox.position.set(0, 0.01, -2);
    teeBox.receiveShadow = true;
    scene.add(teeBox);

    // ---- DISTANCE MARKERS ----
    markerObjects = [];
    for (let d = 50; d <= 300; d += 50) {
        const z = d;
        // Left marker
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(-17, 2, z);
        pole.castShadow = true;
        scene.add(pole);
        markerObjects.push(pole);

        // Right marker
        const poleR = new THREE.Mesh(poleGeo, poleMat);
        poleR.position.set(17, 2, z);
        poleR.castShadow = true;
        scene.add(poleR);
        markerObjects.push(poleR);

        // Center stripe
        const stripeGeo = new THREE.PlaneGeometry(1, 0.3);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0, 0.015, z);
        scene.add(stripe);
        markerObjects.push(stripe);
    }

    // ---- TREES (Simple cones) ----
    function addTree(x, z) {
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 1.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);

        const canopyGeo = new THREE.ConeGeometry(2, 6, 8, 4);
        const canopyMat = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a1e, 
            roughness: 0.8,
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(x, 5, z);
        canopy.castShadow = true;
        canopy.receiveShadow = true;
        scene.add(canopy);
    }

    // Tree lines along both sides
    for (let z = -10; z < 330; z += 15) {
        addTree(-35, z);
        addTree(35, z);
    }

    // ---- BUNKER (Example at 180 yards) ----
    function addBunker(x, z) {
        const bunkerGeo = new THREE.CircleGeometry(4, 16);
        const bunkerMat = new THREE.MeshStandardMaterial({
            color: 0xf5e6c8,
            roughness: 0.9,
            metalness: 0.0,
        });
        const bunker = new THREE.Mesh(bunkerGeo, bunkerMat);
        bunker.rotation.x = -Math.PI / 2;
        bunker.position.set(x, 0.01, z);
        bunker.receiveShadow = true;
        scene.add(bunker);
    }
    addBunker(-8, 180);

    // ---- HANDLE RESIZE ----
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    console.log('3D Scene initialized');
};

window.update3DTracer = function(pointsJson) {
    if (!scene) return;
    if (line) { scene.remove(line); line = null; }
    if (ballMesh) { scene.remove(ballMesh); ballMesh = null; }

    try {
        const points = JSON.parse(pointsJson);
        if (!points || points.length === 0) return;

        const threePoints = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(threePoints);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xff6600,
            linewidth: 2,
        });
        line = new THREE.Line(geometry, material);
        scene.add(line);

        // Ball at landing point
        const last = threePoints[threePoints.length - 1];
        const ballGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const ballMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            roughness: 0.2,
            metalness: 0.05,
        });
        ballMesh = new THREE.Mesh(ballGeo, ballMat);
        ballMesh.position.copy(last);
        ballMesh.castShadow = true;
        scene.add(ballMesh);

        // Smooth camera to landing
        controls.target.lerp(last, 0.5);
        controls.update();
    } catch(e) {
        console.error('update3DTracer error:', e);
    }
};

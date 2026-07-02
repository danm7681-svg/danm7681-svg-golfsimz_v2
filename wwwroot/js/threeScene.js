import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, line, ballMesh;

window.init3DTracer = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, -20);
    camera.lookAt(0, 0, 80);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 80);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.update();

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);

    // Ground
    const grid = new THREE.GridHelper(300, 30, 0x2a5a1e, 0x1a3a14);
    grid.position.set(0, -0.01, 80);
    scene.add(grid);

    // Fairway
    const fairwayGeo = new THREE.PlaneGeometry(20, 280);
    const fairwayMat = new THREE.MeshStandardMaterial({ color: 0x3d7a2a, roughness: 0.7 });
    const fairway = new THREE.Mesh(fairwayGeo, fairwayMat);
    fairway.rotation.x = -Math.PI / 2;
    fairway.position.set(0, 0, 80);
    scene.add(fairway);

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
        const material = new THREE.LineBasicMaterial({ color: 0x00d4ff });
        line = new THREE.Line(geometry, material);
        scene.add(line);

        const last = threePoints[threePoints.length - 1];
        const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        ballMesh = new THREE.Mesh(sphereGeo, sphereMat);
        ballMesh.position.copy(last);
        scene.add(ballMesh);
    } catch(e) {
        console.error('update3DTracer error:', e);
    }
};

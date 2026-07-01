let scene, camera, renderer, controls, line, ballMesh;

window.init3DTracer = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    canvas.width = width;
    canvas.height = height;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, -20);
    camera.lookAt(0, 0, 80);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 80);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    // Ground grid
    const grid = new THREE.GridHelper(300, 30, 0x33663b, 0x224428);
    grid.position.set(0, 0, 80);
    scene.add(grid);

    renderer.render(scene, camera);
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
        const material = new THREE.LineBasicMaterial({ color: 0xff8c00 });
        line = new THREE.Line(geometry, material);
        scene.add(line);

        const last = threePoints[threePoints.length - 1];
        const sphereGeo = new THREE.SphereGeometry(0.6, 12, 12);
        const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        ballMesh = new THREE.Mesh(sphereGeo, sphereMat);
        ballMesh.position.copy(last);
        scene.add(ballMesh);

        renderer.render(scene, camera);
    } catch(e) {
        console.error('update3DTracer error:', e);
    }
};
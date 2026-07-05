window.drawBirdseye = function(canvasId, pointsJson) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#2d8a4e';
    ctx.fillRect(0, 0, w, h);

    try {
        const points = JSON.parse(pointsJson);
        if (!points || points.length === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px sans-serif';
            ctx.fillText('No data', w/2-25, h/2);
            return;
        }

        const maxZ = Math.max(...points.map(p => p.z)) || 1;
        ctx.strokeStyle = '#89CFF0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const x = (points[i].x / maxZ) * w/2 + w/2;
            const y = (points[i].z / maxZ) * h/2 + h/2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const last = points[points.length - 1];
        const bx = (last.x / maxZ) * w/2 + w/2;
        const by = (last.z / maxZ) * h/2 + h/2;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffaa00';
        ctx.fill();
    } catch(e) {
        console.error('drawBirdseye error:', e);
    }
};
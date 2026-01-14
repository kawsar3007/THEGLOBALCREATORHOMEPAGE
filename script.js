const firebaseConfig = { databaseURL: "https://the-5k-elite-legacy-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas'), ctx = cv.getContext('2d');
const tooltip = document.getElementById('legacy-tooltip');
const blockSize = 30; const cols = 100; const rows = 200; 
cv.width = cols * blockSize; cv.height = rows * blockSize;

let pixels = {};
const imgCache = {};

function render() {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockSize, 0); ctx.lineTo(i * blockSize, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockSize); ctx.lineTo(cv.width, j * blockSize); ctx.stroke(); }
    
    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            const id = parseInt(p.plotID) - 1;
            const targetX = (id % cols) * blockSize;
            const targetY = Math.floor(id / cols) * blockSize;
            if (!imgCache[p.imageUrl]) {
                const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
                img.onload = () => { imgCache[p.imageUrl] = img; render(); };
            } else { ctx.drawImage(imgCache[p.imageUrl], targetX, targetY, blockSize, blockSize); }
        }
    });
}

function downloadMap() {
    const link = document.createElement('a');
    link.download = 'Global-Creator-Map-20K.png';
    link.href = cv.toDataURL("image/png");
    link.click();
}

cv.addEventListener('mousemove', (e) => {
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / cv.width);
    const y = (e.clientY - rect.top) / (rect.height / cv.height);
    let found = false;
    Object.values(pixels).forEach(p => {
        const id = parseInt(p.plotID) - 1;
        const px = (id % cols) * blockSize; const py = Math.floor(id / cols) * blockSize;
        if (x >= px && x <= px + blockSize && y >= py && y <= py + blockSize) {
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX + 15) + 'px'; tooltip.style.top = (e.pageY + 15) + 'px';
            tooltip.innerHTML = `<strong>${p.name}</strong><br>Plot #${p.plotID}`;
            cv.style.cursor = 'pointer'; found = true;
        }
    });
    if (!found) { tooltip.style.display = 'none'; cv.style.cursor = 'default'; }
});

cv.addEventListener('click', (e) => {
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / cv.width);
    const y = (e.clientY - rect.top) / (rect.height / cv.height);
    Object.values(pixels).forEach(p => {
        const id = parseInt(p.plotID) - 1;
        const px = (id % cols) * blockSize; const py = Math.floor(id / cols) * blockSize;
        if (x >= px && x <= px + blockSize && y >= py && y <= py + blockSize) {
            if (p.link && p.link !== "#") window.open(p.link, '_blank');
        }
    });
});

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 20000 - Object.keys(pixels).length;
    render();
});
function copyVal(v) { navigator.clipboard.writeText(v).then(()=>alert("Copied!")); }
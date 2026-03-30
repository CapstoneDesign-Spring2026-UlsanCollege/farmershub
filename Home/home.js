(function () {
  const canvas = document.getElementById('fallingCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // SVG shapes as small inline images
  const svgLeaf = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'>
    <path d='M20 38 C8 30,2 18,4 6 C14 13,22 18,20 38Z' fill='rgba(56,142,60,0.75)'/>
    <line x1='20' y1='38' x2='11' y2='14' stroke='rgba(27,94,32,0.8)' stroke-width='1'/>
  </svg>`;

  const svgLeaf2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'>
    <path d='M20 38 C32 30,38 18,36 6 C26 13,18 18,20 38Z' fill='rgba(104,159,56,0.75)'/>
    <line x1='20' y1='38' x2='29' y2='14' stroke='rgba(51,105,30,0.8)' stroke-width='1'/>
  </svg>`;

  const svgWheat = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 50'>
    <line x1='10' y1='50' x2='10' y2='5' stroke='rgba(139,195,74,0.9)' stroke-width='1.5'/>
    <ellipse cx='10' cy='5' rx='4' ry='8' fill='rgba(174,213,129,0.85)'/>
    <ellipse cx='5' cy='18' rx='3' ry='6' fill='rgba(174,213,129,0.75)' transform='rotate(-30 5 18)'/>
    <ellipse cx='15' cy='18' rx='3' ry='6' fill='rgba(174,213,129,0.75)' transform='rotate(30 15 18)'/>
  </svg>`;

  const svgFlower = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'>
    <circle cx='15' cy='15' r='4' fill='rgba(255,193,7,0.9)'/>
    <ellipse cx='15' cy='6' rx='3' ry='5' fill='rgba(255,235,59,0.8)'/>
    <ellipse cx='15' cy='24' rx='3' ry='5' fill='rgba(255,235,59,0.8)'/>
    <ellipse cx='6' cy='15' rx='5' ry='3' fill='rgba(255,235,59,0.8)'/>
    <ellipse cx='24' cy='15' rx='5' ry='3' fill='rgba(255,235,59,0.8)'/>
  </svg>`;

  function makeImg(svg) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    return img;
  }

  const imgs = [
    makeImg(svgLeaf),
    makeImg(svgLeaf2),
    makeImg(svgWheat),
    makeImg(svgFlower)
  ];

  const particles = [];

  function spawn() {
    const size = 18 + Math.random() * 22;
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -size,
      size,
      speed: 1.2 + Math.random() * 2.5,
      drift: (Math.random() - 0.5) * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.06,
      img: imgs[Math.floor(Math.random() * imgs.length)],
      opacity: 0.55 + Math.random() * 0.4
    });
  }

  // Pre-populate
  for (let i = 0; i < 18; i++) {
    spawn();
    particles[particles.length - 1].y = Math.random() * window.innerHeight;
  }

  let lastSpawn = 0;

  function animate(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ts - lastSpawn > 600) {
      spawn();
      lastSpawn = ts;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
      ctx.rotate(p.rot);
      ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y > canvas.height + 40) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
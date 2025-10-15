import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  closest?: Point[];
  circle?: Circle;
  active?: number;
}

class Circle {
  pos: Point;
  radius: number;
  color: string;
  active?: number;
  ctx: CanvasRenderingContext2D;

  constructor(pos: Point, rad: number, color: string, ctx: CanvasRenderingContext2D) {
    this.pos = pos;
    this.radius = rad;
    this.color = color;
    this.ctx = ctx;
  }

  draw() {
    if (!this.active) return;
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = `rgba(156,217,249,${this.active})`;
    this.ctx.fill();
  }
}

interface Target {
  x: number;
  y: number;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animateHeader = true;

    let target: Target = { x: width / 2, y: height / 2 };
    let points: Point[] = [];

    canvas.width = width;
    canvas.height = height;


    for (let x = 0; x < width; x += width / 20) {
      for (let y = 0; y < height; y += height / 20) {
        const px = x + Math.random() * (width / 20);
        const py = y + Math.random() * (height / 20);
        points.push({ x: px, originX: px, y: py, originY: py });
      }
    }


    points.forEach((p1) => {
      const closest: Point[] = [];
      points.forEach((p2) => {
        if (p1 === p2) return;
        if (closest.length < 5) {
          closest.push(p2);
        } else {
          for (let i = 0; i < 5; i++) {
            if (getDistance(p1, p2) < getDistance(p1, closest[i])) {
              closest[i] = p2;
              break;
            }
          }
        }
      });
      p1.closest = closest;
    });

    // Criar círculo para cada ponto
    points.forEach((p) => {
      p.circle = new Circle(p, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)', ctx);
    });

    function getDistance(p1: Point | Target, p2: Point) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    function drawLines(p: Point) {
      if (!p.active || !p.closest) return;
      p.closest.forEach((c) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = `rgba(156,217,249,${p.active})`;
        ctx.stroke();
      });
    }

    function shiftPoint(p: Point) {
      gsap.to(p, {
        duration: 1 + Math.random(),
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: 'circ.inOut',
        onComplete: () => shiftPoint(p),
      });
    }

    points.forEach((p) => shiftPoint(p));

  
    function animate() {
      if (!animateHeader) return;

    
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1D4ED8'); 
      gradient.addColorStop(1, '#10B981');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      points.forEach((p) => {
        const dist = getDistance(target, p);

        
        p.active = 0.05;
        if (p.circle) p.circle.active = 0.05;

   
        if (dist < 4000) {
          p.active = 0.3;
          if (p.circle) p.circle.active = 0.6;
        } else if (dist < 20000) {
          p.active = 0.1;
          if (p.circle) p.circle.active = 0.3;
        } else if (dist < 40000) {
          p.active = 0.05;
          if (p.circle) p.circle.active = 0.1;
        }

        drawLines(p);
        p.circle?.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();


    function handleMouseMove(e: MouseEvent) {
      target.x = e.pageX || e.clientX;
      target.y = e.pageY || e.clientY;
    }

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;

"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;

  vx: number;
  vy: number;

  radius: number;
  depth: number;

  phase: number;
};

export default function HeroNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;

if (!canvasNode) return;

const canvas: HTMLCanvasElement = canvasNode;

const contextNode = canvas.getContext("2d");

if (!contextNode) return;

const ctx: CanvasRenderingContext2D = contextNode;

    let animationFrame = 0;

    let width = 0;
    let height = 0;

    const nodes: Node[] = [];

    const NODE_COUNT = 28;

    function createNodes() {
      nodes.length = 0;

      for (let i = 0; i < NODE_COUNT; i++) {
        const depth =
          0.45 + Math.random() * 0.9;

        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,

          vx:
            (Math.random() - 0.5) *
            (0.35 + depth * 0.4),

          vy:
            (Math.random() - 0.5) *
            (0.3 + depth * 0.35),

          radius:
            (2 + Math.random() * 4.5) *
            depth,

          depth,

          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function resizeCanvas() {
      const rect =
        canvas.getBoundingClientRect();

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      createNodes();
    }

    const resizeObserver =
      new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);

    resizeCanvas();

    let mouseX = width / 2;
    let mouseY = height / 2;

    function handleMouseMove(
      event: MouseEvent
    ) {
      const rect =
        canvas.getBoundingClientRect();

      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    }

    canvas.addEventListener(
      "mousemove",
      handleMouseMove
    );

    function draw(time: number) {
      ctx.clearRect(0, 0, width, height);

      /*
       * Update node positions
       */
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        /*
         * Gentle mouse parallax.
         * Nearby/deeper nodes respond differently,
         * creating a 3D feeling.
         */
        const dx = mouseX - width / 2;
        const dy = mouseY - height / 2;

        node.x +=
          dx * 0.000035 * node.depth;

        node.y +=
          dy * 0.000035 * node.depth;

        /*
         * Bounce from edges
         */
        if (
          node.x < -20 ||
          node.x > width + 20
        ) {
          node.vx *= -1;
        }

        if (
          node.y < -20 ||
          node.y > height + 20
        ) {
          node.vy *= -1;
        }

        node.phase += 0.015;
      }

      /*
       * Dynamic connections
       */
      for (
        let i = 0;
        i < nodes.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < nodes.length;
          j++
        ) {
          const first = nodes[i];
          const second = nodes[j];

          const dx =
            second.x - first.x;

          const dy =
            second.y - first.y;

          const distance =
            Math.sqrt(
              dx * dx + dy * dy
            );

          const maxDistance = 155;

          if (distance < maxDistance) {
            const opacity =
              (1 -
                distance /
                  maxDistance) *
              0.22;

            const gradient =
              ctx.createLinearGradient(
                first.x,
                first.y,
                second.x,
                second.y
              );

            gradient.addColorStop(
              0,
              `rgba(110,231,183,${
                opacity *
                first.depth
              })`
            );

            gradient.addColorStop(
              1,
              `rgba(167,243,208,${
                opacity *
                second.depth
              })`
            );

            ctx.beginPath();

            ctx.moveTo(
              first.x,
              first.y
            );

            ctx.lineTo(
              second.x,
              second.y
            );

            ctx.strokeStyle =
              gradient;

            ctx.lineWidth =
              0.6 +
              Math.min(
                first.depth,
                second.depth
              ) *
                0.5;

            ctx.stroke();
          }
        }
      }

      /*
       * Draw nodes
       */
      for (const node of nodes) {
        const breathing =
          Math.sin(
            time * 0.0015 +
              node.phase
          ) *
          0.8;

        const radius =
          Math.max(
            1.5,
            node.radius +
              breathing
          );

        /*
         * Outer 3D glow
         */
        const glow =
          ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            radius * 5
          );

        glow.addColorStop(
          0,
          `rgba(167,243,208,${
            0.32 *
            node.depth
          })`
        );

        glow.addColorStop(
          0.3,
          `rgba(52,211,153,${
            0.18 *
            node.depth
          })`
        );

        glow.addColorStop(
          1,
          "rgba(16,185,129,0)"
        );

        ctx.beginPath();

        ctx.arc(
          node.x,
          node.y,
          radius * 5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = glow;
        ctx.fill();

        /*
         * Actual node
         */
        const nodeGradient =
          ctx.createRadialGradient(
            node.x - radius * 0.3,
            node.y - radius * 0.3,
            radius * 0.1,
            node.x,
            node.y,
            radius
          );

        nodeGradient.addColorStop(
          0,
          "#ecfdf5"
        );

        nodeGradient.addColorStop(
          0.3,
          "#a7f3d0"
        );

        nodeGradient.addColorStop(
          0.68,
          "#34d399"
        );

        nodeGradient.addColorStop(
          1,
          "#059669"
        );

        ctx.beginPath();

        ctx.arc(
          node.x,
          node.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          nodeGradient;

        ctx.fill();

        /*
         * Tiny highlight makes node look spherical.
         */
        ctx.beginPath();

        ctx.arc(
          node.x - radius * 0.28,
          node.y - radius * 0.28,
          Math.max(
            0.7,
            radius * 0.18
          ),
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "rgba(255,255,255,0.8)";

        ctx.fill();
      }

      animationFrame =
        requestAnimationFrame(draw);
    }

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      resizeObserver.disconnect();

      canvas.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 z-[1] h-full w-full"
    />
  );
}
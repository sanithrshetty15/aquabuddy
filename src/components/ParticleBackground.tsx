"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export const ParticleBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let particles: THREE.Points;
        const count = 12000;
        let currentState = 'scattered';
        let animationFrameId: number;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0); // Transparent background
        container.appendChild(renderer.domElement);

        function createScatteredParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 60;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

                const color = new THREE.Color();
                const depth = Math.random();
                color.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3); // Aqua/cyan range

                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.08,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);
        }

        createScatteredParticles();

        function createTextPoints(text: string) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return [];
            
            const fontSize = 100;
            const padding = 20;

            ctx.font = `bold ${fontSize}px Arial`;
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;

            canvas.width = textWidth + padding * 2;
            canvas.height = textHeight + padding * 2;

            ctx.fillStyle = 'white';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const points = [];
            const threshold = 128;

            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] > threshold) {
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    
                    if (Math.random() < 0.35) { // Adjusted density
                        points.push({
                            x: (x - canvas.width / 2) / (fontSize / 15),
                            y: -(y - canvas.height / 2) / (fontSize / 15)
                        });
                    }
                }
            }
            return points;
        }

        function morphToText(text: string) {
            currentState = 'text';
            const textPoints = createTextPoints(text);
            const positions = particles.geometry.attributes.position.array as Float32Array;
            const targetPositions = new Float32Array(count * 3);

            gsap.to(particles.rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1
            });

            for (let i = 0; i < count; i++) {
                if (i < textPoints.length) {
                    targetPositions[i * 3] = textPoints[i].x;
                    targetPositions[i * 3 + 1] = textPoints[i].y;
                    targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 1;
                } else {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 20 + 15;
                    targetPositions[i * 3] = Math.cos(angle) * radius;
                    targetPositions[i * 3 + 1] = Math.sin(angle) * radius;
                    targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
                }
            }

            for (let i = 0; i < positions.length; i += 3) {
                gsap.to(positions, {
                    [i]: targetPositions[i],
                    [i + 1]: targetPositions[i + 1],
                    [i + 2]: targetPositions[i + 2],
                    duration: 3,
                    ease: "power3.inOut",
                    onUpdate: () => {
                        particles.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }

            setTimeout(() => {
                morphToCircle();
            }, 6000); // Wait 6 seconds before morphing to sphere
        }

        function morphToCircle() {
            currentState = 'sphere';
            const positions = particles.geometry.attributes.position.array as Float32Array;
            const targetPositions = new Float32Array(count * 3);
            const colors = particles.geometry.attributes.color.array as Float32Array;

            function sphericalDistribution(i: number) {
                const phi = Math.acos(-1 + (2 * i) / count);
                const theta = Math.sqrt(count * Math.PI) * phi;
                
                return {
                    x: 10 * Math.cos(theta) * Math.sin(phi),
                    y: 10 * Math.sin(theta) * Math.sin(phi),
                    z: 10 * Math.cos(phi)
                };
            }

            for (let i = 0; i < count; i++) {
                const point = sphericalDistribution(i);
                
                targetPositions[i * 3] = point.x + (Math.random() - 0.5) * 0.5;
                targetPositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.5;
                targetPositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.5;

                const depth = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z) / 10;
                const color = new THREE.Color();
                color.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3);
                
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            for (let i = 0; i < positions.length; i += 3) {
                gsap.to(positions, {
                    [i]: targetPositions[i],
                    [i + 1]: targetPositions[i + 1],
                    [i + 2]: targetPositions[i + 2],
                    duration: 2.5,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        particles.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }

            for (let i = 0; i < colors.length; i += 3) {
                gsap.to(colors, {
                    [i]: colors[i],
                    [i + 1]: colors[i + 1],
                    [i + 2]: colors[i + 2],
                    duration: 2.5,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        particles.geometry.attributes.color.needsUpdate = true;
                    }
                });
            }
        }

        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            
            if (currentState === 'sphere') {
                particles.rotation.y += 0.002;
                particles.rotation.z += 0.001;
            } else if (currentState === 'text') {
                particles.position.y = Math.sin(Date.now() * 0.001) * 0.5; // subtle float
            }

            // Parallax
            camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 4 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        }

        // Trigger first morph after a short delay
        const timeoutId = setTimeout(() => {
            morphToText('AQUA');
        }, 1000);

        animate();

        const handleResize = () => {
             if (!containerRef.current) return;
             const newWidth = containerRef.current.clientWidth;
             const newHeight = containerRef.current.clientHeight;
             camera.aspect = newWidth / newHeight;
             camera.updateProjectionMatrix();
             renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
             clearTimeout(timeoutId);
             window.removeEventListener('resize', handleResize);
             window.removeEventListener('mousemove', handleMouseMove);
             cancelAnimationFrame(animationFrameId);
             // Kill any active GSAP tweens on particles
             if (particles && particles.geometry && particles.geometry.attributes) {
                 gsap.killTweensOf(particles.geometry.attributes.position.array);
                 gsap.killTweensOf(particles.geometry.attributes.color.array);
                 gsap.killTweensOf(particles.rotation);
             }
             if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
                 container.removeChild(renderer.domElement);
             }
             if (renderer) renderer.dispose();
             if (scene) {
                 scene.traverse((object) => {
                     if (object instanceof THREE.Points) {
                         if (object.geometry) object.geometry.dispose();
                         if (object.material) (object.material as THREE.Material).dispose();
                     }
                 });
             }
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none" />;
};

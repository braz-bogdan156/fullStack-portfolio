(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animatedItems = document.querySelectorAll("[data-animate]");

    document.body.classList.add("is-loaded");

    if (window.gsap && !prefersReducedMotion) {
        const hasScrollTrigger = Boolean(window.ScrollTrigger);

        if (hasScrollTrigger) {
            gsap.registerPlugin(window.ScrollTrigger);
        }

        gsap.fromTo(
            ".topbar",
            { y: -28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }
        );

        gsap.fromTo(
            ".hero .eyebrow, .hero h1, .hero-lead, .hero-actions, .hero-metrics, .hero-profile",
            { y: 42, autoAlpha: 0, filter: "blur(10px)" },
            {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.95,
                ease: "power3.out",
                stagger: 0.09,
                delay: 0.15
            }
        );

        gsap.utils.toArray(animatedItems).forEach((item) => {
            if (item.closest(".hero") || item.classList.contains("topbar")) {
                return;
            }

            const revealConfig = {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.8,
                ease: "power3.out"
            };

            if (hasScrollTrigger) {
                revealConfig.scrollTrigger = {
                    trigger: item,
                    start: "top 84%",
                    once: true
                };
            }

            gsap.fromTo(item, { y: 44, autoAlpha: 0, filter: "blur(8px)" }, revealConfig);
        });

        gsap.to(".visual-line", {
            scaleX: 0.28,
            duration: 1.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.2,
            transformOrigin: "50% 50%"
        });

        gsap.to(".visual-ring, .portal-a", {
            rotate: 360,
            duration: 18,
            repeat: -1,
            ease: "none"
        });

        gsap.to(".visual-dot, .portal-b, .portal-c, .pin", {
            y: -12,
            duration: 1.8,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.14
        });
    }

    initTiltCards(prefersReducedMotion);
    initThreeScene(prefersReducedMotion);
})();

function initTiltCards(prefersReducedMotion) {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cards = document.querySelectorAll("[data-tilt]");

    if (!cards.length || prefersReducedMotion || !canHover || !window.gsap) {
        return;
    }

    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const relX = (event.clientX - rect.left) / rect.width - 0.5;
            const relY = (event.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, {
                rotationY: relX * 10,
                rotationX: relY * -10,
                transformPerspective: 950,
                transformOrigin: "center",
                duration: 0.45,
                ease: "power2.out"
            });
        });

        card.addEventListener("pointerleave", () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.45)"
            });
        });
    });
}

function initThreeScene(prefersReducedMotion) {
    const canvas = document.getElementById("neon-canvas");

    if (!canvas || !window.THREE || prefersReducedMotion) {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    const group = new THREE.Group();
    const pointer = { x: 0, y: 0 };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    scene.add(group);

    const torus = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.05, 0.28, 150, 18),
        new THREE.MeshStandardMaterial({
            color: 0x38f8ff,
            emissive: 0x123e44,
            metalness: 0.55,
            roughness: 0.22,
            wireframe: true
        })
    );

    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.72, 1),
        new THREE.MeshStandardMaterial({
            color: 0xff4fd8,
            emissive: 0x4d143f,
            metalness: 0.34,
            roughness: 0.18,
            transparent: true,
            opacity: 0.86
        })
    );

    const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.85, 0.012, 12, 160),
        new THREE.MeshBasicMaterial({
            color: 0x60ffbf,
            transparent: true,
            opacity: 0.62
        })
    );

    halo.rotation.x = Math.PI / 2.7;
    group.add(torus, core, halo);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
        const radius = 2.2 + Math.random() * 5.6;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 4.2;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            color: 0xf7c45f,
            size: 0.025,
            transparent: true,
            opacity: 0.74
        })
    );

    scene.add(particles);

    const cyanLight = new THREE.PointLight(0x38f8ff, 1.9, 10);
    cyanLight.position.set(-3, 2.5, 3);

    const pinkLight = new THREE.PointLight(0xff4fd8, 1.45, 9);
    pinkLight.position.set(3, -1.4, 3);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(cyanLight, pinkLight, ambient);
    camera.position.set(0, 0, 5.2);

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);

        const isSmall = width < 760;
        group.position.set(isSmall ? 0.85 : 2.05, isSmall ? 1.1 : 1.25, 0);
        group.scale.setScalar(isSmall ? 0.54 : 0.9);
    }

    function handlePointer(event) {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer);
    resize();

    renderer.setAnimationLoop(() => {
        const elapsed = performance.now() * 0.001;

        group.rotation.x = elapsed * 0.22 + pointer.y * 0.12;
        group.rotation.y = elapsed * 0.32 + pointer.x * 0.16;
        core.rotation.y = elapsed * -0.46;
        halo.rotation.z = elapsed * 0.38;
        particles.rotation.y = elapsed * 0.035;

        renderer.render(scene, camera);
    });
}

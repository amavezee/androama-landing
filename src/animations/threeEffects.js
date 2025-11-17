// animations/threeEffects.js
import * as THREE from 'three';

/**
 * Three.js holographic logo effect
 */
export class HolographicLogo {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.logoMesh = null;
    this.clock = new THREE.Clock();
    
    this.init();
    this.animate();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(300, 300);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Create holographic material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0xec4899) },
        color2: { value: new THREE.Color(0xa855f7) },
        color3: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 uv = vUv;
          
          // Create holographic effect
          float wave1 = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
          float wave2 = sin(uv.y * 8.0 + time * 1.5) * 0.5 + 0.5;
          float wave3 = sin((uv.x + uv.y) * 6.0 + time * 3.0) * 0.5 + 0.5;
          
          // Mix colors based on waves
          vec3 color = mix(color1, color2, wave1);
          color = mix(color, color3, wave2 * 0.3);
          
          // Add scan lines
          float scanline = sin(uv.y * 200.0 + time * 10.0) * 0.1 + 0.9;
          
          // Add glow effect
          float glow = 1.0 - distance(uv, vec2(0.5)) * 2.0;
          glow = pow(glow, 2.0);
          
          color *= scanline * (0.7 + glow * 0.3);
          
          gl_FragColor = vec4(color, 0.8 + glow * 0.2);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create logo geometry (simplified sphere for now)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    this.logoMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.logoMesh);

    // Position camera
    this.camera.position.z = 3;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update shader uniforms
    if (this.logoMesh) {
      this.logoMesh.material.uniforms.time.value = elapsedTime;
      this.logoMesh.rotation.x = elapsedTime * 0.2;
      this.logoMesh.rotation.y = elapsedTime * 0.3;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}

/**
 * Animated gradient background with Three.js
 */
export class AnimatedGradientBackground {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.clock = new THREE.Clock();
    
    this.init();
    this.animate();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Create gradient material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          
          // Create animated gradient
          vec3 color1 = vec3(0.0, 0.0, 0.0); // Black
          vec3 color2 = vec3(0.92, 0.28, 0.6); // Pink
          vec3 color3 = vec3(0.66, 0.33, 0.97); // Purple
          vec3 color4 = vec3(0.0, 0.0, 0.0); // Black
          
          // Animate gradient positions
          float t1 = sin(time * 0.5) * 0.5 + 0.5;
          float t2 = sin(time * 0.3 + 1.0) * 0.5 + 0.5;
          float t3 = sin(time * 0.7 + 2.0) * 0.5 + 0.5;
          
          // Mix colors
          vec3 color = mix(color1, color2, t1);
          color = mix(color, color3, t2 * uv.y);
          color = mix(color, color4, t3 * (1.0 - uv.y));
          
          // Add subtle noise
          float noise = sin(uv.x * 100.0 + time) * 0.01;
          color += noise;
          
          gl_FragColor = vec4(color, 0.8);
        }
      `
    });

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    this.scene.add(quad);

    // Position camera
    this.camera.position.z = 1;
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update shader uniforms
    const material = this.scene.children[0].material;
    material.uniforms.time.value = elapsedTime;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    const material = this.scene.children[0].material;
    material.uniforms.resolution.value.set(width, height);
  }

  dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}

/**
 * Mouse parallax grid effect
 */
export class ParallaxGrid {
  constructor(container) {
    this.container = container;
    this.mouse = new THREE.Vector2();
    this.init();
    this.bindEvents();
  }

  init() {
    // Create grid overlay
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'parallax-grid';
    this.gridElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: 1;
      transition: transform 0.1s ease-out;
    `;
    
    this.container.appendChild(this.gridElement);
  }

  bindEvents() {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Apply parallax effect
      const moveX = this.mouse.x * 10;
      const moveY = this.mouse.y * 10;
      
      this.gridElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  dispose() {
    if (this.gridElement) {
      this.gridElement.remove();
    }
  }
}

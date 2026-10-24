import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Howl } from 'howler'

class EducationalVisualization {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = null
    this.renderer = null
    this.controls = null
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clock = new THREE.Clock()
    
    this.visualizations = {
      motivation: null,
      learning: null,
      cooperation: null
    }
    
    this.currentVisualization = 'motivation'
    this.animationActive = true
    this.particlesActive = true
    
    this.neurons = []
    this.connections = []
    this.learningNodes = []
    this.cooperationNetwork = []
    
    this.init()
  }

  init() {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupLights()
    this.createVisualization('motivation')
    this.setupEventListeners()
    this.hideLoader()
    this.animate()
  }

  setupScene() {
    this.scene.fog = new THREE.Fog(0x0a0e1a, 10, 100)
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x00d4ff, 0x141927)
    gridHelper.position.y = -10
    gridHelper.material.opacity = 0.2
    gridHelper.material.transparent = true
    this.scene.add(gridHelper)
  }

  setupCamera() {
    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
    this.camera.position.set(15, 10, 25)
    this.camera.lookAt(0, 0, 0)
  }

  setupRenderer() {
    const canvas = document.getElementById('three-canvas')
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x0a0e1a, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxDistance = 50
    this.controls.minDistance = 5
    this.controls.maxPolarAngle = Math.PI * 0.9
    this.controls.enablePan = true
    this.controls.panSpeed = 0.8
    
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0x00d4ff, 0.8)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.camera.near = 0.1
    mainLight.shadow.camera.far = 50
    mainLight.shadow.camera.left = -20
    mainLight.shadow.camera.right = 20
    mainLight.shadow.camera.top = 20
    mainLight.shadow.camera.bottom = -20
    this.scene.add(mainLight)

    const accentLight = new THREE.PointLight(0x7b61ff, 0.5)
    accentLight.position.set(-10, 15, -10)
    this.scene.add(accentLight)

    const spotLight = new THREE.SpotLight(0x00ff88, 0.3)
    spotLight.position.set(0, 30, 0)
    spotLight.angle = Math.PI / 6
    spotLight.penumbra = 0.5
    this.scene.add(spotLight)
  }

  createVisualization(type) {
    this.clearVisualization()
    this.currentVisualization = type
    
    switch(type) {
      case 'motivation':
        this.createMotivationFlow()
        break
      case 'learning':
        this.createLearningPaths()
        break
      case 'cooperation':
        this.createCooperationNetwork()
        break
    }
  }

  clearVisualization() {
    this.neurons.forEach(n => this.scene.remove(n))
    this.connections.forEach(c => this.scene.remove(c))
    this.learningNodes.forEach(n => this.scene.remove(n))
    this.cooperationNetwork.forEach(n => this.scene.remove(n))
    
    this.neurons = []
    this.connections = []
    this.learningNodes = []
    this.cooperationNetwork = []
  }

  createMotivationFlow() {
    const centerNode = this.createNeuron(0, 0, 0, 0x00d4ff, 1.5)
    this.neurons.push(centerNode)
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 8
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.sin(angle * 2) * 2
      
      const node = this.createNeuron(x, y, z, 0x7b61ff, 0.8)
      this.neurons.push(node)
      
      const connection = this.createConnection(centerNode.position, node.position, 0x00d4ff)
      this.connections.push(connection)
      
      for (let j = 0; j < 3; j++) {
        const subAngle = angle + (j - 1) * 0.3
        const subRadius = radius + 4
        const subX = Math.cos(subAngle) * subRadius
        const subZ = Math.sin(subAngle) * subRadius
        const subY = y + (j - 1) * 2
        
        const subNode = this.createNeuron(subX, subY, subZ, 0x00ff88, 0.5)
        this.neurons.push(subNode)
        
        const subConnection = this.createConnection(node.position, subNode.position, 0x7b61ff)
        this.connections.push(subConnection)
      }
    }
    
    if (this.particlesActive) {
      this.createFlowParticles()
    }
  }

  createLearningPaths() {
    const levels = 5
    const nodesPerLevel = 4
    
    for (let level = 0; level < levels; level++) {
      for (let i = 0; i < nodesPerLevel; i++) {
        const angle = (i / nodesPerLevel) * Math.PI * 2
        const radius = 6 + level * 3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = level * 3 - 6
        
        const color = level === 0 ? 0x00d4ff : 
                     level === levels - 1 ? 0x00ff88 : 0x7b61ff
        const size = 1 - level * 0.1
        
        const node = this.createLearningNode(x, y, z, color, size)
        this.learningNodes.push(node)
        
        if (level > 0) {
          const prevLevelNodes = this.learningNodes.slice(
            (level - 1) * nodesPerLevel, 
            level * nodesPerLevel
          )
          
          prevLevelNodes.forEach(prevNode => {
            if (Math.random() > 0.3) {
              const connection = this.createConnection(prevNode.position, node.position, color)
              this.connections.push(connection)
            }
          })
        }
      }
    }
  }

  createCooperationNetwork() {
    const nodeCount = 12
    const nodes = []
    
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - 2 * i / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      
      const x = Math.cos(theta) * Math.sin(phi) * 10
      const y = Math.sin(theta) * Math.sin(phi) * 10
      const z = Math.cos(phi) * 10
      
      const node = this.createNetworkNode(x, y, z, 0x00d4ff)
      nodes.push(node)
      this.cooperationNetwork.push(node)
    }
    
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i < j) {
          const distance = node.position.distanceTo(otherNode.position)
          if (distance < 8) {
            const connection = this.createConnection(
              node.position, 
              otherNode.position, 
              0x00ff88,
              0.3
            )
            this.connections.push(connection)
          }
        }
      })
    })
  }

  createNeuron(x, y, z, color, size = 1) {
    const geometry = new THREE.SphereGeometry(size, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      shininess: 100
    })
    const neuron = new THREE.Mesh(geometry, material)
    neuron.position.set(x, y, z)
    neuron.castShadow = true
    neuron.receiveShadow = true
    
    const glowGeometry = new THREE.SphereGeometry(size * 1.2, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    neuron.add(glow)
    
    this.scene.add(neuron)
    return neuron
  }

  createLearningNode(x, y, z, color, size = 1) {
    const geometry = new THREE.OctahedronGeometry(size)
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      flatShading: true
    })
    const node = new THREE.Mesh(geometry, material)
    node.position.set(x, y, z)
    node.castShadow = true
    this.scene.add(node)
    return node
  }

  createNetworkNode(x, y, z, color) {
    const group = new THREE.Group()
    
    const coreGeometry = new THREE.IcosahedronGeometry(0.5)
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.4
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    group.add(core)
    
    const ringGeometry = new THREE.TorusGeometry(1, 0.1, 8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    group.add(ring)
    
    group.position.set(x, y, z)
    this.scene.add(group)
    return group
  }

  createConnection(start, end, color, opacity = 0.5) {
    const points = []
    points.push(start)
    
    const midPoint = new THREE.Vector3()
    midPoint.lerpVectors(start, end, 0.5)
    midPoint.y += 2
    points.push(midPoint)
    
    points.push(end)
    
    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity
    })
    
    const connection = new THREE.Mesh(geometry, material)
    this.scene.add(connection)
    return connection
  }

  createFlowParticles() {
    const particleCount = 200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = Math.random() * 15 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i + 2] = radius * Math.cos(phi)
      
      const color = new THREE.Color()
      color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.6)
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(geometry, material)
    particles.name = 'particles'
    this.scene.add(particles)
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize())
    
    document.querySelectorAll('.control-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view
        this.setCameraView(view)
      })
    })
    
    document.querySelectorAll('.viz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.viz-btn.active').classList.remove('active')
        e.target.classList.add('active')
        const viz = e.target.dataset.viz
        this.createVisualization(viz)
      })
    })
    
    document.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        this.handleDemoAction(action)
      })
    })
    
    document.querySelectorAll('.concept-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const concept = card.dataset.concept
        this.highlightConcept(concept)
      })
    })
    
    // Panel toggle functionality
    const panelToggleBtn = document.querySelector('.panel-toggle-btn')
    const closePanelBtn = document.querySelector('.close-panel-btn')
    const panel = document.querySelector('.slideable-panel')
    
    if (panelToggleBtn && closePanelBtn && panel) {
      // Show the side button initially (panel is visible by default)
      setTimeout(() => {
        // Hide panel after 5 seconds automatically
        panel.classList.add('hidden')
        panelToggleBtn.classList.add('visible')
      }, 5000)
      
      // Handle side button click (show panel)
      panelToggleBtn.addEventListener('click', () => {
        panel.classList.remove('hidden')
        panelToggleBtn.classList.remove('visible')
      })
      
      // Handle close button click (hide panel)
      closePanelBtn.addEventListener('click', () => {
        panel.classList.add('hidden')
        panelToggleBtn.classList.add('visible')
      })
    }
    
    // Music player functionality
    this.setupMusicPlayer()
    
    // Clickable research stat
    this.setupClickableStats()
  }

  setupMusicPlayer() {
    const musicToggle = document.querySelector('.music-toggle')
    const volumeSlider = document.querySelector('.volume-slider')
    const playIcon = document.querySelector('.play-icon')
    const pauseIcon = document.querySelector('.pause-icon')
    
    let isPlaying = false
    
    // Create ambient track using Howler.js
    this.ambientSound = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmETBzhV+t/hZBkCFU6+7aVhFgVTm9r2w3IxBSV+y+1TjSMEGlvH5KxiEAg6lNn2y2wqABBHf8XsJnswGAq+6qNYEAhEpe/vn2IUBDCQ3+vDbycDGm/CQ4MBApFhSjJfhDhJvPLnf2AhAyJ1yuvCaC4HK4nO7eSMNQcZb7zl4XVbHQU+mdT2y3IqBSJ9yuvFZCYEGGO/7aVcHQc6k9fyy3UiAyF3yed1XiIDI3nM6eFoGwYfaLXn4nNeHAY7k9byzXUhAyJ6y+nHaTGGJIXJ692RQwgVYrTm5XZWFAY7k9fzyXYhAyB5zOvFaSEEHGu74OiJNAUZcLzrpGEeBDCM2O7BbywGIoXH7tqBMQgQZrjq5YM8CgyNzunJeyINE2e58+CJNAUag8bp3okyBhJrt+7hbSEEH3vC5d+BNwsRabvl4XZhFgU0Zezpf2EOBI+QdtTfzCQkE3rM6eOAOgsRabvl4GE'],
      loop: true,
      volume: 0.3,
      autoplay: false,
      html5: true,
      onplayerror: function() {
        this.once('unlock', function() {
          this.play()
        })
      }
    })
    
    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        if (isPlaying) {
          this.ambientSound.pause()
          playIcon.style.display = 'block'
          pauseIcon.style.display = 'none'
          isPlaying = false
        } else {
          this.ambientSound.play()
          playIcon.style.display = 'none'
          pauseIcon.style.display = 'block' 
          isPlaying = true
        }
      })
      
      if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
          const volume = parseFloat(e.target.value)
          this.ambientSound.volume(volume)
        })
      }
    }
  }

  setupClickableStats() {
    const clickableStat = document.querySelector('.clickable-stat')
    
    if (clickableStat) {
      clickableStat.addEventListener('click', () => {
        const details = clickableStat.querySelector('.stat-details')
        const isExpanded = clickableStat.dataset.expanded === 'true'
        
        if (isExpanded) {
          // Collapse
          details.style.display = 'none'
          clickableStat.dataset.expanded = 'false'
        } else {
          // Expand
          details.style.display = 'block'
          clickableStat.dataset.expanded = 'true'
        }
      })
    }
  }

  setCameraView(view) {
    const duration = 1500
    const start = Date.now()
    const startPos = this.camera.position.clone()
    const startTarget = this.controls.target.clone()
    
    let targetPos, targetLookAt
    
    switch(view) {
      case 'overview':
        targetPos = new THREE.Vector3(15, 10, 25)
        targetLookAt = new THREE.Vector3(0, 0, 0)
        break
      case 'focus':
        targetPos = new THREE.Vector3(0, 5, 15)
        targetLookAt = new THREE.Vector3(0, 0, 0)
        break
      case 'explore':
        targetPos = new THREE.Vector3(20, 15, 20)
        targetLookAt = new THREE.Vector3(0, 0, 0)
        break
    }
    
    const animateCamera = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = this.easeInOutCubic(progress)
      
      this.camera.position.lerpVectors(startPos, targetPos, eased)
      this.controls.target.lerpVectors(startTarget, targetLookAt, eased)
      this.controls.update()
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera)
      }
    }
    
    animateCamera()
  }

  handleDemoAction(action) {
    switch(action) {
      case 'reset':
        this.setCameraView('overview')
        break
      case 'animate':
        this.animationActive = !this.animationActive
        break
      case 'particles':
        this.particlesActive = !this.particlesActive
        const particles = this.scene.getObjectByName('particles')
        if (particles) {
          particles.visible = this.particlesActive
        }
        break
    }
  }

  highlightConcept(concept) {
    const colors = {
      intrinsic: 0x00d4ff,
      autonomy: 0x7b61ff,
      cooperation: 0x00ff88,
      process: 0xffd700
    }
    
    this.neurons.forEach(neuron => {
      if (neuron.material) {
        neuron.material.emissiveIntensity = 0.8
        neuron.material.emissive = new THREE.Color(colors[concept] || 0x00d4ff)
      }
    })
    
    setTimeout(() => {
      this.neurons.forEach(neuron => {
        if (neuron.material) {
          neuron.material.emissiveIntensity = 0.3
        }
      })
    }, 2000)
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  hideLoader() {
    setTimeout(() => {
      const loader = document.querySelector('.loading-screen')
      if (loader) {
        loader.classList.add('hidden')
      }
    }, 1000)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    const time = this.clock.getElapsedTime()
    
    if (this.animationActive) {
      this.neurons.forEach((neuron, i) => {
        if (neuron.rotation) {
          neuron.rotation.y = time * 0.2 + i * 0.5
          neuron.position.y += Math.sin(time + i) * 0.005
        }
      })
      
      this.learningNodes.forEach((node, i) => {
        if (node.rotation) {
          node.rotation.x = time * 0.3 + i * 0.2
          node.rotation.z = time * 0.2 + i * 0.3
        }
      })
      
      this.cooperationNetwork.forEach((node, i) => {
        if (node.rotation) {
          node.rotation.y = time * 0.1 + i * 0.5
          const scale = 1 + Math.sin(time * 2 + i) * 0.1
          node.scale.set(scale, scale, scale)
        }
      })
      
      const particles = this.scene.getObjectByName('particles')
      if (particles) {
        particles.rotation.y = time * 0.05
        const positions = particles.geometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.01
        }
        particles.geometry.attributes.position.needsUpdate = true
      }
    }
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

const visualization = new EducationalVisualization()
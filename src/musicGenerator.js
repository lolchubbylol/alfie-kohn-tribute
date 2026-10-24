// Music Generator - Creates different ambient music styles
class MusicGenerator {
  constructor() {
    this.audioContext = null
    this.tracks = []
  }

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    await this.audioContext.resume()
  }

  // Generate Track 1: Gentle Rain Ambience
  generateRainAmbience(duration = 30) {
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate
        
        // Pink noise for rain texture
        let rain = (Math.random() * 2 - 1) * 0.15
        
        // Low frequency rumble (distant thunder)
        const rumble = Math.sin(2 * Math.PI * 0.3 * t + Math.sin(t * 0.1)) * 0.05
        
        // High frequency sparkle (raindrops)
        const sparkle = Math.random() * 0.02 * Math.sin(t * 50)
        
        channelData[i] = (rain + rumble + sparkle) * 0.6
      }
    }
    
    return this.bufferToWave(buffer)
  }

  // Generate Track 2: Soft Piano Ambience  
  generatePianoAmbience(duration = 30) {
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)
    
    // Piano-like notes (C major pentatonic)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] // C D E G A C
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate
        let signal = 0
        
        // Sparse piano notes
        if (Math.floor(t * 0.2) % 7 === 0 && (t * 0.2) % 1 < 0.1) {
          const noteIndex = Math.floor(Math.sin(t * 0.1) * 3 + 3)
          const freq = notes[noteIndex % notes.length]
          const envelope = Math.exp(-t % 5) // Decay envelope
          signal += Math.sin(2 * Math.PI * freq * t) * envelope * 0.1
        }
        
        // Soft pad underneath
        signal += Math.sin(2 * Math.PI * 130.81 * t) * 0.03 // C3
        signal += Math.sin(2 * Math.PI * 164.81 * t) * 0.02 // E3
        
        channelData[i] = signal * 0.7
      }
    }
    
    return this.bufferToWave(buffer)
  }

  // Generate Track 3: Ocean Waves
  generateOceanWaves(duration = 30) {
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate
        
        // Wave crash pattern
        const wavePattern = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5 // 0 to 1
        
        // White noise for wave texture
        let wave = (Math.random() * 2 - 1) * wavePattern * 0.2
        
        // Low frequency wave motion
        const motion = Math.sin(2 * Math.PI * 0.05 * t) * 0.1
        
        channelData[i] = (wave + motion) * 0.5
      }
    }
    
    return this.bufferToWave(buffer)
  }

  // Generate Track 4: Forest Ambience
  generateForestAmbience(duration = 30) {
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate
        
        // Wind through leaves (filtered noise)
        let wind = (Math.random() * 2 - 1) * Math.sin(t * 2) * 0.05
        
        // Bird chirps (occasional high frequency)
        let birds = 0
        if (Math.random() < 0.001) { // Rare chirps
          birds = Math.sin(2 * Math.PI * (800 + Math.random() * 400) * t) * 0.03
        }
        
        // Rustling (mid frequency texture)
        const rustle = (Math.random() * 2 - 1) * 0.02
        
        channelData[i] = (wind + birds + rustle) * 0.6
      }
    }
    
    return this.bufferToWave(buffer)
  }

  // Generate Track 5: Space Ambience
  generateSpaceAmbience(duration = 30) {
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate)
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate
        
        // Deep space drone
        const drone1 = Math.sin(2 * Math.PI * 55 * t) * 0.04 // A1
        const drone2 = Math.sin(2 * Math.PI * 82.41 * t) * 0.03 // E2
        
        // Ethereal high frequencies
        const ethereal = Math.sin(2 * Math.PI * 1760 * t + Math.sin(t * 0.5)) * 0.01
        
        // Cosmic wind (very low noise)
        const cosmic = (Math.random() * 2 - 1) * 0.01
        
        channelData[i] = (drone1 + drone2 + ethereal + cosmic) * 0.8
      }
    }
    
    return this.bufferToWave(buffer)
  }

  // Convert audio buffer to WAV blob
  bufferToWave(abuffer) {
    const numOfChan = abuffer.numberOfChannels
    const length = abuffer.length * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    const channels = []
    let sample, offset = 0, pos = 0

    // WAV header
    const setUint16 = (data) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8)
    setUint32(0x45564157) // "WAVE"
    setUint32(0x20746d66) // "fmt "
    setUint32(16)
    setUint16(1)
    setUint16(numOfChan)
    setUint32(abuffer.sampleRate)
    setUint32(abuffer.sampleRate * 2 * numOfChan)
    setUint16(numOfChan * 2)
    setUint16(16)
    setUint32(0x61746164) // "data"
    setUint32(length - pos - 4)

    // Write audio data
    for (let i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i))

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  // Generate all tracks
  async generateAllTracks() {
    await this.init()
    
    const tracks = [
      { name: 'Gentle Rain', generator: () => this.generateRainAmbience() },
      { name: 'Soft Piano', generator: () => this.generatePianoAmbience() },
      { name: 'Ocean Waves', generator: () => this.generateOceanWaves() },
      { name: 'Forest Sounds', generator: () => this.generateForestAmbience() },
      { name: 'Space Ambience', generator: () => this.generateSpaceAmbience() }
    ]
    
    return tracks.map(track => ({
      ...track,
      blob: track.generator(),
      url: URL.createObjectURL(track.generator())
    }))
  }
}

export default MusicGenerator
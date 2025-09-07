// Generate proper ambient audio files using Node.js
const fs = require('fs')
const path = require('path')

// Simple WAV file generator
function createWavFile(filename, frequency, duration, type = 'sine') {
  const sampleRate = 44100
  const channels = 2
  const bitsPerSample = 16
  
  const numSamples = sampleRate * duration
  const bytesPerSample = bitsPerSample / 8
  const blockAlign = channels * bytesPerSample
  const dataSize = numSamples * blockAlign
  const fileSize = 36 + dataSize
  
  const buffer = Buffer.alloc(44 + dataSize)
  let offset = 0
  
  // WAV header
  buffer.write('RIFF', offset); offset += 4
  buffer.writeUInt32LE(fileSize, offset); offset += 4
  buffer.write('WAVE', offset); offset += 4
  buffer.write('fmt ', offset); offset += 4
  buffer.writeUInt32LE(16, offset); offset += 4  // PCM format
  buffer.writeUInt16LE(1, offset); offset += 2   // Audio format
  buffer.writeUInt16LE(channels, offset); offset += 2
  buffer.writeUInt32LE(sampleRate, offset); offset += 4
  buffer.writeUInt32LE(sampleRate * blockAlign, offset); offset += 4
  buffer.writeUInt16LE(blockAlign, offset); offset += 2
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2
  buffer.write('data', offset); offset += 4
  buffer.writeUInt32LE(dataSize, offset); offset += 4
  
  // Generate melodic background music
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    let sample = 0
    
    switch (type) {
      case 'study':
        // "Lofi Study Beats" - Enhanced with changing chord progressions
        
        // Multiple chord progressions that cycle every 64 seconds
        const progressionCycle = Math.floor(t / 64) % 3
        
        let lofiChords
        if (progressionCycle === 0) {
          // Classic lo-fi: Dm - Bb - F - C (vi - IV - I - V in F major)
          lofiChords = [
            [146.83, 185.00, 220.00], // Dm
            [123.47, 155.56, 185.00], // Bb
            [174.61, 220.00, 261.63], // F
            [130.81, 164.81, 196.00]  // C
          ]
        } else if (progressionCycle === 1) {
          // Jazz progression: Am - Dm - G - C
          lofiChords = [
            [110.00, 138.59, 164.81], // Am
            [146.83, 185.00, 220.00], // Dm
            [98.00, 123.47, 146.83],  // G
            [130.81, 164.81, 196.00]  // C
          ]
        } else {
          // Mellow progression: F - Am - Bb - C
          lofiChords = [
            [174.61, 220.00, 261.63], // F
            [110.00, 138.59, 164.81], // Am
            [123.47, 155.56, 185.00], // Bb
            [130.81, 164.81, 196.00]  // C
          ]
        }
        
        // 16-second loop with variation (4 seconds per chord for more space)
        const loopLength = 16
        const chordLength = 4
        const loopTime = t % loopLength
        const currentChordIndex = Math.floor(loopTime / chordLength)
        const lofiChord = lofiChords[currentChordIndex]
        
        // Add variation every 32 seconds (2 full loops)
        const bigLoopTime = t % 32
        const isVariation = bigLoopTime >= 16
        
        // Warm, jazzy chord voicings - stable pitch
        lofiChord.forEach((freq, index) => {
          const volume = 0.035 - index * 0.005
          sample += Math.sin(2 * Math.PI * freq * t) * volume
          
          // Add subtle sub-octave for warmth (lower, not higher)
          if (index === 0) {
            sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * volume * 0.3
          }
        })
        
        // Simple melody - same octave range, no pitch weirdness
        const lofiMelody = [349.23, 392.00, 329.63, 293.66, 440.00, 392.00] // F4, G4, E4, D4, A4, G4 - original range
        const mainMelodyPattern = [0, 2, 1, 3, 2, 4, 1, 5] // Main pattern
        const variationMelodyPattern = [0, 4, 2, 1, 3, 5, 1, 2] // Variation pattern - same notes, different order
        const currentMelodyPattern = isVariation ? variationMelodyPattern : mainMelodyPattern
        
        const lofiMelodyNoteLength = 2 // Longer notes for more melodic feel
        const lofiMelodyTime = t % (currentMelodyPattern.length * lofiMelodyNoteLength)
        const lofiMelodyIndex = Math.floor(lofiMelodyTime / lofiMelodyNoteLength)
        const lofiMelodyProgress = (lofiMelodyTime % lofiMelodyNoteLength) / lofiMelodyNoteLength
        
        // Play melody with stable pitch - no detuning
        if (lofiMelodyProgress < 0.9) {
          const freq = lofiMelody[currentMelodyPattern[lofiMelodyIndex] % lofiMelody.length]
          const envelope = Math.exp(-lofiMelodyProgress * 1.5) * 0.04 // Gentler decay
          sample += Math.sin(2 * Math.PI * freq * t) * envelope
          
          // Add harmonics for richness - but keep them low
          sample += Math.sin(2 * Math.PI * freq * 1.5 * t) * envelope * 0.12 // Perfect fifth instead of octave
        }
        
        // Enhanced bass line with walking pattern - adjust to current progression
        let lofiBassNotes
        if (progressionCycle === 0) {
          lofiBassNotes = [73.42, 61.74, 87.31, 65.41] // D2, Bb1, F2, C2
        } else if (progressionCycle === 1) {
          lofiBassNotes = [55.00, 73.42, 49.00, 65.41] // A1, D2, G1, C2
        } else {
          lofiBassNotes = [87.31, 55.00, 61.74, 65.41] // F2, A1, Bb1, C2
        }
        const lofiBassTime = t % loopLength
        const lofiBassIndex = Math.floor(lofiBassTime / chordLength)
        const bassNote = lofiBassNotes[lofiBassIndex]
        
        // Main bass note
        const lofiBassEnvelope = 0.6 + Math.sin(t * 1.5) * 0.15 // Gentler pulsing
        sample += Math.sin(2 * Math.PI * bassNote * t) * 0.06 * lofiBassEnvelope
        
        // Walking bass notes (in between main notes)
        const walkingBeatTime = (t + 2) % 4 // Offset timing
        if (walkingBeatTime < 0.1) {
          const walkingNote = bassNote * 1.125 // Fifth up
          sample += Math.sin(2 * Math.PI * walkingNote * t) * Math.exp(-walkingBeatTime * 15) * 0.03
        }
        
        // Enhanced rhythm section
        const beatTime = t % 4 // 4-second beat cycle (slower)
        
        // Kick pattern - more varied
        const kickTimes = [0, 2] // On beats 1 and 3
        kickTimes.forEach(kickBeat => {
          const kickTime = (beatTime + (4 - kickBeat)) % 4
          if (kickTime < 0.08) {
            sample += Math.sin(2 * Math.PI * 55 * t) * Math.exp(-kickTime * 20) * 0.08
          }
        })
        
        // Snare on beat 4
        const snareTime = (beatTime + 2) % 4
        if (snareTime < 0.06) {
          const snareNoise = (Math.random() - 0.5) * Math.exp(-snareTime * 25)
          const snareTone = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-snareTime * 30)
          sample += (snareNoise + snareTone) * 0.04
        }
        
        // Hi-hat with swing feel
        const hihatPattern = [0, 0.75, 1.5, 2.25, 3, 3.75] // Swing timing
        hihatPattern.forEach(hihatBeat => {
          const hihatTime = (beatTime + (4 - hihatBeat)) % 4
          if (hihatTime < 0.02) {
            const noise = (Math.random() - 0.5) * Math.exp(-hihatTime * 60)
            sample += noise * 0.015
          }
        })
        
        // Reduced vinyl crackle
        sample += (Math.random() - 0.5) * 0.004
        
        // Gentler tape saturation
        sample = Math.tanh(sample * 1.1) * 0.95
        
        break

      default:
        // Simple ambient tone for other tracks
        sample = Math.sin(2 * Math.PI * (220 + Math.sin(t * 0.1) * 20) * t) * 0.1
        break
    }
    
    // Convert to 16-bit signed integer
    const intSample = Math.max(-1, Math.min(1, sample)) * 32767
    
    // Write to both channels
    buffer.writeInt16LE(intSample, offset); offset += 2
    buffer.writeInt16LE(intSample, offset); offset += 2
  }
  
  fs.writeFileSync(filename, buffer)
  console.log(`Generated ${filename}`)
}

// Generate audio tracks
const audioDir = './public/audio'

// Create directory if it doesn't exist
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public')
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir)
}

const duration = 180  // 3 minutes each

createWavFile(path.join(audioDir, 'study.wav'), 0, duration, 'study')

console.log('Ambient audio files generated! Run "npm run dev" and visit the site to hear the music.')
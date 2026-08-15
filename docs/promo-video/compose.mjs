/**
 * Generate TTS narration clips with mmx, then compose final MP4 with ffmpeg.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAW = path.join(__dirname, 'raw')
const AUDIO = path.join(__dirname, 'audio')
const FRAMES = path.join(__dirname, 'frames')
const OUT = path.join(__dirname, 'out')
const NARRATION = JSON.parse(fs.readFileSync(path.join(__dirname, 'narration.json'), 'utf8'))
const FONT =
  '/System/Library/AssetsV2/com_apple_MobileAsset_Font8/86ba2c91f017a3749571a82f2c6d890ac7ffb2fb.asset/AssetData/PingFang.ttc'
const FONT_FALLBACK = '/System/Library/Fonts/STHeiti Medium.ttc'
const FONT_FILE = fs.existsSync(FONT) ? FONT : FONT_FALLBACK

for (const dir of [AUDIO, FRAMES, OUT]) fs.mkdirSync(dir, { recursive: true })

function run(cmd, args, opts = {}) {
  console.log('>', cmd, args.join(' '))
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts })
  if (res.status !== 0) {
    console.error(res.stdout)
    console.error(res.stderr)
    throw new Error(`${cmd} failed with ${res.status}`)
  }
  return res
}

function ffprobeDuration(file) {
  const res = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ])
  return Number(String(res.stdout).trim())
}

function synthesize() {
  for (const seg of NARRATION.segments) {
    const out = path.join(AUDIO, `${seg.id}.mp3`)
    if (fs.existsSync(out) && fs.statSync(out).size > 1000) {
      console.log('skip existing', out)
      continue
    }
    run('mmx', [
      'speech', 'synthesize',
      '--text', seg.text,
      '--voice', NARRATION.voice,
      '--language', 'zh',
      '--out', out,
      '--quiet',
      '--non-interactive',
    ], { timeout: 120000 })
  }
}

function makeTitleCard(seg) {
  const png = path.join(FRAMES, `${seg.id}-title.png`)
  const title = seg.title.replace(/'/g, "\\'")
  // dark product-style title card
  run('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x111827:s=1440x900:d=1`,
    '-vf',
    `drawtext=fontfile=${FONT_FILE}:text='Multi-Screen Wireframe':fontcolor=0x9ca3af:fontsize=28:x=(w-text_w)/2:y=320,` +
    `drawtext=fontfile=${FONT_FILE}:text='${title}':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=400`,
    '-frames:v', '1',
    png,
  ])
  return png
}

function stretchVideoTo(input, seconds, output) {
  // Loop/trim video to match target duration; keep constant frame rate.
  run('ffmpeg', [
    '-y',
    '-stream_loop', '-1',
    '-i', input,
    '-t', String(seconds),
    '-vf', 'scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    output,
  ])
}

function titleClip(png, seconds, output) {
  run('ffmpeg', [
    '-y',
    '-loop', '1',
    '-i', png,
    '-t', String(seconds),
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    output,
  ])
}

function muxAv(video, audio, output) {
  run('ffmpeg', [
    '-y',
    '-i', video,
    '-i', audio,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    output,
  ])
}

function composeSegment(seg) {
  const webm = path.join(RAW, `${seg.id}.webm`)
  if (!fs.existsSync(webm)) throw new Error(`Missing raw clip ${webm}`)
  const mp3 = path.join(AUDIO, `${seg.id}.mp3`)
  const audioDur = ffprobeDuration(mp3)
  const hold = Number(seg.holdSeconds || 2)
  const titleDur = Math.min(2.2, Math.max(1.4, hold))
  const bodyDur = Math.max(audioDur - titleDur + 0.35, 3)

  const titlePng = makeTitleCard(seg)
  const titleMp4 = path.join(OUT, `${seg.id}-title.mp4`)
  const bodyMp4 = path.join(OUT, `${seg.id}-body.mp4`)
  const silentMp4 = path.join(OUT, `${seg.id}-silent.mp4`)
  const finalMp4 = path.join(OUT, `${seg.id}.mp4`)

  titleClip(titlePng, titleDur, titleMp4)
  stretchVideoTo(webm, bodyDur, bodyMp4)

  // concat title + body then mux audio
  const list = path.join(OUT, `${seg.id}-list.txt`)
  fs.writeFileSync(list, `file '${titleMp4}'\nfile '${bodyMp4}'\n`)
  run('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-c', 'copy',
    silentMp4,
  ])
  muxAv(silentMp4, mp3, finalMp4)
  return finalMp4
}

function concatAll(files, output) {
  const list = path.join(OUT, 'all.txt')
  fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n') + '\n')
  run('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-c', 'copy',
    output,
  ])
}

const mode = process.argv[2] || 'all'

if (mode === 'tts' || mode === 'all') synthesize()
if (mode === 'compose' || mode === 'all') {
  const parts = []
  for (const seg of NARRATION.segments) {
    console.log('compose', seg.id)
    parts.push(composeSegment(seg))
  }
  const finalPath = path.join(__dirname, 'multi-screen-wireframe-intro.mp4')
  concatAll(parts, finalPath)
  // also copy to out/
  fs.copyFileSync(finalPath, path.join(OUT, 'multi-screen-wireframe-intro.mp4'))
  console.log('FINAL', finalPath)
  console.log('duration', ffprobeDuration(finalPath).toFixed(1), 's')
}

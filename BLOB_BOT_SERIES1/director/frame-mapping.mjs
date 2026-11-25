import fs from 'node:fs/promises';
import path from 'node:path';

export function scoreFrameMapping(capture,samples,encoded,coverage){
  const byMarker=new Map(capture.frames.map(row=>[row.marker,row]));
  const known=encoded.filter(f=>byMarker.has(f.marker));
  const origin=known[0], originWall=origin?byMarker.get(origin.marker).wallMs:null;
  const byFrame=new Map();
  for(const decoded of known){
    const capture=byMarker.get(decoded.marker);
    if(!byFrame.has(capture.frame))byFrame.set(capture.frame,{...capture,...decoded,
      ptsResidualMs:(decoded.ptsSeconds-origin.ptsSeconds)*1000-(capture.wallMs-originWall)});
  }
  const actions=Object.entries(coverage).map(([name,step])=>{
    const event=samples.find(s=>s.step?.frame===step?.frame&&s.step?.substep===step?.substep);
    const media=event&&byFrame.get(step.frame);
    if(!event||!media)return {name,step,status:event?'FRAME_NOT_ENCODED':'MISSING_EVENT_SAMPLE'};
    const renderDelayMs=media.wallMs-event.wallMs;
    const eventToFrameMs=renderDelayMs+media.ptsResidualMs;
    return {name,step,simSeconds:event.runtimeSeconds,action:event.input.flowSequence,
      consequence:event.flow?.effect??null,eventWallMs:event.wallMs,captureWallMs:media.wallMs,
      encodedFrameObserved:media.encodedFrameObserved,ptsSeconds:media.ptsSeconds,marker:media.marker,
      renderDelayMs,ptsResidualMs:media.ptsResidualMs,eventToFrameMs,
      status:Math.abs(eventToFrameMs)<=100?'WITHIN_100_MS':'OVER_100_MS'};
  });
  return {actions,captured:capture.frames.length,encodedMarkers:known.length,
    missingCapturedMarkers:capture.frames.filter(f=>!known.some(other=>other.marker===f.marker)).map(f=>f.marker),
    maxAbsPtsResidualMs:known.length?Math.max(...[...byFrame.values()].map(f=>Math.abs(f.ptsResidualMs))):null};
}

export async function decodeCapture(browser,origin,out,raw){
  const context=await browser.newContext();
  const page=await context.newPage();
  const results={};
  try{
    await page.route('**/__director_media',route=>route.fulfill({
      contentType:'text/html',body:'<!doctype html><title>Director frame inspection</title>'}));
    await page.goto(origin+'/__director_media');
    const payload=async row=>({data:(await fs.readFile(path.join(out,row.name))).toString('base64'),mime:row.mime});
    for(const row of raw.capture.files){
      const report=await page.evaluate(async ({data,mime})=>{
        const {frameCode}=await import('/BLOB_BOT_SERIES1/director/frame-capture.mjs');
        const source=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
        const video=document.createElement('video');
        const canvas=document.createElement('canvas');
        const context=canvas.getContext('2d',{willReadFrequently:true});
        video.muted=true;video.playsInline=true;
        video.src=URL.createObjectURL(new Blob([source],{type:mime}));
        document.body.replaceChildren(video);
        await new Promise((resolve,reject)=>{
          video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('Video failed to decode'));
        });
        canvas.width=video.videoWidth;canvas.height=video.videoHeight;
        const frames=[];
        const recordFrame=(_now,info)=>{
          context.drawImage(video,0,0);
          const marker=frameCode(context,canvas.height);
          if(marker!==null)frames.push({marker,ptsSeconds:info.mediaTime,encodedFrameObserved:info.presentedFrames});
          if(!video.ended)video.requestVideoFrameCallback(recordFrame);
        };
        video.requestVideoFrameCallback(recordFrame);
        const ended=new Promise((resolve,reject)=>{
          const timeout=setTimeout(()=>reject(new Error('Media presentation timed out')),80_000);
          video.onended=()=>{clearTimeout(timeout);resolve();};
        });
        await video.play();await ended;
        return {frames,dimensions:[video.videoWidth,video.videoHeight],quality:video.getVideoPlaybackQuality().droppedVideoFrames};
      },await payload(row));
      results[row.format]={...scoreFrameMapping(raw.capture,raw.trial.samples,report.frames,raw.trial.actions),
        dimensions:report.dimensions,decoderDrops:report.quality,codec:row.mime,
        nativeAudioTrack:row.nativeAudioTrack,signalObserved:row.nativeAudioTrack&&raw.capture.peakAudio>0.0001};
    }
    return results;
  }finally{await context.close();}
}

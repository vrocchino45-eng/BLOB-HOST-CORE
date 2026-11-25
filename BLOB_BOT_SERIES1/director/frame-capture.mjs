const markerWidth=190, cell=10, prefix=[1,0,1];
export function frameCode(context,height){
  const pixels=context.getImageData(0,height-cell,markerWidth,cell).data;
  const bit=i=>pixels[((5*markerWidth)+i*cell+5)*4]>128;
  if(prefix.some((value,i)=>Boolean(value)!==bit(i)))return null;
  let key=0;
  for(let i=0;i<16;i++) key+=Number(bit(i+prefix.length))*2**i;
  return key||null;
}
function stamp(context,key,height){
  for(let i=0;i<19;i++){
    const value=i<prefix.length?prefix[i]:(key>>(i-prefix.length))&1;
    context.fillStyle=value?'white':'black';
    context.fillRect(i*10,height-10,10,10);
  }
}
function audioTap(runtime){
  const host=runtime.eventAnchoredHostAudioSystem;
  if(host?.context?.state!=='running'||!host.outputCompressor)return null;
  const destination=host.context.createMediaStreamDestination();
  const analyser=host.context.createAnalyser();
  host.outputCompressor.connect(destination);host.outputCompressor.connect(analyser);
  const values=new Float32Array(analyser.fftSize);
  return {track:destination.stream.getAudioTracks()[0],
    level(){analyser.getFloatTimeDomainData(values);return Math.sqrt(values.reduce((n,x)=>n+x*x,0)/values.length);},
    close(){host.outputCompressor.disconnect(destination);host.outputCompressor.disconnect(analyser);}};
}
function chooseMime(format,audio){
  const codecs=format==='webm'?['vp8','vp8,opus']:['avc1.42001f','avc1.42001f,mp4a.40.2'];
  const table=codecs.map(c=>'video/'+format+';codecs='+c);
  if(audio&&MediaRecorder.isTypeSupported(table[1]))return {mime:table[1],audio:true};
  if(MediaRecorder.isTypeSupported(table[0]))return {mime:table[0],audio:false};
  return null;
}
export function captureRuntime(runtime,{detail=false,phone=true}={}){
  const canvas=document.createElement('canvas');
  canvas.width=768;canvas.height=432;
  const context=canvas.getContext('2d',{alpha:false});
  const source=canvas.captureStream(0).getVideoTracks()[0];
  const audio=audioTap(runtime);
  const recordings=[];
  for(const format of phone?['webm','mp4']:['webm']){
    const support=chooseMime(format,audio);
    if(!support)continue;
    const tracks=[source];
    if(support.audio)tracks.push(audio.track);
    const recorder=new MediaRecorder(new MediaStream(tracks),{mimeType:support.mime,videoBitsPerSecond:2000000});
    const chunks=[];
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.start();
    recordings.push({format,recorder,chunks,...support});
  }
  if(!recordings.length){
    source.stop();audio?.close();audio?.track.stop();
    throw new Error('No supported capture codec');
  }
  const renderer=runtime.renderer,original=renderer.render,frames=[];
  let frame,peakAudio=0;
  renderer.render=function capture(scene,camera){
    const result=original.call(this,scene,camera),f=runtime.frameState;
    if(scene!==runtime.scene||this.getRenderTarget()!==null||frame===f.frame)return result;
    frame=f.frame;
    const image=renderer.domElement,scale=detail ? .62 : 1;
    const w=image.width*scale,h=image.height*scale;
    context.drawImage(image,(image.width-w)/2,(image.height-h)/2,w,h,0,0,canvas.width,canvas.height);
    const marker=frames.length+1;
    if(marker>=65536)return result;
    stamp(context,marker,canvas.height);
    frames.push({marker,wallMs:performance.now(),frame,substep:f.runtimeSimulationSubstepIndex,
      simSeconds:f.runtimeSeconds,flowPhase:f.coreFlow?.phase,action:f.input?.flowActionSequence,
      host:f.activeHostId,cell:f.activeCellId,mount:f.firstSliceRuntimeMount?.mountSequence});
    peakAudio=Math.max(peakAudio,audio?.level()??0);
    source.requestFrame();
    return result;
  };
  return {supported:recordings.map(r=>r.format),frames,
    async stop(base){
      renderer.render=original;
      const files=await Promise.all(recordings.map(({format,recorder,chunks,mime,audio})=>new Promise(resolve=>{
        recorder.onstop=()=>{
          const name=base+'.'+format,a=document.createElement('a');
          a.href=URL.createObjectURL(new Blob(chunks,{type:mime}));
          a.download=name;a.click();resolve({name,format,mime,nativeAudioTrack:audio});
        };
        recorder.stop();
      })));
      source.stop();audio?.close();audio?.track.stop();
      return {files,frames,peakAudio,timeOrigin:performance.timeOrigin,detail,crop:detail ? .62 : 1};
    }};
}

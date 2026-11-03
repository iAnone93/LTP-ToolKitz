var iy=Object.defineProperty;var ny=(e,t,r)=>t in e?iy(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var xe=(e,t,r)=>ny(e,typeof t!="symbol"?t+"":t,r);let Qr="https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main",ay="https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main",sy="https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/raw/main";function oy(e){var r,i;let t=(i=(r=globalThis.process)==null?void 0:r.env)==null?void 0:i.PPU_PADDLE_OCR_MODEL_MIRROR;return!t||t==="0"||t==="false"||!e.startsWith(Qr)?null:sy+e.slice(Qr.length)}let uy={detection:`${Qr}/detection/ort/PP-OCRv6_tiny_det.ort`,recognition:`${Qr}/recognition/ort/PP-OCRv6_tiny_rec.ort`,charactersDictionary:`${ay}/recognition/ppocrv6_tiny_dict.txt`},ly=uy,Xt=ly;/*!
 * ONNX Runtime Web v1.31.1
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var aa=Object.defineProperty,dy=Object.getOwnPropertyDescriptor,py=Object.getOwnPropertyNames,cy=Object.prototype.hasOwnProperty,hy=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),L=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(i){throw r=[i],i}},rr=(e,t)=>{for(var r in t)aa(e,r,{get:t[r],enumerable:!0})},fy=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of py(t))!cy.call(e,n)&&n!==r&&aa(e,n,{get:()=>t[n],enumerable:!(i=dy(t,n))||i.enumerable});return e},$r=e=>fy(aa({},"__esModule",{value:!0}),e),Yt,dt,Oi,qt,Bi,Up,Lp,sa=L(()=>{"use strict";Yt=new Map,dt=[],Oi=new WeakMap,qt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Yt.get(e);if(i===void 0)Yt.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let n=dt.indexOf(e);n!==-1&&dt.splice(n,1);for(let a=0;a<dt.length;a++)if(Yt.get(dt[a]).priority<=r){dt.splice(a,0,e);return}dt.push(e)}return}throw new TypeError("not a valid backend")},Bi=async e=>{let t=Yt.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{if(!r){let i=t.backend,n=Oi.get(i);t.initPromise=n?n.then(async()=>i.init(e),async()=>i.init(e)):i.init(e),Oi.set(i,t.initPromise)}return await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Up=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?dt:r,n,a=[],s=new Set;for(let l of i){let d=await Bi(l);typeof d=="string"?a.push({name:l,err:d}):(n||(n=d),n===d&&s.add(l))}if(!n)throw new Error(`no available backend found. ERR: ${a.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:d}of a)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${d}`);let o=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[n,new Proxy(e,{get:(l,d)=>d==="executionProviders"?o:Reflect.get(l,d)})]},Lp=async()=>{let e=[];for(let r of dt){if(typeof Yt.get(r).backend.createLoraAdapterHandler!="function")continue;let i=await Bi(r);if(typeof i!="string")return i;e.push({name:r,err:i})}let t=e.length===0?"":` ERR: ${e.map(r=>`[${r.name}] ${r.err}`).join(", ")}`;throw new Error(`no available backend supports LoRA adapters.${t}`)}}),my=L(()=>{"use strict";sa()}),Wp,gy=L(()=>{"use strict";Wp="1.31.1"}),Ri,Ae,qp=L(()=>{"use strict";gy(),Ri="warning",Ae={wasm:{},webgl:{},webgpu:{},versions:{common:Wp},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);Ri=e}},get logLevel(){return Ri}},Object.defineProperty(Ae,"logLevel",{enumerable:!0})}),me,yy=L(()=>{"use strict";qp(),me=Ae}),vr,Mi,Ve,Pe,vt,xt,oa=L(()=>{"use strict";qp(),vr=(e,t)=>{(typeof Ae.trace>"u"?!Ae.wasm.trace:!Ae.trace)||console.timeStamp(`${e}::ORT::${t}`)},Mi=(e,t)=>{var n;let r=((n=new Error().stack)==null?void 0:n.split(/\r\n|\r|\n/g))||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(s+=`::${t}`),vr("CPU",s);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},Ve=e=>{(typeof Ae.trace>"u"?!Ae.wasm.trace:!Ae.trace)||Mi("BEGIN",e)},Pe=e=>{(typeof Ae.trace>"u"?!Ae.wasm.trace:!Ae.trace)||Mi("END",e)},vt=e=>{(typeof Ae.trace>"u"?!Ae.wasm.trace:!Ae.trace)||console.time(`ORT::${e}`)},xt=e=>{(typeof Ae.trace>"u"?!Ae.wasm.trace:!Ae.trace)||console.timeEnd(`ORT::${e}`)}}),ua,Vp=L(()=>{"use strict";sa(),oa(),ua=class Gp{constructor(t,r){this.backend=t,this.handler=r}static async create(t){if(Ve(),typeof t!="string"&&!(t instanceof Uint8Array))throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let r=await Lp(),i=await r.createLoraAdapterHandler(t);return Pe(),new Gp(r,i)}async release(){return this.handler.dispose()}}}),Hp,Fp,_y=L(()=>{"use strict";Hp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let n,a;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[3]):(n=e.dims[3],a=e.dims[2]);let s=(t==null?void 0:t.format)!==void 0?t.format:"RGB",o=t==null?void 0:t.norm,l,d;o===void 0||o.mean===void 0?l=[255,255,255,255]:typeof o.mean=="number"?l=[o.mean,o.mean,o.mean,o.mean]:(l=[o.mean[0],o.mean[1],o.mean[2],0],o.mean[3]!==void 0&&(l[3]=o.mean[3])),o===void 0||o.bias===void 0?d=[0,0,0,0]:typeof o.bias=="number"?d=[o.bias,o.bias,o.bias,o.bias]:(d=[o.bias[0],o.bias[1],o.bias[2],0],o.bias[3]!==void 0&&(d[3]=o.bias[3]));let c=a*n,h=0,f=c,_=c*2,g=-1;s==="RGBA"?(h=0,f=c,_=c*2,g=c*3):s==="RGB"?(h=0,f=c,_=c*2):s==="RBG"&&(h=0,_=c,f=c*2);for(let b=0;b<a;b++)for(let S=0;S<n;S++){let $=(e.data[h++]-d[0])*l[0],w=(e.data[f++]-d[1])*l[1],T=(e.data[_++]-d[2])*l[2],I=g===-1?255:(e.data[g++]-d[3])*l[3];i.fillStyle="rgba("+$+","+w+","+T+","+I+")",i.fillRect(S,b,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},Fp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let n,a,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[1],s=e.dims[3]):(n=e.dims[3],a=e.dims[2],s=e.dims[1]);let o=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t==null?void 0:t.norm,d,c;l===void 0||l.mean===void 0?d=[255,255,255,255]:typeof l.mean=="number"?d=[l.mean,l.mean,l.mean,l.mean]:(d=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(d[3]=l.mean[3])),l===void 0||l.bias===void 0?c=[0,0,0,0]:typeof l.bias=="number"?c=[l.bias,l.bias,l.bias,l.bias]:(c=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(c[3]=l.bias[3]));let h=a*n;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let f=4,_=0,g=1,b=2,S=3,$=0,w=h,T=h*2,I=-1;o==="RGBA"?($=0,w=h,T=h*2,I=h*3):o==="RGB"?($=0,w=h,T=h*2):o==="RBG"&&($=0,T=h,w=h*2),i=r.createImageData(n,a);for(let k=0;k<a*n;_+=f,g+=f,b+=f,S+=f,k++)i.data[_]=(e.data[$++]-c[0])*d[0],i.data[g]=(e.data[w++]-c[1])*d[1],i.data[b]=(e.data[T++]-c[2])*d[2],i.data[S]=I===-1?255:(e.data[I++]-c[3])*d[3]}else throw new Error("Can not access image data");return i}}),Dr,jp,Kp,Zp,Xp,Yp,wy=L(()=>{"use strict";la(),Dr=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,n=t.norm??{mean:255,bias:0},a,s;typeof n.mean=="number"?a=[n.mean,n.mean,n.mean,n.mean]:a=[n.mean[0],n.mean[1],n.mean[2],n.mean[3]??255],typeof n.bias=="number"?s=[n.bias,n.bias,n.bias,n.bias]:s=[n.bias[0],n.bias[1],n.bias[2],n.bias[3]??0];let o=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",d=r*i,c=l==="RGBA"?new Float32Array(d*4):new Float32Array(d*3),h=4,f=0,_=1,g=2,b=3,S=0,$=d,w=d*2,T=-1;o==="RGB"&&(h=3,f=0,_=1,g=2,b=-1),l==="RGBA"?T=d*3:l==="RBG"?(S=0,w=d,$=d*2):l==="BGR"&&(w=0,$=d,S=d*2);for(let I=0;I<d;I++,f+=h,g+=h,_+=h,b+=h)c[S++]=(e[f]+s[0])/a[0],c[$++]=(e[_]+s[1])/a[1],c[w++]=(e[g]+s[2])/a[2],T!==-1&&b!==-1&&(c[T++]=(e[b]+s[3])/a[3]);return l==="RGBA"?new We("float32",c,[1,4,r,i]):new We("float32",c,[1,3,r,i])},jp=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,n=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,a=typeof e=="string",s,o=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},d=c=>typeof HTMLCanvasElement<"u"&&c instanceof HTMLCanvasElement||c instanceof OffscreenCanvas?c.getContext("2d"):null;if(r){let c=l();c.width=e.width,c.height=e.height;let h=d(c);if(h!=null){let f=e.height,_=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(f=t.resizedHeight,_=t.resizedWidth),t!==void 0){if(o=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");o.tensorFormat="RGBA",o.height=f,o.width=_}else o.tensorFormat="RGBA",o.height=f,o.width=_;h.drawImage(e,0,0),s=h.getImageData(0,0,_,f).data}else throw new Error("Can not access image data")}else if(i){let c,h;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(c=t.resizedHeight,h=t.resizedWidth):(c=e.height,h=e.width),t!==void 0&&(o=t),o.format="RGBA",o.height=c,o.width=h,t!==void 0){let f=l();f.width=h,f.height=c;let _=d(f);if(_!=null)_.putImageData(e,0,0),s=_.getImageData(0,0,h,c).data;else throw new Error("Can not access image data")}else s=e.data}else if(n){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let c=l();c.width=e.width,c.height=e.height;let h=d(c);if(h!=null){let f=e.height,_=e.width;return h.drawImage(e,0,0,_,f),s=h.getImageData(0,0,_,f).data,o.height=f,o.width=_,Dr(s,o)}else throw new Error("Can not access image data")}else{if(a)return new Promise((c,h)=>{let f=l(),_=d(f);if(!e||!_)return h();let g=new Image;g.crossOrigin="Anonymous",g.src=e,g.onload=()=>{f.width=g.width,f.height=g.height,_.drawImage(g,0,0,f.width,f.height);let b=_.getImageData(0,0,f.width,f.height);o.height=f.height,o.width=f.width,c(Dr(b.data,o))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Dr(s,o);throw new Error("Input data provided is not supported - aborted tensor creation")},Kp=(e,t)=>{let{width:r,height:i,download:n,dispose:a}=t,s=[1,i,r,4];return new We({location:"texture",type:"float32",texture:e,dims:s,download:n,dispose:a})},Zp=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new We({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:n,dispose:a})},Xp=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new We({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:n,dispose:a})},Yp=(e,t,r)=>new We({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),Pt,yr,Di,Qp,by=L(()=>{"use strict";Pt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),yr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Di=!1,Qp=()=>{if(!Di){Di=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(Pt.set("int64",BigInt64Array),yr.set(BigInt64Array,"int64")),t&&(Pt.set("uint64",BigUint64Array),yr.set(BigUint64Array,"uint64")),i?(Pt.set("float16",r),yr.set(r,"float16")):Pt.set("float16",Uint16Array)}}}),Jp,ec,$y=L(()=>{"use strict";la(),Jp=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},ec=(e,t)=>{switch(e.location){case"cpu":return new We(e.type,e.data,t);case"cpu-pinned":return new We({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new We({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new We({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new We({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),We,la=L(()=>{"use strict";_y(),wy(),by(),$y(),We=class{constructor(e,t,r){Qp();let i,n;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,n=e.dims,e.location){case"cpu-pinned":{let s=Pt.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,o;if(typeof e=="string")if(i=e,o=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=Pt.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(o=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=yr.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(o===void 0)o=[s.length];else if(!Array.isArray(o))throw new TypeError("A tensor's dims must be a number array");n=o,this.cpuData=s,this.dataLocation="cpu"}let a=Jp(n);if(this.cpuData&&a!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(a/2)===this.cpuData.length))throw new Error(`Tensor's size(${a}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=n,this.size=a}static async fromImage(e,t){return jp(e,t)}static fromTexture(e,t){return Kp(e,t)}static fromGpuBuffer(e,t){return Zp(e,t)}static fromMLTensor(e,t){return Xp(e,t)}static fromPinnedBuffer(e,t,r){return Yp(e,t,r)}toDataURL(e){return Hp(this,e)}toImageData(e){return Fp(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return ec(this,e)}}}),et,tc=L(()=>{"use strict";la(),et=We}),rc,vy=L(()=>{"use strict";sa(),Vp(),tc(),oa(),rc=class ic{constructor(t,r){this.handler=t,this.backend=r}async run(t,r,i){Ve(),vt("InferenceSession.run");let n={},a={};if(typeof t!="object"||t===null||t instanceof et||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof et)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let c of r){if(typeof c!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(c)===-1)throw new RangeError(`'fetches' contains invalid output name: ${c}.`);n[c]=null}if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let c=!1,h=Object.getOwnPropertyNames(r);for(let f of this.outputNames)if(h.indexOf(f)!==-1){let _=r[f];(_===null||_ instanceof et)&&(c=!0,s=!1,n[f]=_)}if(c){if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else a=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let c of this.inputNames)if(typeof t[c]>"u")throw new Error(`input '${c}' is missing in 'feeds'.`);if(s)for(let c of this.outputNames)n[c]=null;let o;if(a.activeLoraAdapters!==void 0){if(!Array.isArray(a.activeLoraAdapters))throw new TypeError("'activeLoraAdapters' must be an array.");o=a.activeLoraAdapters.map(c=>{if(!(c instanceof ua))throw new TypeError("'activeLoraAdapters' must be an array of LoraAdapter objects.");if(c.backend!==this.backend)throw new Error("LoRA adapter was created by a different backend than the session.");return c.handler})}let l=await this.handler.run(t,n,a,o),d={};for(let c in l)if(Object.hasOwnProperty.call(l,c)){let h=l[c];h instanceof et?d[c]=h:d[c]=new et(h.type,h.data,h.dims)}return xt("InferenceSession.run"),Pe(),d}async release(){return this.handler.dispose()}static async create(t,r,i,n){Ve(),vt("InferenceSession.create");let a,s={};if(typeof t=="string"){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let c=t,h=0,f=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(h=r,!Number.isSafeInteger(h))throw new RangeError("'byteOffset' must be an integer.");if(h<0||h>=c.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${c.byteLength}).`);if(f=t.byteLength-h,typeof i=="number"){if(f=i,!Number.isSafeInteger(f))throw new RangeError("'byteLength' must be an integer.");if(f<=0||h+f>c.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${c.byteLength-h}].`);if(typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");a=new Uint8Array(c,h,f)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[o,l]=await Up(s),d=await o.createInferenceSessionHandler(a,l);return xt("InferenceSession.create"),Pe(),new ic(d,o)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),da,xy=L(()=>{"use strict";vy(),da=rc}),pa,Sy=L(()=>{"use strict";Vp(),pa=ua}),Ty=L(()=>{"use strict"}),ky=L(()=>{"use strict"}),Iy=L(()=>{"use strict"}),Ey=L(()=>{"use strict"}),nc={};rr(nc,{InferenceSession:()=>da,LoraAdapter:()=>pa,TRACE:()=>vr,TRACE_EVENT_BEGIN:()=>vt,TRACE_EVENT_END:()=>xt,TRACE_FUNC_BEGIN:()=>Ve,TRACE_FUNC_END:()=>Pe,Tensor:()=>et,env:()=>me,registerBackend:()=>qt});var Ge=L(()=>{"use strict";my(),yy(),xy(),Sy(),tc(),Ty(),ky(),oa(),Iy(),Ey()}),ca=L(()=>{"use strict"}),ac={};rr(ac,{default:()=>sc});var Ni,Pi,sc,Cy=L(()=>{"use strict";var e;gm(),Ft(),ha(),Ni="ort-wasm-proxy-worker",Pi=((e=globalThis.self)==null?void 0:e.name)===Ni,Pi&&(self.onmessage=t=>{let{type:r,in:i}=t.data;try{switch(r){case"init-wasm":fa(i.wasm).then(()=>{Aa(i).then(()=>{postMessage({type:r})},n=>{postMessage({type:r,err:n})})},n=>{postMessage({type:r,err:n})});break;case"init-ep":{let{epName:n,env:a}=i;Oa(a,n).then(()=>{postMessage({type:r})},s=>{postMessage({type:r,err:s})});break}case"copy-from":{let{buffer:n}=i,a=ai(n);postMessage({type:r,out:a});break}case"create":{let{model:n,options:a}=i;Ba(n,a).then(s=>{postMessage({type:r,out:s})},s=>{postMessage({type:r,err:s})});break}case"release":Ra(i),postMessage({type:r});break;case"run":{let{sessionId:n,inputIndices:a,inputs:s,outputIndices:o,options:l}=i;Ma(n,a,s,o,new Array(o.length).fill(null),l).then(d=>{d.some(c=>c[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:d},Na([...s,...d]))},d=>{postMessage({type:r,err:d})});break}case"end-profiling":Da(i),postMessage({type:r});break;default:}}catch(n){postMessage({type:r,err:n})}}),sc=Pi?null:t=>new Worker(t??Le,{type:"module",name:Ni})}),oc={};rr(oc,{default:()=>uc});async function Wo(e={}){var Uo,Lo;var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,n=i&&((Uo=self.name)==null?void 0:Uo.startsWith("em-pthread"));t.mountExternalData=(u,p)=>{u.startsWith("./")&&(u=u.substring(2)),(t.jd||(t.jd=new Map)).set(u,p)},t.unmountExternalData=()=>{delete t.jd,delete t.ke,delete t.je,delete t.le},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let a=u=>async(...p)=>{var y;try{if(t.hd)throw Error("Session already started");let m=t.hd={Vd:p[0],errors:[]},x=await u(...p);if(t.hd!==m)throw Error("Session mismatch");(y=t.pd)==null||y.flush();let E=m.errors;if(0<E.length){let A=await Promise.all(E);if(A=A.filter(D=>D),0<A.length)throw Error(A.join(`
`))}return x}finally{t.hd=null}};t.jsepInit=(u,p)=>{if(u==="webgpu"){[t.pd,t.Ld,t.Pd,t.rd,t.Od,t.ic,t.Qd,t.Sd,t.Md,t.Nd,t.Rd]=p;let y=t.pd;t.jsepRegisterBuffer=(m,x,E,A)=>y.registerBuffer(m,x,E,A),t.jsepGetBuffer=m=>y.getBuffer(m),t.jsepCreateDownloader=(m,x,E)=>y.createDownloader(m,x,E),t.jsepOnCreateSession=m=>{y.onCreateSession(m)},t.jsepOnReleaseSession=m=>{y.onReleaseSession(m)},t.jsepOnRunStart=m=>y.onRunStart(m),t.Td=(m,x)=>{y.upload(m,x)}}else if(u==="webnn"){let y=p[0];[t.ce,t.Cd,t.webnnEnsureTensor,t.Dd,t.webnnDownloadTensor,t.be,t.webnnEnableTraceEvent]=p.slice(1),t.webnnReleaseTensorId=t.Cd,t.webnnUploadTensor=t.Dd,t.webnnRegisterMLContext=t.be,t.webnnOnRunStart=m=>y.onRunStart(m),t.webnnOnRunEnd=y.onRunEnd.bind(y),t.webnnOnReleaseSession=m=>{y.onReleaseSession(m)},t.webnnCreateMLTensorDownloader=(m,x)=>y.createMLTensorDownloader(m,x),t.webnnRegisterMLTensor=(m,x,E,A)=>y.registerMLTensor(m,x,E,A),t.webnnCreateMLContext=m=>y.createMLContext(m),t.webnnRegisterGraphInput=y.registerGraphInput.bind(y),t.webnnIsGraphInput=y.isGraphInput.bind(y),t.webnnRegisterGraphOutput=y.registerGraphOutput.bind(y),t.webnnIsGraphOutput=y.isGraphOutput.bind(y),t.webnnCreateTemporaryTensor=y.createTemporaryTensor.bind(y),t.webnnIsGraphInputOutputTypeSupported=y.isGraphInputOutputTypeSupported.bind(y)}};let s=()=>{let u=p=>(...y)=>{let m=it;return y=p(...y),it!=m?new Promise((x,E)=>{wi={resolve:x,reject:E}}):y};(p=>{for(let y of p)t[y]=u(t[y])})("_OrtAppendExecutionProvider _OrtAppendExecutionProviderV2 _OrtCreateSession _OrtRun _OrtRunWithBinding _OrtBindInput".split(" ")),a!==void 0&&(t._OrtRun=a(t._OrtRun),t._OrtRunWithBinding=a(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s==null||s()};var o,l,d=(u,p)=>{throw p},c=import.meta.url,h="";if(r||i){try{h=new URL(".",c).href}catch{}i&&(l=u=>{var p=new XMLHttpRequest;return p.open("GET",u,!1),p.responseType="arraybuffer",p.send(null),new Uint8Array(p.response)}),o=async u=>{if(z(u))return new Promise((y,m)=>{var x=new XMLHttpRequest;x.open("GET",u,!0),x.responseType="arraybuffer",x.onload=()=>{x.status==200||x.status==0&&x.response?y(x.response):m(x.status)},x.onerror=m,x.send(null)});var p=await fetch(u,{credentials:"same-origin"});if(p.ok)return p.arrayBuffer();throw Error(p.status+" : "+p.url)}}var f,_,g,b,S,$,w=console.log.bind(console),T=console.error.bind(console),I=w,k=T,C=!1,z=u=>u.startsWith("file://");function v(){mt.buffer!=P.buffer&&K()}if(n){let u=function(p){try{var y=p.data,m=y.bd;if(m==="load"){let x=[];self.onmessage=E=>x.push(E),$=()=>{postMessage({bd:"loaded"});for(let E of x)u(E);self.onmessage=u};for(let E of y.Hd)t[E]&&!t[E].proxy||(t[E]=(...A)=>{postMessage({bd:"callHandler",Fd:E,args:A})},E=="print"&&(I=t[E]),E=="printErr"&&(k=t[E]));mt=y.Zd,K(),_=y.$d,$e(),Mr()}else if(m==="run"){(function(x){var E=(v(),H)[x+52>>>2>>>0];x=(v(),H)[x+56>>>2>>>0],Fs(E,E-x),se(E)})(y.ad),Si(y.ad,0,0,1,0,0),Fa(),gi(y.ad),B||(Ls(),B=!0);try{jm(y.Xd,y.nd)}catch(x){if(x!="unwind")throw x}}else y.target!=="setimmediate"&&(m==="checkMailbox"?B&&Er():m&&(k(`worker: received unknown command ${m}`),k(y)))}catch(x){throw Ws(),x}};var B=!1;self.onunhandledrejection=p=>{throw p.reason||p},self.onmessage=u}var P,G,V,U,O,H,Y,Q,re,J,_e,M=!1;function K(){var u=mt.buffer;t.HEAP8=P=new Int8Array(u),V=new Int16Array(u),t.HEAPU8=G=new Uint8Array(u),U=new Uint16Array(u),t.HEAP32=O=new Int32Array(u),t.HEAPU32=H=new Uint32Array(u),Y=new Float32Array(u),Q=new Float64Array(u),re=new BigInt64Array(u),J=new BigUint64Array(u)}function ee(){M=!0,n?$():lt.vb()}function W(u){throw k(u="Aborted("+u+")"),C=!0,u=new WebAssembly.RuntimeError(u+". Build with -sASSERTIONS for more info."),S==null||S(u),u}function we(){return{a:{na:g0,jb:m0,g:Km,G:Zm,f:Xm,o:Ym,h:Qm,$:Jm,b:eg,S:tg,Ja:Qa,n:rg,aa:rs,_a:is,Fa:ns,Ha:as,$a:ss,Ya:os,Ra:us,Xa:ls,la:ds,Ga:ps,Da:cs,Za:hs,Ea:fs,eb:ig,ga:ng,ya:ag,wa:og,fa:lg,N:dg,I:pg,xa:cg,_:wg,za:bg,Ua:$g,Ba:xg,Ka:Sg,ua:Tg,ha:kg,Ta:gi,bb:Ig,Q:Ag,r:Dg,c:fi,kb:Ng,y:Pg,M:Ug,D:Lg,m:Wg,s:vs,lb:qg,J:Vg,R:Gg,j:Hg,u:Fg,q:jg,k:Kg,Oa:Zg,Pa:Xg,Qa:Yg,Ma:ks,Na:Is,va:Es,gb:Jg,db:t0,v:r0,ba:i0,ia:n0,cb:e0,V:a0,ab:s0,Ca:o0,F:Qg,U:u0,ma:Br,Aa:d0,ib:l0,hb:p0,Va:Os,Wa:Bs,Ia:Ue,T:Rs,La:Ms,ka:Ds,Sa:Ns,ja:Ps,nb:ey,oa:Z0,ob:J0,pa:K0,H:N0,e:b0,t:_0,w:y0,B:A0,pb:H0,Z:G0,x:S0,qa:F0,X:X0,ca:V0,qb:q0,ea:v0,O:O0,sb:U0,ra:W0,tb:P0,L:M0,Y:j0,d:w0,A:x0,l:$0,mb:ty,p:k0,z:I0,C:T0,E:E0,K:B0,sa:D0,P:Y0,da:R0,W:Q0,ub:z0,ta:C0,rb:L0,i:h0,a:mt,fb:Ie}}}async function $e(){function u(m,x){var E=lt=m.exports;m={};for(let[A,D]of Object.entries(E))typeof D=="function"?(E=Eg(D),m[A]=E):m[A]=D;return lt=m,lt=function(){var A=lt,D=F=>ae=>F(ae)>>>0,q=F=>()=>F()>>>0;return(A=Object.assign({},A)).wb=D(A.wb),A.ec=q(A.ec),A.gc=D(A.gc),A.uc=D(A.uc),A.vc=q(A.vc),A.zc=D(A.zc),A}(),Ga.push(lt.hc),Us=(m=lt).wb,Ls=m.xb,t._OrtInit=m.yb,t._OrtGetLastError=m.zb,t._OrtCreateSessionOptions=m.Ab,t._OrtAppendExecutionProvider=m.Bb,t._OrtGetEpDevices=m.Cb,t._OrtEpDevice_EpName=m.Db,t._OrtAppendExecutionProviderV2=m.Eb,t._OrtAddFreeDimensionOverride=m.Fb,t._OrtAddSessionConfigEntry=m.Gb,t._OrtReleaseSessionOptions=m.Hb,t._OrtCreateSession=m.Ib,t._OrtReleaseSession=m.Jb,t._OrtGetInputOutputCount=m.Kb,t._OrtGetInputOutputMetadata=m.Lb,t._OrtFree=m.Mb,t._OrtCreateTensor=m.Nb,t._OrtGetTensorData=m.Ob,t._OrtReleaseTensor=m.Pb,t._OrtCreateLoraAdapter=m.Qb,t._OrtReleaseLoraAdapter=m.Rb,t._OrtCreateRunOptions=m.Sb,t._OrtAddRunConfigEntry=m.Tb,t._OrtRunOptionsAddActiveLoraAdapter=m.Ub,t._OrtReleaseRunOptions=m.Vb,t._OrtCreateBinding=m.Wb,t._OrtBindInput=m.Xb,t._OrtBindOutput=m.Yb,t._OrtClearBoundOutputs=m.Zb,t._OrtReleaseBinding=m._b,t._OrtRunWithBinding=m.$b,t._OrtRun=m.ac,t._OrtEndProfiling=m.bc,t._JsepOutput=m.cc,t._JsepGetNodeName=m.dc,Rr=m.ec,nt=t._free=m.fc,nr=t._malloc=m.gc,Si=m.jc,Ws=m.kc,qs=m.lc,Vs=m.mc,Ti=m.nc,Gs=m.oc,Hs=m.pc,ue=m.qc,ar=m.rc,Fs=m.sc,se=m.tc,ki=m.uc,oe=m.vc,js=m.wc,Ii=m.xc,Ks=m.yc,Zs=m.zc,Xs=m.Ac,Ei=m.Bc,Ys=m.Cc,Qs=m.Dc,Js=m.Ec,eo=m.Fc,to=m.Gc,ro=m.Hc,io=m.Ic,no=m.Jc,ao=m.Kc,so=m.Lc,oo=m.Mc,uo=m.Nc,lo=m.Oc,po=m.Pc,co=m.Qc,ho=m.Rc,fo=m.Sc,mo=m.Tc,go=m.Uc,yo=m.Vc,_o=m.Wc,wo=m.Xc,bo=m.Yc,$o=m._c,vo=m.$c,xo=m.kd,So=m.ld,To=m.qd,ko=m.vd,Io=m.wd,Eo=m.xd,Co=m.yd,zo=m.zd,Ao=m.Ad,Oo=m.Bd,Bo=m.Gd,Ro=m.Jd,Mo=m.fe,Do=m.ge,No=m.he,Po=m.ie,_=x,lt}var p,y=we();return t.instantiateWasm?new Promise(m=>{t.instantiateWasm(y,(x,E)=>{m(u(x,E))})}):n?u(new WebAssembly.Instance(_,we()),_):(_e??(_e=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",h):h+"ort-wasm-simd-threaded.jsep.wasm":new URL("/LTP-ToolKitz/assets/ort-wasm-simd-threaded.jsep-Dt5UNR3U.wasm",import.meta.url).href),p=await async function(m){var x=_e;if(!f&&!z(x))try{var E=fetch(x,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(E,m)}catch(A){k(`wasm streaming compile failed: ${A}`),k("falling back to ArrayBuffer instantiation")}return async function(A,D){try{var q=await async function(F){if(!f)try{var ae=await o(F);return new Uint8Array(ae)}catch{}if(F==_e&&f)F=new Uint8Array(f);else{if(!l)throw"both async and sync fetching of the wasm failed";F=l(F)}return F}(A);return await WebAssembly.instantiate(q,D)}catch(F){k(`failed to asynchronously prepare wasm: ${F}`),W(F)}}(x,m)}(y),u(p.instance,p.module))}class ge{constructor(p){xe(this,"name","ExitStatus");this.message=`Program terminated with exit(${p})`,this.status=p}}var Me=u=>{u.terminate(),u.onmessage=()=>{}},Be=[],kt=0,It=null,Fe=u=>{tt.length==0&&(Ka(),ja(tt[0]));var p=tt.pop();if(!p)return 6;Et.push(p),Ct[u.ad]=p,p.ad=u.ad;var y={bd:"run",Xd:u.Wd,nd:u.nd,ad:u.ad};return p.postMessage(y,u.ud),0},Re=0,fe=(u,p,...y)=>{var m,x=16*y.length,E=oe(),A=ki(x),D=A>>>3;for(m of y)typeof m=="bigint"?((v(),re)[D++>>>0]=1n,(v(),re)[D++>>>0]=m):((v(),re)[D++>>>0]=0n,(v(),Q)[D++>>>0]=m);return u=qs(u,0,x,A,p),se(E),u};function Ie(u){if(n)return fe(0,1,u);if(g=u,!(0<Re)){for(var p of Et)Me(p);for(p of tt)Me(p);tt=[],Et=[],Ct={},C=!0}d(0,new ge(u))}function Se(u){if(n)return fe(1,0,u);Ue(u)}var Ue=u=>{if(g=u,n)throw Se(u),"unwind";Ie(u)},tt=[],Et=[],Ga=[],Ct={},Ha=u=>{var p=u.ad;delete Ct[p],tt.push(u),Et.splice(Et.indexOf(u),1),u.ad=0,Vs(p)};function Fa(){Ga.forEach(u=>u())}var ja=u=>new Promise(p=>{u.onmessage=x=>{var E=x.data;if(x=E.bd,E.md&&E.md!=Rr()){var A=Ct[E.md];A?A.postMessage(E,E.ud):k(`Internal error! Worker sent a message "${x}" to target pthread ${E.md}, but that thread no longer exists!`)}else x==="checkMailbox"?Er():x==="spawnThread"?Fe(E):x==="cleanupThread"?Ir(()=>{Ha(Ct[E.Yd])}):x==="loaded"?(u.loaded=!0,p(u)):E.target==="setimmediate"?u.postMessage(E):x==="uncaughtException"?u.onerror(E.error):x==="callHandler"?t[E.Fd](...E.args):x&&k(`worker sent an unknown command ${x}`)},u.onerror=x=>{throw k(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var y,m=[];for(y of[])t.propertyIsEnumerable(y)&&m.push(y);u.postMessage({bd:"load",Hd:m,Zd:mt,$d:_})});function Ka(){var u=new Worker((()=>{let p=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new p("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});tt.push(u)}var mt,jm=(u,p)=>{Re=0,u=Ei(u,p),0<Re?g=u:Ti(u)},Sr=[],Tr=0;function Km(u){var p=new di(u>>>=0);return(v(),P)[p.cd+12>>>0]==0&&(Za(p,!0),Tr--),Xa(p,!1),Sr.push(p),Zs(u)}var Kt=0,Zm=()=>{ue(0,0);var u=Sr.pop();js(u.od),Kt=0};function Za(u,p){p=p?1:0,(v(),P)[u.cd+12>>>0]=p}function Xa(u,p){p=p?1:0,(v(),P)[u.cd+13>>>0]=p}class di{constructor(p){this.od=p,this.cd=p-24}}var pi=u=>{var p=Kt;if(!p)return ar(0),0;var y=new di(p);(v(),H)[y.cd+16>>>2>>>0]=p;var m=(v(),H)[y.cd+4>>>2>>>0];if(!m)return ar(0),p;for(var x of u){if(x===0||x===m)break;if(Ks(x,m,y.cd+16))return ar(x),p}return ar(m),p};function Xm(){return pi([])}function Ym(u){return pi([u>>>0])}function Qm(u,p,y,m){return pi([u>>>0,p>>>0,y>>>0,m>>>0])}var Jm=()=>{var u=Sr.pop();u||W("no exception to throw");var p=u.od;throw(v(),P)[u.cd+13>>>0]==0&&(Sr.push(u),Xa(u,!0),Za(u,!1),Tr++),Ii(p),Kt=p};function eg(u,p,y){var m=new di(u>>>=0);throw p>>>=0,y>>>=0,(v(),H)[m.cd+16>>>2>>>0]=0,(v(),H)[m.cd+4>>>2>>>0]=p,(v(),H)[m.cd+8>>>2>>>0]=y,Ii(u),Tr++,Kt=u}var tg=()=>Tr;function Ya(u,p,y,m){return n?fe(2,1,u,p,y,m):Qa(u,p,y,m)}function Qa(u,p,y,m){if(u>>>=0,p>>>=0,y>>>=0,m>>>=0,!globalThis.SharedArrayBuffer)return 6;var x=[];return n&&x.length===0?Ya(u,p,y,m):(u={Wd:y,ad:u,nd:m,ud:x},n?(u.bd="spawnThread",postMessage(u,x),0):Fe(u))}function rg(u){throw Kt||(Kt=u>>>0),Kt}var Ja=globalThis.TextDecoder&&new TextDecoder,es=(u,p,y,m)=>{if(y=p+y,m)return y;for(;u[p]&&!(p>=y);)++p;return p},ts=(u,p=0,y,m)=>{if(16<(y=es(u,p>>>=0,y,m))-p&&u.buffer&&Ja)return Ja.decode(u.buffer instanceof ArrayBuffer?u.subarray(p,y):u.slice(p,y));for(m="";p<y;){var x=u[p++];if(128&x){var E=63&u[p++];if((224&x)==192)m+=String.fromCharCode((31&x)<<6|E);else{var A=63&u[p++];65536>(x=(240&x)==224?(15&x)<<12|E<<6|A:(7&x)<<18|E<<12|A<<6|63&u[p++])?m+=String.fromCharCode(x):(x-=65536,m+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else m+=String.fromCharCode(x)}return m},Ee=(u,p,y)=>(u>>>=0)?ts((v(),G),u,p,y):"";function rs(u,p,y){return n?fe(3,1,u,p,y):0}function is(u,p){if(n)return fe(4,1,u,p)}function ns(u,p){if(n)return fe(5,1,u,p)}function as(u,p,y){if(n)return fe(6,1,u,p,y)}function ss(u,p,y){return n?fe(7,1,u,p,y):0}function os(u,p){if(n)return fe(8,1,u,p)}function us(u,p,y){if(n)return fe(9,1,u,p,y)}function ls(u,p,y,m){if(n)return fe(10,1,u,p,y,m)}function ds(u,p,y,m){if(n)return fe(11,1,u,p,y,m)}function ps(u,p,y,m){if(n)return fe(12,1,u,p,y,m)}function cs(u){if(n)return fe(13,1,u)}function hs(u,p){if(n)return fe(14,1,u,p)}function fs(u,p,y){if(n)return fe(15,1,u,p,y)}var ig=()=>W(""),rt=u=>{u>>>=0;for(var p="";;){var y=(v(),G)[u++>>>0];if(!y)return p;p+=String.fromCharCode(y)}},ci={},hi={},Zt=class extends Error{constructor(u){super(u),this.name="BindingError"}};function ut(u,p,y={}){return function(m,x,E={}){var A=x.name;if(!m)throw new Zt(`type "${A}" must have a positive integer typeid pointer`);if(hi.hasOwnProperty(m)){if(E.Id)return;throw new Zt(`Cannot register type '${A}' twice`)}hi[m]=x,ci.hasOwnProperty(m)&&(x=ci[m],delete ci[m],x.forEach(D=>D()))}(u,p,y)}var ms=(u,p,y)=>{switch(p){case 1:return y?m=>(v(),P)[m>>>0]:m=>(v(),G)[m>>>0];case 2:return y?m=>(v(),V)[m>>>1>>>0]:m=>(v(),U)[m>>>1>>>0];case 4:return y?m=>(v(),O)[m>>>2>>>0]:m=>(v(),H)[m>>>2>>>0];case 8:return y?m=>(v(),re)[m>>>3>>>0]:m=>(v(),J)[m>>>3>>>0];default:throw new TypeError(`invalid integer width (${p}): ${u}`)}};function ng(u,p,y,m,x){u>>>=0,y>>>=0,p=rt(p>>>0);let E=A=>A;if(m=m===0n){let A=8*y;E=D=>BigInt.asUintN(A,D),x=E(x)}ut(u,{name:p,Zc:E,ed:(A,D)=>(typeof D=="number"&&(D=BigInt(D)),D),dd:ms(p,y,!m),gd:null})}function ag(u,p,y,m){ut(u>>>=0,{name:p=rt(p>>>0),Zc:function(x){return!!x},ed:function(x,E){return E?y:m},dd:function(x){return this.Zc((v(),G)[x>>>0])},gd:null})}var gs=[],zt=[0,1,,1,null,1,!0,1,!1,1];function fi(u){9<(u>>>=0)&&--zt[u+1]===0&&(zt[u]=void 0,gs.push(u))}var He=u=>{if(!u)throw new Zt(`Cannot use deleted val. handle = ${u}`);return zt[u]},je=u=>{switch(u){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let p=gs.pop()||zt.length;return zt[p]=u,zt[p+1]=1,p}};function mi(u){return this.Zc((v(),H)[u>>>2>>>0])}var sg={name:"emscripten::val",Zc:u=>{var p=He(u);return fi(u),p},ed:(u,p)=>je(p),dd:mi,gd:null};function og(u){return ut(u>>>0,sg)}var ug=(u,p)=>{switch(p){case 4:return function(y){return this.Zc((v(),Y)[y>>>2>>>0])};case 8:return function(y){return this.Zc((v(),Q)[y>>>3>>>0])};default:throw new TypeError(`invalid float width (${p}): ${u}`)}};function lg(u,p,y){y>>>=0,ut(u>>>=0,{name:p=rt(p>>>0),Zc:m=>m,ed:(m,x)=>x,dd:ug(p,y),gd:null})}function dg(u,p,y,m,x){u>>>=0,y>>>=0,p=rt(p>>>0);let E=D=>D;if(m===0){var A=32-8*y;E=D=>D<<A>>>A,x=E(x)}ut(u,{name:p,Zc:E,ed:(D,q)=>q,dd:ms(p,y,m!==0),gd:null})}function pg(u,p,y){function m(E){var A=(v(),H)[E>>>2>>>0];return E=(v(),H)[E+4>>>2>>>0],new x((v(),P).buffer,E,A)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][p];ut(u>>>=0,{name:y=rt(y>>>0),Zc:m,dd:m},{Id:!0})}var gt=(u,p,y)=>{var m=(v(),G);if(p>>>=0,0<y){var x=p;y=p+y-1;for(var E=0;E<u.length;++E){var A=u.codePointAt(E);if(127>=A){if(p>=y)break;m[p++>>>0]=A}else if(2047>=A){if(p+1>=y)break;m[p++>>>0]=192|A>>6,m[p++>>>0]=128|63&A}else if(65535>=A){if(p+2>=y)break;m[p++>>>0]=224|A>>12,m[p++>>>0]=128|A>>6&63,m[p++>>>0]=128|63&A}else{if(p+3>=y)break;m[p++>>>0]=240|A>>18,m[p++>>>0]=128|A>>12&63,m[p++>>>0]=128|A>>6&63,m[p++>>>0]=128|63&A,E++}}m[p>>>0]=0,u=p-x}else u=0;return u},kr=u=>{for(var p=0,y=0;y<u.length;++y){var m=u.charCodeAt(y);127>=m?p++:2047>=m?p+=2:55296<=m&&57343>=m?(p+=4,++y):p+=3}return p};function cg(u,p){ut(u>>>=0,{name:p=rt(p>>>0),Zc(y){var m=(v(),H)[y>>>2>>>0];return m=Ee(y+4,m,!0),nt(y),m},ed(y,m){m instanceof ArrayBuffer&&(m=new Uint8Array(m));var x=typeof m=="string";if(!(x||ArrayBuffer.isView(m)&&m.BYTES_PER_ELEMENT==1))throw new Zt("Cannot pass non-string to std::string");var E=x?kr(m):m.length,A=nr(4+E+1),D=A+4;return(v(),H)[A>>>2>>>0]=E,x?gt(m,D,E+1):(v(),G).set(m,D>>>0),y!==null&&y.push(nt,A),A},dd:mi,gd(y){nt(y)}})}var ys=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,hg=(u,p,y)=>{if(u>>>=1,16<(p=es((v(),U),u,p/2,y))-u&&ys)return ys.decode((v(),U).slice(u,p));for(y="";u<p;++u){var m=(v(),U)[u>>>0];y+=String.fromCharCode(m)}return y},fg=(u,p,y)=>{if(y??(y=2147483647),2>y)return 0;var m=p;y=(y-=2)<2*u.length?y/2:u.length;for(var x=0;x<y;++x){var E=u.charCodeAt(x);(v(),V)[p>>>1>>>0]=E,p+=2}return(v(),V)[p>>>1>>>0]=0,p-m},mg=u=>2*u.length,gg=(u,p,y)=>{var m="";u>>>=2;for(var x=0;!(x>=p/4);x++){var E=(v(),H)[u+x>>>0];if(!E&&!y)break;m+=String.fromCodePoint(E)}return m},yg=(u,p,y)=>{if(p>>>=0,y??(y=2147483647),4>y)return 0;var m=p;y=m+y-4;for(var x=0;x<u.length;++x){var E=u.codePointAt(x);if(65535<E&&x++,(v(),O)[p>>>2>>>0]=E,(p+=4)+4>y)break}return(v(),O)[p>>>2>>>0]=0,p-m},_g=u=>{for(var p=0,y=0;y<u.length;++y)65535<u.codePointAt(y)&&y++,p+=4;return p};function wg(u,p,y){if(u>>>=0,p>>>=0,y=rt(y>>>=0),p===2)var m=hg,x=fg,E=mg;else m=gg,x=yg,E=_g;ut(u,{name:y,Zc:A=>{var D=(v(),H)[A>>>2>>>0];return D=m(A+4,D*p,!0),nt(A),D},ed:(A,D)=>{if(typeof D!="string")throw new Zt(`Cannot pass non-string to C++ string type ${y}`);var q=E(D),F=nr(4+q+p);return(v(),H)[F>>>2>>>0]=q/p,x(D,F+4,q+p),A!==null&&A.push(nt,F),F},dd:mi,gd(A){nt(A)}})}function bg(u,p){ut(u>>>=0,{Kd:!0,name:p=rt(p>>>0),Zc:()=>{},ed:()=>{}})}function $g(u){Si(u>>>0,!i,1,!r,131072,!1),Fa()}var Ir=u=>{if(!C)try{if(u(),!(0<Re))try{n?Rr()&&Ti(g):Ue(g)}catch(p){p instanceof ge||p=="unwind"||d(0,p)}}catch(p){p instanceof ge||p=="unwind"||d(0,p)}},vg=!Atomics.waitAsync||((Lo=globalThis.navigator)==null?void 0:Lo.userAgent)&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function gi(u){u>>>=0,vg||(Atomics.waitAsync((v(),O),u>>>2,u).value.then(Er),u+=128,Atomics.store((v(),O),u>>>2,1))}var Er=()=>Ir(()=>{var u=Rr();u&&(gi(u),Hs())});function xg(u,p){(u>>>=0)==p>>>0?setTimeout(Er):n?postMessage({md:u,bd:"checkMailbox"}):(u=Ct[u])&&u.postMessage({bd:"checkMailbox"})}var yi=[];function Sg(u,p,y,m,x){for(p>>>=0,x>>>=0,yi.length=0,y=x>>>3,m=x+m>>>3;y<m;){var E;E=(v(),re)[y++>>>0]?(v(),re)[y++>>>0]:(v(),Q)[y++>>>0],yi.push(E)}return(p?Ci[p]:f0[u])(...yi)}var Tg=()=>{Re=0};function kg(u){u>>>=0,n?postMessage({bd:"cleanupThread",Yd:u}):Ha(Ct[u])}function Ig(u){}var Cr=u=>{try{u()}catch(p){W(p)}};function Eg(u){var p=(...y)=>{zr.push(u);try{return u(...y)}finally{C||(zr.pop(),it&&yt===1&&zr.length===0&&(yt=0,Re+=1,Cr(Do),typeof Fibers<"u"&&Fibers.ne()))}};return bs.set(u,p),p}var yt=0,it=null,_s=0,zr=[],_i=new Map,ws=new Map,bs=new Map,Cg=0,wi=null,zg=[],$s=u=>function(p){if(!C){if(yt===0){var y=!1,m=!1;p((x=0)=>{if(!C&&(_s=x,y=!0,m)){yt=2,Cr(()=>No(it)),typeof MainLoop<"u"&&MainLoop.Ed&&MainLoop.resume(),x=!1;try{var E=function(){var q=(v(),O)[it+8>>>2>>>0];return q=ws.get(q),q=bs.get(q),--Re,q()}()}catch(q){E=q,x=!0}var A=!1;if(!it){var D=wi;D&&(wi=null,(x?D.reject:D.resolve)(E),A=!0)}if(x&&!A)throw E}}),m=!0,y||(yt=1,it=function(){var x=nr(65548),E=x+12;if((v(),H)[x>>>2>>>0]=E,(v(),H)[x+4>>>2>>>0]=E+65536,E=zr[0],!_i.has(E)){var A=Cg++;_i.set(E,A),ws.set(A,E)}return E=_i.get(E),(v(),O)[x+8>>>2>>>0]=E,x}(),typeof MainLoop<"u"&&MainLoop.Ed&&MainLoop.pause(),Cr(()=>Mo(it)))}else yt===2?(yt=0,Cr(Po),nt(it),it=null,zg.forEach(Ir)):W(`invalid state: ${yt}`);return _s}}(p=>{u().then(p)});function Ag(u){return u>>>=0,$s(async()=>{var p=await He(u);return je(p)})}var bi=[],Og=u=>{var p=bi.length;return bi.push(u),p},Bg=(u,p)=>{for(var y=Array(u),m=0;m<u;++m){var x=m,E=(v(),H)[p+4*m>>>2>>>0],A=hi[E];if(A===void 0)throw u=`parameter ${m}`,E=Us(E),p=rt(E),nt(E),new Zt(`${u} has unknown type ${p}`);y[x]=A}return y},Rg=(u,p,y)=>{var m=[];return u=u(m,y),m.length&&((v(),H)[p>>>2>>>0]=je(m)),u},Mg={},Ar=u=>{var p=Mg[u];return p===void 0?rt(u):p};function Dg(u,p,y){var[m,...x]=Bg(u,p>>>0);p=m.ed.bind(m);var E=x.map(q=>q.dd.bind(q));u--;var A={toValue:He};switch(u=E.map((q,F)=>{var ae=`argFromPtr${F}`;return A[ae]=q,`${ae}(args${F?"+"+8*F:""})`}),y){case 0:var D="toValue(handle)";break;case 2:D="new (toValue(handle))";break;case 3:D="";break;case 1:A.getStringOrSymbol=Ar,D="toValue(handle)[getStringOrSymbol(methodName)]"}return D+=`(${u})`,m.Kd||(A.toReturnWire=p,A.emval_returnValue=Rg,D=`return emval_returnValue(toReturnWire, destructorsRef, ${D})`),D=`return function (handle, methodName, destructorsRef, args) {
  ${D}
  }`,y=new Function(Object.keys(A),D)(...Object.values(A)),D=`methodCaller<(${x.map(q=>q.name)}) => ${m.name}>`,Og(Object.defineProperty(y,"name",{value:D}))}function Ng(u,p){return p>>>=0,(u=He(u>>>0))==He(p)}function Pg(u){return(u>>>=0)?(u=Ar(u),je(globalThis[u])):je(globalThis)}function Ug(u){return u=Ar(u>>>0),je(t[u])}function Lg(u,p){return p>>>=0,u=He(u>>>0),p=He(p),je(u[p])}function Wg(u){9<(u>>>=0)&&(zt[u+1]+=1)}function vs(u,p,y,m,x){return bi[u>>>0](p>>>0,y>>>0,m>>>0,x>>>0)}function qg(u,p,y,m,x){return vs(u>>>0,p>>>0,y>>>0,m>>>0,x>>>0)}function Vg(){return je([])}function Gg(u){u=He(u>>>0);for(var p=Array(u.length),y=0;y<u.length;y++)p[y]=u[y];return je(p)}function Hg(u){return je(Ar(u>>>0))}function Fg(){return je({})}function jg(u){for(var p=He(u>>>=0);p.length;){var y=p.pop();p.pop()(y)}fi(u)}function Kg(u,p,y){p>>>=0,y>>>=0,u=He(u>>>0),p=He(p),y=He(y),u[p]=y}function Zg(u,p){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),p>>>=0,u=new Date(1e3*u),(v(),O)[p>>>2>>>0]=u.getUTCSeconds(),(v(),O)[p+4>>>2>>>0]=u.getUTCMinutes(),(v(),O)[p+8>>>2>>>0]=u.getUTCHours(),(v(),O)[p+12>>>2>>>0]=u.getUTCDate(),(v(),O)[p+16>>>2>>>0]=u.getUTCMonth(),(v(),O)[p+20>>>2>>>0]=u.getUTCFullYear()-1900,(v(),O)[p+24>>>2>>>0]=u.getUTCDay(),u=(u.getTime()-Date.UTC(u.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(v(),O)[p+28>>>2>>>0]=u}var xs=u=>u%4==0&&(u%100!=0||u%400==0),Ss=[0,31,60,91,121,152,182,213,244,274,305,335],Ts=[0,31,59,90,120,151,181,212,243,273,304,334];function Xg(u,p){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),p>>>=0,u=new Date(1e3*u),(v(),O)[p>>>2>>>0]=u.getSeconds(),(v(),O)[p+4>>>2>>>0]=u.getMinutes(),(v(),O)[p+8>>>2>>>0]=u.getHours(),(v(),O)[p+12>>>2>>>0]=u.getDate(),(v(),O)[p+16>>>2>>>0]=u.getMonth(),(v(),O)[p+20>>>2>>>0]=u.getFullYear()-1900,(v(),O)[p+24>>>2>>>0]=u.getDay();var y=(xs(u.getFullYear())?Ss:Ts)[u.getMonth()]+u.getDate()-1|0;(v(),O)[p+28>>>2>>>0]=y,(v(),O)[p+36>>>2>>>0]=-60*u.getTimezoneOffset(),y=new Date(u.getFullYear(),6,1).getTimezoneOffset();var m=new Date(u.getFullYear(),0,1).getTimezoneOffset();u=0|(y!=m&&u.getTimezoneOffset()==Math.min(m,y)),(v(),O)[p+32>>>2>>>0]=u}function Yg(u){u>>>=0;var p=new Date((v(),O)[u+20>>>2>>>0]+1900,(v(),O)[u+16>>>2>>>0],(v(),O)[u+12>>>2>>>0],(v(),O)[u+8>>>2>>>0],(v(),O)[u+4>>>2>>>0],(v(),O)[u>>>2>>>0],0),y=(v(),O)[u+32>>>2>>>0],m=p.getTimezoneOffset(),x=new Date(p.getFullYear(),6,1).getTimezoneOffset(),E=new Date(p.getFullYear(),0,1).getTimezoneOffset(),A=Math.min(E,x);return 0>y?(v(),O)[u+32>>>2>>>0]=+(x!=E&&A==m):0<y!=(A==m)&&(x=Math.max(E,x),p.setTime(p.getTime()+6e4*((0<y?A:x)-m))),(v(),O)[u+24>>>2>>>0]=p.getDay(),y=(xs(p.getFullYear())?Ss:Ts)[p.getMonth()]+p.getDate()-1|0,(v(),O)[u+28>>>2>>>0]=y,(v(),O)[u>>>2>>>0]=p.getSeconds(),(v(),O)[u+4>>>2>>>0]=p.getMinutes(),(v(),O)[u+8>>>2>>>0]=p.getHours(),(v(),O)[u+12>>>2>>>0]=p.getDate(),(v(),O)[u+16>>>2>>>0]=p.getMonth(),(v(),O)[u+20>>>2>>>0]=p.getYear(),u=p.getTime(),BigInt(isNaN(u)?-1:u/1e3)}function ks(u,p,y,m,x,E,A){return n?fe(16,1,u,p,y,m,x,E,A):-52}function Is(u,p,y,m,x,E){if(n)return fe(17,1,u,p,y,m,x,E)}var ir={},Qg=()=>performance.timeOrigin+performance.now();function Es(u,p){if(n)return fe(18,1,u,p);if(ir[u]&&(clearTimeout(ir[u].id),delete ir[u]),!p)return 0;var y=setTimeout(()=>{delete ir[u],Ir(()=>Gs(u,performance.timeOrigin+performance.now()))},p);return ir[u]={id:y,me:p},0}function Jg(u,p,y,m){u>>>=0,p>>>=0,y>>>=0,m>>>=0;var x=new Date().getFullYear(),E=new Date(x,0,1).getTimezoneOffset();x=new Date(x,6,1).getTimezoneOffset();var A=Math.max(E,x);(v(),H)[u>>>2>>>0]=60*A,(v(),O)[p>>>2>>>0]=+(E!=x),u=(p=D=>{var q=Math.abs(D);return`UTC${0<=D?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`})(E),p=p(x),x<E?(gt(u,y,17),gt(p,m,17)):(gt(u,m,17),gt(p,y,17))}var e0=()=>Date.now();function t0(u,p,y){return y>>>=0,0<=u&&3>=u?(u===0?u=Date.now():u=performance.timeOrigin+performance.now(),u=Math.round(1e6*u),(v(),re)[y>>>3>>>0]=BigInt(u),0):28}var $i=[],Cs=(u,p)=>{$i.length=0;for(var y;y=(v(),G)[u++>>>0];){var m=y!=105;p+=(m&=y!=112)&&p%8?4:0,$i.push(y==112?(v(),H)[p>>>2>>>0]:y==106?(v(),re)[p>>>3>>>0]:y==105?(v(),O)[p>>>2>>>0]:(v(),Q)[p>>>3>>>0]),p+=m?8:4}return $i};function r0(u,p,y){return u>>>=0,p=Cs(p>>>0,y>>>0),Ci[u](...p)}function i0(u,p,y){return u>>>=0,p=Cs(p>>>0,y>>>0),Ci[u](...p)}var n0=()=>{};function a0(u,p){return k(Ee(u>>>0,p>>>0))}var s0=()=>{throw Re+=1,"unwind"};function o0(){return 4294901760}var u0=()=>navigator.hardwareConcurrency,At={},Or=u=>{var p;return(p=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(u))?+p[1]:(p=/:(\d+):\d+(?:\)|$)/.exec(u))?2147483648|+p[1]:0},zs=u=>{for(var p of u)(u=Or(p))&&(At[u]=p)};function l0(){var u=Error().stack.toString().split(`
`);return u[0]=="Error"&&u.shift(),zs(u),At.sd=Or(u[3]),At.Ud=u,At.sd}function Br(u){if(!(u=At[u>>>0]))return 0;var p;if(p=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(u))u=p[1];else if(p=/^\s+at (.*) \(.*\)$/.exec(u))u=p[1];else{if(!(p=/^(.+?)@/.exec(u)))return 0;u=p[1]}nt(Br.td??0),p=kr(u)+1;var y=nr(p);return y&&gt(u,y,p),Br.td=y,Br.td}function d0(u){u>>>=0;var p=(v(),G).length;if(u<=p||4294901760<u)return!1;for(var y=1;4>=y;y*=2){var m=p*(1+.2/y);m=Math.min(m,u+100663296);e:{m=(Math.min(4294901760,65536*Math.ceil(Math.max(u,m)/65536))-mt.buffer.byteLength+65535)/65536|0;try{mt.grow(m),K();var x=1;break e}catch{}x=void 0}if(x)return!0}return!1}function p0(u,p,y){if(u>>>=0,p>>>=0,At.sd==u)var m=At.Ud;else(m=Error().stack.toString().split(`
`))[0]=="Error"&&m.shift(),zs(m);for(var x=3;m[x]&&Or(m[x])!=u;)++x;for(u=0;u<y&&m[u+x];++u)(v(),O)[p+4*u>>>2>>>0]=Or(m[u+x]);return u}var vi,xi={},As=()=>{var m;if(!vi){var u,p={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(((m=globalThis.navigator)==null?void 0:m.language)??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(u in xi)xi[u]===void 0?delete p[u]:p[u]=xi[u];var y=[];for(u in p)y.push(`${u}=${p[u]}`);vi=y}return vi};function Os(u,p){if(n)return fe(19,1,u,p);u>>>=0,p>>>=0;var y,m=0,x=0;for(y of As()){var E=p+m;(v(),H)[u+x>>>2>>>0]=E,m+=gt(y,E,1/0)+1,x+=4}return 0}function Bs(u,p){if(n)return fe(20,1,u,p);u>>>=0,p>>>=0;var y=As();for(var m of((v(),H)[u>>>2>>>0]=y.length,u=0,y))u+=kr(m)+1;return(v(),H)[p>>>2>>>0]=u,0}function Rs(u){return n?fe(21,1,u):52}function Ms(u,p,y,m,x){return n?fe(22,1,u,p,y,m,x):52}function Ds(u,p,y,m){return n?fe(23,1,u,p,y,m):52}function Ns(u,p,y,m){return n?fe(24,1,u,p,y,m):70}var c0=[null,[],[]];function Ps(u,p,y,m){if(n)return fe(25,1,u,p,y,m);p>>>=0,y>>>=0,m>>>=0;for(var x=0,E=0;E<y;E++){var A=(v(),H)[p>>>2>>>0],D=(v(),H)[p+4>>>2>>>0];p+=8;for(var q=0;q<D;q++){var F=u,ae=(v(),G)[A+q>>>0],de=c0[F];ae===0||ae===10?((F===1?I:k)(ts(de)),de.length=0):de.push(ae)}x+=D}return(v(),H)[m>>>2>>>0]=x,0}function h0(u){return u>>>0}n||function(){for(var u=t.numThreads-1;u--;)Ka();Be.push(async()=>{var p=async function(){if(!n)return Promise.all(tt.map(ja))}();kt++,await p,--kt==0&&It&&(p=It,It=null,p())})}(),n||(mt=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),K()),t.wasmBinary&&(f=t.wasmBinary),t.stackSave=()=>oe(),t.stackRestore=u=>se(u),t.stackAlloc=u=>ki(u),t.setValue=function(u,p,y="i8"){switch(y.endsWith("*")&&(y="*"),y){case"i1":case"i8":(v(),P)[u>>>0]=p;break;case"i16":(v(),V)[u>>>1>>>0]=p;break;case"i32":(v(),O)[u>>>2>>>0]=p;break;case"i64":(v(),re)[u>>>3>>>0]=BigInt(p);break;case"float":(v(),Y)[u>>>2>>>0]=p;break;case"double":(v(),Q)[u>>>3>>>0]=p;break;case"*":(v(),H)[u>>>2>>>0]=p;break;default:W(`invalid type for setValue: ${y}`)}},t.getValue=function(u,p="i8"){switch(p.endsWith("*")&&(p="*"),p){case"i1":case"i8":return(v(),P)[u>>>0];case"i16":return(v(),V)[u>>>1>>>0];case"i32":return(v(),O)[u>>>2>>>0];case"i64":return(v(),re)[u>>>3>>>0];case"float":return(v(),Y)[u>>>2>>>0];case"double":return(v(),Q)[u>>>3>>>0];case"*":return(v(),H)[u>>>2>>>0];default:W(`invalid type for getValue: ${p}`)}},t.UTF8ToString=Ee,t.stringToUTF8=gt,t.lengthBytesUTF8=kr;var Us,Ls,Rr,nt,nr,Si,Ws,qs,Vs,Ti,Gs,Hs,ue,ar,Fs,se,ki,oe,js,Ii,Ks,Zs,Xs,Ei,Ys,Qs,Js,eo,to,ro,io,no,ao,so,oo,uo,lo,po,co,ho,fo,mo,go,yo,_o,wo,bo,$o,vo,xo,So,To,ko,Io,Eo,Co,zo,Ao,Oo,Bo,Ro,Mo,Do,No,Po,lt,f0=[Ie,Se,Ya,rs,is,ns,as,ss,os,us,ls,ds,ps,cs,hs,fs,ks,Is,Es,Os,Bs,Rs,Ms,Ds,Ns,Ps],Ci={1124124:(u,p,y,m,x)=>{if(t===void 0||!t.jd)return 1;if((u=Ee(Number(u>>>0))).startsWith("./")&&(u=u.substring(2)),!(u=t.jd.get(u)))return 2;if(p=Number(p>>>0),y=Number(y>>>0),m=Number(m>>>0),p+y>u.byteLength)return 3;try{let E=u.subarray(p,p+y);switch(x){case 0:(v(),G).set(E,m>>>0);break;case 1:t.ae?t.ae(m,E):t.Td(m,E);break;default:return 4}return 0}catch{return 4}},1124948:()=>typeof navigator<"u"&&navigator.de?1:0,1125020:(u,p,y)=>{t.Dd(u,(v(),G).subarray(p>>>0,p+y>>>0))},1125084:()=>t.ce(),1125126:u=>{t.Cd(u)},1125163:()=>{t.Md()},1125194:()=>{t.Nd()},1125223:()=>{t.Rd()},1125248:u=>t.Ld(u),1125281:u=>t.Pd(u),1125313:(u,p,y)=>{t.rd(Number(u),Number(p),Number(y),!0)},1125376:(u,p,y)=>{t.rd(Number(u),Number(p),Number(y))},1125433:()=>typeof wasmOffsetConverter<"u",1125490:u=>{t.ic("Abs",u,void 0)},1125541:u=>{t.ic("Neg",u,void 0)},1125592:u=>{t.ic("Floor",u,void 0)},1125645:u=>{t.ic("Ceil",u,void 0)},1125697:u=>{t.ic("Reciprocal",u,void 0)},1125755:u=>{t.ic("Sqrt",u,void 0)},1125807:u=>{t.ic("Exp",u,void 0)},1125858:u=>{t.ic("Erf",u,void 0)},1125909:u=>{t.ic("Sigmoid",u,void 0)},1125964:(u,p,y)=>{t.ic("HardSigmoid",u,{alpha:p,beta:y})},1126043:u=>{t.ic("HardSwish",u,void 0)},1126100:u=>{t.ic("Log",u,void 0)},1126151:u=>{t.ic("Sin",u,void 0)},1126202:u=>{t.ic("Cos",u,void 0)},1126253:u=>{t.ic("Tan",u,void 0)},1126304:u=>{t.ic("Asin",u,void 0)},1126356:u=>{t.ic("Acos",u,void 0)},1126408:u=>{t.ic("Atan",u,void 0)},1126460:u=>{t.ic("Sinh",u,void 0)},1126512:u=>{t.ic("Cosh",u,void 0)},1126564:u=>{t.ic("Asinh",u,void 0)},1126617:u=>{t.ic("Acosh",u,void 0)},1126670:u=>{t.ic("Atanh",u,void 0)},1126723:u=>{t.ic("Tanh",u,void 0)},1126775:u=>{t.ic("Not",u,void 0)},1126826:(u,p,y)=>{t.ic("Clip",u,{min:p,max:y})},1126895:u=>{t.ic("Clip",u,void 0)},1126947:(u,p)=>{t.ic("Elu",u,{alpha:p})},1127005:u=>{t.ic("Gelu",u,void 0)},1127057:u=>{t.ic("Relu",u,void 0)},1127109:(u,p)=>{t.ic("LeakyRelu",u,{alpha:p})},1127173:(u,p)=>{t.ic("ThresholdedRelu",u,{alpha:p})},1127243:(u,p)=>{t.ic("Cast",u,{to:p})},1127301:u=>{t.ic("Add",u,void 0)},1127352:u=>{t.ic("Sub",u,void 0)},1127403:u=>{t.ic("Mul",u,void 0)},1127454:u=>{t.ic("Div",u,void 0)},1127505:u=>{t.ic("Pow",u,void 0)},1127556:u=>{t.ic("Equal",u,void 0)},1127609:u=>{t.ic("Greater",u,void 0)},1127664:u=>{t.ic("GreaterOrEqual",u,void 0)},1127726:u=>{t.ic("Less",u,void 0)},1127778:u=>{t.ic("LessOrEqual",u,void 0)},1127837:(u,p,y,m,x)=>{t.ic("ReduceMean",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128012:(u,p,y,m,x)=>{t.ic("ReduceMax",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128186:(u,p,y,m,x)=>{t.ic("ReduceMin",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128360:(u,p,y,m,x)=>{t.ic("ReduceProd",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128535:(u,p,y,m,x)=>{t.ic("ReduceSum",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128709:(u,p,y,m,x)=>{t.ic("ReduceL1",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1128882:(u,p,y,m,x)=>{t.ic("ReduceL2",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1129055:(u,p,y,m,x)=>{t.ic("ReduceLogSum",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1129232:(u,p,y,m,x)=>{t.ic("ReduceSumSquare",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1129412:(u,p,y,m,x)=>{t.ic("ReduceLogSumExp",u,{keepDims:!!p,noopWithEmptyAxes:!!y,axes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1129592:u=>{t.ic("Where",u,void 0)},1129645:(u,p,y)=>{t.ic("Transpose",u,{perm:p?Array.from((v(),O).subarray(Number(p)>>>0,Number(y)>>>0)):[]})},1129769:(u,p,y,m)=>{t.ic("DepthToSpace",u,{blocksize:p,mode:Ee(y),format:m?"NHWC":"NCHW"})},1129902:(u,p,y,m)=>{t.ic("DepthToSpace",u,{blocksize:p,mode:Ee(y),format:m?"NHWC":"NCHW"})},1130035:(u,p,y,m)=>{t.ic("DFT",u,{axis:p,inverse:y,onesided:m})},1130127:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve,_t)=>{t.ic("ConvTranspose",u,{format:q?"NHWC":"NCHW",autoPad:p,dilations:[y],group:m,kernelShape:[x],pads:[E,A],strides:[D],wIsConst:()=>!!(v(),P)[F>>>0],outputPadding:ae?Array.from((v(),O).subarray(Number(ae)>>>0,Number(de)>>>0)):[],outputShape:be?Array.from((v(),O).subarray(Number(be)>>>0,Number(ve)>>>0)):[],activation:Ee(_t)})},1130560:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("ConvTranspose",u,{format:D?"NHWC":"NCHW",autoPad:p,dilations:Array.from((v(),O).subarray(Number(y)>>>0,(Number(y)>>>0)+2>>>0)),group:m,kernelShape:Array.from((v(),O).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((v(),O).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((v(),O).subarray(Number(A)>>>0,(Number(A)>>>0)+2>>>0)),wIsConst:()=>!!(v(),P)[q>>>0],outputPadding:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],outputShape:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[],activation:Ee(ve)})},1131221:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve,_t)=>{t.ic("ConvTranspose",u,{format:q?"NHWC":"NCHW",autoPad:p,dilations:[y],group:m,kernelShape:[x],pads:[E,A],strides:[D],wIsConst:()=>!!(v(),P)[F>>>0],outputPadding:ae?Array.from((v(),O).subarray(Number(ae)>>>0,Number(de)>>>0)):[],outputShape:be?Array.from((v(),O).subarray(Number(be)>>>0,Number(ve)>>>0)):[],activation:Ee(_t)})},1131654:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("ConvTranspose",u,{format:D?"NHWC":"NCHW",autoPad:p,dilations:Array.from((v(),O).subarray(Number(y)>>>0,(Number(y)>>>0)+2>>>0)),group:m,kernelShape:Array.from((v(),O).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((v(),O).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((v(),O).subarray(Number(A)>>>0,(Number(A)>>>0)+2>>>0)),wIsConst:()=>!!(v(),P)[q>>>0],outputPadding:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],outputShape:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[],activation:Ee(ve)})},1132315:(u,p)=>{t.ic("GlobalAveragePool",u,{format:p?"NHWC":"NCHW"})},1132406:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("AveragePool",u,{format:ve?"NHWC":"NCHW",auto_pad:p,ceil_mode:y,count_include_pad:m,storage_order:x,dilations:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[],kernel_shape:D?Array.from((v(),O).subarray(Number(D)>>>0,Number(q)>>>0)):[],pads:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],strides:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[]})},1132885:(u,p)=>{t.ic("GlobalAveragePool",u,{format:p?"NHWC":"NCHW"})},1132976:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("AveragePool",u,{format:ve?"NHWC":"NCHW",auto_pad:p,ceil_mode:y,count_include_pad:m,storage_order:x,dilations:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[],kernel_shape:D?Array.from((v(),O).subarray(Number(D)>>>0,Number(q)>>>0)):[],pads:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],strides:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[]})},1133455:(u,p)=>{t.ic("GlobalMaxPool",u,{format:p?"NHWC":"NCHW"})},1133542:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("MaxPool",u,{format:ve?"NHWC":"NCHW",auto_pad:p,ceil_mode:y,count_include_pad:m,storage_order:x,dilations:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[],kernel_shape:D?Array.from((v(),O).subarray(Number(D)>>>0,Number(q)>>>0)):[],pads:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],strides:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[]})},1134017:(u,p)=>{t.ic("GlobalMaxPool",u,{format:p?"NHWC":"NCHW"})},1134104:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve)=>{t.ic("MaxPool",u,{format:ve?"NHWC":"NCHW",auto_pad:p,ceil_mode:y,count_include_pad:m,storage_order:x,dilations:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[],kernel_shape:D?Array.from((v(),O).subarray(Number(D)>>>0,Number(q)>>>0)):[],pads:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],strides:de?Array.from((v(),O).subarray(Number(de)>>>0,Number(be)>>>0)):[]})},1134579:(u,p,y,m,x)=>{t.ic("Gemm",u,{alpha:p,beta:y,transA:m,transB:x})},1134683:u=>{t.ic("MatMul",u,void 0)},1134737:(u,p,y,m)=>{t.ic("ArgMax",u,{keepDims:!!p,selectLastIndex:!!y,axis:m})},1134845:(u,p,y,m)=>{t.ic("ArgMin",u,{keepDims:!!p,selectLastIndex:!!y,axis:m})},1134953:(u,p)=>{t.ic("Softmax",u,{axis:p})},1135016:(u,p)=>{t.ic("Concat",u,{axis:p})},1135076:(u,p,y,m,x)=>{t.ic("Split",u,{axis:p,numOutputs:y,splitSizes:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1135232:u=>{t.ic("Expand",u,void 0)},1135286:(u,p)=>{t.ic("Gather",u,{axis:Number(p)})},1135357:(u,p)=>{t.ic("GatherElements",u,{axis:Number(p)})},1135436:(u,p)=>{t.ic("GatherND",u,{batch_dims:Number(p)})},1135515:(u,p,y,m,x,E,A,D,q,F,ae)=>{t.ic("Resize",u,{antialias:p,axes:y?Array.from((v(),O).subarray(Number(y)>>>0,Number(m)>>>0)):[],coordinateTransformMode:Ee(x),cubicCoeffA:E,excludeOutside:A,extrapolationValue:D,keepAspectRatioPolicy:Ee(q),mode:Ee(F),nearestMode:Ee(ae)})},1135877:(u,p,y,m,x,E,A)=>{t.ic("Slice",u,{starts:p?Array.from((v(),O).subarray(Number(p)>>>0,Number(y)>>>0)):[],ends:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[],axes:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[]})},1136141:u=>{t.ic("Tile",u,void 0)},1136193:(u,p,y)=>{t.ic("InstanceNormalization",u,{epsilon:p,format:y?"NHWC":"NCHW"})},1136307:(u,p,y)=>{t.ic("InstanceNormalization",u,{epsilon:p,format:y?"NHWC":"NCHW"})},1136421:u=>{t.ic("Range",u,void 0)},1136474:(u,p)=>{t.ic("Einsum",u,{equation:Ee(p)})},1136555:(u,p,y,m,x)=>{t.ic("Pad",u,{mode:p,value:y,pads:m?Array.from((v(),O).subarray(Number(m)>>>0,Number(x)>>>0)):[]})},1136698:(u,p,y,m,x,E)=>{t.ic("BatchNormalization",u,{epsilon:p,momentum:y,spatial:!!x,trainingMode:!!m,format:E?"NHWC":"NCHW"})},1136867:(u,p,y,m,x,E)=>{t.ic("BatchNormalization",u,{epsilon:p,momentum:y,spatial:!!x,trainingMode:!!m,format:E?"NHWC":"NCHW"})},1137036:(u,p,y)=>{t.ic("CumSum",u,{exclusive:Number(p),reverse:Number(y)})},1137133:(u,p,y)=>{t.ic("DequantizeLinear",u,{axis:p,blockSize:y})},1137223:(u,p,y,m,x)=>{t.ic("GridSample",u,{align_corners:p,mode:Ee(y),padding_mode:Ee(m),format:x?"NHWC":"NCHW"})},1137393:(u,p,y,m,x)=>{t.ic("GridSample",u,{align_corners:p,mode:Ee(y),padding_mode:Ee(m),format:x?"NHWC":"NCHW"})},1137563:(u,p)=>{t.ic("ScatterND",u,{reduction:Ee(p)})},1137648:(u,p,y,m,x,E,A,D,q)=>{t.ic("Attention",u,{numHeads:p,isUnidirectional:y,maskFilterValue:m,scale:x,doRotary:E,qkvHiddenSizes:A?Array.from((v(),O).subarray(Number(D)>>>0,Number(D)+A>>>0)):[],pastPresentShareBuffer:!!q})},1137920:u=>{t.ic("BiasAdd",u,void 0)},1137975:u=>{t.ic("BiasSplitGelu",u,void 0)},1138036:u=>{t.ic("FastGelu",u,void 0)},1138092:(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve,_t,zi)=>{t.ic("Conv",u,{format:de?"NHWC":"NCHW",auto_pad:p,dilations:y?Array.from((v(),O).subarray(Number(y)>>>0,Number(m)>>>0)):[],group:x,kernel_shape:E?Array.from((v(),O).subarray(Number(E)>>>0,Number(A)>>>0)):[],pads:D?Array.from((v(),O).subarray(Number(D)>>>0,Number(q)>>>0)):[],strides:F?Array.from((v(),O).subarray(Number(F)>>>0,Number(ae)>>>0)):[],w_is_const:()=>!!(v(),P)[Number(be)>>>0],activation:Ee(ve),activation_params:_t?Array.from((v(),Y).subarray(Number(_t)>>>0,Number(zi)>>>0)):[]})},1138676:u=>{t.ic("Gelu",u,void 0)},1138728:(u,p,y,m,x,E,A,D,q)=>{t.ic("GroupQueryAttention",u,{numHeads:p,kvNumHeads:y,scale:m,softcap:x,doRotary:E,rotaryInterleaved:A,smoothSoftmax:D,localWindowSize:q})},1138945:(u,p,y,m)=>{t.ic("LayerNormalization",u,{axis:p,epsilon:y,simplified:!!m})},1139056:(u,p,y,m)=>{t.ic("LayerNormalization",u,{axis:p,epsilon:y,simplified:!!m})},1139167:(u,p,y,m,x,E)=>{t.ic("MatMulNBits",u,{k:p,n:y,accuracyLevel:m,bits:x,blockSize:E})},1139294:(u,p,y,m,x,E)=>{t.ic("MultiHeadAttention",u,{numHeads:p,isUnidirectional:y,maskFilterValue:m,scale:x,doRotary:E})},1139453:(u,p)=>{t.ic("QuickGelu",u,{alpha:p})},1139517:(u,p,y,m,x)=>{t.ic("RotaryEmbedding",u,{interleaved:!!p,numHeads:y,rotaryEmbeddingDim:m,scale:x})},1139656:(u,p,y)=>{t.ic("SkipLayerNormalization",u,{epsilon:p,simplified:!!y})},1139758:(u,p,y)=>{t.ic("SkipLayerNormalization",u,{epsilon:p,simplified:!!y})},1139860:(u,p,y,m)=>{t.ic("GatherBlockQuantized",u,{gatherAxis:p,quantizeAxis:y,blockSize:m})},1139981:u=>{t.Qd(u)},1140015:(u,p)=>t.Sd(Number(u),Number(p),t.hd.Vd,t.hd.errors)};function m0(u,p,y){return $s(async()=>{await t.Od(Number(u),Number(p),Number(y))})}function g0(){return typeof wasmOffsetConverter<"u"}function y0(u,p,y,m){var x=oe();try{return ao(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function _0(u,p,y){var m=oe();try{return io(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;ue(1,0)}}function w0(u){var p=oe();try{to(u)}catch(y){if(se(p),y!==y+0)throw y;ue(1,0)}}function b0(u,p){var y=oe();try{return Ei(u,p)}catch(m){if(se(y),m!==m+0)throw m;ue(1,0)}}function $0(u,p,y){var m=oe();try{Xs(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;ue(1,0)}}function v0(u,p,y,m){var x=oe();try{return po(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function x0(u,p){var y=oe();try{so(u,p)}catch(m){if(se(y),m!==m+0)throw m;ue(1,0)}}function S0(u,p,y,m,x,E,A){var D=oe();try{return no(u,p,y,m,x,E,A)}catch(q){if(se(D),q!==q+0)throw q;ue(1,0)}}function T0(u,p,y,m,x,E){var A=oe();try{Ys(u,p,y,m,x,E)}catch(D){if(se(A),D!==D+0)throw D;ue(1,0)}}function k0(u,p,y,m){var x=oe();try{Js(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function I0(u,p,y,m,x){var E=oe();try{ro(u,p,y,m,x)}catch(A){if(se(E),A!==A+0)throw A;ue(1,0)}}function E0(u,p,y,m,x,E,A){var D=oe();try{uo(u,p,y,m,x,E,A)}catch(q){if(se(D),q!==q+0)throw q;ue(1,0)}}function C0(u,p,y,m,x,E,A){var D=oe();try{lo(u,p,y,m,x,E,A)}catch(q){if(se(D),q!==q+0)throw q;ue(1,0)}}function z0(u,p,y,m,x,E,A,D){var q=oe();try{mo(u,p,y,m,x,E,A,D)}catch(F){if(se(q),F!==F+0)throw F;ue(1,0)}}function A0(u,p,y,m,x){var E=oe();try{return oo(u,p,y,m,x)}catch(A){if(se(E),A!==A+0)throw A;ue(1,0)}}function O0(u,p,y){var m=oe();try{return eo(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;ue(1,0)}}function B0(u,p,y,m,x,E,A,D){var q=oe();try{go(u,p,y,m,x,E,A,D)}catch(F){if(se(q),F!==F+0)throw F;ue(1,0)}}function R0(u,p,y,m,x,E,A,D,q,F,ae,de){var be=oe();try{co(u,p,y,m,x,E,A,D,q,F,ae,de)}catch(ve){if(se(be),ve!==ve+0)throw ve;ue(1,0)}}function M0(u,p,y){var m=oe();try{return yo(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;return ue(1,0),0n}}function D0(u,p,y,m,x,E,A,D,q){var F=oe();try{Qs(u,p,y,m,x,E,A,D,q)}catch(ae){if(se(F),ae!==ae+0)throw ae;ue(1,0)}}function N0(u){var p=oe();try{return _o(u)}catch(y){if(se(p),y!==y+0)throw y;ue(1,0)}}function P0(u,p){var y=oe();try{return Bo(u,p)}catch(m){if(se(y),m!==m+0)throw m;return ue(1,0),0n}}function U0(u,p,y,m){var x=oe();try{return wo(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function L0(u,p,y,m,x,E,A){var D=oe();try{Ro(u,p,y,m,x,E,A)}catch(q){if(se(D),q!==q+0)throw q;ue(1,0)}}function W0(u){var p=oe();try{return bo(u)}catch(y){if(se(p),y!==y+0)throw y;return ue(1,0),0n}}function q0(u,p,y,m,x){var E=oe();try{return ko(u,p,y,m,x)}catch(A){if(se(E),A!==A+0)throw A;ue(1,0)}}function V0(u,p,y,m,x,E){var A=oe();try{return Io(u,p,y,m,x,E)}catch(D){if(se(A),D!==D+0)throw D;ue(1,0)}}function G0(u,p,y,m,x,E){var A=oe();try{return ho(u,p,y,m,x,E)}catch(D){if(se(A),D!==D+0)throw D;ue(1,0)}}function H0(u,p,y,m,x,E){var A=oe();try{return Eo(u,p,y,m,x,E)}catch(D){if(se(A),D!==D+0)throw D;ue(1,0)}}function F0(u,p,y,m,x,E,A,D){var q=oe();try{return fo(u,p,y,m,x,E,A,D)}catch(F){if(se(q),F!==F+0)throw F;ue(1,0)}}function j0(u,p,y,m,x){var E=oe();try{return Co(u,p,y,m,x)}catch(A){if(se(E),A!==A+0)throw A;return ue(1,0),0n}}function K0(u,p,y,m){var x=oe();try{return zo(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function Z0(u,p,y,m){var x=oe();try{return Ao(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function X0(u,p,y,m,x,E,A,D,q,F,ae,de){var be=oe();try{return Oo(u,p,y,m,x,E,A,D,q,F,ae,de)}catch(ve){if(se(be),ve!==ve+0)throw ve;ue(1,0)}}function Y0(u,p,y,m,x,E,A,D,q,F,ae){var de=oe();try{So(u,p,y,m,x,E,A,D,q,F,ae)}catch(be){if(se(de),be!==be+0)throw be;ue(1,0)}}function Q0(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve,_t,zi){var ry=oe();try{To(u,p,y,m,x,E,A,D,q,F,ae,de,be,ve,_t,zi)}catch(Ai){if(se(ry),Ai!==Ai+0)throw Ai;ue(1,0)}}function J0(u,p,y){var m=oe();try{return $o(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;ue(1,0)}}function ey(u,p,y){var m=oe();try{return vo(u,p,y)}catch(x){if(se(m),x!==x+0)throw x;ue(1,0)}}function ty(u,p,y,m){var x=oe();try{xo(u,p,y,m)}catch(E){if(se(x),E!==E+0)throw E;ue(1,0)}}function Mr(){if(0<kt)It=Mr;else if(n)b==null||b(t),ee();else{for(var u=Be;0<u.length;)u.shift()(t);0<kt?It=Mr:(t.calledRun=!0,C||(ee(),b==null||b(t)))}}return n||(lt=await $e(),Mr()),t.PTR_SIZE=4,M?t:new Promise((u,p)=>{b=u,S=p})}var uc,qo,zy=L(()=>{"use strict";var e,t;uc=Wo,qo=(t=(e=globalThis.self)==null?void 0:e.name)==null?void 0:t.startsWith("em-pthread"),qo&&Wo()}),Ui,Pn,Vo,Le,lc,Nr,Go,Ho,Li,Fo,Wi,dc,qi,pc,ha=L(()=>{"use strict";ca(),Ui=typeof location>"u"?void 0:location.origin,Pn=import.meta.url>"file:"&&import.meta.url<"file;",Vo=()=>{if(Pn){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,Ui).href}return import.meta.url},Le=Vo(),lc=()=>{if(Le&&!Le.startsWith("blob:"))return Le.substring(0,Le.lastIndexOf("/")+1)},Nr=(e,t)=>{try{let r=t??Le;return(r?new URL(e,r):new URL(e)).origin===Ui}catch{return!1}},Go=(e,t)=>{let r=t??Le;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Ho=(e,t)=>`${t??"./"}${e}`,Li=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},Fo=async e=>(await import(e)).default,Wi=(Cy(),$r(ac)).default,dc=async()=>{if(!Le)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Nr(Le))return[void 0,Wi()];let e=await Li(Le);return[e,Wi(e)]},qi=(zy(),$r(oc)).default,pc=async(e,t,r,i)=>{let n=qi&&!(e||t);if(n)if(Le)n=Nr(Le)||i&&!r;else if(i&&!r)n=!0;else throw new Error("cannot determine the script source URL.");if(n)return[void 0,qi];{let a="ort-wasm-simd-threaded.jsep.mjs",s=e??Go(a,t),o=r&&s&&!Nr(s,t),l=o?await Li(s):s??Ho(a,t);return[o?l:void 0,await Fo(l)]}}}),Vi,Pr,sr,Gi,jo,Ko,Zo,fa,ye,Ft=L(()=>{"use strict";ha(),Pr=!1,sr=!1,Gi=!1,jo=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Ko=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Zo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},fa=async e=>{if(Pr)return Promise.resolve();if(sr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Gi)throw new Error("previous call to 'initializeWebAssembly()' failed.");sr=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Zo())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Ko())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=jo();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let n=e.wasmPaths,a=typeof n=="string"?n:void 0,s=n==null?void 0:n.mjs,o=(s==null?void 0:s.href)??s,l=n==null?void 0:n.wasm,d=(l==null?void 0:l.href)??l,c=e.wasmBinary,[h,f]=await pc(o,a,r>1,!!c||!!d),_=!1,g=[];if(t>0&&g.push(new Promise(b=>{setTimeout(()=>{_=!0,b()},t)})),g.push(new Promise((b,S)=>{let $={numThreads:r};if(c)$.wasmBinary=c,$.locateFile=w=>w;else if(d||a)$.locateFile=w=>d??a+w;else if(o&&o.indexOf("blob:")!==0)$.locateFile=w=>new URL(w,o).href;else if(h){let w=lc();w&&($.locateFile=T=>w+T)}f($).then(w=>{sr=!1,Pr=!0,Vi=w,b(),h&&URL.revokeObjectURL(h)},w=>{sr=!1,Gi=!0,S(w)})})),await Promise.race(g),_)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},ye=()=>{if(Pr&&Vi)return Vi;throw new Error("WebAssembly is not initialized yet.")}}),Je,Jr,ce,ma=L(()=>{"use strict";Ft(),Je=(e,t)=>{let r=ye(),i=r.lengthBytesUTF8(e)+1,n=r._malloc(i);return r.stringToUTF8(e,n,i),t.push(n),n},Jr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([n,a])=>{let s=t?t+n:n;if(typeof a=="object")Jr(a,s+".",r,i);else if(typeof a=="string"||typeof a=="number")i(s,a.toString());else if(typeof a=="boolean")i(s,a?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof a}`)})},ce=e=>{let t=ye(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetLastError(n,n+i);let a=Number(t.getValue(n,i===4?"i32":"i64")),s=t.getValue(n+i,"*"),o=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${a}, ERROR_MESSAGE: ${o}`)}finally{t.stackRestore(r)}}}),cc,Ay=L(()=>{"use strict";Ft(),ma(),cc=(e,t)=>{let r=ye(),i=0,n=[],a=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(a.terminate=!1);let s=0;(e==null?void 0:e.tag)!==void 0&&(s=Je(e.tag,n)),i=r._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,s),i===0&&ce("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&Jr(e.extra,"",new WeakSet,(o,l)=>{let d=Je(o,n),c=Je(l,n);r._OrtAddRunConfigEntry(i,d,c)!==0&&ce(`Can't set a run config entry: ${o} - ${l}.`)});for(let o of t)r._OrtRunOptionsAddActiveLoraAdapter(i,o)!==0&&ce("Can't add an active LoRA adapter.");return[i,n]}catch(s){throw i!==0&&r._OrtReleaseRunOptions(i),n.forEach(o=>r._free(o)),s}}}),Xo,Yo,Qo,Ot,Jo,hc,Oy=L(()=>{"use strict";Ft(),ma(),Xo=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Yo=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Qo=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Ot=(e,t,r,i)=>{let n=Je(t,i),a=Je(r,i);ye()._OrtAddSessionConfigEntry(e,n,a)!==0&&ce(`Can't set a session config entry: ${t} - ${r}.`)},Jo=async(e,t,r)=>{let i=t.executionProviders;for(let n of i){let a=typeof n=="string"?n:n.name,s=[],o;switch(a){case"webnn":if(a="WEBNN",Ot(e,"session.disable_quant_qdq","1",r),Ot(e,"session.disable_qdq_constant_folding","1",r),typeof n!="string"){let f=n==null?void 0:n.deviceType;f&&Ot(e,"deviceType",f,r)}break;case"webgpu":if(a="JS",typeof n!="string"){let f=n;if(f!=null&&f.preferredLayout){if(f.preferredLayout!=="NCHW"&&f.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);Ot(e,"preferredLayout",f.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${a}`)}let l=s.length,d=0,c=0;if(l>0){d=ye()._malloc(l*ye().PTR_SIZE),r.push(d),c=ye()._malloc(l*ye().PTR_SIZE),r.push(c);for(let f=0;f<l;f++)ye().setValue(d+f*ye().PTR_SIZE,s[f][0],"*"),ye().setValue(c+f*ye().PTR_SIZE,s[f][1],"*")}let h;if(o===void 0){let f=Je(a,r);h=await ye()._OrtAppendExecutionProvider(e,f,d,c,l)}h!==0&&ce(`Can't append execution provider: ${a}.`)}},hc=async e=>{let t=ye(),r=0,i=[],n=e||{};Qo(n);try{let a=Xo(n.graphOptimizationLevel??"all"),s=Yo(n.executionMode??"sequential"),o=typeof n.logId=="string"?Je(n.logId,i):0,l=n.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let d=n.logVerbosityLevel??0;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log verbosity level is not valid: ${d}`);let c=typeof n.optimizedModelFilePath=="string"?Je(n.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(a,!!n.enableCpuMemArena,!!n.enableMemPattern,s,!!n.enableProfiling,0,o,l,d,c),r===0&&ce("Can't create session options."),n.executionProviders&&await Jo(r,n,i),n.enableGraphCapture!==void 0){if(typeof n.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${n.enableGraphCapture}`);Ot(r,"enableGraphCapture",n.enableGraphCapture.toString(),i)}if(n.freeDimensionOverrides)for(let[h,f]of Object.entries(n.freeDimensionOverrides)){if(typeof h!="string")throw new Error(`free dimension override name must be a string: ${h}`);if(typeof f!="number"||!Number.isInteger(f)||f<0)throw new Error(`free dimension override value must be a non-negative integer: ${f}`);let _=Je(h,i);t._OrtAddFreeDimensionOverride(r,_,f)!==0&&ce(`Can't set a free dimension override: ${h} - ${f}.`)}return n.extra!==void 0&&Jr(n.extra,"",new WeakSet,(h,f)=>{Ot(r,h,f,i)}),[r,i]}catch(a){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&ce("Can't release session options."),i.forEach(s=>t._free(s)),a}}}),Ut,ht,Lt,oi,ei,ga,ya,Un,te=L(()=>{"use strict";Ut=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ht=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Lt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((n,a)=>n*a,1);return r>0?Math.ceil(i*r):void 0},oi=e=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},ei=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},ga=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",ya=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Un=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),ui,_a=L(()=>{"use strict";ca(),ui=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let n=t.body.getReader(),a;try{a=new ArrayBuffer(i)}catch(o){if(o instanceof RangeError){let l=Math.ceil(i/65536);a=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw o}let s=0;for(;;){let{done:o,value:l}=await n.read();if(o)break;let d=l.byteLength;new Uint8Array(a,s,d).set(l),s+=d}return new Uint8Array(a,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),eu,tu,ru,iu,wa,nu,le,ft=L(()=>{"use strict";te(),eu=["V","I","W","E","F"],tu=(e,t)=>{console.log(`[${eu[e]},${new Date().toISOString()}]${t}`)},wa=(e,t)=>{ru=e,iu=t},nu=(e,t)=>{let r=ei(e),i=ei(ru);r>=i&&tu(r,typeof t=="function"?t():t)},le=(...e)=>{iu&&nu(...e)}}),au,er,R,ti,fc,mc,gc,ie=L(()=>{"use strict";au=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},er=class{static calcShape(e,t,r=!1){let i=e.length,n=t.length;if(i===0)return t;if(n===0)return e;let a=Math.max(e.length,t.length),s=new Array(a);if(r){if(i<2||n<2)return;let o=au.calcMatMulShape([e[i-2],e[i-1]],[t[n-2],t[n-1]]);if(o===void 0)return;[s[a-2],s[a-1]]=o}for(let o=r?3:1;o<=a;o++){let l=i-o<0?1:e[i-o],d=n-o<0?1:t[n-o];if(l!==d&&l>1&&d>1)return;let c=Math.max(l,d);if(l&&d)s[a-o]=Math.max(l,d);else{if(c>1)return;s[a-o]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let n=1;n<=r;n++)if(e[r-n]!==1&&e[r-n]!==t[i-n])return!1;return!0}},R=class Xr{static size(t){return Xr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let n=new Array(i),a=i-1;for(;a>=0;){if(t[a]%r===0){n[a]=t[a]/r;break}if(r%t[a]!==0)throw new Error("cannot convert shape");n[a]=1,r/=t[a],a--}for(a--;a>=0;a--)n[a]=t[a];return n}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Xr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Xr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let n=1;for(let a=r;a<i;a++){if(t[a]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");n*=Number(t[a])}return n}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let n=r-3;n>=0;--n)i[n]=i[n+1]*t[n+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((n,a)=>n+r[a]+r[a+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,n)=>i===r[n])}},ti=class $t{static adjustPoolAttributes(t,r,i,n,a,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let o=0;o<r.length-2;o++)o>=i.length?i.push(r[o+2]):i[o]=r[o+2];for(let o=0;o<i.length;o++)if(o<n.length){if(n[o]<0)throw new Error("strides should be greater than or equal to 1")}else n.push(1);for(let o=0;o<i.length;o++)if(o<a.length){if(a[o]<0)throw new Error("dilations should be greater than or equal to 1")}else a.push(1);for(let o=0;o<i.length*2;o++)if(o<s.length){if(s[o]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let o=0;o<i.length;o++){if(i[o]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[o]>=i[o]||s[o+i.length]>=i[o])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,n,a,s,o){if(o){if(a.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(n.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)$t.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],n[l],a,l,l+t.length-2,o)}}static computePoolOutputShape(t,r,i,n,a,s,o,l=0){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let d=[r[0],r[1]];return $t.computeShapeHelper(t,r,d,i,n,a,s,o,l),d}static computeConvOutputShape(t,r,i,n,a,s,o){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return $t.computeShapeHelper(!1,t,l,i,n,a,s,o),l}static computeShapeHelper(t,r,i,n,a,s,o,l,d=0){if(t)for(let c=0;c<r.length-2;c++)i.push(1);else for(let c=0;c<r.length-2;c++)i.push($t.adjustPadAndReturnShape(r[c+2],n[c],a[c],s[c],o,c,c+r.length-2,l,d))}static computeOutputSize(t,r,i,n,a){let s=Math.floor(t/r)+1;return a===1&&(s=Math.ceil(t/r)+1,(s-1)*r>=i+n&&(s-=1)),s}static adjustPadAndReturnShape(t,r,i,n,a,s,o,l,d=0){let c=i*(n-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return a[s]=0,a[o]=0,$t.computeOutputSize(t-c,r,t,0,d);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=(Math.floor((t+r-1)/r)-1)*r+n-t;return a[s]=Math.floor(l==="SAME_LOWER"?(h+1)/2:h/2),a[o]=h-a[s],$t.computeOutputSize(t+a[s]+a[o]-c,r,t,a[s],d)}default:throw new Error("Unsupported AutoPad type")}else return $t.computeOutputSize(t+a[s]+a[o]-c,r,t,a[s],d)}},fc=class{static getShapeOfGemmResult(e,t,r,i,n){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let a,s,o;t?(a=e[1],s=e[0]):(a=e[0],s=e[1]);let l=-1;if(i?(o=r[0],l=1):(o=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(a<=0||o<=0||s<=0)throw new Error("invalid shape specified");if(n&&!er.isValidBroadcast(n,[a,o]))throw new Error("gemm: invalid bias shape for broadcast");return[a,o,s]}},mc=-34028234663852886e22,gc=34028234663852886e22}),ba,yc=L(()=>{"use strict";te(),ba=(e,t)=>new(oi(t))(e)}),Hi,su,Fi,ou,ji,uu,Ki,Zi,Xi,lu,_c,By=L(()=>{"use strict";te(),ft(),Hi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),su=(e,t)=>{if(t==="int32")return e;let r=Hi.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let n=e.byteLength/i,a=new(oi(t))(e.buffer,e.byteOffset,n);switch(t){case"int64":case"uint64":{let s=new Int32Array(n);for(let o=0;o<n;o++){let l=a[o];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[o]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&a.some(o=>o>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(a,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Fi=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let n=BigInt64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"uint64":{if(i.some(a=>a<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let n=BigUint64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"int8":{if(i.some(a=>a<-128||a>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let n=Int8Array.from(i,Number);return new Uint8Array(n.buffer)}case"uint8":{if(i.some(n=>n<0||n>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(a=>a<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let n=Uint32Array.from(i,Number);return new Uint8Array(n.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},ou=1,ji=()=>ou++,uu=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Ki=(e,t)=>{let r=Hi.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,n)=>i*n)*r/8):0},Zi=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:n,shape:a,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=n,this.tensorShape=a,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Ki(this.dataType,this.tensorShape)}destroy(){le("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Fi(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,n)=>i===r[n])}setIsDataConverted(e){this.isDataConverted=e}},Xi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let n=this.tensorManager.getMLContext(e),a=this.tensorManager.getMLOpSupportLimits(e),s;if(!(a!=null&&a.input.dataTypes.includes(t))){if(s=uu.get(t),!s||!(a!=null&&a.input.dataTypes.includes(s)))throw new Error(`WebNN backend does not support data type: ${t}`);le("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(n,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Ki(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let o=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,o,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=su(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else le("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){var t,r;if(this.activeUpload){let i=(t=this.wrapper)!=null&&t.isDataConverted?Fi(this.activeUpload,(r=this.wrapper)==null?void 0:r.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(i):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(i);return}else return i.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},lu=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=ji();return this.tensorTrackersById.set(e,new Xi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,n){le("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${n}}`);let a=this.tensorTrackersById.get(t);if(!a)throw new Error("Tensor not found.");return a.ensureTensor(e,r,i,n)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){le("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let n=this.getMLContext(e),a=ji(),s=new Zi({sessionId:e,context:n,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(a,new Xi(this,s)),this.externalTensors.add(s),a}async getCachedTensor(e,t,r,i,n,a,s){let o=this.getMLContext(e);for(let[d,c]of this.freeTensors.entries())if(c.canReuseTensor(o,t,r)){le("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let h=this.freeTensors.splice(d,1)[0];return h.sessionId=e,h}le("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await o.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:n,readable:a});return new Zi({sessionId:e,context:o,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},_c=(...e)=>new lu(...e)}),or,du,wc,Ry=L(()=>{"use strict";te(),Ft(),yc(),By(),ft(),or=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),du=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((n,a)=>n===i[a]&&e[n]===t[n])},wc=class{constructor(e){this.tensorManager=_c(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,wa(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){le("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){le("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)le("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>du(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(n=>n.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){le("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,n){let a=or.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,a,i,n)}async createTemporaryTensor(e,t,r){le("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=or.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let n=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,n,i,r,!1);let a=this.temporarySessionTensorIds.get(e);return a?a.push(n):this.temporarySessionTensorIds.set(e,[n]),n}uploadTensor(e,t){if(!ye().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");le("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return ba(r,t)}}registerMLTensor(e,t,r,i){let n=or.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);let a=this.tensorManager.registerTensor(e,t,n,i);return le("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${n}, dimensions: ${i}} -> {tensorId: ${a}}`),a}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=or.get(Ut(t)),n=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!(n!=null&&n.input.dataTypes.includes(i)):!!(n!=null&&n.output.dataTypes.includes(i))}flush(){}}}),$a=L(()=>{"use strict"}),Yi,Ur,Lr,pu,cu,Qi,Ln,hu,bc,My=L(()=>{"use strict";ft(),$a(),Yi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Ur=[],Lr=e=>Math.ceil(Number(e)/16)*16,pu=e=>{for(let t=0;t<Ur.length;t++){let r=Ur[t];if(e<=r)return r}return Math.ceil(e/16)*16},cu=1,Qi=()=>cu++,Ln=async(e,t,r,i)=>{let n=Lr(r),a=e.device.createBuffer({size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,a,0,n),e.flush(),await a.mapAsync(GPUMapMode.READ);let o=a.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(o,0,r)),l}else return new Uint8Array(o.slice(0,r))}finally{a.destroy()}},hu=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Yi)Ur.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,n=t.byteLength,a=Lr(n),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==n)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${n}`);if(a===n&&i%4===0)this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,r,i,n);else{let o=new Uint8Array(a);o.set(t),this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,o,0,a)}le("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let n=Lr(r.originalSize),a=this.backend.getCommandEncoder();this.backend.endComputePass(),a.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,n)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return le("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Qi();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),le("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),le("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=pu(e),i,n=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,a=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(n||a){let o=(n?this.freeBuffers:this.freeUniformBuffers).get(r);o?o.length>0?i=o.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Qi(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),le("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return le("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Ln(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Yi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(le("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},bc=(...e)=>new hu(...e)}),fu,he,ke=L(()=>{"use strict";fu=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},he=e=>new fu(e)}),tr,Wr,ze,Ce,X,Te,Wn,Jt,St,Z,ur,N,j,$c,va,mu,vc,ne=L(()=>{"use strict";te(),ie(),tr=64,Wr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},ze=(e,t=1)=>{let r=Wr(e,t);return typeof r=="string"?r:r[0]},Ce=(e,t=1)=>{let r=Wr(e,t);return typeof r=="string"?r:r[1]},X=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:R.computeStrides(r)})}),t},Te=e=>e%4===0?4:e%2===0?2:1,Wn=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Jt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,St=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Z=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ur=(e,t,r,i,n)=>{let a=typeof r=="number",s=a?r:r.length,o=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,d=Wr(t,n),c=typeof d=="string"?d:d[1],h=typeof d=="string"?d:d[0],f={indices:l,value:c,storage:h,tensor:t},_=M=>typeof M=="string"?M:`${M}u`,g={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},b=a?"uniforms.":"",S=`${b}${e}_shape`,$=`${b}${e}_strides`,w="";for(let M=0;M<s-1;M++)w+=`
    let dim${M} = current / ${Z($,M,s)};
    let rest${M} = current % ${Z($,M,s)};
    indices[${M}] = dim${M};
    current = rest${M};
    `;w+=`indices[${s-1}] = current;`;let T=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${f.indices} {
    var indices: ${f.indices};
    var current = offset;
    ${w}
    return indices;
  }`,I=M=>(g.offsetToIndices=!0,s<2?M:`o2i_${e}(${M})`),k=[];if(s>=2)for(let M=s-1;M>=0;M--)k.push(`${Z($,M,s)} * (indices[${M}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${f.indices}) -> u32 {
    return ${k.join("+")};
  }`,z=M=>(g.indicesToOffset=!0,s<2?M:`i2o_${e}(${M})`),v=(...M)=>s===0?"0u":`${f.indices}(${M.map(_).join(",")})`,B=(M,K)=>s<2?`${M}`:`${Z(M,K,s)}`,P=(M,K,ee)=>s<2?`${M}=${ee};`:`${Z(M,K,s)}=${ee};`,G={},V=(M,K)=>{g.broadcastedIndicesToOffset=!0;let ee=`${K.name}broadcastedIndicesTo${e}Offset`;if(ee in G)return`${ee}(${M})`;let W=[];for(let we=s-1;we>=0;we--){let $e=K.indicesGet("outputIndices",we+K.rank-s);W.push(`${B($,we)} * (${$e} % ${B(S,we)})`)}return G[ee]=`fn ${ee}(outputIndices: ${K.type.indices}) -> u32 {
             return ${W.length>0?W.join("+"):"0u"};
           }`,`${ee}(${M})`},U=(M,K)=>(()=>{if(f.storage===f.value)return`${e}[${M}]=${K};`;if(f.storage==="vec2<u32>"&&f.value==="i32")return`${e}[${M}]=vec2<u32>(u32(${K}), select(0u, 0xFFFFFFFFu, ${K} < 0));`;if(f.storage==="vec2<u32>"&&f.value==="u32")return`${e}[${M}]=vec2<u32>(u32(${K}), 0u);`;if(f.storage==="u32"&&f.value==="vec4<bool>")return`${e}[${M}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${K}));`;throw new Error(`not supported combination of storage type ${f.storage} and value type ${f.value} yet`)})(),O=M=>(()=>{if(f.storage===f.value)return`${e}[${M}]`;if(f.storage==="vec2<u32>"&&f.value==="i32")return`i32(${e}[${M}].x)`;if(f.storage==="vec2<u32>"&&f.value==="u32")return`u32(${e}[${M}].x)`;if(f.storage==="u32"&&f.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${M}] & 0xFFu), bool(${e}[${M}] & 0xFF00u), bool(${e}[${M}] & 0xFF0000u), bool(${e}[${M}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${f.storage} and value type ${f.value} yet`)})(),H=s<2?"":`
  fn get_${e}ByIndices(indices: ${f.indices}) -> ${c} {
    return ${O(`i2o_${e}(indices)`)};
  }`,Y=s<2?"":(()=>{let M=o.map(ee=>`d${ee}: u32`).join(", "),K=o.map(ee=>`d${ee}`).join(", ");return`
  fn get_${e}(${M}) -> ${c} {
    return get_${e}ByIndices(${v(K)});
  }`})(),Q=(...M)=>{if(M.length!==s)throw new Error(`indices length must be ${s}`);let K=M.map(_).join(",");return s===0?O("0u"):s===1?O(K[0]):(g.get=!0,g.getByIndices=!0,g.indicesToOffset=!0,`get_${e}(${K})`)},re=M=>s<2?O(M):(g.getByIndices=!0,g.indicesToOffset=!0,`get_${e}ByIndices(${M})`),J=s<2?"":`
  fn set_${e}ByIndices(indices: ${f.indices}, value: ${c}) {
    ${U(`i2o_${e}(indices)`,"value")}
  }`,_e=s<2?"":(()=>{let M=o.map(ee=>`d${ee}: u32`).join(", "),K=o.map(ee=>`d${ee}`).join(", ");return`
  fn set_${e}(${M}, value: ${c}) {
    set_${e}ByIndices(${v(K)}, value);
  }`})();return{impl:()=>{let M=[],K=!1;return g.offsetToIndices&&(M.push(T),K=!0),g.indicesToOffset&&(M.push(C),K=!0),g.broadcastedIndicesToOffset&&(Object.values(G).forEach(ee=>M.push(ee)),K=!0),g.set&&(M.push(_e),K=!0),g.setByIndices&&(M.push(J),K=!0),g.get&&(M.push(Y),K=!0),g.getByIndices&&(M.push(H),K=!0),!a&&K&&M.unshift(`const ${S} = ${f.indices}(${r.join(",")});`,`const ${$} = ${f.indices}(${R.computeStrides(r).join(",")});`),M.join(`
`)},type:f,offsetToIndices:I,indicesToOffset:z,broadcastedIndicesToOffset:V,indices:v,indicesGet:B,indicesSet:P,set:(...M)=>{if(M.length!==s+1)throw new Error(`indices length must be ${s}`);let K=M[s];if(typeof K!="string")throw new Error("value must be string");let ee=M.slice(0,s).map(_).join(",");return s===0?U("0u",K):s===1?U(ee[0],K):(g.set=!0,g.setByIndices=!0,g.indicesToOffset=!0,`set_${e}(${ee}, ${K})`)},setByOffset:U,setByIndices:(M,K)=>s<2?U(M,K):(g.setByIndices=!0,g.indicesToOffset=!0,`set_${e}ByIndices(${M}, ${K});`),get:Q,getByOffset:O,getByIndices:re,usage:i,name:e,strides:$,shape:S,rank:s}},N=(e,t,r,i=1)=>ur(e,t,r,"input",i),j=(e,t,r,i=1)=>ur(e,t,r,"output",i),$c=(e,t,r)=>ur(e,t,r,"atomicOutput",1),va=(e,t,r,i=1)=>ur(e,t,r,"internal",i),mu=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=tr){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let n=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,a=n?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=n?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${a}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let n=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${n}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},vc=(e,t)=>new mu(e,t)}),gu,Ji,yu,_u,wu,bu,qe,xc,Sc,Tt=L(()=>{"use strict";te(),ie(),ke(),ne(),gu=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Ji=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),yu=(e,t)=>R.sortBasedOnPerm(e,Ji(e.length,t)),_u=(e,t,r,i)=>{let n=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let a=0;a<t;++a)n+=`a[${e[a]}]=i[${a}];`;return n+="return a;}"},wu=(e,t)=>{let r=[],i=[];for(let n=0;n<e.length;++n)e[n]!==1&&r.push(e[n]),e[t[n]]!==1&&i.push(t[n]);return{newShape:r,newPerm:i}},bu=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},qe=(e,t)=>{let r=e.dataType,i=e.dims.length,n=Ji(i,t),a=yu(e.dims,n),s=e.dims,o=a,l=i<2||bu(n,e.dims),d;if(l)return d=g=>{let b=N("input",r,s,4),S=j("output",r,o,4);return`
  ${g.registerUniform("output_size","u32").declareVariables(b,S)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let g=R.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64/4)},programUniforms:[{type:12,data:Math.ceil(g/4)}]}},getShaderSource:d};let{newShape:c,newPerm:h}=wu(e.dims,n),f=R.areEqual(h,[2,3,1]),_=R.areEqual(h,[3,1,2]);if(c.length===2||f||_){s=f?[c[0],c[1]*c[2]]:_?[c[0]*c[1],c[2]]:c,o=[s[1],s[0]];let g=16;return d=b=>{let S=N("a",r,s.length),$=j("output",r,o.length);return`
  ${b.registerUniform("output_size","u32").declareVariables(S,$)}
  var<workgroup> tile : array<array<${$.type.value}, ${g+1}>, ${g}>;
  ${b.mainStart([g,g,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${g} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${g}u + local_id.x;
    let input_row = workgroup_id_x * ${g}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${g}u + local_id.x;
    let output_row = workgroup_id_y * ${g}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${$.setByIndices(`${$.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let b=R.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(o[1]/g),y:Math.ceil(o[0]/g)},programUniforms:[{type:12,data:b},...X(s,o)]}},getShaderSource:d}}return d=g=>{let b=N("a",r,s.length),S=j("output",r,o.length);return`
  ${g.registerUniform("output_size","u32").declareVariables(b,S)}

  ${_u(n,i,b,S)}

  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",b.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let g=R.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},...X(s,o)]}},getShaderSource:d}},xc=(e,t)=>{gu(e.inputs,t.perm),e.compute(qe(e.inputs[0],t.perm))},Sc=e=>he({perm:e.perm})}),$u,vu,xu,Su,Tu,ku,Iu,Eu,Cu,zu,Ke,Tc,kc,Ic,Ec,Cc,zc,Ac,Oc,Bc,Rc,Dy=L(()=>{"use strict";te(),ie(),ne(),xa(),Tt(),$u={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},vu={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},xu={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},Su={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Tu=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},ku=(e,t)=>{let r=[],i=e.length;for(let a=0;a<i;a++)t.indexOf(a)===-1&&r.push(e[a]);let n=t.map(a=>e[a]);return[r,n]},Iu=(e,t)=>{let r=e.length+t.length,i=[],n=0;for(let a=0;a<r;a++)t.indexOf(a)===-1?i.push(e[n++]):i.push(1);return i},Eu=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Cu=(e,t)=>{let r=[];if(!Eu(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},zu=(e,t,r,i,n,a,s)=>{let o=r[0].dims,l=R.size(a),d=R.size(s),c=N("_A",r[0].dataType,o),h=j("output",n,a),f=64;l===1&&(f=256);let _=`
          var<workgroup> aBestValues : array<f32, ${f}>;
       `,g=b=>`
        ${b.registerUniform("reduceSize","u32").declareVariables(c,h)}
        ${_}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${b.mainStart(f)}

          let outputIndex = global_idx / ${f};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${xu[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${f}) {
           let candidate = f32(${c.getByOffset("offset + k")});
           bestValue = ${$u[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${f}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${vu[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${h.setByOffset("outputIndex",`${i==="mean"?`${h.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${h.type.storage}(${Su[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${f}`,inputDependencies:["type"]},getShaderSource:g,getRunData:()=>({outputs:[{dims:a,dataType:n}],dispatchGroup:{x:l},programUniforms:[{type:12,data:d}]})}},Ke=(e,t,r,i)=>{let n=e.inputs.length===1?r:qn(e.inputs,r),a=n.axes;a.length===0&&!n.noopWithEmptyAxes&&(a=e.inputs[0].dims.map((_,g)=>g));let s=R.normalizeAxes(a,e.inputs[0].dims.length),o=s,l=e.inputs[0],d=Cu(o,e.inputs[0].dims.length);d.length>0&&(l=e.compute(qe(e.inputs[0],d),{inputs:[0],outputs:[-1]})[0],o=Tu(o.length,l.dims.length));let[c,h]=ku(l.dims,o),f=c;n.keepDims&&(f=Iu(c,s)),e.compute(zu(t,n.cacheKey,[l],i,e.inputs[0].dataType,f,h),{inputs:[l]})},Tc=(e,t)=>{Ke(e,"ReduceMeanShared",t,"mean")},kc=(e,t)=>{Ke(e,"ReduceL1Shared",t,"l1")},Ic=(e,t)=>{Ke(e,"ReduceL2Shared",t,"l2")},Ec=(e,t)=>{Ke(e,"ReduceLogSumExpShared",t,"logSumExp")},Cc=(e,t)=>{Ke(e,"ReduceMaxShared",t,"max")},zc=(e,t)=>{Ke(e,"ReduceMinShared",t,"min")},Ac=(e,t)=>{Ke(e,"ReduceProdShared",t,"prod")},Oc=(e,t)=>{Ke(e,"ReduceSumShared",t,"sum")},Bc=(e,t)=>{Ke(e,"ReduceSumSquareShared",t,"sumSquare")},Rc=(e,t)=>{Ke(e,"ReduceLogSumShared",t,"logSum")}}),Ze,Au,ri,qn,Xe,Ou,Bu,Ru,Mu,Du,Nu,Pu,Uu,Lu,Wu,Ye,Mc,Dc,Nc,Pc,Uc,Lc,Wc,qc,Vc,Gc,xa=L(()=>{"use strict";te(),ie(),ke(),ne(),Dy(),Ze=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Au=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],ri=(e,t,r,i,n,a,s=!1,o=!1)=>{let l=[],d=r[0].dims,c=d.length,h=R.normalizeAxes(n,c),f=!o&&h.length===0;d.forEach((b,S)=>{f||h.indexOf(S)>=0?s&&l.push(1):l.push(b)});let _=l.length,g=R.size(l);return{name:e,shaderCache:t,getShaderSource:b=>{let S=[],$=N("_A",r[0].dataType,c),w=j("output",a,_),T=i($,w,h),I=T[2];for(let k=0,C=0;k<c;k++)f||h.indexOf(k)>=0?(s&&C++,I=`for(var j${k}: u32 = 0; j${k} < ${d[k]}; j${k}++) {
                  ${T[2].includes("last_index")?`let last_index = j${k};`:""}
                  ${$.indicesSet("input_indices",k,`j${k}`)}
                  ${I}
                }`):(S.push(`${$.indicesSet("input_indices",k,w.indicesGet("output_indices",C))};`),C++);return`

        ${b.registerUniform("output_size","u32").declareVariables($,w)}

        ${b.mainStart()}
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${$.type.indices};
          let output_indices = ${w.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${T[0]}       // init ops for reduce max/min
          ${T[1]}
          ${I}
          ${T[3]}
          ${T.length===4?w.setByOffset("global_idx","value"):T.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:a}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},...X(d,l)]})}},qn=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),he({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Xe=(e,t,r,i)=>{let n=e.inputs,a=n.length===1?r:qn(n,r);e.compute(ri(t,{hint:a.cacheKey,inputDependencies:["rank"]},[n[0]],a.noopWithEmptyAxes&&a.axes.length===0?Au:i,a.axes,n[0].dataType,a.keepDims,a.noopWithEmptyAxes),{inputs:[0]})},Ou=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Bu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Ru=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Mu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Du=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceMax",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(r.indicesSet("input_indices",s,0));return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Nu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceMean",t,(r,i,n)=>{let a=1;for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&(a*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${a});`]})},Pu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceMin",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(`input_indices[${s}] = 0;`);return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Uu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Lu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Wu=(e,t)=>{Ze(e.inputs),Xe(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Ye=(e,t,r)=>{if(t.length===0)return r;let i=1,n=1;for(let a=0;a<t.length;a++)t.indexOf(a)===-1?i*=e[a]:n*=e[a];return n<32&&i>1024},Mc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Nu(e,t):Tc(e,t)},Dc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bu(e,t):kc(e,t)},Nc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ru(e,t):Ic(e,t)},Pc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Mu(e,t):Ec(e,t)},Uc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Du(e,t):Cc(e,t)},Lc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Pu(e,t):zc(e,t)},Wc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Uu(e,t):Ac(e,t)},qc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Lu(e,t):Oc(e,t)},Vc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Wu(e,t):Bc(e,t)},Gc=(e,t)=>{Ye(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ou(e,t):Rc(e,t)}}),en,Hc,Fc,Vn,Ny=L(()=>{"use strict";te(),ke(),xa(),en=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Hc=(e,t)=>{en(e.inputs);let r=(i,n,a)=>{let s=[];for(let o=0;o<i.rank;o++)(a.indexOf(o)>=0||a.length===0)&&s.push(`input_indices[${o}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(ri("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Fc=(e,t)=>{en(e.inputs);let r=(i,n,a)=>{let s=[];for(let o=0;o<i.rank;o++)(a.indexOf(o)>=0||a.length===0)&&s.push(`input_indices[${o}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(ri("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Vn=e=>he(e)}),qu,qr,Vu,Gu,Hu,xr,Fu,jc,Sa=L(()=>{"use strict";te(),ie(),$a(),ne(),qu=(e,t)=>{let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4],o=e[5];if(s&&o)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],d=r.dims[1],c=r.dims[2];if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==c)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(n.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let h=n.dims[0]/3,f=h,_=f;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let T of t.qkvHiddenSizes)if(T%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");h=t.qkvHiddenSizes[0],f=t.qkvHiddenSizes[1],_=t.qkvHiddenSizes[2]}let g=d;if(h!==f)throw new Error("qkv_hidden_sizes first element should be same as the second");if(n.dims[0]!==h+f+_)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let b=0;if(s){if(f!==_)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==f/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(b=s.dims[3])}let S=g+b,$=-1,w=0;if(a)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(o){if(o.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(o.dims[0]!==l||o.dims[1]!==t.numHeads||o.dims[2]!==d||o.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:d,pastSequenceLength:b,kvSequenceLength:g,totalSequenceLength:S,maxSequenceLength:$,inputHiddenSize:c,hiddenSize:h,vHiddenSize:_,headSize:Math.floor(h/t.numHeads),vHeadSize:Math.floor(_/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},qr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Vu=(e,t,r,i,n,a,s,o)=>{let l=Te(s?1:a),d=64,c=a/l;c<d&&(d=32);let h=Math.ceil(a/l/d),f=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:n},{type:12,data:c},{type:12,data:h}],_=ze(e.dataType,l),g=Ce(1,l),b=["type"];s&&b.push("type"),o&&b.push("type");let S=$=>{let w=j("x",e.dataType,e.dims,l),T=[w],I=s?N("seq_lens",s.dataType,s.dims):void 0;I&&T.push(I);let k=o?N("total_sequence_length_input",o.dataType,o.dims):void 0;k&&T.push(k);let C=Ce(e.dataType),z=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${d}>;
  var<workgroup> thread_sum: array<f32, ${d}>;
  ${$.registerUniforms(z).declareVariables(...T)}
  ${$.mainStart([d,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${qr(I,k,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${d}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${g}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${g}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${d}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${g}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${g}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${d}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${w.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${g}(x[offset + i]);
        x[offset + i] = ${w.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${w.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${d};${_};${l}`,inputDependencies:b},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:n,z:t*r},programUniforms:f})}},Gu=(e,t,r,i,n,a,s,o,l)=>{let d=s+a.kvSequenceLength,c=[a.batchSize,a.numHeads,a.sequenceLength,d],h=e>1&&i,f=a.kvNumHeads?a.kvNumHeads:a.numHeads,_=h?[a.batchSize,f,d,a.headSize]:void 0,g=a.nReps?a.nReps:1,b=a.scale===0?1/Math.sqrt(a.headSize):a.scale,S=Te(a.headSize),$=a.headSize/S,w=12,T={x:Math.ceil(d/w),y:Math.ceil(a.sequenceLength/w),z:a.batchSize*a.numHeads},I=[{type:12,data:a.sequenceLength},{type:12,data:$},{type:12,data:d},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:1,data:b},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:g}],k=h&&i&&R.size(i.dims)>0,C=["type","type"];k&&C.push("type"),n&&C.push("type"),o&&C.push("type"),l&&C.push("type");let z=[{dims:c,dataType:t.dataType,gpuDataType:0}];h&&z.push({dims:_,dataType:t.dataType,gpuDataType:0});let v=B=>{let P=N("q",t.dataType,t.dims,S),G=N("key",r.dataType,r.dims,S),V=[P,G];if(k){let J=N("past_key",i.dataType,i.dims,S);V.push(J)}n&&V.push(N("attention_bias",n.dataType,n.dims));let U=o?N("seq_lens",o.dataType,o.dims):void 0;U&&V.push(U);let O=l?N("total_sequence_length_input",l.dataType,l.dims):void 0;O&&V.push(O);let H=j("output",t.dataType,c),Y=[H];h&&Y.push(j("present_key",t.dataType,_,S));let Q=Ce(1,S),re=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;

  var<workgroup> tileQ: array<${P.type.storage}, ${w*w}>;
  var<workgroup> tileK: array<${P.type.storage}, ${w*w}>;
  ${B.registerUniforms(re).declareVariables(...V,...Y)}
  ${B.mainStart([w,w,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${g===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${g===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${qr(U,O,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${k&&h?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${h?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${Q}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${k&&h?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${h?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${Q}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${H.type.value} (sum * uniforms.alpha) + ${n?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${n!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:z,dispatchGroup:T,programUniforms:I}),getShaderSource:v}},Hu=(e,t,r,i,n,a,s=void 0,o=void 0)=>{let l=a+n.kvSequenceLength,d=n.nReps?n.nReps:1,c=n.vHiddenSize*d,h=e>1&&i,f=n.kvNumHeads?n.kvNumHeads:n.numHeads,_=h?[n.batchSize,f,l,n.headSize]:void 0,g=[n.batchSize,n.sequenceLength,c],b=12,S={x:Math.ceil(n.vHeadSize/b),y:Math.ceil(n.sequenceLength/b),z:n.batchSize*n.numHeads},$=[{type:12,data:n.sequenceLength},{type:12,data:l},{type:12,data:n.vHeadSize},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:12,data:c},{type:12,data:a},{type:12,data:n.kvSequenceLength},{type:12,data:d}],w=h&&i&&R.size(i.dims)>0,T=["type","type"];w&&T.push("type"),s&&T.push("type"),o&&T.push("type");let I=[{dims:g,dataType:t.dataType,gpuDataType:0}];h&&I.push({dims:_,dataType:t.dataType,gpuDataType:0});let k=C=>{let z=N("probs",t.dataType,t.dims),v=N("v",r.dataType,r.dims),B=[z,v];w&&B.push(N("past_value",i.dataType,i.dims));let P=s?N("seq_lens",s.dataType,s.dims):void 0;s&&B.push(P);let G=o?N("total_sequence_length_input",o.dataType,o.dims):void 0;o&&B.push(G);let V=[j("output",t.dataType,g)];h&&V.push(j("present_value",t.dataType,_));let U=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;
  var<workgroup> tileQ: array<${z.type.value}, ${b*b}>;
  var<workgroup> tileV: array<${z.type.value}, ${b*b}>;
  ${C.registerUniforms(U).declareVariables(...B,...V)}
  ${C.mainStart([b,b,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${d===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${d===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${qr(P,G,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${w&&h?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${h?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${z.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${w&&h?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${h?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:T},getRunData:()=>({outputs:I,dispatchGroup:S,programUniforms:$}),getShaderSource:k}},xr=(e,t,r,i,n,a,s,o,l,d,c=void 0,h=void 0)=>{let f=Math.min(e.outputCount,1+(s?1:0)+(o?1:0)),_=f>1?s:void 0,g=f>1?o:void 0,b=f>1?d.pastSequenceLength:0,S=b+d.kvSequenceLength,$=l&&R.size(l.dims)>0?l:void 0,w=[t,r];_&&R.size(_.dims)>0&&w.push(_),$&&w.push($),c&&w.push(c),h&&w.push(h);let T=e.compute(Gu(f,t,r,_,$,d,b,c,h),{inputs:w,outputs:f>1?[-1,1]:[-1]})[0];e.compute(Vu(T,d.batchSize,d.numHeads,b,d.sequenceLength,S,c,h),{inputs:c&&h?[T,c,h]:[T],outputs:[]});let I=[T,i];g&&R.size(g.dims)>0&&I.push(g),c&&I.push(c),h&&I.push(h),e.compute(Hu(f,T,i,g,d,b,c,h),{inputs:I,outputs:f>1?[0,2]:[0]})},Fu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,n=t.inputHiddenSize,a=t.headSize,s=12,o={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],d=[{type:12,data:i},{type:12,data:n},{type:12,data:a},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],c=h=>{let f=j("output_q",l[0].dataType,r),_=j("output_k",l[0].dataType,r),g=j("output_v",l[0].dataType,r),b=N("input",l[0].dataType,l[0].dims),S=N("weight",l[1].dataType,l[1].dims),$=N("bias",l[2].dataType,l[2].dims),w=b.type.storage,T=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${w}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${w}, ${s*s}>;
  var<workgroup> tileWeightK: array<${w}, ${s*s}>;
  var<workgroup> tileWeightV: array<${w}, ${s*s}>;
  ${h.registerUniforms(T).declareVariables(b,S,$,f,_,g)}
  ${h.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${w}(0);
    var valueK = ${w}(0);
    var valueV = ${w}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:o,programUniforms:d}),getShaderSource:c},{inputs:l,outputs:[-1,-1,-1]})},jc=(e,t)=>{let r=qu(e.inputs,t),[i,n,a]=Fu(e,r);return xr(e,i,n,a,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),ju,Ku,Zu,Kc,Py=L(()=>{"use strict";Ge(),te(),ie(),ke(),ne(),ju=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,n,a)=>{let s=n.length;if(s!==i.length)throw new Error(`${a}: num dimensions != ${s}`);n.forEach((o,l)=>{if(o!==i[l])throw new Error(`${a}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Ku=(e,t)=>{let{epsilon:r,spatial:i,format:n}=t,a=e[0].dims,s=i?Te(a[a.length-1]):1,o=n==="NHWC"&&a.length>1?s:1,l=R.size(a)/s,d=i,c=d?a.length:a,h=N("x",e[0].dataType,e[0].dims,s),f=N("scale",e[1].dataType,e[1].dims,o),_=N("bias",e[2].dataType,e[2].dims,o),g=N("inputMean",e[3].dataType,e[3].dims,o),b=N("inputVar",e[4].dataType,e[4].dims,o),S=j("y",e[0].dataType,c,s),$=()=>{let T="";if(i)T=`let cOffset = ${a.length===1?"0u":n==="NHWC"?`outputIndices[${a.length-1}] / ${s}`:"outputIndices[1]"};`;else if(n==="NCHW")T=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{T=`var cIndices = ${f.type.indices}(0);
                       cIndices[0] = outputIndices[${a.length-1}];`;for(let I=1;I<f.rank;I++)T+=`cIndices[${I}] = outputIndices[${I}];`;T+=`let cOffset = ${f.indicesToOffset("cIndices")};`}return T},w=T=>`
  const epsilon = ${r};
  ${T.registerUniform("outputSize","u32").declareVariables(h,f,_,g,b,S)}
  ${T.mainStart()}
  ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${$()}
    let scale = ${f.getByOffset("cOffset")};
    let bias = ${_.getByOffset("cOffset")};
    let inputMean = ${g.getByOffset("cOffset")};
    let inputVar = ${b.getByOffset("cOffset")};
    let x = ${h.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:d?["rank","type","type","type","type"]:void 0},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d?[{type:12,data:l},...X(a)]:[{type:12,data:l}]})}},Zu=e=>he(e),Kc=(e,t)=>{let{inputs:r,outputCount:i}=e,n=Zu({...t,outputCount:i});if(me.webgpu.validateInputContent&&ju(r,n),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Ku(r,n))}}),Xu,Yu,Zc,Uy=L(()=>{"use strict";ie(),ne(),Xu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Yu=e=>{let t=e[0].dims,r=e[0].dims[2],i=R.size(t)/4,n=e[0].dataType,a=N("input",n,t,4),s=N("bias",n,[r],4),o=N("residual",n,t,4),l=j("output",n,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:d=>`
  const channels = ${r}u / 4;
  ${d.declareVariables(a,s,o,l)}

  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${a.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${o.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},Zc=e=>{Xu(e.inputs),e.compute(Yu(e.inputs))}}),Qu,pe,Xc,Yc,Qc,Jc,eh,th,rh,ih,nh,Ju,ah,sh,oh,uh,_r,lh,Yr,dh,ph,ch,hh,fh,mh,gh,yh,_h,wh,bh,$h,vh,xh,Sh,Th,kh,tn,Ih,Gn,Hn,Eh,Ch,zh,el,tl,Ah,Ta=L(()=>{"use strict";te(),ie(),ke(),ne(),Qu=(e,t,r,i,n,a,s)=>{let o=Math.ceil(t/4),l="";typeof n=="string"?l=`${n}(a)`:l=n("a");let d=N("inputData",r,[o],4),c=j("outputData",i,[o],4),h=[{name:"vec_size",type:"u32"}];return s&&h.push(...s),`
      ${e.registerUniforms(h).declareVariables(d,c)}

  ${a??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${d.getByOffset("global_idx")};
    ${c.setByOffset("global_idx",l)}
  }`},pe=(e,t,r,i,n,a=e.dataType,s,o)=>{let l=[{type:12,data:Math.ceil(R.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:n,inputDependencies:["type"]},getShaderSource:d=>Qu(d,R.size(e.dims),e.dataType,a,r,i,o),getRunData:d=>({outputs:[{dims:e.dims,dataType:a}],dispatchGroup:{x:Math.ceil(R.size(d[0].dims)/64/4)},programUniforms:l})}},Xc=e=>{e.compute(pe(e.inputs[0],"Abs","abs"))},Yc=e=>{e.compute(pe(e.inputs[0],"Acos","acos"))},Qc=e=>{e.compute(pe(e.inputs[0],"Acosh","acosh"))},Jc=e=>{e.compute(pe(e.inputs[0],"Asin","asin"))},eh=e=>{e.compute(pe(e.inputs[0],"Asinh","asinh"))},th=e=>{e.compute(pe(e.inputs[0],"Atan","atan"))},rh=e=>{e.compute(pe(e.inputs[0],"Atanh","atanh"))},ih=e=>he(e),nh=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(pe(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Ju=e=>{let t,r,i=e.length>=2&&e[1].data!==0,n=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=n?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=n?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return he({min:t,max:r})},ah=(e,t)=>{let r=t||Ju(e.inputs),i=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Clip",n=>`clamp(${n}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},sh=e=>{e.compute(pe(e.inputs[0],"Ceil","ceil"))},oh=e=>{e.compute(pe(e.inputs[0],"Cos","cos"))},uh=e=>{e.compute(pe(e.inputs[0],"Cosh","cosh"))},_r=e=>he(e),lh=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Yr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,dh=e=>{let t=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Yr(t)))},ph=e=>{e.compute(pe(e.inputs[0],"Exp","exp"))},ch=e=>{e.compute(pe(e.inputs[0],"Floor","floor"))},hh=e=>{let t=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Yr(t)))},fh=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},mh=e=>{e.compute(pe(e.inputs[0],"Not",t=>`!${t}`))},gh=e=>{e.compute(pe(e.inputs[0],"Neg",t=>`-${t}`))},yh=e=>{e.compute(pe(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},_h=e=>{let t=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},wh=e=>{e.compute(pe(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},bh=e=>he(e),$h=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},vh=e=>{let t=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"HardSwish",r=>`${r} * max(vec4<${t}>(0.0), min(vec4<${t}>(1.0), vec4<${t}>(${t}(1.0 / 6.0)) * ${r} + vec4<${t}>(0.5)))`))},xh=e=>{e.compute(pe(e.inputs[0],"Sin","sin"))},Sh=e=>{e.compute(pe(e.inputs[0],"Sinh","sinh"))},Th=e=>{e.compute(pe(e.inputs[0],"Sqrt","sqrt"))},kh=e=>{e.compute(pe(e.inputs[0],"Tan","tan"))},tn=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Ih=e=>{e.compute(pe(e.inputs[0],"Tanh",tn))},Gn=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${tn("v")};
}
`,Hn=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Eh=e=>{let t=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"FastGelu",Hn,Gn(t),void 0,e.inputs[0].dataType))},Ch=(e,t)=>{let r=Ce(e.inputs[0].dataType);return e.compute(pe(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},zh=e=>{e.compute(pe(e.inputs[0],"Log","log"))},el=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,tl=e=>`quick_gelu_impl(${e})`,Ah=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(pe(e.inputs[0],"QuickGelu",tl,el(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),rl,il,Oh,Ly=L(()=>{"use strict";ie(),ne(),Ta(),rl=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},il=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=N("input",e[0].dataType,e[0].dims,4),i=N("bias",e[0].dataType,[e[0].dims[2]],4),n=j("output",e[0].dataType,t,4),a=R.size(t)/4,s=ze(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)}}),getShaderSource:o=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${o.declareVariables(r,i,n)}

  ${Yr(s)}

  ${o.mainStart()}
    ${o.guardAgainstOutOfBoundsWorkgroupSizes(a)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${n.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Oh=e=>{rl(e.inputs),e.compute(il(e.inputs))}}),nl,al,Qe,Bh,Rh,Mh,Dh,Nh,Ph,Uh,Lh,Wh,qh,Wy=L(()=>{"use strict";te(),ie(),ne(),nl=(e,t,r,i,n,a,s,o,l,d,c,h)=>{let f,_;typeof o=="string"?f=_=(w,T)=>`${o}((${w}),(${T}))`:typeof o=="function"?f=_=o:(f=o.scalar,_=o.vector);let g=j("outputData",c,i.length,4),b=N("aData",l,t.length,4),S=N("bData",d,r.length,4),$;if(n)if(a){let w=R.size(t)===1,T=R.size(r)===1,I=t.length>0&&t[t.length-1]%4===0,k=r.length>0&&r[r.length-1]%4===0;w||T?$=g.setByOffset("global_idx",_(w?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"),T?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):$=`
            let outputIndices = ${g.offsetToIndices("global_idx * 4u")};
            let offsetA = ${b.broadcastedIndicesToOffset("outputIndices",g)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",g)};
            ${g.setByOffset("global_idx",_(s||I?b.getByOffset("offsetA / 4u"):`${b.type.value}(${b.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||k?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else $=g.setByOffset("global_idx",_(b.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!a)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let w=(T,I,k="")=>{let C=`aData[indexA${I}][componentA${I}]`,z=`bData[indexB${I}][componentB${I}]`;return`
            let outputIndices${I} = ${g.offsetToIndices(`global_idx * 4u + ${I}u`)};
            let offsetA${I} = ${b.broadcastedIndicesToOffset(`outputIndices${I}`,g)};
            let offsetB${I} = ${S.broadcastedIndicesToOffset(`outputIndices${I}`,g)};
            let indexA${I} = offsetA${I} / 4u;
            let indexB${I} = offsetB${I} / 4u;
            let componentA${I} = offsetA${I} % 4u;
            let componentB${I} = offsetB${I} % 4u;
            ${T}[${I}] = ${k}(${f(C,z)});
          `};c===9?$=`
            var data = vec4<u32>(0);
            ${w("data",0,"u32")}
            ${w("data",1,"u32")}
            ${w("data",2,"u32")}
            ${w("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:$=`
            ${w("outputData[global_idx]",0)}
            ${w("outputData[global_idx]",1)}
            ${w("outputData[global_idx]",2)}
            ${w("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(b,S,g)}

        ${h??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${$}
      }`},al=(e,t,r,i,n,a,s=r.dataType)=>{let o=r.dims.map(Number),l=i.dims.map(Number),d=!R.areEqual(o,l),c=o,h=R.size(o),f=!1,_=!1,g=[d];if(d){let b=er.calcShape(o,l,!1);if(!b)throw new Error("Can't perform binary op on the given tensors");c=b.slice(),h=R.size(c);let S=R.size(o)===1,$=R.size(l)===1,w=o.length>0&&o[o.length-1]%4===0,T=l.length>0&&l[l.length-1]%4===0;g.push(S),g.push($),g.push(w),g.push(T);let I=1;for(let k=1;k<c.length;k++){let C=o[o.length-k],z=l[l.length-k];if(C===z)I*=C;else break}I%4===0?(_=!0,f=!0):(S||$||w||T)&&(f=!0)}else f=!0;return g.push(f),{name:e,shaderCache:{hint:t+g.map(b=>b.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:b=>nl(b,o,l,c,f,d,_,n,r.dataType,i.dataType,s,a),getRunData:()=>({outputs:[{dims:c,dataType:s}],dispatchGroup:{x:Math.ceil(h/64/4)},programUniforms:[{type:12,data:Math.ceil(R.size(c)/4)},...X(o,l,c)]})}},Qe=(e,t,r,i,n,a)=>{e.compute(al(t,n??"",e.inputs[0],e.inputs[1],r,i,a))},Bh=e=>{Qe(e,"Add",(t,r)=>`${t}+${r}`)},Rh=e=>{Qe(e,"Div",(t,r)=>`${t}/${r}`)},Mh=e=>{Qe(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Dh=e=>{Qe(e,"Mul",(t,r)=>`${t}*${r}`)},Nh=e=>{let t=N("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Qe(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Ph=e=>{Qe(e,"Sub",(t,r)=>`${t}-${r}`)},Uh=e=>{Qe(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Lh=e=>{Qe(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Wh=e=>{Qe(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},qh=e=>{Qe(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),sl,ol,Vh,Gh,qy=L(()=>{"use strict";te(),ie(),ke(),ne(),sl=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],n=i.dataType,a=i.dims.length;e.forEach((s,o)=>{if(o!==r){if(s.dataType!==n)throw new Error("input tensors should be one type");if(s.dims.length!==a)throw new Error("input tensors should have the same shape");s.dims.forEach((l,d)=>{if(d!==t&&l!==i.dims[d])throw new Error("non concat dimensions must match")})}})},ol=(e,t,r,i,n=0)=>{let a=e.reduce(($,w)=>$+R.size(w.dims),0),s=new Array(e.length),o=new Array(e.length),l=new Array(e.length),d=0,c=n,h=[],f=[],_=[{type:12,data:a}];for(let $=0;$<e.length;++$)s[$]=d,o[$]=c,d+=R.size(e[$].dims),c+=e[$].dims[t],f.push(e[$].dims.length),l[$]=N(`input${$}`,i,f[$]),h.push("rank"),_.push({type:12,data:s[$]}),_.push({type:12,data:o[$]});for(let $=0;$<e.length;++$)_.push(...X(e[$].dims));_.push(...X(r));let g=j("output",i,r.length),b=l.map(($,w)=>{let T=`
        let inputOffset = ${`global_idx - uniforms.inputOffset${w}`};
        var outputIndices = ${$.offsetToIndices("inputOffset")};
        ${g.indicesGet("outputIndices",t)} += uniforms.outputAxisOffset${w};
        ${g.setByIndices("outputIndices",$.getByOffset("inputOffset"))}`;return e.length===1?T:w===0?`if (inputIndex == 0u) {${T}}`:w===e.length-1?`else {${T}}`:`else if (inputIndex == ${w}u) {${T}}`}).join(`
`),S=$=>`

  ${(()=>{$.registerUniform("outputSize","u32");for(let w=0;w<e.length;w++)$.registerUniform(`inputOffset${w}`,"u32"),$.registerUniform(`outputAxisOffset${w}`,"u32");return $.declareVariables(...l,g)})()}

  fn calculateInputIndex(global_idx: u32) -> u32 {
    ${l.slice(1).map((w,T)=>`if (global_idx < uniforms.inputOffset${T+1}) {
      return ${T}u;
    }`).join(`
`)}
    return ${e.length-1}u;
  }

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    let inputIndex = calculateInputIndex(global_idx);
    ${b}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:_}),getShaderSource:S}},Vh=(e,t)=>{let r=e.inputs,i=r[0].dims,n=R.normalizeAxis(t.axis,i.length);sl(r,n);let a=i.slice();a[n]=r.reduce((d,c)=>d+(c.dims.length>n?c.dims[n]:0),0);let s=r.filter(d=>R.size(d.dims)>0);if(s.length===0){e.output(0,a);return}let o=e.deviceLimits.maxStorageBuffersPerShaderStage-1,l=0;for(let d=0;d<s.length;d+=o){let c=s.slice(d,d+o);e.compute(ol(c,n,a,r[0].dataType,l),{inputs:c,outputs:[0]}),l+=c.reduce((h,f)=>h+f.dims[n],0)}},Gh=e=>he({axis:e.axis})}),Vt,Gt,Ht,ka,jt=L(()=>{"use strict";te(),ie(),Vt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Gt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Ht=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},ka=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,i]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=(e==null?void 0:e.activation_params)||[mc,gc];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Oe,Hh,Ia=L(()=>{"use strict";Oe=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Hh=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),Fh,Vy=L(()=>{"use strict";Fh=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),br,Ea,Ca=L(()=>{"use strict";te(),ie(),ne(),jt(),br=(e,t,r,i,n)=>{let a=i-r;return`
      ${Array.from({length:r}).map((s,o)=>`
      if (${Z(t.shape,o,t.rank)} != 1) {
        ${t.indicesSet(e,o,Z(n,o+a,i))}
      } else {
        ${t.indicesSet(e,o,0)}
      }`).join("")}
`},Ea=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,o=e[1].dims,l=s[s.length-2],d=o[o.length-1],c=s[s.length-1],h=Te(d),f=Te(c),_=Te(l),g=R.size(r)/h/_,b=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),$=[R.size(S),l,d],w=[{type:12,data:g},{type:12,data:l},{type:12,data:d},{type:12,data:c}];Gt(t,w),w.push(...X(S,s,o)),b&&w.push(...X(e[2].dims)),w.push(...X($));let T=I=>{let k=va("batch_dims",e[0].dataType,S.length),C=N("a",e[0].dataType,s.length,f),z=N("b",e[1].dataType,o.length,h),v=j("output",e[0].dataType,$.length,h),B=ze(v.type.tensor),P=Vt(t,v.type.value,B),G=[C,z],V="";if(b){let H=n?h:1;G.push(N("bias",e[2].dataType,e[2].dims.length,H)),V=`${n?`value += bias[col / ${H}];`:`value += ${v.type.value}(bias[row + i]);`}`}let U=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Ht(t,U);let O=()=>{let H=`var a_data: ${C.type.value};`;for(let Y=0;Y<f;Y++)H+=`
              let b_data${Y} = b[(b_offset + (k + ${Y}) * uniforms.N + col) / ${h}];`;for(let Y=0;Y<_;Y++){H+=`a_data = a[(a_offset + (row + ${Y}) * uniforms.K + k) / ${f}];`;for(let Q=0;Q<f;Q++)H+=`
            values[${Y}] = fma(${z.type.value}(a_data${f===1?"":`[${Q}]`}), b_data${Q}, values[${Y}]);
`}return H};return`
  ${I.registerUniforms(U).registerInternalVariables(k).declareVariables(...G,v)}
  ${I.mainStart()}
    ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${h})) * ${h};
    var index1 = global_idx / (uniforms.N / ${h});
    let stride1 = uniforms.M / ${_};
    let row = (index1 % stride1) * ${_};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${k.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${br("a_indices",C,C.rank-2,k.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${z.type.indices};
    ${br("b_indices",z,z.rank-2,k.rank,"batch_indices")}
    ${z.indicesSet("b_indices",z.rank-2,0)}
    ${z.indicesSet("b_indices",z.rank-1,0)}
    let b_offset = ${z.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${_}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${f}) {
      ${O()}
    }
    for (var i = 0u; i < ${_}u; i++) {
      var value = values[i];
      ${V}
      ${P}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${h}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${h};${f};${_};${n}`,inputDependencies:b?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:w}),getShaderSource:T}}}),ul,ll,Fn,rn,dl,jn,pl,ii,za=L(()=>{"use strict";te(),ie(),ne(),jt(),Ca(),Ia(),ul=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,ll=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Fn=(e,t,r="f32",i,n=!1,a=32,s=!1,o=32)=>{let l=t[1]*e[1],d=t[0]*e[0],c=n?l:a,h=n?a:l,f=c/t[0],_=a/t[1];if(!((n&&f===4&&e[1]===4||!n&&(f===3||f===4))&&c%t[0]===0&&a%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${n} is true, innerElementSize ${f} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${f} must be 3 or 4.
  tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}. tileInner ${a} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${f}<${r}>, ${c/f}>, ${h}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${d/e[0]}>, ${a}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${f};
const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(o/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${o}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${_};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${ul(n,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${f===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${ll(n,f)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},rn=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,dl=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",jn=(e,t,r="f32",i,n=!1,a=32,s=!1,o=32,l=!1)=>{let d=e[1]*t[1],c=e[0]*t[0],h=n?d:a,f=n?a:d;if(!(f%t[1]===0&&h%t[0]===0&&a%t[1]===0))throw new Error(`tileAHight ${f} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}, tileInner ${a} must be divisible by workgroupSize[1]${t[1]}`);let _=f/t[1],g=h/t[0],b=a/t[1],S=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${d};
    let globalColStart = i32(workgroupId.x) * ${c};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${f}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          ${rn(n,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${a}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${n?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${d};

let tileRowA = i32(localId.y) * ${_};
let tileColA = i32(localId.x) * ${g};
let tileRowB = i32(localId.y) * ${b};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${g}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${rn(n,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${dl(n)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${h}>, ${f}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${c}>, ${a}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(o/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${o}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},pl=(e,t,r,i,n=!1)=>{let[a,s,o,l]=i,d=ze(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,d)} {
      var value = ${Oe(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${br("aIndices",s,s.rank-2,a.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,d)} {
      var value = ${Oe(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${o.type.indices};
        ${br("bIndices",o,o.rank-2,a.rank,"batchIndices")}
        ${o.indicesSet("bIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("bIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Oe(e,d)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${n?"bias[colIn]":`${Oe(e,d)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},ii=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,o=e[1].dims,l=s.slice(0,-2),d=o.slice(0,-2),c=i?i.slice(0,-2):r.slice(0,-2),h=R.size(c),f=s[s.length-2],_=s[s.length-1],g=o[o.length-1],b=_%4===0&&g%4===0,S=f<=8?[4,1,1]:[4,4,1],$=[8,8,1],w=[Math.ceil(g/$[0]/S[0]),Math.ceil(f/$[1]/S[1]),Math.ceil(h/$[2]/S[2])],T=b?4:1,I=[...l,f,_/T],k=I.length,C=[...d,_,g/T],z=C.length,v=[h,f,g/T],B=[{type:6,data:f},{type:6,data:g},{type:6,data:_}];Gt(t,B),B.push(...X(c,I,C));let P=["rank","rank"],G=e.length>2;G&&(B.push(...X(e[2].dims)),P.push("rank")),B.push(...X(v));let V=U=>{let O=c.length,H=va("batchDims",e[0].dataType,O,1),Y=ze(e[0].dataType),Q=N("a",e[0].dataType,k,T),re=N("b",e[1].dataType,z,T),J=j("result",e[0].dataType,v.length,T),_e=[Q,re];if(G){let we=n?T:1;_e.push(N("bias",e[2].dataType,e[2].dims.length,we))}let M=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Ht(t,M);let K=ze(J.type.tensor),ee=Vt(t,J.type.value,K),W=pl(T,G,ee,[H,Q,re,J],n);return`
  ${U.registerUniforms(M).registerInternalVariables(H).declareVariables(..._e,J)}
  ${W}
  ${b?Fn(S,$,Y,H):jn(S,$,Y,H)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${b};${n}`,inputDependencies:P},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:w[0],y:w[1],z:w[2]},programUniforms:B}),getShaderSource:V}}}),cl,jh,Gy=L(()=>{"use strict";te(),ft(),ne(),jt(),Ia(),Vy(),za(),cl=(e,t,r,i,n=!1,a,s=4,o=4,l=4,d="f32")=>{let c=B=>{switch(B){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${d}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${B} is not supported.`)}},h=B=>{switch(B){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${B} is not supported.`)}},f=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,_=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,g=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",b=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",$=e?"col":"row",w=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${$} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${$} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${$} % inChannels;
    var resData = ${Oe(s,d)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${g} && xCol >= 0 && xCol < ${b}) {
      ${f}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${c(s)}
    }
    return resData;`,T=e?t&&i?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${w}
    }
    return ${Oe(s,d)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${w}
    }
    return ${Oe(s,d)}(0.0);`,I=e?i&&r?h(o):`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${h(o)}
    }
    return ${Oe(o,d)}(0.0);`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${h(o)}
    }
    return ${Oe(o,d)}(0.0);`,k=Oe(l,d),C=Oe(e?s:o,d),z=Oe(e?o:s,d),v=Vt(a,k,d);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?T:I}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${z} {
      ${e?I:T}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${k}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${_}
      ${Hh(n)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},jh=(e,t,r,i,n,a,s,o,l)=>{let d=t.format==="NHWC",c=d?e[0].dims[3]:e[0].dims[1],h=r[0],f=d?r[2]:r[3],_=d?r[1]:r[2],g=d?r[3]:r[1],b=d&&(c%4===0||c%3===0)&&g%4===0,S=d?g:f*_,$=d?f*_:g,w=[8,8,1],T=i<=8?[4,1,1]:[4,4,1],I=[Math.ceil(S/w[0]/T[0]),Math.ceil($/w[1]/T[1]),Math.ceil(h/w[2]/T[2])];le("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${I}`);let k=b?d&&c%4!==0?3:4:1,C=w[1]*T[1],z=w[0]*T[0],v=Math.max(w[0]*k,w[1]),B=i%C===0,P=n%z===0,G=a%v===0,V=b?[k,4,4]:[1,1,1],U=[{type:6,data:i},{type:6,data:n},{type:6,data:a},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Gt(t,U),U.push(...X(e[0].dims,e[1].dims));let O=["rank","rank"];s&&(U.push(...X(e[2].dims)),O.push("rank")),U.push(...X(r));let H=Y=>{let Q=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Ht(t,Q);let re=b?4:1,J=ze(e[0].dataType),_e=`
      fn setOutputAtIndex(flatIndex : i32, value : ${b?`vec4<${J}>`:J}) {
        result[flatIndex] = ${b?`vec4<${J}>`:J}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${b?`vec4<${J}>`:J}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${b?"/ 4":""}, value);
      }`,M=N("x",e[0].dataType,e[0].dims.length,k===3?1:k),K=N("w",e[1].dataType,e[1].dims.length,re),ee=[M,K],W=j("result",e[0].dataType,r.length,re);if(s){let we=N("bias",e[2].dataType,e[2].dims.length,re);ee.push(we),_e+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${b?`vec4<${J}>`:J} {
          return bias[coords.${d?"w":"y"}${b?"/ 4":""}];
        }`}return`
        ${Fh("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${Y.registerUniforms(Q).declareVariables(...ee,W)}
        ${_e}
        ${cl(d,B,P,G,s,t,V[0],V[1],V[2],J)}
        ${b?Fn(T,w,J,void 0,!d,v):jn(T,w,J,void 0,!d,v,!1,void 0,o)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${k};${b};${B};${P};${G};${C};${z};${v}`,inputDependencies:O},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:I[0],y:I[1],z:I[2]},programUniforms:U}),getShaderSource:H}}}),hl,nn,lr,fl,an,ml,Kh,Zh,Hy=L(()=>{"use strict";te(),ft(),ie(),ne(),jt(),Ia(),hl=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},nn=e=>typeof e=="number"?[e,e,e]:e,lr=(e,t)=>t<=1?e:e+(e-1)*(t-1),fl=(e,t,r,i=1)=>{let n=lr(t,i);return Math.floor((e[0]*(r-1)-r+n)/2)},an=(e,t,r,i,n)=>{n==null&&(n=fl(e,t[0],i[0]));let a=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*n>=t[s]&&(a[s]=Math.trunc((e[s]-t[s]+2*n)/i[s]+1));return a},ml=(e,t,r,i,n,a,s,o,l,d)=>{let c,h,f,_;if(e==="VALID"&&(e=0),typeof e=="number"){c={top:e,bottom:e,left:e,right:e,front:e,back:e};let g=an([t,r,i,1],[o,l,d],1,[n,a,s],e);h=g[0],f=g[1],_=g[2]}else if(Array.isArray(e)){if(!e.every((b,S,$)=>b===$[0]))throw Error(`Unsupported padding parameter: ${e}`);c={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let g=an([t,r,i,1],[o,l,d],1,[n,a,s],e[0]);h=g[0],f=g[1],_=g[2]}else if(e==="SAME_UPPER"){h=Math.ceil(t/n),f=Math.ceil(r/a),_=Math.ceil(i/s);let g=(h-1)*n+o-t,b=(f-1)*a+l-r,S=(_-1)*s+d-i,$=Math.floor(g/2),w=g-$,T=Math.floor(b/2),I=b-T,k=Math.floor(S/2),C=S-k;c={top:T,bottom:I,left:k,right:C,front:$,back:w}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:c,outDepth:h,outHeight:f,outWidth:_}},Kh=(e,t,r,i,n,a=!1,s="channelsLast")=>{let o,l,d,c,h;if(s==="channelsLast")[o,l,d,c,h]=e;else if(s==="channelsFirst")[o,h,l,d,c]=e;else throw new Error(`Unknown dataFormat ${s}`);let[f,,_,g,b]=t,[S,$,w]=nn(r),[T,I,k]=nn(i),C=lr(_,T),z=lr(g,I),v=lr(b,k),{padInfo:B,outDepth:P,outHeight:G,outWidth:V}=ml(n,l,d,c,S,$,w,C,z,v),U=a?f*h:f,O=[0,0,0,0,0];return s==="channelsFirst"?O=[o,U,P,G,V]:s==="channelsLast"&&(O=[o,P,G,V,U]),{batchSize:o,dataFormat:s,inDepth:l,inHeight:d,inWidth:c,inChannels:h,outDepth:P,outHeight:G,outWidth:V,outChannels:U,padInfo:B,strideDepth:S,strideHeight:$,strideWidth:w,filterDepth:_,filterHeight:g,filterWidth:b,effectiveFilterDepth:C,effectiveFilterHeight:z,effectiveFilterWidth:v,dilationDepth:T,dilationHeight:I,dilationWidth:k,inShape:e,outShape:O,filterShape:t}},Zh=(e,t,r,i,n,a)=>{let s=a==="channelsLast",o=s?e[0].dims[3]:e[0].dims[1],l=!1,d=[64,1,1],c={x:r.map((w,T)=>T)},h=[Math.ceil(hl(c.x.map(w=>r[w]))/d[0]),1,1];le("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${h}`);let f=l?s&&o%4!==0?3:4:1,_=R.size(r),g=[{type:12,data:_},{type:12,data:i},{type:12,data:n},{type:12,data:t.strides},{type:12,data:t.dilations}];Gt(t,g),g.push(...X(e[0].dims,e[1].dims));let b=["rank","rank"],S=e.length===3;S&&(g.push(...X(e[2].dims)),b.push("rank")),g.push(...X(r));let $=w=>{let T=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:n.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Ht(t,T);let I=l?4:1,k=ze(e[0].dataType),C=N("x",e[0].dataType,e[0].dims.length,f===3?1:f),z=N("W",e[1].dataType,e[1].dims.length,I),v=[C,z],B=j("result",e[0].dataType,r.length,I),P="";if(S){let U=N("bias",e[2].dataType,e[2].dims.length,I);v.push(U),P+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${l?`vec4<${k}>`:k} {
          return bias[${s?Z("coords",4,5):Z("coords",1,5)}${l?"/ 4":""}];
        }`}let G=Oe(f,k),V=Vt(t,G,k);return`
            ${P}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${k} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${C.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> ${k} {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${z.getByIndices("aIndices")};
            }
          ${w.registerUniforms(T).declareVariables(...v,B)}
          ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${B.offsetToIndices("global_idx")};
              let batch = ${Z("coords",0,C.rank)};
              let d2 = ${s?Z("coords",C.rank-1,C.rank):Z("coords",1,C.rank)};
              let xFRCCorner = vec3<u32>(${s?Z("coords",1,C.rank):Z("coords",2,C.rank)},
              ${s?Z("coords",2,C.rank):Z("coords",3,C.rank)},
              ${s?Z("coords",3,C.rank):Z("coords",4,C.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Z("uniforms.x_shape",1,C.rank):Z("uniforms.x_shape",2,C.rank)};
              let xShapeZ = ${s?Z("uniforms.x_shape",2,C.rank):Z("uniforms.x_shape",3,C.rank)};
              let xShapeW = ${s?Z("uniforms.x_shape",3,C.rank):Z("uniforms.x_shape",4,C.rank)};
              let xShapeU = ${s?Z("uniforms.x_shape",4,C.rank):Z("uniforms.x_shape",1,C.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = ${k}(0);
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<${k}>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<${k}>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<${k}>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<${k}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<${k}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<${k}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<${k}>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<${k}>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<${k}>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${S?"value = value + getBiasByOutputCoords(coords)":""};
              ${V}
              result[global_idx] = ${k}(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${f};${S}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:h[0],y:h[1],z:h[2]},programUniforms:g}),getShaderSource:$}}}),Xh,Yh,Fy=L(()=>{"use strict";te(),ie(),ne(),jt(),Xh=(e,t,r,i)=>{let n=e.length>2,a=n?"value += b[output_channel];":"",s=e[0].dims,o=e[1].dims,l=t.format==="NHWC",d=l?r[3]:r[1],c=d/t.group,h=l&&c>=4?Te(d):1,f=R.size(r)/h,_=[{type:12,data:f},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:c}];Gt(t,_),_.push(...X(s,[o[0],o[1],o[2],o[3]/h]));let g=n?["rank","rank","rank"]:["rank","rank"];_.push(...X([r[0],r[1],r[2],r[3]/h]));let b=S=>{let $=j("output",e[0].dataType,r.length,h),w=ze($.type.tensor),T=Vt(t,$.type.value,w),I=N("x",e[0].dataType,s.length),k=N("w",e[1].dataType,o.length,h),C=[I,k];n&&C.push(N("b",e[2].dataType,e[2].dims,h));let z=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Ht(t,z);let v=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${I.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${k.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${I.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${k.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(z).declareVariables(...C,$)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${$.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${h} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${$.type.value} = ${$.type.value}(0);
    ${v}
    ${a}
    ${T}
    ${$.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${h}`,inputDependencies:g},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:_}),getShaderSource:b}},Yh=(e,t,r,i)=>{let n=e.length>2,a=Te(r[3]),s=Te(r[2]),o=R.size(r)/a/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/a],d=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/a],c=[r[0],r[1],r[2],r[3]/a],h=[{type:12,data:o},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Gt(t,h),h.push(...X(l,d,c));let f=(s-1)*t.strides[1]+d[1],_=g=>{let b=j("output",e[0].dataType,c.length,a),S=ze(b.type.tensor),$=Vt(t,b.type.value,S),w=N("x",e[0].dataType,l.length,a),T=N("w",e[1].dataType,d.length,a),I=[w,T];n&&I.push(N("b",e[2].dataType,e[2].dims,a));let k=n?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Ht(t,C),`
  ${g.registerUniforms(C).declareVariables(...I,b)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${w.type.value}, ${f}>;
    var values: array<${b.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${d[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${f}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${w.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${w.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${d[1]}; w_width++) {
          let w_val = ${T.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${k}
      ${$}
      ${b.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${a};${s};${f};${d[0]};${d[1]}`,inputDependencies:n?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:h}),getShaderSource:_}}}),gl,Vr,yl,Gr,Kn,sn,_l,wl,Zn,jy=L(()=>{"use strict";ie(),Gy(),Hy(),za(),Fy(),jt(),Ca(),Tt(),gl=(e,t,r,i,n,a)=>{let s=e[0],o=e.slice(a?1:2,a?3:4),l=o.length,d=t[0],c=t.slice(2).map((f,_)=>f+(f-1)*(r[_]-1)),h=o.map((f,_)=>f+i[_]+i[_+l]).map((f,_)=>Math.floor((f-c[_]+n[_])/n[_]));return h.splice(0,0,s),h.splice(a?3:1,0,d),h},Vr=[2,3,1,0],yl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Gr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let a=2;a<t[1].dims.length;++a)r[a-2]===0&&(r[a-2]=t[1].dims[a]);let i=e.pads.slice();ti.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let n=Object.assign({},e);return Object.assign(n,{kernelShape:r,pads:i}),n},Kn=e=>{let t=ka(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],n=e.dilations,a=e.group,s=e.kernel_shape,o=e.pads,l=e.strides,d=e.w_is_const();return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,pads:o,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},sn=(e,t,r,i)=>{let n=r.format==="NHWC",a=gl(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,n);if(r.group!==1){let C=[t[0]];if(n){let z=e.kernelCustomData.wT??e.compute(qe(t[1],Vr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=z),C.push(z)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&n&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Yh(C,r,a,i),{inputs:C}):e.compute(Xh(C,r,a,i),{inputs:C});return}let s=t.length===3,o=t[0].dims[n?1:2],l=t[0].dims[n?2:3],d=t[0].dims[n?3:1],c=t[1].dims[2],h=t[1].dims[3],f=a[n?1:2],_=a[n?2:3],g=a[n?3:1],b=n&&c===o&&h===l&&r.pads[0]===0&&r.pads[1]===0;if(b||c===1&&h===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=a[0],z,v,B,P=[];if(n){let U=e.kernelCustomData.wT??e.compute(qe(t[1],Vr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=U),b){let O=o*l*d;z=t[0].reshape([1,C,O]),v=U.reshape([1,O,g]),B=[1,C,g]}else z=t[0].reshape([C,o*l,d]),v=U.reshape([1,d,g]),B=[C,f*_,g];P.push(z),P.push(v)}else z=t[0].reshape([C,d,o*l]),v=t[1].reshape([1,g,d]),B=[C,g,f*_],P.push(v),P.push(z);s&&P.push(t[2]);let G=B[2],V=P[0].dims[P[0].dims.length-1];G<8&&V<8?e.compute(Ea(P,r,a,B,n,i),{inputs:P}):e.compute(ii(P,r,a,B,n,i),{inputs:P});return}let S=!0,$=e.kernelCustomData.wT??e.compute(qe(t[1],Vr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=$);let w=[t[0],$];s&&w.push(t[2]);let T=n?f*_:g,I=n?g:f*_,k=c*h*d;e.compute(jh(w,r,a,T,I,k,s,S,i),{inputs:w})},_l=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=[0,t.pads[0],0,t.pads[1]],a=[1].concat(t.strides),s=[1].concat(t.dilations),o=[1].concat(t.kernelShape),l=Gr({...t,pads:n,strides:a,dilations:s,kernelShape:o},i);sn(e,i,l,d=>r?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},wl=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",n=Gr(r,t),a=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=Kh(t[0].dims,t[1].dims,r.strides,r.dilations,a,!1,i);e.compute(Zh(t,n,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Zn=(e,t)=>{if(yl(e.inputs,t),e.inputs[0].dims.length===3)_l(e,t);else if(e.inputs[0].dims.length===5)wl(e,e.inputs,t);else{let r=Gr(t,e.inputs);sn(e,e.inputs,r)}}}),Qh,Ky=L(()=>{"use strict";te(),ft(),ie(),ne(),Qh=(e,t,r)=>{let i=e.length>2,n=t.outputShape,a=t.format==="NHWC",s=t.group,o=e[1].dims,l=o[2]/s,d=o[3],c=a?Te(l):1,h=a&&d===1&&l>=4,f=h?Math.floor(l/4)*4:Math.floor(l/c)*c,_=l-f,g=a?Te(d):1,b=a?d===1?c:g:1,S=R.size(n)/g,$=[Math.ceil(S/64),1,1];le("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${$}`);let w=["rank","rank"],T=[t.strides[0],t.strides[1]],I=[t.kernelShape[a?1:2],t.kernelShape[a?2:3]],k=[t.dilations[0],t.dilations[1]],C=[I[0]+(t.dilations[0]<=1?0:(t.kernelShape[a?1:2]-1)*(t.dilations[0]-1)),I[1]+(t.dilations[1]<=1?0:(t.kernelShape[a?2:3]-1)*(t.dilations[1]-1))],z=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:S},{type:12,data:T},{type:12,data:I},{type:12,data:k},{type:12,data:C},{type:6,data:z},{type:12,data:f},{type:12,data:l},{type:12,data:d},...X(e[0].dims,e[1].dims)];i&&(v.push(...X(e[2].dims)),w.push("rank")),v.push(...X(n));let B=P=>{let G=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:T.length},{name:"filter_dims",type:"u32",length:I.length},{name:"dilations",type:"u32",length:I.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:z.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],V=ze(e[0].dataType),U=a?1:2,O=a?2:3,H=a?3:1,Y=N("W",e[1].dataType,e[1].dims.length,b),Q=N("Dy",e[0].dataType,e[0].dims.length,c),re=[Q,Y];i&&re.push(N("bias",e[2].dataType,[n[H]].length,g));let J=j("result",e[0].dataType,n.length,g),_e=()=>{let ee="";if(h)c===4?ee+=`
        let xValue = ${Q.getByOffset("x_offset")};
        let wValue = ${Y.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:c===2?ee+=`
          dotProd = dotProd + dot(vec4<${V}>(${Q.getByOffset("x_offset")}, ${Q.getByOffset("x_offset + 1u")}), vec4<${V}>(${Y.getByOffset("w_offset")}, ${Y.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:c===1&&(ee+=`
          dotProd = dotProd + dot(vec4<${V}>(${Q.getByOffset("x_offset")}, ${Q.getByOffset("x_offset + 1u")}, ${Q.getByOffset("x_offset + 2u")}, ${Q.getByOffset("x_offset + 3u")}), vec4<${V}>(${Y.getByOffset("w_offset")}, ${Y.getByOffset("w_offset + 1u")}, ${Y.getByOffset("w_offset + 2u")}, ${Y.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(ee+=`
                  let xValue = ${a?Q.getByOffset(`${Q.indicesToOffset(`${Q.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c}`):Q.get("batch","inputChannel","idyR","idyC")};
        `,c===1)ee+=`
          let w_offset = ${Y.indicesToOffset(`${Y.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${Y.getByOffset(`w_offset / ${b}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let W=0;W<c;W++)ee+=`
            let wValue${W} = ${Y.getByOffset(`${Y.indicesToOffset(`${Y.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${W}, wOutChannel)`)} / ${b}`)};
            dotProd = dotProd + xValue[${W}] * wValue${W};`;return ee},M=()=>{if(_===0)return"";if(!h)throw new Error(`packInputAs4 ${h} is not true.`);let ee="";if(c===1){ee+="dotProd = dotProd";for(let W=0;W<_;W++)ee+=`
            + ${Q.getByOffset(`x_offset + ${W}`)} * ${Y.getByOffset(`w_offset + ${W}`)}`;ee+=";"}else if(c===2){if(_!==2)throw new Error(`Invalid inputChannelsRemainder ${_}.`);ee+=`
          let xValue = ${Q.getByOffset("x_offset")};
          let wValue = ${Y.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return ee},K=`
            let outputIndices = ${J.offsetToIndices(`global_idx * ${g}`)};
            let batch = ${J.indicesGet("outputIndices",0)};
            let d1 = ${J.indicesGet("outputIndices",H)};
            let r = ${J.indicesGet("outputIndices",U)};
            let c = ${J.indicesGet("outputIndices",O)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${J.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${V}(dyRCorner) + ${V}(wR)) / ${V}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${V}(uniforms.Dy_shape[${U}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${V}(dyCCorner) + ${V}(wC)) / ${V}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${V}(uniforms.Dy_shape[${O}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${h?`
                var x_offset = ${Q.indicesToOffset(`${Q.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${c};
                var w_offset = ${Y.indicesToOffset(`${Y.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${b};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${h?4:c}) {
                  ${_e()}
                  inputChannel = inputChannel + ${h?4:c};
                }
                ${M()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${g}]`:""};
            ${J.setByOffset("global_idx","value")};
          `;return`
    ${P.registerUniforms(G).declareVariables(...re,J)}
      ${P.mainStart()}
      ${P.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${K}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${c}${b}${g}${h}${_}`,inputDependencies:w},getRunData:()=>({dispatchGroup:{x:$[0],y:$[1],z:$[2]},outputs:[{dims:r?r(n):n,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:B}}}),bl,$l,vl,on,Jh,xl,un,Sl,ef,Zy=L(()=>{"use strict";Ky(),jt(),Tt(),bl=(e,t,r,i,n,a)=>(e-1)*t+r+(i-1)*n+1-a,$l=(e,t,r,i,n)=>{let a=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=a,r[n]=e-a):t==="SAME_LOWER"&&(r[i]=e-a,r[n]=a)},vl=(e,t,r,i,n,a,s,o,l,d)=>{let c=e.length-2,h=d.length===0;l.length<c&&l.push(...Array(c-l.length).fill(0));let f=e[0],_=t[o?3:1]*n;for(let g=0,b=e.length-c-(o?1:0);g<c;++g,++b){let S=e[b],$=h?S*s[g]:d[g],w=bl(S,s[g],a[g],t[b],r[g],$);$l(w,i,a,g,g+c),h&&d.push(s[g]*(S-1)+l[g]+(t[b]-1)*r[g]+1-a[g]-a[g+c])}d.splice(0,0,f),d.splice(o?3:1,0,_)},on=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((h,f)=>h*f,1)===0){r.length=0;for(let h=2;h<t[1].dims.length;++h)r.push(t[1].dims[h])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let n=e.pads.slice(),a=e.outputShape.slice(),s=e.outputPadding.slice(),o=t[0].dims,l=e.dilations.slice();if(l.reduce((h,f)=>h+f,0)===0){let h=t[0].dims.length-2;l=new Array(h).fill(1)}let d=e.strides.slice();if(d.reduce((h,f)=>h+f,0)===0){let h=t[0].dims.length-2;d=new Array(h).fill(1)}vl(o,r,l,e.autoPad,e.group,n,d,i,s,a);let c=Object.assign({},e);return Object.assign(c,{kernelShape:r,pads:n,outputPadding:s,outputShape:a,dilations:l,strides:d}),c},Jh=e=>{let t=ka(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],n=e.dilations,a=e.group??1,s=e.kernelShape,o=e.pads,l=e.strides,d=e.wIsConst(),c=e.outputPadding,h=e.outputShape;return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,outputPadding:c,outputShape:h,pads:o,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},xl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let n=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==n))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.reduce((s,o)=>s+o,0)>0&&t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.reduce((s,o)=>s+o,0)>0&&t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.reduce((s,o)=>s+o,0)>0&&t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.outputPadding.length!==a&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${a}D`);if(t.kernelShape.reduce((s,o)=>s+o,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},un=(e,t,r,i)=>{let n=e.kernelCustomData.wT??e.compute(qe(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=n);let a=[t[0],n];t.length===3&&a.push(t[2]),e.compute(Qh(a,r,i),{inputs:a})},Sl=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=t.kernelShape;(n.length===0||n[0]===0)&&(n=[e.inputs[1].dims[2]]);let a=t.dilations;(a.length===0||a[0]===0)&&(a=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let o=t.pads;o.length===0&&(o=[0,0]),o=[0,o[0],0,o[1]],s=[1].concat(s),a=[1].concat(a),n=[1].concat(n);let l=t.outputPadding;l=[0].concat(l);let d=on({...t,pads:o,strides:s,dilations:a,kernelShape:n,outputPadding:l},i);un(e,i,d,c=>r?[c[0],c[2],c[3]]:[c[0],c[1],c[3]])},ef=(e,t)=>{if(xl(e.inputs,t),e.inputs[0].dims.length===3)Sl(e,t);else{let r=on(t,e.inputs);un(e,e.inputs,r)}}}),Tl,tf,rf,Xy=L(()=>{"use strict";te(),ie(),ke(),ne(),Tl=(e,t,r,i)=>{let n=R.size(t),a=t.length,s=N("input",e,a),o=j("output",e,a),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),d=R.normalizeAxis(l,a),c=h=>{let f=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,_=Z("uniforms.input_shape","uniforms.axis",a),g=i.reverse?f+(i.exclusive?" + 1":""):"0",b=i.reverse?_:f+(i.exclusive?"":" + 1");return`
                ${h.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,o)}
                ${h.mainStart()}
                  ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${o.offsetToIndices("global_idx")};
                  var sum = ${o.type.value}(0);
                  let first : i32 = ${g};
                  let last : i32 = ${b};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${o.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},{type:12,data:d},...X(t,t)]}),getShaderSource:c}},tf=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,n=e.inputs[1];e.compute(Tl(i,r,n,t),{inputs:[0]})},rf=e=>{let t=e.exclusive===1,r=e.reverse===1;return he({exclusive:t,reverse:r})}}),kl,Il,El,nf,af,Yy=L(()=>{"use strict";te(),ie(),ke(),ne(),kl=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Il=(e,t,r,i)=>{let n=[];n.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let a=0;a<t;++a)n.push(r.indicesSet("a",e[a],`i[${a}]`));return n.push("return a;}"),n.join(`
`)},El=(e,t)=>{let r,i,n,a,s,o,l=t.format==="NHWC",d=t.blocksize,c=t.mode==="DCR";l?([r,i,n,a]=e.dims,s=c?[r,i,n,d,d,a/d**2]:[r,i,n,a/d**2,d,d],o=c?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,n,a]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=c?[r,d,d,a/d**2,i,n]:[r,a/d**2,d,d,i,n],o=c?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let h=e.reshape(s),f=h.dims.length,_=e.dataType,g=N("a",_,f),b=j("output",_,f),S=$=>`
  ${$.registerUniform("output_size","u32").declareVariables(g,b)}

  ${Il(o,f,g,b)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${b.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${b.setByOffset("global_idx",g.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:$=>{let w=l?[r,i*d,n*d,a/d**2]:[r,a/d**2,i*d,n*d],T=R.size(w),I=h.dims,k=R.sortBasedOnPerm(I,o);return{outputs:[{dims:w,dataType:$[0].dataType}],dispatchGroup:{x:Math.ceil(T/64)},programUniforms:[{type:12,data:T},...X(I,k)]}},getShaderSource:S}},nf=(e,t)=>{kl(e.inputs),e.compute(El(e.inputs[0],t))},af=e=>he({blocksize:e.blocksize,mode:e.mode,format:e.format})}),pt,dr,Hr,ln,wt,Cl,zl,Al,dn,pn,cn,Ol,Bl,hn,Rl,sf,of,Qy=L(()=>{"use strict";te(),ie(),ke(),ne(),pt=256,dr=512,Hr=2*Math.PI,ln=e=>{let t=[],r=e;for(let i of[4,2,3,5])for(;r%i===0;)t.push(i),r/=i;return r===1?t:void 0},wt=e=>{let t=e.toPrecision(9);return/[.eE]/.test(t)?t:`${t}.0`},Cl=(e,t,r,i,n)=>{let a=r/e,s=dr-i,o=d=>`smem[${s}u + base + ${d*t}u]`,l=`  for (var t = local_idx; t < ${a}u; t += ${pt}u) {
`;l+=`    let twiddleIndex = t % ${t}u;
    let angleUnit = f32(twiddleIndex);
`,l+=`    var leg: array<vec2<f32>, 5>;
`;for(let d=0;d<e;d++){let c=`${i}u + t + ${d*a}u`;if(d===0)l+=`    leg[0] = smem[${c}];
`;else{let h=n*Hr*d/(e*t);l+=`    { let a = ${wt(h)} * angleUnit; leg[${d}] = cmul(smem[${c}], vec2<f32>(cos(a), sin(a))); }
`}}if(l+=`    let base = (t / ${t}u) * ${t*e}u + twiddleIndex;
`,e===2)l+=`    ${o(0)} = leg[0] + leg[1];
    ${o(1)} = leg[0] - leg[1];
`;else if(e===4){let d=n<0?"vec2<f32>(oddDiff.y, -oddDiff.x)":"vec2<f32>(-oddDiff.y, oddDiff.x)";l+=`    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`,l+=`    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`,l+=`    let oddRot = ${d};
`,l+=`    ${o(0)} = evenSum + oddSum;
    ${o(1)} = evenDiff + oddRot;
`,l+=`    ${o(2)} = evenSum - oddSum;
    ${o(3)} = evenDiff - oddRot;
`}else for(let d=0;d<e;d++){let c=["leg[0]"];for(let h=1;h<e;h++){let f=n*Hr*(h*d)/e,_=wt(Math.cos(f)),g=wt(Math.sin(f));c.push(`vec2<f32>(leg[${h}].x*${_} - leg[${h}].y*${g}, leg[${h}].x*${g} + leg[${h}].y*${_})`)}l+=`    ${o(d)} = ${c.join(" + ")};
`}return`${l}  }
  workgroupBarrier();
`},zl=(e,t,r)=>{let i="",n=1,a=0;for(let s of e)i+=Cl(s,n,t,a,r),n*=s,a=dr-a;return{code:i,resultOffset:a}},Al=(e,t,r,i,n)=>{let a=e.dims,s=a.length,o=a[s-1],l=a[t],d=r&&i?(l-1)*2:l;n!==void 0&&(d=n);let c=r&&i?1:2,h=i&&!r?Math.floor(d/2)+1:d,f=a.slice();f[t]=h,f[s-1]=c;let _=1;for(let b=t+1;b<s-1;b++)_*=a[b];let g=R.size(a)/o/l;return{dataType:e.dataType,outputDims:f,length:d,signalLength:l,inner:_,batch:g,inputComponents:o,outputComponents:c,outputLength:h,inverse:r,onesided:i}},dn=(e,t)=>[t,e.length,e.inputComponents,e.outputComponents,e.inverse,e.onesided].join(";"),pn=e=>[{type:12,data:e.batch},{type:12,data:e.signalLength},{type:12,data:e.inner},{type:12,data:e.outputLength}],cn=(e,t,r)=>e.registerUniform("batch","u32").registerUniform("signalLength","u32").registerUniform("inner","u32").registerUniform("outputLength","u32").declareVariables(t,r),Ol=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,o=Ce(t),l=a?1:-1,d=a?1/r:1,c=ln(r),h=f=>{let _=N("x",t,[1]),g=j("y",t,[1]),b=k=>{let C=`inBase + (${k}) * uniforms.inner * ${i}u`,z=`f32(${_.getByOffset(C)})`,v=i===2?`f32(${_.getByOffset(`${C} + 1u`)})`:"0.0";return`vec2<f32>(${z}, ${v})`},S;if(a&&s){let k=Math.floor(r/2)+1,C=r%2===0?`select(provided, provided - 1u, provided == ${k}u)`:"provided";S=`
    let provided = min(uniforms.signalLength, ${k}u);
    for (var i = local_idx; i < ${r}u; i += ${pt}u) {
      if (i < provided) { smem[i] = ${b("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${C}; k += ${pt}u) {
      let h = smem[k];
      smem[${r}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`}else S=`
    let loadCount = min(uniforms.signalLength, ${r}u);
    for (var i = local_idx; i < ${r}u; i += ${pt}u) {
      if (i < loadCount) { smem[i] = ${b("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;let{code:$,resultOffset:w}=zl(c,r,l),T=d===1?`smem[${w}u + i]`:`smem[${w}u + i] * ${wt(d)}`,I=n===2?g.setByOffset("off + 1u",`${o}(v.y)`):"";return`
  ${cn(f,_,g)}
  var<workgroup> smem: array<vec2<f32>, ${2*dr}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${f.mainStart(pt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    ${S}
${$}    for (var i = local_idx; i < uniforms.outputLength; i += ${pt}u) {
      let v = ${T};
      let off = outBase + i * uniforms.inner * ${n}u;
      ${g.setByOffset("off",`${o}(v.x)`)}
      ${I}
    }
  }`};return{name:"DFT",shaderCache:{hint:dn(e,"fft"),inputDependencies:["type"]},getShaderSource:h,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:pn(e),dispatchGroup:{x:e.batch}})}},Bl=e=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,o=Ce(t),l=a?1:-1,d=a?1/r:1,c=h=>{let f=N("x",t,[1]),_=j("y",t,[1]),g=T=>{let I=`inBase + (${T}) * uniforms.inner * ${i}u`,k=`f32(${f.getByOffset(I)})`,C=i===2?`f32(${f.getByOffset(`${I} + 1u`)})`:"0.0";return`vec2<f32>(${k}, ${C})`},b=a&&s?`fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(r/2)+1}u);
    if (k < provided) { return ${g("k")}; }
    let m = ${r}u - k;
    if (m < provided) {
      let h = ${g("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }`:`fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${g("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`,S=`
      let angle = ${wt(l*Hr)} * f32(knMod) / ${wt(r)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${r}u) { knMod -= ${r}u; }`,$=n===2?_.setByOffset("off + 1u",`${o}(v.y)`):"",w=d===1?"acc":`acc * ${wt(d)}`;return`
  ${cn(h,f,_)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${b}
  ${h.mainStart(pt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${pt}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${r}u; n++) {${S}
      }
      let v = ${w};
      let off = outBase + k * uniforms.inner * ${n}u;
      ${_.setByOffset("off",`${o}(v.x)`)}
      ${$}
    }
  }`};return{name:"DFT",shaderCache:{hint:dn(e,"direct"),inputDependencies:["type"]},getShaderSource:c,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:pn(e),dispatchGroup:{x:e.batch}})}},hn=e=>{if(!e||e.dataType===0)return;if(R.size(e.dims)!==1)throw new Error("DFT optional scalar inputs must have exactly 1 element.");if(e.dataType===6)return e.getInt32Array()[0];let t=Number(e.getBigInt64Array()[0]);if(!Number.isSafeInteger(t))throw new Error("DFT optional scalar inputs are out of JavaScript safe integer range.");return t},Rl=e=>{if(!e||e.length<1)throw new Error("DFT requires at least 1 input.");let t=e[0].dims;if(t.length<2)throw new Error("DFT input must have at least 2 dimensions.");let r=t[t.length-1];if(r!==1&&r!==2)throw new Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).")},sf=(e,t)=>{Rl(e.inputs);let r=e.inputs[0],i=r.dims.length,n=t.inverse!==0,a=t.onesided!==0,s=hn(e.inputs[1]);if(s!==void 0&&s<=0)throw new Error("dft_length must be greater than zero.");let o=R.normalizeAxis(hn(e.inputs[2])??t.axis,i);if(o===i-1)throw new Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");if(n&&a&&r.dims[i-1]!==2)throw new Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");let l=Al(r,o,n,a,s);if(l.length<=0)throw new Error(`Invalid DFT length: ${l.length}`);let d=l.length<=dr&&ln(l.length)!==void 0?Ol(l):Bl(l);e.compute(d,{inputs:[0]})},of=e=>he({axis:e.axis??1,inverse:e.inverse??0,onesided:e.onesided??0})}),Fr,pr,fn,Ml,Dl,Nl,Pl,mn,Ul,uf,lf,Jy=L(()=>{"use strict";te(),ie(),ke(),ne(),Fr="[a-zA-Z]|\\.\\.\\.",pr="("+Fr+")+",fn="^"+pr+"$",Ml="("+pr+",)*"+pr,Dl="^"+Ml+"$",Nl=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},Pl=class{constructor(e,t){var n;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Dl)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,s)=>{let o=e[s].dims.slice();if(!a.match(RegExp(fn)))throw new Error("Invalid LHS term");let l=this.processTerm(a,!0,o,s);this.lhs.push(l)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,s])=>s.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(pr)))throw new Error("Invalid RHS");(n=i.match(RegExp(Fr,"g")))==null||n.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(a);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let n=r.length,a=!1,s=[],o=0;if(!e.match(RegExp(fn))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(Fr,"g")),d=new Nl(i);return l==null||l.forEach((c,h)=>{if(c==="..."){if(a)throw new Error("Only one ellipsis is allowed per input term");a=!0;let f=n-l.length+1;if(f<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(o,o+f),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let _=0;_<s.length;_++){let g=String.fromCharCode(48+_);d.addSymbol(g,h+_),this.addSymbol(g,r[o++],i)}}else d.addSymbol(c,h+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(c,r[o++],i)}),d}},mn=e=>e+"_max",Ul=(e,t,r,i)=>{let n=e.map(d=>d.length).map((d,c)=>N(`input${c}`,t,d)),a=R.size(i),s=j("output",t,i.length),o=[...r.symbolToInfo.keys()].filter(d=>!r.rhs.symbolToIndices.has(d)),l=d=>{let c=[],h="var prod = 1.0;",f="var sum = 0.0;",_="sum += prod;",g=[],b=[],S=[],$=[],w=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((I,k)=>{var C;if(r.rhs.symbolToIndices.has(k)){let z=(C=r.rhs.symbolToIndices.get(k))==null?void 0:C[0];z!==void 0&&r.lhs.forEach((v,B)=>{if(I.inputIndices.includes(B)){let P=v.symbolToIndices.get(k);if(P===void 0)throw new Error("Invalid symbol error");P.forEach(G=>{c.push(`${n[B].indicesSet(`input${B}Indices`,G,s.indicesGet("outputIndices",z))}`)})}})}else r.lhs.forEach((z,v)=>{if(I.inputIndices.includes(v)){let B=z.symbolToIndices.get(k);if(B===void 0)throw new Error("Invalid symbol error");B.forEach(P=>{g.push(`${n[v].indicesSet(`input${v}Indices`,P,`${k}`)}`)}),$.push(`prod *= ${n[v].getByIndices(`input${v}Indices`)};`)}}),b.push(`for(var ${k}: u32 = 0; ${k} < uniforms.${mn(k)}; ${k}++) {`),S.push("}")});let T=w?[...c,`let sum = ${n.map((I,k)=>I.getByIndices(`input${k}Indices`)).join(" * ")};`]:[...c,f,...b,...g,h,...$,_,...S];return`
            ${d.registerUniforms(o.map(I=>({name:`${mn(I)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...n,s)}

            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${n.map((I,k)=>`var input${k}Indices: ${n[k].type.indices};`).join(`
`)}
            ${T.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let d=o.filter(h=>r.symbolToInfo.has(h)).map(h=>{var f;return{type:12,data:((f=r.symbolToInfo.get(h))==null?void 0:f.dimValue)||0}});d.push({type:12,data:a});let c=e.map((h,f)=>[...X(h)]).reduce((h,f)=>h.concat(f),d);return c.push(...X(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:c}},getShaderSource:l}},uf=(e,t)=>{let r=new Pl(e.inputs,t.equation),i=r.outputDims,n=e.inputs.map((a,s)=>a.dims);e.compute(Ul(n,e.inputs[0].dataType,r,i))},lf=e=>{let t=e.equation.replace(/\s+/g,"");return he({equation:t})}}),Ll,gn,Wl,ql,df,e_=L(()=>{"use strict";te(),ie(),ne(),Ll=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,n=t.length<r.length?0:t.length-r.length;for(;i<r.length&&n<t.length;++i,++n)if(r[i]!==t[n]&&r[i]!==1&&t[n]!==1)throw new Error("Expand requires shape to be broadcastable to input")},gn=(e,t)=>{let r=e.length-t.length,i=[];for(let n=0;n<r;++n)i.push(e[n]);for(let n=0;n<t.length;++n)i.push(t[n]===1?e[n+r]:t[n]);return i},Wl=(e,t)=>e.length>t.length?gn(e,t):gn(t,e),ql=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Wl(t,r),n=e[0].dataType,a=n===9||R.size(t)===1,s=n===9||t.length>0&&t[t.length-1]%4===0?4:1,o=a||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(R.size(i)/o),d=h=>{let f=N("input",n,t.length,s),_=j("output",n,i.length,o),g;if(n===9){let b=(S,$,w="")=>`
          let outputIndices${$} = ${_.offsetToIndices(`outputOffset + ${$}u`)};
          let offset${$} = ${f.broadcastedIndicesToOffset(`outputIndices${$}`,_)};
          let index${$} = offset${$} / 4u;
          let component${$} = offset${$} % 4u;
          ${S}[${$}] = ${w}(${f.getByOffset(`index${$}`)}[component${$}]);
        `;g=`
        let outputOffset = global_idx * ${o};
        var data = vec4<u32>(0);
        ${b("data",0,"u32")}
        ${b("data",1,"u32")}
        ${b("data",2,"u32")}
        ${b("data",3,"u32")}
        ${_.setByOffset("global_idx","data")}
      }`}else g=`
        let outputIndices = ${_.offsetToIndices(`global_idx * ${o}`)};
        let inputOffset = ${f.broadcastedIndicesToOffset("outputIndices",_)};
        let data = ${_.type.value}(${f.getByOffset(`inputOffset / ${s}`)});
        ${_.setByOffset("global_idx","data")}
      }`;return`
    ${h.registerUniform("vec_size","u32").declareVariables(f,_)}
    ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${g}`},c=[{type:12,data:l},...X(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${o}`,inputDependencies:["rank"]},getShaderSource:d,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c})}},df=e=>{Ll(e.inputs),e.compute(ql(e.inputs),{inputs:[0]})}}),Vl,pf,t_=L(()=>{"use strict";te(),ie(),ne(),Ta(),Vl=e=>{let t=e[0].dataType,r=R.size(e[0].dims),i=R.size(e[1].dims),n=i%4===0,a=s=>{let o=N("x",t,[1],4),l=N("bias",t,[1],4),d=j("y",t,[1],4),c=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],h=_=>`
      let bias${_}_offset: u32 = (global_idx * 4 + ${_}) % uniforms.bias_size;
      let bias${_} = ${l.getByOffset(`bias${_}_offset / 4`)}[bias${_}_offset % 4];`,f=n?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${h(0)}${h(1)}${h(2)}${h(3)}
      let bias = ${o.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(c).declareVariables(o,l,d)}

    ${Gn(Ce(t))}

    ${s.mainStart(tr)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${o.getByOffset("global_idx")};
      ${f}
      let x_in = x + bias;
      ${d.setByOffset("global_idx",Hn("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${n}`,inputDependencies:["type","type"]},getShaderSource:a,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/tr/4)}})}},pf=e=>{e.inputs.length<2||R.size(e.inputs[1].dims)===0?Eh(e):e.compute(Vl(e.inputs))}}),Gl,Hl,cf,hf,r_=L(()=>{"use strict";te(),ie(),ke(),ne(),Gl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},Hl=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=R.normalizeAxis(t.axis,n),s=r.slice(0);s.splice(a,1,...i);let o=r[a],l=e[0].dataType===9?4:1,d=Math.ceil(R.size(s)/l),c=[{type:12,data:d},{type:6,data:o},{type:12,data:a},...X(e[0].dims,e[1].dims,s)],h=f=>{let _=N("data",e[0].dataType,e[0].dims.length,l),g=N("inputIndices",e[1].dataType,e[1].dims.length),b=j("output",e[0].dataType,s.length,l),S=w=>{let T=i.length,I=`var indicesIndices${w}  = ${g.type.indices}(0);`;for(let k=0;k<T;k++)I+=`${T>1?`indicesIndices${w}[${k}]`:`indicesIndices${w}`} = ${s.length>1?`outputIndices${w}[uniforms.axis + ${k}]`:`outputIndices${w}`};`;I+=`
          var idx${w} = ${g.getByIndices(`indicesIndices${w}`)};
          if (idx${w} < 0) {
            idx${w} = idx${w} + uniforms.axisDimLimit;
          }
          var dataIndices${w} : ${_.type.indices};
        `;for(let k=0,C=0;k<n;k++)k===a?(I+=`${n>1?`dataIndices${w}[${k}]`:`dataIndices${w}`} = u32(idx${w});`,C+=T):(I+=`${n>1?`dataIndices${w}[${k}]`:`dataIndices${w}`} = ${s.length>1?`outputIndices${w}[${C}]`:`outputIndices${w}`};`,C++);return I},$;if(e[0].dataType===9){let w=(T,I,k="")=>`
          let outputIndices${I} = ${b.offsetToIndices(`outputOffset + ${I}u`)};
          ${S(I)};
          let offset${I} = ${_.indicesToOffset(`dataIndices${I}`)};
          let index${I} = offset${I} / 4u;
          let component${I} = offset${I} % 4u;
          ${T}[${I}] = ${k}(${_.getByOffset(`index${I}`)}[component${I}]);
        `;$=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${w("value",0,"u32")}
        ${w("value",1,"u32")}
        ${w("value",2,"u32")}
        ${w("value",3,"u32")}
        ${b.setByOffset("global_idx","value")}
      `}else $=`
      let outputIndices = ${b.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${_.getByIndices("dataIndices")};
      ${b.setByOffset("global_idx","value")};
      `;return`
      ${f.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(_,g,b)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${$}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:c}),getShaderSource:h}},cf=e=>he({axis:e.axis}),hf=(e,t)=>{let r=e.inputs;Gl(r),e.compute(Hl(e.inputs,t))}}),Fl,ff,mf,i_=L(()=>{"use strict";te(),ie(),ne(),Fl=(e,t,r,i,n,a,s,o,l)=>{let d=[{type:12,data:a},{type:12,data:i},{type:12,data:n},{type:12,data:r},{type:12,data:s},{type:12,data:o},{type:12,data:l}],c=[a];d.push(...X(t.dims,c));let h=f=>{let _=N("indices_data",t.dataType,t.dims.length),g=j("input_slice_offsets_data",12,1,1),b=[_,g],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:n.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${f.registerUniforms(S).declareVariables(...b)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${n.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${n.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:c,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:d}),getShaderSource:h},{inputs:[t],outputs:[-1]})[0]},ff=(e,t)=>{let r=e.inputs,i=r[0].dims,n=r[0].dataType,a=r[1].dims,s=a[a.length-1],o=R.sizeToDimension(a,a.length-1),l=R.sizeFromDimension(i,t.batchDims+s),d=R.sizeToDimension(i,t.batchDims),c=R.sizeFromDimension(i,t.batchDims),h=o/d,f=new Array(s),_=l;for(let I=0;I<s;++I)f[s-1-I]=_,_*=i[t.batchDims+s-1-I];let g=Fl(e,r[1],f,t.batchDims,i,o,h,c,s),b=t.batchDims+s;if(b>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=a.slice(0,-1).concat(i.slice(b)),$=R.size(S),w=[{type:12,data:$},{type:12,data:l},...X(r[0].dims,g.dims,S)],T=I=>{let k=N("data",r[0].dataType,r[0].dims.length),C=N("slice_offsets",12,g.dims.length),z=j("output",r[0].dataType,S.length);return`
          ${I.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(k,C,z)}
            ${I.mainStart()}
            ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:n}],dispatchGroup:{x:Math.ceil($/64)},programUniforms:w}),getShaderSource:T},{inputs:[r[0],g]})},mf=e=>({batchDims:e.batch_dims,cacheKey:""})}),jl,Kl,gf,yf,n_=L(()=>{"use strict";te(),ie(),ke(),ne(),jl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=R.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,n=e[0],a=e[2],s=e.length===4?e[3]:void 0;if(a.dims.length!==n.dims.length||!n.dims.map((o,l)=>l===r?Math.ceil(o/i)===a.dims[l]:o===a.dims[l]).reduce((o,l)=>o&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==n.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==a.dims.length||!s.dims.map((o,l)=>o===a.dims[l]).reduce((o,l)=>o&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Kl=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=R.normalizeAxis(t.gatherAxis,n),s=R.normalizeAxis(t.quantizeAxis,n),o=r.slice(0);o.splice(a,1,...i);let l=R.size(o),d=e[2].dataType,c=e[0].dataType===22,h=[{type:12,data:l},{type:12,data:s},{type:12,data:a},{type:12,data:t.blockSize},...X(...e.map((_,g)=>_.dims),o)],f=_=>{let g=N("data",e[0].dataType,e[0].dims.length),b=N("inputIndices",e[1].dataType,e[1].dims.length),S=N("scales",e[2].dataType,e[2].dims.length),$=e.length>3?N("zeroPoint",e[3].dataType,e[3].dims.length):void 0,w=j("output",d,o.length),T=[g,b,S];$&&T.push($);let I=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${_.registerUniforms(I).declareVariables(...T,w)}
        ${_.mainStart()}
        let output_indices = ${w.offsetToIndices("global_idx")};
        var indices_indices = ${b.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${w.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${b.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${w.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${g.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${w.indicesGet("output_indices","i")};
          ${g.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${b.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[a]};
        }
        ${g.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${o.length}; i++) {
          let index = ${w.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${g.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${g.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${g.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${$?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${$.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${$.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${c?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ce(d)}(quantized_data - zero_point) * scale;
        ${w.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((_,g)=>g!==1).map(_=>_.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(_,g)=>"rank")},getRunData:()=>({outputs:[{dims:o,dataType:d}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h}),getShaderSource:f}},gf=(e,t)=>{let r=e.inputs;jl(r,t),e.compute(Kl(e.inputs,t))},yf=e=>he({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Zl,Xl,_f,wf,a_=L(()=>{"use strict";te(),ie(),ke(),ne(),Zl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Xl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,n=r.length,a=e[1].dims,s=e[1].dataType,o=R.normalizeAxis(t.axis,n),l=r[o],d=a.slice(0),c=R.size(d),h=N("input",i,n),f=N("indicesInput",s,a.length),_=j("output",i,d.length),g=[{type:12,data:c},{type:6,data:l},{type:12,data:o}];return g.push(...X(r,a,d)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:g}),getShaderSource:b=>`
      ${b.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(h,f,_)}
      ${b.mainStart()}
      ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${_.offsetToIndices("global_idx")};

      var idx = ${f.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${h.type.indices}(outputIndices);
      ${h.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${h.getByIndices("inputIndices")};

      ${_.setByOffset("global_idx","value")};
  }`}},_f=e=>he({axis:e.axis}),wf=(e,t)=>{let r=e.inputs;Zl(r),e.compute(Xl(e.inputs,t))}}),Yl,Ql,bf,$f,s_=L(()=>{"use strict";te(),ie(),ne(),Yl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Ql=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[n,a,s]=fc.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),o=[n,a];if(!o)throw new Error("Can't use gemm on the given tensors");let l=16,d=Math.ceil(a/l),c=Math.ceil(n/l),h=!0,f=R.size(o),_=[{type:12,data:h?d:f},{type:12,data:n},{type:12,data:a},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],g=["type","type"];e.length===3&&(_.push(...X(e[2].dims)),g.push("rank")),_.push(...X(o));let b=$=>{let w="";t.transA&&t.transB?w="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?w="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?w="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(w="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let T=t.alpha===1?"":"value *= uniforms.alpha;",I=N("a",e[0].dataType,e[0].dims),k=N("b",e[1].dataType,e[1].dims),C=I.type.value,z=null,v=[I,k];e.length===3&&(z=N("c",e[2].dataType,e[2].dims.length),v.push(z));let B=j("output",e[0].dataType,o.length);v.push(B);let P=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${$.registerUniforms(P).declareVariables(...v)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${w}
    }

    ${T}
    ${z!=null?`let cOffset = ${z.broadcastedIndicesToOffset("vec2(m, n)",B)}; value += ${C}(uniforms.beta) * ${z.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=$=>{let w=N("a",e[0].dataType,e[0].dims),T=N("b",e[1].dataType,e[1].dims),I=null,k=[w,T];e.length===3&&(I=N("c",e[2].dataType,e[2].dims.length),k.push(I));let C=j("output",e[0].dataType,o.length);k.push(C);let z=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",B="";t.transA&&t.transB?(B=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(B=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(B=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(B=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let P=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${$.registerUniforms(z).declareVariables(...k)}
  var<workgroup> tile_a: array<array<${w.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${T.type.storage}, ${l}>, ${l}>;
  ${$.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${B}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${P}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${I!=null?`let cOffset = ${I.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${I.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return h?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:g},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:d*c},programUniforms:_}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:g},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:_}),getShaderSource:b}},bf=e=>{let t=e.transA,r=e.transB,i=e.alpha,n=e.beta;return{transA:t,transB:r,alpha:i,beta:n,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},$f=(e,t)=>{Yl(e.inputs),e.compute(Ql(e.inputs,t))}}),at,ct,Bt,Rt,Jl,ed,td,rd,id,nd,ad,sd,vf,xf,o_=L(()=>{"use strict";te(),ie(),ke(),ne(),[at,ct,Bt,Rt]=[0,1,2,3],Jl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},ed=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,td=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,rd=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,id=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,nd=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${at}] = batch;
     indices[${ct}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Bt}] = u32(r);
            indices[${Rt}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Bt}] = u32(clamp(r, 0, H - 1));
          indices[${Rt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Bt}] = gs_reflect(r, border[1], border[3]);
          indices[${Rt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,ad=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${at}], indices[${ct}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${at}], indices[${ct}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${at}], indices[${ct}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${at}], indices[${ct}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${at}], indices[${ct}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${at}], indices[${ct}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,sd=(e,t)=>{let r=N("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],n=N("grid",e[1].dataType,i.length,2),a=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(a=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[at,ct,Bt,Rt]=[0,3,1,2]);let s=j("output",e[0].dataType,a.length),o=r.type.value,l=R.size(a),d=[{type:12,data:l},...X(e[0].dims,i,a)],c=h=>`
  ${h.registerUniform("output_size","u32").declareVariables(r,n,s)}
  ${ed}
  ${td(o)}
  ${rd(t)}
  ${id(t)}
  ${nd(r,o,t)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Bt}]);
      let W_in = i32(uniforms.x_shape[${Rt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${at}], indices[${Bt}], indices[${Rt}]);
      let nxy = ${n.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${ad(s,o,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:h=>{let f=R.size(a);return{outputs:[{dims:a,dataType:h[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:d}},getShaderSource:c}},vf=(e,t)=>{Jl(e.inputs),e.compute(sd(e.inputs,t))},xf=e=>he({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),De,od,Sf,yn,ud,wr,Tf,kf=L(()=>{"use strict";te(),ie(),ke(),$a(),Sa(),ne(),Tt(),De=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,od=(e,t)=>{let r=e[0],i=De(e,1),n=De(e,2),a=De(e,3),s=De(e,4),o=De(e,5),l=De(e,6),d=De(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let c=r.dims[0],h=r.dims[1],f=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],_=h,g=0,b=0,S=Math.floor(f/t.numHeads);if(l&&d&&R.size(l.dims)&&R.size(d.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==c||l.dims[1]!==t.numHeads||l.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[0]!==c||d.dims[1]!==t.numHeads||d.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==d.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(d.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=l.dims[2],b=l.dims[2]}else if(l&&R.size(l.dims)||d&&R.size(d.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $;if(i&&R.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');$=2,_=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw new Error('Expect "value" be none when "key" has packed kv format.');$=5,_=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');$=0,_=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}if(a&&R.size(a.dims)>0){if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let w=g+_,T=0;if(s&&R.size(s.dims)>0){T=8;let z=s.dims;throw z.length===1?z[0]===c?T=1:z[0]===3*c+2&&(T=3):z.length===2&&z[0]===c&&z[1]===w&&(T=5),T===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let I=!1,k=f;if(n&&R.size(n.dims)>0){if(n.dims.length!==3&&n.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(_!==n.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=n.dims[2]}else{if(_!==n.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');k=n.dims[1]*n.dims[3],I=!0}}let C=!1;if(s&&R.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(o&&R.size(o.dims)>0){if(o.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(o.dims[0]!==c||o.dims[1]!==t.numHeads||o.dims[2]!==h||o.dims[3]!==w)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:c,sequenceLength:h,pastSequenceLength:g,kvSequenceLength:_,totalSequenceLength:w,maxSequenceLength:b,inputHiddenSize:0,hiddenSize:f,vHiddenSize:k,headSize:S,vHeadSize:Math.floor(k/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:T,scale:t.scale,broadcastResPosBias:C,passPastInKv:I,qkvFormat:$}},Sf=e=>he({...e}),yn=he({perm:[0,2,1,3]}),ud=(e,t,r,i,n,a,s)=>{let o=[i,n,a],l=R.size(o),d=[{type:12,data:l},{type:12,data:s},{type:12,data:a}],c=h=>{let f=j("qkv_with_bias",t.dataType,o),_=N("qkv",t.dataType,o),g=N("bias",r.dataType,o),b=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${h.registerUniforms(b).declareVariables(_,g,f)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:o,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:c},{inputs:[t,r],outputs:[-1]})[0]},wr=(e,t,r,i,n,a,s,o)=>{let l=a;if(s&&R.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=ud(e,a,s,t,i,r*n,o),l=l.reshape([t,i,r,n]),r===1||i===1?l:e.compute(qe(l,yn.perm),{inputs:[l],outputs:[-1]})[0]}else return a.dims.length===3&&(l=a.reshape([t,i,r,n])),r===1||i===1?l:e.compute(qe(l,yn.perm),{inputs:[l],outputs:[-1]})[0]},Tf=(e,t)=>{let r=od(e.inputs,t),i=e.inputs[0],n=De(e.inputs,1),a=De(e.inputs,2),s=De(e.inputs,3),o=De(e.inputs,4),l=De(e.inputs,5),d=De(e.inputs,6),c=De(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if((n==null?void 0:n.dims.length)===5)throw new Error("Packed KV is not implemented");let h=n&&a&&n.dims.length===4&&a.dims.length===4,f=wr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(h)return xr(e,f,n,a,o,void 0,d,c,l,r);if(!n||!a)throw new Error("key and value must be provided");let _=wr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,n,s,r.hiddenSize),g=wr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,a,s,2*r.hiddenSize);xr(e,f,_,g,o,void 0,d,c,l,r)}}),ld,dd,pd,cd,Xn,If,Ef,Cf=L(()=>{"use strict";te(),ie(),ke(),ne(),ld=e=>{if(!e||e.length<1)throw new Error("too few inputs")},dd=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(n=>r.push(Number(n))),i=r.length),he({numOutputs:i,axis:t.axis,splitSizes:r})},pd=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Z("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,cd=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let n=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(n):i===0?r.push(`if (output_number == ${i}u) { ${n} }`):i===t-1?r.push(`else { ${n} }`):r.push(`else if (output_number == ${i}) { ${n} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Xn=(e,t)=>{let r=e[0].dims,i=R.size(r),n=e[0].dataType,a=R.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),o=N("input",n,r.length),l=new Array(t.numOutputs),d=[],c=[],h=0,f=[{type:12,data:i}];for(let g=0;g<t.numOutputs;g++){h+=t.splitSizes[g],l[g]=h;let b=r.slice();b[a]=t.splitSizes[g],c.push(b),s[g]=j(`output${g}`,n,b.length),d.push({dims:c[g],dataType:e[0].dataType})}f.push({type:12,data:l},...X(r,...c));let _=g=>`
  ${g.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(o,...s)}
  ${pd(l.length)}
  ${cd(s)}

  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${o.offsetToIndices("global_idx")};
    var index = ${o.indicesGet("indices",a)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Z("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${o.indicesSet("indices",a,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:_,getRunData:()=>({outputs:d,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:f})}},If=(e,t)=>{ld(e.inputs);let r=e.inputs.length===1?t:dd(e.inputs,t);e.compute(Xn(e.inputs,r),{inputs:[0]})},Ef=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return he({axis:t,numOutputs:i,splitSizes:r})}}),hd,ni,zf,Af=L(()=>{"use strict";te(),ie(),ke(),ne(),hd=(e,t)=>{let[r,i,n,a]=e,{numHeads:s,rotaryEmbeddingDim:o}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!R.areEqual(i.dims,[])&&!R.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(!R.areEqual(n.dims,a.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(o>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],d=r.dims[r.dims.length-2],c=n.dims[0],h=R.sizeFromDimension(r.dims,1)/d,f=o===0?n.dims[1]*2:h/s;if(o>f)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(d!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(d>c)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(f/2!==n.dims[1]&&o/2!==n.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${n.dims[1]}`)},ni=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:n,scale:a}=t,s=e[0].dims[0],o=R.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],d=o/l,c=e[2].dims[1],h=n===0?c*2:d/i,f=new Array(s,l,d/h,h-c),_=R.computeStrides(f),g=[{type:1,data:a},{type:12,data:f},{type:12,data:_},...e[0].dims.length===3?new Array({type:12,data:[o,d,h,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[o,h,l*h,1]}):[],...X(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],b=S=>{let $=N("input",e[0].dataType,e[0].dims.length),w=N("position_ids",e[1].dataType,e[1].dims.length),T=N("cos_cache",e[2].dataType,e[2].dims.length),I=N("sin_cache",e[3].dataType,e[3].dims.length),k=j("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:f.length},{name:"global_strides",type:"u32",length:_.length},{name:"input_output_strides",type:"u32",length:_.length}]),`
        ${S.declareVariables($,w,T,I,k)}

        ${S.mainStart(tr)}
          let half_rotary_emb_dim = uniforms.${T.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${w.broadcastedIndicesToOffset("bsnh.xy",j("",w.type.tensor,2))};
            let position_id =
                u32(${w.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${$.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} -
                ${$.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${k.setByOffset("i","re")}
            let im = ${$.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} +
                ${$.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${k.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${k.setByOffset("k",$.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:he({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(R.size(f)/tr)},programUniforms:g})}},zf=(e,t)=>{hd(e.inputs,t),e.compute(ni(e.inputs,t))}}),fd,md,_n,gd,Of,u_=L(()=>{"use strict";ke(),te(),Sa(),kf(),Cf(),Tt(),Af(),ne(),fd=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let o=!1,l=r.dims[0],d=r.dims[1],c=r.dims.length===3?o?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],h=d,f=0,_=!i||i.dims.length===0,g=Math.floor(_?c/(t.numHeads+2*t.kvNumHeads):c/t.numHeads);_&&(c=g*t.numHeads);let b=a&&a.dims.length!==0,S=s&&s.dims.length!==0;if(b&&a.dims.length===4&&a.dims[0]===l&&a.dims[1]!==t.kvNumHeads&&a.dims[2]===t.kvNumHeads&&a.dims[3]===g)throw new Error("BSNH pastKey/pastValue is not supported");if(b&&S){if(a.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');f=a.dims[2]}else if(b||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let $=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');h=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==g)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw new Error('Expect "value" be none when "key" has packed kv format.');h=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==g)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');h=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');$=3}let w=0,T=!1,I=t.kvNumHeads?g*t.kvNumHeads:c;if(n&&n.dims.length>0){if(n.dims.length!==3&&n.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(h!==n.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');I=n.dims[2]}else{if(h!==n.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');I=n.dims[1]*n.dims[3],T=!0}}let k=e.length>4?e[5]:void 0;if(k){if(k.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let C=k.dims.reduce((z,v)=>z*v,1);if(C!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${C}.`);for(let z=0;z<k.dims.length;z++)if(k.dims[z]!==1&&k.dims[z]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${z}] = ${k.dims[z]}.`)}return{batchSize:l,sequenceLength:d,pastSequenceLength:f,kvSequenceLength:h,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:c,vHiddenSize:I,headSize:g,vHeadSize:Math.floor(I/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:T,qkvFormat:$}},md=he({perm:[0,2,1,3]}),_n=(e,t,r)=>{let i=t,n=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,n,r.headSize]),i=e.compute(qe(i,md.perm),{inputs:[i],outputs:[-1]})[0]),i},gd=(e,t,r,i)=>{let n=7,a=["type","type"],s=[e*t],o=e*t,l=[{type:12,data:o},{type:12,data:t},{type:12,data:e}],d=c=>{let h=N("seq_lens",r.dataType,r.dims),f=N("total_seq_lens",i.dataType,i.dims),_=j("pos_ids",n,s),g=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${c.registerUniforms(g).declareVariables(h,f,_)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${f.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${h.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${_.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:a},getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:l}),getShaderSource:d}},Of=(e,t)=>{var I;if(e.inputs.length>14&&e.inputs[14]||e.inputs.length>15&&e.inputs[15])throw new Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");let r=fd(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(((I=e.inputs[1])==null?void 0:I.dims.length)===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],n=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,a=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,o=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,d=e.inputs.length>5?e.inputs[6]:void 0,c=r.kvNumHeads?r.kvNumHeads:r.numHeads,h=he({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,c*r.headSize,c*r.headSize]}),[f,_,g]=!n&&!a?e.compute(Xn([i],h),{inputs:[i],outputs:[-1,-1,-1]}):[i,n,a],b,S;if(t.doRotary){let k=e.compute(gd(r.batchSize,r.sequenceLength,l,d),{inputs:[l,d],outputs:[-1]})[0],C=e.inputs[7],z=e.inputs[8],v=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),B=[f,k,C,z],P=[-1];b=e.compute(ni(B,v),{inputs:B,outputs:P})[0],B.splice(0,1,_);let G=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(ni(B,G),{inputs:B,outputs:P})[0]}let $=wr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?b:f,void 0,0),w=_n(e,t.doRotary?S:_,r),T=_n(e,g,r);xr(e,$,w,T,void 0,void 0,s,o,void 0,r,l,d)}}),wn,yd,_d,Bf,l_=L(()=>{"use strict";te(),ie(),Tt(),ne(),wn=(e,t,r,i,n,a,s,o)=>{let l=Te(a),d=l===1?"f32":`vec${l}f`,c=l===1?"vec2f":`mat2x${l}f`,h=n*s,f=64;h===1&&(f=256);let _=[n,s,a/l],g=[n,s,2],b=["rank","type","type"],S=[];S.push(...X(_,g));let $=w=>{let T=N("x",t.dataType,3,l),I=N("scale",r.dataType,r.dims),k=N("bias",i.dataType,i.dims),C=j("output",1,3,2),z=[T,I,k,C];return`
  var<workgroup> workgroup_shared : array<${c}, ${f}>;
  const workgroup_size = ${f}u;
  ${w.declareVariables(...z)}
  ${w.mainStart(f)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${d}(0);
    var squared_sum = ${d}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${d}(${T.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${c}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${St("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${St("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${o}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${o};${f}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:g,dataType:1}],dispatchGroup:{x:h},programUniforms:S}),getShaderSource:$},{inputs:[t,r,i],outputs:[-1]})[0]},yd=(e,t,r)=>{let i=t[0].dims,n=i,a=2,s=i[0],o=i[1],l=R.sizeFromDimension(i,a),d=Te(l),c=R.size(n)/d,h=wn(e,t[0],t[1],t[2],s,l,o,r.epsilon),f=[s,o,l/d],_=[s,o],g=["type","none"],b=S=>{let $=N("x",t[0].dataType,f.length,d),w=N("scale_shift",1,_.length,2),T=j("output",t[0].dataType,f.length,d),I=[$,w,T];return`
  ${S.registerUniform("output_size","u32").declareVariables(...I)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${T.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${w.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${$.getByOffset("global_idx")} * ${T.type.value}(scale_shift.x) + ${T.type.value}(scale_shift.y);
      ${T.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${d}`,inputDependencies:g},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(c/64)},programUniforms:[{type:12,data:c},...X(f,_,f)]}),getShaderSource:b},{inputs:[t[0],h]})},_d=(e,t,r)=>{let i=t[0].dims,n=i,a=i[0],s=i[i.length-1],o=R.sizeFromDimension(i,1)/s,l=Te(s),d=R.size(n)/l,c=[{type:12,data:o},{type:12,data:Math.floor(s/l)}],h=["type","type"],f=!1,_=[0,i.length-1];for(let $=0;$<i.length-2;$++)f=f||i[$+1]!==1,_.push($+1);f=f&&i[i.length-1]!==1;let g=f?e.compute(qe(e.inputs[0],_),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},($,w)=>i[_[w]])),b=wn(e,g,t[1],t[2],a,o,s,r.epsilon),S=$=>{let w=ze(t[0].dataType),T=l===1?"vec2f":`mat${l}x2f`,I=z=>{let v=z===0?"x":"y",B=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${w}(${B}(scale.${v}))`;case 2:return`vec2<${w}>(${B}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${w}>(${B}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw new Error(`Not supported compoents ${l}`)}},k=N("input",t[0].dataType,t[0].dims,l),C=j("output",t[0].dataType,n,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${k.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${T}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${$.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${I(0)}, ${I(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:c}),getShaderSource:S},{inputs:[t[0],b]})},Bf=(e,t)=>{t.format==="NHWC"?_d(e,e.inputs,t):yd(e,e.inputs,t)}}),wd,bd,Rf,d_=L(()=>{"use strict";te(),ie(),ne(),wd=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},bd=(e,t,r)=>{let i=t.simplified,n=e[0].dims,a=e[1],s=!i&&e[2],o=n,l=R.normalizeAxis(t.axis,n.length),d=R.sizeToDimension(n,l),c=R.sizeFromDimension(n,l),h=R.size(a.dims),f=s?R.size(s.dims):0;if(h!==c||s&&f!==c)throw new Error(`Size of X.shape()[axis:] == ${c}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${h} and bias size of ${f}`);let _=[];for(let k=0;k<n.length;++k)k<l?_.push(n[k]):_.push(1);let g=Te(c),b=["type","type"],S=[{type:12,data:d},{type:1,data:c},{type:12,data:Math.floor(c/g)},{type:1,data:t.epsilon}];s&&b.push("type");let $=r>1,w=r>2,T=k=>{let C=ze(e[0].dataType),z=[N("x",e[0].dataType,e[0].dims,g),N("scale",a.dataType,a.dims,g)];s&&z.push(N("bias",s.dataType,s.dims,g)),z.push(j("output",e[0].dataType,o,g)),$&&z.push(j("mean_data_output",1,_)),w&&z.push(j("inv_std_output",1,_));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${k.registerUniforms(v).declareVariables(...z)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Wn("f32",g)};
    var mean_square_vector = ${Wn("f32",g)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Jt(C,g,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${St("mean_vector",g)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${St("mean_square_vector",g)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Jt(C,g,"x[j + offset]")};
      let f32scale = ${Jt(C,g,"scale[j]")};
      output[j + offset] = ${z[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Jt(C,g,"bias[j]")}`:""}
      );
    }

    ${$?"mean_data_output[global_idx] = mean":""};
    ${w?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},I=[{dims:o,dataType:e[0].dataType}];return $&&I.push({dims:_,dataType:1}),w&&I.push({dims:_,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${g};${r};${i}`,inputDependencies:b},getRunData:()=>({outputs:I,dispatchGroup:{x:Math.ceil(d/64)},programUniforms:S}),getShaderSource:T}},Rf=(e,t)=>{wd(e.inputs),e.compute(bd(e.inputs,t,e.outputCount))}}),$d,Mf,p_=L(()=>{"use strict";ie(),Ca(),za(),$d=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Mf=e=>{$d(e.inputs);let t=er.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(Ea(e.inputs,{activation:""},t));else{let n=t[t.length-2],a=R.size(e.inputs[0].dims.slice(0,-2)),s=R.size(e.inputs[1].dims.slice(0,-2));if(a!==1&&n===1&&s===1){let o=e.inputs[0].reshape([1,a,i]),l=e.inputs[1].reshape([1,i,r]),d=[1,a,r],c=[o,l];e.compute(ii(c,{activation:""},t,d),{inputs:c})}else e.compute(ii(e.inputs,{activation:""},t))}}}),vd,xd,Sd,Df,Nf,c_=L(()=>{"use strict";te(),ie(),ke(),ne(),vd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let n=Math.floor((t.k+t.blockSize-1)/t.blockSize),a=t.blockSize/8*t.bits,s=e[1];if(!R.areEqual(s.dims,[t.n,n,a]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let o=e[2].dims;if(R.size(o)!==t.n*n)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,d=t.n*(t.bits===8?n:Math.floor((n*t.bits+7)/8));if(R.size(l)!==d)throw new Error("zeroPoints input size error.")}},xd=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,o=r.slice(0,i-2),l=R.size(o),d=e[1].dims[2]/4,c=e[0].dataType,h=Te(t.k),f=Te(d),_=Te(s),g=o.concat([n,s]),b=n>1&&s/_%2===0?2:1,S=R.size(g)/_/b,$=64,w=[],T=[l,n,a/h],I=R.convertShape(e[1].dims).slice();I.splice(-1,1,d/f),w.push(...X(T)),w.push(...X(I)),w.push(...X(e[2].dims)),e.length===4&&w.push(...X(R.convertShape(e[3].dims)));let k=[l,n,s/_];w.push(...X(k));let C=z=>{let v=T.length,B=N("a",e[0].dataType,v,h),P=N("b",12,I.length,f),G=N("scales",e[2].dataType,e[2].dims.length),V=[B,P,G],U=e.length===4?N("zero_points",12,e[3].dims.length):void 0;U&&V.push(U);let O=k.length,H=j("output",e[0].dataType,O,_),Y=ze(e[0].dataType),Q=(()=>{switch(h){case 1:return`array<${Y}, 8>`;case 2:return`mat4x2<${Y}>`;case 4:return`mat2x4<${Y}>`;default:throw new Error(`${h}-component is not supported.`)}})(),re=Math.floor(32/t.bits),J=Math.floor(re/8),_e=()=>{let ee="";for(let W=0;W<J;W++){let we=W*t.bits*4,$e=we+t.bits;ee+=`
          // reuse a data (pass ${W})
            var input_offset${W>0?W:""} = ${W===0?B.indicesToOffset(`${B.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${W>0?W:""}: ${Q};
            for (var j${W>0?W:""}: u32 = 0; j${W>0?W:""} < ${8/h}; j${W>0?W:""}++) {
              a_data${W>0?W:""}[j${W>0?W:""}] = ${B.getByOffset(`input_offset${W>0?W:""}`)};
              input_offset${W>0?W:""}++;
            }
          `;for(let ge=0;ge<_*b;ge++)ee+=`
            b_value = ${f===1?`b${ge}_data`:`b${ge}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${W*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${we}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${$e}u) & b_mask);`}
            b_quantized_values = ${Q}(${Array.from({length:4},(Me,Be)=>`${Y}(b_value_lower[${Be}]), ${Y}(b_value_upper[${Be}])`).join(", ")});
            b_dequantized_values = ${h===1?`${Q}(${Array.from({length:8},(Me,Be)=>`(b_quantized_values[${Be}] - ${U?`zero_point${ge}`:"zero_point"}) * scale${ge}`).join(", ")});`:`(b_quantized_values - ${Q}(${Array(8).fill(`${U?`zero_point${ge}`:"zero_point"}`).join(",")})) * scale${ge};`};
            workgroup_shared[local_id.x * ${b} + ${Math.floor(ge/_)}]${_>1?`[${ge%_}]`:""} += ${Array.from({length:8/h},(Me,Be)=>`${h===1?`a_data${W>0?W:""}[${Be}] * b_dequantized_values[${Be}]`:`dot(a_data${W>0?W:""}[${Be}], b_dequantized_values[${Be}])`}`).join(" + ")};
          `}return ee},M=()=>{let ee=`
            var col_index = col * ${_};
            ${U?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${Y}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let W=0;W<_*b;W++)ee+=`
            let scale${W} = ${G.getByOffset("col_index * nBlocksPerCol + block")};
            ${U?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${U.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${W} = ${Y}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return ee},K=()=>{let ee=`col_index = col * ${_};`;for(let W=0;W<_*b;W++)ee+=`
            let b${W}_data = ${P.getByIndices(`${P.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return ee+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${Q};
            var b_dequantized_values: ${Q};`,ee};return`
        var<workgroup> workgroup_shared: array<${H.type.value}, ${b*$}>;
        ${z.declareVariables(...V,H)}
        ${z.mainStart([$,1,1])}
          let output_indices = ${H.offsetToIndices(`(global_idx / ${$}) * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${$}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/h};
            ${M()}
            for (var word: u32 = 0; word < ${d}; word += ${f}) {
              ${K()}
              for (var i: u32 = 0; i < ${f}; i++) {
                ${_e()}
                word_offset += ${re/h};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${b}) {
            var output_value: ${H.type.value} = ${H.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${$}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${b};
            }
            ${H.setByIndices(`${H.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${h};${f};${_};${b};${$}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:g,dataType:c}],dispatchGroup:{x:S},programUniforms:w}),getShaderSource:C}},Sd=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,o=r.slice(0,i-2),l=R.size(o),d=e[1].dims[2]/4,c=e[0].dataType,h=Te(t.k),f=Te(d),_=o.concat([n,s]),g=128,b=s%8===0?8:s%4===0?4:1,S=g/b,$=Math.floor(32/t.bits),w=S*f*$,T=w/h,I=w/t.blockSize,k=R.size(_)/b,C=[],z=[l,n,a/h],v=R.convertShape(e[1].dims).slice();v.splice(-1,1,d/f),C.push(...X(z)),C.push(...X(v)),C.push(...X(e[2].dims)),e.length===4&&C.push(...X(R.convertShape(e[3].dims)));let B=[l,n,s];C.push(...X(B));let P=G=>{let V=z.length,U=N("a",e[0].dataType,V,h),O=N("b",12,v.length,f),H=N("scales",e[2].dataType,e[2].dims.length),Y=[U,O,H],Q=e.length===4?N("zero_points",12,e[3].dims.length):void 0;Q&&Y.push(Q);let re=B.length,J=j("output",e[0].dataType,re),_e=ze(e[0].dataType),M=()=>{switch(h){case 1:return`
          let a_data0 = vec4<${_e}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${_e}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${_e}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${_e}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${h}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${U.type.value}, ${T}>;
        var<workgroup> inter_results: array<array<${J.type.value}, ${S}>, ${b}>;
        ${G.declareVariables(...Y,J)}
        ${G.mainStart([S,b,1])}
          let output_indices = ${J.offsetToIndices(`workgroup_index * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${I} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${T};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${T}; a_offset += ${g})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${U.getByIndices(`${U.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${U.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${I} + local_id.x;
            ${Q?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${Q.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${_e}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${_e}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${H.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${O.getByIndices(`${O.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/h};
            for (var i: u32 = 0; i < ${f}; i++) {
              let b_value = ${f===1?"b_data":"b_data[i]"};
              ${(()=>{let K=Math.floor($/8),ee="";for(let W=0;W<K;W++){let we=W*t.bits*4,$e=we+t.bits;ee+=`
              ${M()}
              {${t.bits===2?`
                let half_word = b_value >> ${W*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${we}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${$e}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${_e}>(${Array.from({length:4},(ge,Me)=>`${_e}(b_value_lower[${Me}]), ${_e}(b_value_upper[${Me}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${_e}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(ge,Me)=>`${`dot(a_data${Me}, b_dequantized_values[${Me}])`}`).join(" + ")};
              }
              word_offset += ${8/h};`}return ee})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${b}) {
            var output_value: ${J.type.value} = ${J.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${J.setByIndices(`${J.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${h};${f};${S};${b}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:c}],dispatchGroup:{x:k},programUniforms:C}),getShaderSource:P}},Df=(e,t)=>{vd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Sd(e.inputs,t)):e.compute(xd(e.inputs,t))},Nf=e=>he(e)}),Td,kd,Id,Ed,Cd,zd,Ad,Od,Pf,h_=L(()=>{"use strict";te(),ie(),ne(),Td=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},kd=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
            k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
              break;
            }
            offset += k * i32(${Z("uniforms.x_strides",n,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Id=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Z("uniforms.x_shape",n,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Z("uniforms.x_shape",n,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Ed=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
                  k = i32(${Z("uniforms.x_shape",n,t)}) - 1;
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Cd=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0)  {
                  k += i32(${Z("uniforms.x_shape",n,t)}]);
                }
                if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
                  k -= i32(${Z("uniforms.x_shape",n,t)});
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},zd=(e,t,r)=>{switch(r.mode){case 0:return kd(e,t,r.pads.length);case 1:return Id(e,t,r.pads.length);case 2:return Ed(e,t,r.pads.length);case 3:return Cd(e,t,r.pads.length);default:throw new Error("Invalid mode")}},Ad=(e,t)=>{let r=R.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,n=R.size(r),a=[{type:12,data:n},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&a.push({type:s?e[2].dataType:1,data:t.value}),a.push(...X(e[0].dims,r));let o=["rank"],l=d=>{let c=j("output",e[0].dataType,r.length),h=N("x",e[0].dataType,i.length),f=h.type.value,_=zd(c,i.length,t),g=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&g.push({name:"constant_value",type:s?f:"f32"}),`
            ${d.registerUniforms(g).declareVariables(h,c)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${c.offsetToIndices("global_idx")};

            var value = ${f}(0);
            ${_}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:o},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(R.size(r)/64)},programUniforms:a}),getShaderSource:l}},Od=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,n=e[0].dims.length,a=new Int32Array(2*n).fill(0);if(e.length>=4){let o=e[3].getBigInt64Array();for(let l=0;l<o.length;l++)a[Number(o[l])]=Number(r[l]),a[Number(o[l])+n]=Number(r[l+o.length])}else r.forEach((o,l)=>a[Number(l)]=Number(o));let s=[];return a.forEach(o=>s.push(o)),{mode:t.mode,value:i,pads:s}}else return t},Pf=(e,t)=>{Td(e.inputs);let r=Od(e.inputs,t);e.compute(Ad(e.inputs,r),{inputs:[0]})}}),cr,bn,$n,vn,xn,Bd,Rd,Sn,Tn,Uf,Lf,kn,Wf,qf,In,Vf,Gf,Hf,Ff,f_=L(()=>{"use strict";Ge(),te(),ie(),ne(),cr=e=>{if(me.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},bn=(e,t,r)=>{let i=t.format==="NHWC",n=e.dims.slice();i&&n.splice(1,0,n.pop());let a=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),o=t.strides.slice(),l=a?t.dilations.slice():[],d=t.pads.slice();ti.adjustPoolAttributes(r,n,s,o,l,d);let c=ti.computePoolOutputShape(r,n,o,l,s,d,t.autoPad,t.ceilMode),h=Object.assign({},t);a?Object.assign(h,{kernelShape:s,strides:o,pads:d,dilations:l,cacheKey:t.cacheKey}):Object.assign(h,{kernelShape:s,strides:o,pads:d,cacheKey:t.cacheKey});let f=c.slice();return f.push(f.splice(1,1)[0]),[h,i?f:c]},$n=(e,t)=>{let r=t.format==="NHWC",i=R.size(e),n=R.size(t.kernelShape),a=[{type:12,data:i},{type:12,data:n}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let o=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],d=t.pads[t.pads.length/2-1],c=t.pads[t.pads.length-1],h=!!(d+c);a.push({type:12,data:o},{type:12,data:l},{type:12,data:d},{type:12,data:c}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let f=!1;if(t.kernelShape.length===2){let _=t.kernelShape[t.kernelShape.length-2],g=t.strides[t.strides.length-2],b=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];f=!!(b+S),a.push({type:12,data:_},{type:12,data:g},{type:12,data:b},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[a,s,!0,h,f]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let o=R.computeStrides(t.kernelShape);a.push({type:12,data:o},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:o.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((d,c)=>d+c);return[a,s,!!l,!1,!1]}},vn=(e,t,r,i,n,a,s,o,l,d,c,h)=>{let f=n.format==="NHWC",_=t.type.value,g=j("output",t.type.tensor,i);if(n.kernelShape.length<=2){let b="",S="",$="",w=r-(f?2:1);if(c?b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${w}] < 0 || xIndices[${w}]
                      >= uniforms.x_shape[${w}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`:b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`,n.kernelShape.length===2){let T=r-(f?3:2);h?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${T}] < 0 || xIndices[${T}] >= uniforms.x_shape[${T}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                `,$=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,g)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${g.offsetToIndices("global_idx")};
              var xIndices = ${g.offsetToIndices("global_idx")};

              var value = ${_}(${o});
              var pad = 0;
              ${S}
              ${b}
              ${$}
              ${s}

              output[global_idx] = value;
            }`}else{if(f)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let b=n.kernelShape.length,S=n.pads.length,$="";return d?$=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${a}
              }`:$=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${a}
            `,`
            ${e.registerUniforms(l).declareVariables(t,g)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${g.offsetToIndices("global_idx")};
              var xIndices = ${g.offsetToIndices("global_idx")};

              var offsets: array<u32, ${b}>;

              var value = ${_}(${o});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${b-1}u; j++) {
                  offsets[j] = offset / ${Z("uniforms.kernelStrides","j",b)};
                  offset -= offsets[j] * ${Z("uniforms.kernelStrides","j",b)};
                }
                offsets[${b-1}] = offset;

                isPad = false;
                for (var j = ${r-b}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Z("uniforms.strides",`j - ${r-b}u`,b)}
                    + offsets[j - ${r-b}u] - ${Z("uniforms.pads","j - 2u",S)};
                  ${$}
              }
              ${s}

              output[global_idx] = value;
            }`}},xn=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Bd=e=>`${xn(e)};${e.countIncludePad}`,Rd=e=>`${xn(e)};${e.storageOrder};${e.dilations}`,Sn=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Tn=(e,t,r,i)=>{let[n,a]=bn(t,i,r),s=N("x",t.dataType,t.dims.length),o=s.type.value,l="value += x_val;",d="";n.countIncludePad?d+=`value /= ${o}(uniforms.kernelSize);`:d+=`value /= ${o}(i32(uniforms.kernelSize) - pad);`;let[c,h,f,_,g]=$n(a,n);c.push(...X(t.dims,a));let b=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${f};${_};${g}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(R.size(a)/64)},programUniforms:c}),getShaderSource:S=>vn(S,s,t.dims.length,a.length,n,l,d,0,h,f,_,g)}},Uf=e=>{let t=e.count_include_pad!==0,r=Sn(e);if(r.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Bd(i)}},Lf=(e,t)=>{cr(e.inputs),e.compute(Tn("AveragePool",e.inputs[0],!1,t))},kn={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Wf=e=>{let t=e.format;return{format:t,...kn,cacheKey:t}},qf=(e,t)=>{cr(e.inputs),e.compute(Tn("GlobalAveragePool",e.inputs[0],!0,t))},In=(e,t,r,i)=>{let[n,a]=bn(t,i,r),s=`
      value = max(x_val, value);
    `,o="",l=N("x",t.dataType,t.dims.length),d=["rank"],[c,h,f,_,g]=$n(a,n);return c.push(...X(t.dims,a)),{name:e,shaderCache:{hint:`${i.cacheKey};${f};${_};${g}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(R.size(a)/64)},programUniforms:c}),getShaderSource:b=>vn(b,l,t.dims.length,a.length,n,s,o,t.dataType===10?-65504:-1e5,h,f,_,g)}},Vf=(e,t)=>{cr(e.inputs),e.compute(In("MaxPool",e.inputs[0],!1,t))},Gf=e=>{let t=e.storage_order,r=e.dilations,i=Sn(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");let n={storageOrder:t,dilations:r,...i,cacheKey:""};return{...n,cacheKey:Rd(n)}},Hf=e=>{let t=e.format;return{format:t,...kn,cacheKey:t}},Ff=(e,t)=>{cr(e.inputs),e.compute(In("GlobalMaxPool",e.inputs[0],!0,t))}}),Md,Dd,jf,Kf,m_=L(()=>{"use strict";te(),ie(),ke(),ne(),Md=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((n,a)=>a===t.axis||n===e[0].dims[a]).reduce((n,a)=>n&&a,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Dd=(e,t)=>{let r=R.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,n=i===3,a=e[0].dims,s=e[1].dataType,o=R.size(a),l=i===3||i===2,d=l?[Math.ceil(R.size(e[0].dims)/4)]:e[0].dims,c=e[1].dims,h=e.length>2?e[2]:void 0,f=h?l?[Math.ceil(R.size(h.dims)/4)]:h.dims:void 0,_=c.length===0||c.length===1&&c[0]===1,g=_===!1&&c.length===1,b=Te(o),S=_&&(!l||b===4),$=S?b:1,w=S&&!l?b:1,T=N("input",l?12:i,d.length,w),I=N("scale",s,c.length),k=h?N("zero_point",l?12:i,f.length):void 0,C=j("output",s,a.length,$),z=[T,I];k&&z.push(k);let v=[d,c];h&&v.push(f);let B=[{type:12,data:o/$},{type:12,data:r},{type:12,data:t.blockSize},...X(...v,a)],P=G=>{let V=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${G.registerUniforms(V).declareVariables(...z,C)}
      ${G.mainStart()}
          ${G.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${T.getByOffset("global_idx / 4")};
            let x_vec = ${n?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${$===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${T.getByOffset("global_idx")};`};

          // Set scale input
          ${_?`let scale_value= ${I.getByOffset("0")}`:g?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${I.getByOffset("scale_index")};`:`
            var scale_indices: ${I.type.indices} = output_indices;
            let index = ${I.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${I.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${I.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${k?_?l?`
                let zero_point_input = ${k.getByOffset("0")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${k.getByOffset("0")}`:g?l?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${k.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${k.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${I.indicesToOffset("scale_indices")};
                let zero_point_input = ${k.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${k.getByIndices("scale_indices")};`:`let zero_point_value = ${l?n?"i32":"u32":T.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:k?["rank","rank","rank"]:["rank","rank"]},getShaderSource:P,getRunData:()=>({outputs:[{dims:a,dataType:s}],dispatchGroup:{x:Math.ceil(o/$/64),y:1,z:1},programUniforms:B})}},jf=(e,t)=>{Md(e.inputs,t),e.compute(Dd(e.inputs,t))},Kf=e=>he({axis:e.axis,blockSize:e.blockSize})}),Nd,Pd,Zf,g_=L(()=>{"use strict";Ge(),te(),ne(),Nd=(e,t,r)=>{let i=e===t,n=e<t&&r<0,a=e>t&&r>0;if(i||n||a)throw new Error("Range these inputs' contents are invalid.")},Pd=(e,t,r,i)=>{let n=Math.abs(Math.ceil((t-e)/r)),a=[n],s=n,o=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...X(a)],l=d=>{let c=j("output",i,a.length),h=c.type.value,f=[{name:"outputSize",type:"u32"},{name:"start",type:h},{name:"delta",type:h}];return`
        ${d.registerUniforms(f).declareVariables(c)}
        ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${h}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:a,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:o})}},Zf=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),me.webgpu.validateInputContent&&Nd(t,r,i),e.compute(Pd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Ud,Ld,Xf,Yf,y_=L(()=>{"use strict";te(),ie(),ke(),ne(),Ud=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let n=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,a=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${n}bitcast<${i}>(oldValue) + (${r})${a}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${n}max(bitcast<f32>(oldValue), (${r}))${a}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${n}min(bitcast<${i}>(oldValue), (${r}))${a}`;case"mul":return`${n}(bitcast<${i}>(oldValue) * (${r}))${a}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Ld=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r,a=1,s=Math.ceil(R.sizeToDimension(i,i.length-1)/a),o=i[i.length-1],l=R.sizeFromDimension(r,o),d=[{type:12,data:s},{type:12,data:o},{type:12,data:l},...X(e[1].dims,e[2].dims,n)],c=h=>{let f=N("indices",e[1].dataType,e[1].dims.length),_=N("updates",e[2].dataType,e[2].dims.length,a),g=t.reduction!=="none"&&t.reduction!==""?$c("output",e[0].dataType,n.length):j("output",e[0].dataType,n.length,a);return`
      ${h.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(f,_,g)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Ud(t.reduction,"output[data_offset + i]","value",g.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}),getShaderSource:c}},Xf=e=>he({reduction:e.reduction}),Yf=(e,t)=>{e.compute(Ld(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Wd,qd,Vd,En,Gd,Hd,Fd,jd,Kd,Zd,Xd,Yd,Cn,Qd,Jd,ep,tp,rp,Qf,Jf,__=L(()=>{"use strict";te(),ie(),ke(),ne(),Wd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},qd=(e,t,r)=>{t.every(n=>n>=0&&n<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((n,a)=>i[n]=e[a]),i},Vd=(e,t,r,i,n,a)=>{let[s,o,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],d=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(c=>a.push(c));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(o>0&&e.length>o&&e[o].dims.length===1&&e[o].dims[0]>0){if(e[o].getFloat32Array().forEach(c=>i.push(c)),i.length!==0&&i.length!==d&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Wd(i,t),t.axes.length>0&&qd(i,t.axes,d).forEach((c,h)=>i[h]=c)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(c=>n.push(Number(c))),n.length!==0&&n.length!==d&&r>=18&&n.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(n.length!==0&&n.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof n<"u"&&i.length>0&&n.length>d)throw new Error("Resize requires only of scales or sizes to be specified")},En=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Gd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${En("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${En("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Hd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Fd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),n=e.length===0?i:e.slice();return t.length>0?(t.forEach((a,s)=>{i[a]=n[s],i[s+r]=n[t.length+s]}),i):n},jd=(e,t,r,i)=>{let n=[];if(r.length>0)if(i.length>0){if(e.forEach(a=>n.push(a)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((a,s)=>n[a]=r[s])}else r.forEach(a=>n.push(a));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");n=e.map((a,s)=>Math.round(a*t[s]))}return n},Kd=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(a=>t[a]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(a=>t[a]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let n=e.slice();return r.axes.length>0?(r.axes.forEach(a=>t[a]=i),r.axes.forEach(a=>n[a]=Math.round(e[a]*t[a]))):(t.fill(i,0,t.length),n.forEach((a,s)=>n[s]=Math.round(a*t[s]))),n},Zd=(e,t,r,i,n)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Z("uniforms.scales","i",i)};
        var roi_low = ${Z("uniforms.roi","i",n)};
        var roi_hi = ${Z("uniforms.roi",`i + ${t.length}`,n)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Z("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Xd=(e,t,r,i,n,a,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Z("uniforms.scales","i",n)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Z("uniforms.roi","i",a)};
          var roi_hi = ${Z("uniforms.roi",`i + ${r.length}`,a)};
          var input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,Yd=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Z("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Cn=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Qd=(e,t,r,i,n)=>{let[a,s,o,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],d=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${d} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(col, ${r[o]} - 1))`)};
      ${Cn(e,l,a,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${d} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${d} = originalIndices[${s}];
      var col:${d} = originalIndices[${o}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[o]} - 1)) {
        return ${n};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[o]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${a}])`:"0"};
      var x11: ${d} = getInputValue(batch, channel, row1, col1);
      var x12: ${d} = getInputValue(batch, channel, row1, col2);
      var x21: ${d} = getInputValue(batch, channel, row2, col1);
      var x22: ${d} = getInputValue(batch, channel, row2, col2);
      var dx1: ${d} = abs(row - ${d}(row1));
      var dx2: ${d} = abs(${d}(row2) - row);
      var dy1: ${d} = abs(col - ${d}(col1));
      var dy2: ${d} = abs(${d}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Jd=(e,t,r,i,n,a,s,o,l,d)=>{let c=r.length===2,h=!0,[f,_]=c?[0,1]:h?[2,3]:[1,2],g=e.type.value,b=S=>{let $=S===f?"row":"col";return`
      fn ${$}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${g} {
        var output_index = ${t.indicesGet("output_indices",S)};
        var originalIdx: ${g} = getOriginalCoordinateFromResizedCoordinate(output_index, ${n[S]},
        ${i[S]}, ${r[S]}, ${a[S]}, ${a[S]} + ${r.length});
        var fractOriginalIdx: ${g} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${o} && (originalIdx < 0 || originalIdx > (${r[S]} - 1))) {
          return ${l};
        }
        var data: array<${g}, 4> = array<${g}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${$}: ${g} = originalIdx + ${g}(i);
          if (${$} < 0 || ${$} >= ${r[S]}) {
            ${d?`coefs[i + 1] = 0.0;
                        continue;`:o?`return ${l};`:`${$} = max(0, min(${$}, ${r[S]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",S,`u32(${$})`)};
          data[i + 1] = ${S===f?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${b(f)};
    ${b(_)};
  fn getCubicInterpolationCoefs(s: ${g}) -> array<${g}, 4> {
    var absS = abs(s);
    var coeffs: array<${g}, 4> = array<${g}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${g} = 1.0 - absS;
    var twoMinusAbsS: ${g} = 2.0 - absS;
    var onePlusAbsS: ${g} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${g}, 4>, coefs: array<${g}, 4>) -> ${g} {
    var coefsSum: ${g} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${g} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},ep=(e,t,r,i,n)=>{let[a,s,o,l,d]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],c=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${c} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(height, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${Cn(e,d,a,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${c} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${c} = originalIndices[${s}];
      var height:${c} = originalIndices[${o}];
      var width:${c} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[o]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${n};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[o]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${a}])`:"0"};

      var x111: ${c} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${c} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${c} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${c} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${c} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${c} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${c} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${c} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${c} = abs(depth - ${c}(depth1));
      var dx2: ${c} = abs(${c}(depth2) - depth);
      var dy1: ${c} = abs(height - ${c}(height1));
      var dy2: ${c} = abs(${c}(height2) - height);
      var dz1: ${c} = abs(width - ${c}(width1));
      var dz2: ${c} = abs(${c}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},tp=(e,t,r,i,n,a)=>{let s=e.dims,o=Fd(a,t.axes,s.length),l=jd(s,i,n,t.axes),d=i.slice();i.length===0&&(d=s.map((w,T)=>w===0?1:l[T]/w),t.keepAspectRatioPolicy!=="stretch"&&(l=Kd(s,d,t)));let c=j("output",e.dataType,l.length),h=N("input",e.dataType,s.length),f=R.size(l),_=s.length===l.length&&s.every((w,T)=>w===l[T]),g=t.coordinateTransformMode==="tf_crop_and_resize",b=t.extrapolationValue,S=h.type.value,$=w=>`
      ${_?"":`
      ${Gd(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${Yd(h,s)};
              ${Hd(t.nearestMode,r,S)};
              ${Xd(h,c,s,l,d.length,o.length,g)};
              `;case"linear":return`
              ${Zd(c,s,l,d.length,o.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${Qd(h,c,s,g,b)}`;if(s.length===3||s.length===5)return`${ep(h,c,s,g,b)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${Jd(h,c,s,l,d,o,t.cubicCoeffA,g,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${w.registerUniform("output_size","u32").registerUniform("scales","f32",d.length).registerUniform("roi","f32",o.length).declareVariables(h,c)}
      ${w.mainStart()}
        ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${_?"output[global_idx] = input[global_idx];":`
        let output_indices = ${c.offsetToIndices("global_idx")};
        var input_indices: ${h.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${h.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${d.length>0?t.mode==="cubic"?d:d.length:""}|${n.length>0?n:""}|${o.length>0?o:""}|${_}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:$,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},{type:1,data:d},{type:1,data:o},...X(s,l)]})}},rp=e=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},Qf=(e,t)=>{let r=[],i=[],n=[],a=rp(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Vd(e.inputs,t,a,r,i,n),e.compute(tp(e.inputs[0],t,a,r,i,n),{inputs:[0]})},Jf=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,n=e.cubicCoeffA,a=e.excludeOutside!==0,s=e.extrapolationValue,o=e.keepAspectRatioPolicy,l=e.mode,d=e.nearestMode===""?"simple":e.nearestMode;return he({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:n,excludeOutside:a,extrapolationValue:s,keepAspectRatioPolicy:o,mode:l,nearestMode:d})}}),ip,np,em,w_=L(()=>{"use strict";te(),ie(),ne(),ip=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let n=t.dims[t.dims.length-1],a=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==n)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==a)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==n)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==n)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==n)throw new Error("Bias must have the same hidden size as input")}},np=(e,t,r,i)=>{let n=t.simplified,a=e[0].dims,s=R.size(a),o=a,l=s,d=a.slice(-1)[0],c=i?a.slice(0,-1).concat(1):[],h=!n&&e.length>3,f=e.length>4,_=i&&r>1,g=i&&r>2,b=r>3,S=64,$=Te(d),w=[{type:12,data:l},{type:12,data:$},{type:12,data:d},{type:1,data:t.epsilon}],T=k=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],z=[N("x",e[0].dataType,e[0].dims,$),N("skip",e[1].dataType,e[1].dims,$),N("gamma",e[2].dataType,e[2].dims,$)];h&&z.push(N("beta",e[3].dataType,e[3].dims,$)),f&&z.push(N("bias",e[4].dataType,e[4].dims,$)),z.push(j("output",e[0].dataType,o,$)),_&&z.push(j("mean_output",1,c)),g&&z.push(j("inv_std_output",1,c)),b&&z.push(j("input_skip_bias_sum",e[0].dataType,o,$));let v=ze(e[0].dataType),B=ze(1,$);return`

      ${k.registerUniforms(C).declareVariables(...z)}
      var<workgroup> sum_shared : array<${B}, ${S}>;
      var<workgroup> sum_squared_shared : array<${B}, ${S}>;

      ${k.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${f?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${b?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Jt(v,$,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${St("sum",$)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${St("square_sum",$)} / f32(uniforms.hidden_size) ${n?"":"- mean * mean"} + uniforms.epsilon);
        ${_?"mean_output[global_idx] = mean;":""}
        ${g?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${n?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${h?"+ beta[offset1d + i]":""};
        }
      }`},I=[{dims:o,dataType:e[0].dataType}];return r>1&&I.push({dims:c,dataType:1}),r>2&&I.push({dims:c,dataType:1}),r>3&&I.push({dims:a,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${$};${_};${g};${b}`,inputDependencies:e.map((k,C)=>"type")},getShaderSource:T,getRunData:()=>({outputs:I,dispatchGroup:{x:Math.ceil(l/d)},programUniforms:w})}},em=(e,t)=>{ip(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(np(e.inputs,t,e.outputCount,!1),{outputs:r})}}),ap,hr,sp,zn,op,up,tm,rm,b_=L(()=>{"use strict";te(),ie(),ke(),ne(),ap=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},hr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},sp=(e,t)=>{if(e.length>1){let r=hr(e,1),i=hr(e,2),n=hr(e,3);return n.length===0&&(n=[...Array(e[0].dims.length).keys()]),he({starts:r,ends:i,axes:n})}else return t},zn=(e,t,r,i,n)=>{let a=e;return e<0&&(a+=r[i[t]]),n[t]<0?Math.max(0,Math.min(a,r[i[t]]-1)):Math.max(0,Math.min(a,r[i[t]]))},op=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
            let steps_i = ${Z("uniforms.steps","i",r.length)};
            let signs_i = ${Z("uniforms.signs","i",r.length)};
            let starts_i = ${Z("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,up=(e,t)=>{let r=e[0].dims,i=R.size(r),n=t.axes.length>0?R.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],a=hr(e,4);a.forEach($=>$!==0||(()=>{throw new Error("step cannot be 0")})),a.length===0&&(a=Array(n.length).fill(1));let s=t.starts.map(($,w)=>zn($,w,r,n,a)),o=t.ends.map(($,w)=>zn($,w,r,n,a));if(n.length!==s.length||n.length!==o.length)throw new Error("start, ends and axes should have the same number of elements");if(n.length!==r.length)for(let $=0;$<r.length;++$)n.includes($)||(s.splice($,0,0),o.splice($,0,r[$]),a.splice($,0,1));let l=a.map($=>Math.sign($));a.forEach(($,w,T)=>{if($<0){let I=(o[w]-s[w])/$,k=s[w],C=k+I*a[w];s[w]=C,o[w]=k,T[w]=-$}});let d=r.slice(0);n.forEach(($,w)=>{d[$]=Math.ceil((o[$]-s[$])/a[$])});let c={dims:d,dataType:e[0].dataType},h=j("output",e[0].dataType,d.length),f=N("input",e[0].dataType,e[0].dims.length),_=R.size(d),g=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:a.length}],b=[{type:12,data:_},{type:12,data:s},{type:6,data:l},{type:12,data:a},...X(e[0].dims,d)],S=$=>`
      ${$.registerUniforms(g).declareVariables(f,h)}
        ${op(f,h,r)}
        ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${h.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${h.setByOffset("global_idx",f.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${a.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[c],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:b})}},tm=(e,t)=>{ap(e.inputs,t);let r=sp(e.inputs,t);e.compute(up(e.inputs,r),{inputs:[0]})},rm=e=>{let t=e.starts,r=e.ends,i=e.axes;return he({starts:t,ends:r,axes:i})}}),lp,dp,im,nm,$_=L(()=>{"use strict";te(),ie(),ke(),Tt(),ne(),lp=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},dp=(e,t)=>{let r=e.inputs[0],i=r.dims,n=R.size(i),a=i.length,s=R.normalizeAxis(t.axis,a),o=s<i.length-1,l,d=[];o?(d=Array.from({length:a},(z,v)=>v),d[s]=a-1,d[a-1]=s,l=e.compute(qe(r,d),{inputs:[r],outputs:[-1]})[0]):l=r;let c=l.dims,h=c[a-1],f=n/h,_=Te(h),g=h/_,b=64;f===1&&(b=256);let S=(z,v)=>v===4?`max(max(${z}.x, ${z}.y), max(${z}.z, ${z}.w))`:v===2?`max(${z}.x, ${z}.y)`:v===3?`max(max(${z}.x, ${z}.y), ${z}.z)`:z,$=N("x",l.dataType,l.dims,_),w=j("result",l.dataType,l.dims,_),T=$.type.value,I=ze(l.dataType)==="f32"?`var threadMax = ${T}(-3.4028234663852886e+38f);`:`var threadMax = ${T}(-65504.0h);`,k=z=>`
      var<workgroup> rowMaxShared : ${T};
      var<workgroup> rowSumShared : ${T};
      var<workgroup> threadShared : array<${T}, ${b}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${T} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${T}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${z.registerUniform("packedCols","i32").declareVariables($,w)}
      ${z.mainStart(b)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${b};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${I}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${T}(${S("threadShared[0]",_)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${T}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${T}(${St("threadShared[0]",_)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${T}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${_};${b}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:c,dataType:l.dataType}],dispatchGroup:{x:f},programUniforms:[{type:6,data:g}]}),getShaderSource:k},{inputs:[l],outputs:[o?-1:0]})[0];o&&e.compute(qe(C,d),{inputs:[C]})},im=(e,t)=>{lp(e.inputs),dp(e,t)},nm=e=>he({axis:e.axis})}),An,pp,cp,hp,am,v_=L(()=>{"use strict";te(),ie(),ne(),An=e=>Array.from(e.getBigInt64Array(),Number),pp=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(An(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},cp=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},hp=(e,t)=>{let r=e[0].dims,i=t??An(e[1]),n=cp(r,i),a=R.size(n),s=e[0].dataType,o=N("input",s,r.length),l=j("output",s,n.length),d=c=>`
      const inputShape = ${o.indices(...r)};
      ${c.registerUniform("output_size","u32").declareVariables(o,l)}
      ${c.mainStart()}
      ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${o.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${o.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${o.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",o.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},...X(e[0].dims,n)]}),getShaderSource:d}},am=e=>{pp(e.inputs),e.compute(hp(e.inputs),{inputs:[0]})}}),fp,mp,sm,x_=L(()=>{"use strict";te(),ie(),ne(),fp=(e,t,r,i,n)=>{let a=j("output_data",n,r.length,4),s=N("a_data",t[1].dataType,t[1].dims.length,4),o=N("b_data",t[2].dataType,t[2].dims.length,4),l=N("c_data",t[0].dataType,t[0].dims.length,4),d,c=(h,f,_)=>`select(${f}, ${h}, ${_})`;if(!i)d=a.setByOffset("global_idx",c(s.getByOffset("global_idx"),o.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let h=(f,_,g="")=>{let b=`a_data[index_a${_}][component_a${_}]`,S=`b_data[index_b${_}][component_b${_}]`,$=`bool(c_data[index_c${_}] & (0xffu << (component_c${_} * 8)))`;return`
            let output_indices${_} = ${a.offsetToIndices(`global_idx * 4u + ${_}u`)};
            let offset_a${_} = ${s.broadcastedIndicesToOffset(`output_indices${_}`,a)};
            let offset_b${_} = ${o.broadcastedIndicesToOffset(`output_indices${_}`,a)};
            let offset_c${_} = ${l.broadcastedIndicesToOffset(`output_indices${_}`,a)};
            let index_a${_} = offset_a${_} / 4u;
            let index_b${_} = offset_b${_} / 4u;
            let index_c${_} = offset_c${_} / 4u;
            let component_a${_} = offset_a${_} % 4u;
            let component_b${_} = offset_b${_} % 4u;
            let component_c${_} = offset_c${_} % 4u;
            ${f}[${_}] = ${g}(${c(b,S,$)});
          `};n===9?d=`
            var data = vec4<u32>(0);
            ${h("data",0,"u32")}
            ${h("data",1,"u32")}
            ${h("data",2,"u32")}
            ${h("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:d=`
            ${h("output_data[global_idx]",0)}
            ${h("output_data[global_idx]",1)}
            ${h("output_data[global_idx]",2)}
            ${h("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,o,a)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${d}
      }`},mp=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,n=e[1].dataType,a=!(R.areEqual(t,r)&&R.areEqual(r,i)),s=t,o=R.size(t);if(a){let d=er.calcShape(er.calcShape(t,r,!1),i,!1);if(!d)throw new Error("Can't perform where op on the given tensors");s=d,o=R.size(s)}let l=Math.ceil(o/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:d=>fp(d,e,s,a,n),getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(o/64/4)},programUniforms:[{type:12,data:l},...X(i,t,r,s)]})}},sm=e=>{e.compute(mp(e.inputs))}}),om,S_=L(()=>{"use strict";Ny(),Sa(),Py(),Uy(),Ly(),Wy(),qy(),jy(),Zy(),Xy(),Yy(),Qy(),Jy(),e_(),t_(),r_(),i_(),n_(),a_(),s_(),o_(),u_(),l_(),d_(),p_(),c_(),kf(),h_(),f_(),m_(),g_(),y_(),xa(),__(),Af(),w_(),b_(),$_(),Cf(),v_(),Tt(),Ta(),x_(),om=new Map([["Abs",[Xc]],["Acos",[Yc]],["Acosh",[Qc]],["Add",[Bh]],["ArgMax",[Fc,Vn]],["ArgMin",[Hc,Vn]],["Asin",[Jc]],["Asinh",[eh]],["Atan",[th]],["Atanh",[rh]],["Attention",[jc]],["AveragePool",[Lf,Uf]],["BatchNormalization",[Kc]],["BiasAdd",[Zc]],["BiasSplitGelu",[Oh]],["Cast",[nh,ih]],["Ceil",[sh]],["Clip",[ah]],["Concat",[Vh,Gh]],["Conv",[Zn,Kn]],["ConvTranspose",[ef,Jh]],["Cos",[oh]],["Cosh",[uh]],["CumSum",[tf,rf]],["DepthToSpace",[nf,af]],["DequantizeLinear",[jf,Kf]],["DFT",[sf,of]],["Div",[Rh]],["Einsum",[uf,lf]],["Elu",[lh,_r]],["Equal",[Mh]],["Erf",[dh]],["Exp",[ph]],["Expand",[df]],["FastGelu",[pf]],["Floor",[ch]],["FusedConv",[Zn,Kn]],["Gather",[hf,cf]],["GatherElements",[wf,_f]],["GatherBlockQuantized",[gf,yf]],["GatherND",[ff,mf]],["Gelu",[hh]],["Gemm",[$f,bf]],["GlobalAveragePool",[qf,Wf]],["GlobalMaxPool",[Ff,Hf]],["Greater",[Uh]],["GreaterOrEqual",[Wh]],["GridSample",[vf,xf]],["GroupQueryAttention",[Of]],["HardSigmoid",[$h,bh]],["HardSwish",[vh]],["InstanceNormalization",[Bf]],["LayerNormalization",[Rf]],["LeakyRelu",[fh,_r]],["Less",[Lh]],["LessOrEqual",[qh]],["Log",[zh]],["MatMul",[Mf]],["MatMulNBits",[Df,Nf]],["MaxPool",[Vf,Gf]],["Mul",[Dh]],["MultiHeadAttention",[Tf,Sf]],["Neg",[gh]],["Not",[mh]],["Pad",[Pf]],["Pow",[Nh]],["QuickGelu",[Ah,_r]],["Range",[Zf]],["Reciprocal",[yh]],["ReduceMin",[Lc]],["ReduceMean",[Mc]],["ReduceMax",[Uc]],["ReduceSum",[qc]],["ReduceProd",[Wc]],["ReduceL1",[Dc]],["ReduceL2",[Nc]],["ReduceLogSum",[Gc]],["ReduceLogSumExp",[Pc]],["ReduceSumSquare",[Vc]],["Relu",[_h]],["Resize",[Qf,Jf]],["RotaryEmbedding",[zf]],["ScatterND",[Yf,Xf]],["Sigmoid",[wh]],["Sin",[xh]],["Sinh",[Sh]],["Slice",[tm,rm]],["SkipLayerNormalization",[em]],["Split",[If,Ef]],["Sqrt",[Th]],["Softmax",[im,nm]],["Sub",[Ph]],["Tan",[kh]],["Tanh",[Ih]],["ThresholdedRelu",[Ch,_r]],["Tile",[am]],["Transpose",[xc,Sc]],["Where",[sm]]])}),um,T_=L(()=>{"use strict";Ge(),ft(),ne(),um=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,n){Ve(e.programInfo.name);let a=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let o=[];for(let d of t)o.push({binding:o.length,resource:{buffer:d.buffer}});for(let d of r)o.push({binding:o.length,resource:{buffer:d.buffer}});n&&o.push({binding:o.length,resource:n});let l=a.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:o,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let d={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(d)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Pe(e.programInfo.name)}dispose(){}build(e,t){Ve(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(d=>{r.features.has(d.feature)&&i.push(`enable ${d.extension};`)});let n=vc(t,this.backend.device.limits),a=e.getShaderSource(n),s=`${i.join(`
`)}
${n.additionalImplementations}
${a}`,o=r.createShaderModule({code:s,label:e.name});le("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:o,entryPoint:"main"},layout:"auto",label:e.name});return Pe(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:n.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,n=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=n&&r<=n&&i<=n)return[t,r,i];let a=t*r*i,s=Math.ceil(Math.sqrt(a));if(s>n){if(s=Math.ceil(Math.cbrt(a)),s>n)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),lm={};rr(lm,{WebGpuBackend:()=>dm});var gp,yp,_p,dm,k_=L(()=>{"use strict";Ge(),te(),ft(),yc(),My(),S_(),T_(),gp=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let n=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${n}`);break}case"rank":{let a=e[i].dims.length;r.push(`${n};${a}`);break}case"dims":{let a=e[i].dims.join(",");r.push(`${n};${a}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},yp=(e,t,r)=>{var n,a;let i=e.name;return(n=e.shaderCache)!=null&&n.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${gp(t,((a=e.shaderCache)==null?void 0:a.inputDependencies)??new Array(t.length).fill("dims"))}`,i},_p=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},dm=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},n=o=>t.features.has(o)&&r.push(o)&&!0;n("chromium-experimental-timestamp-query-inside-passes")||n("timestamp-query"),n("shader-f16"),n("subgroups"),this.device=await t.requestDevice(i);let a=t,s=t.info??(typeof a.requestAdapterInfo=="function"?await a.requestAdapterInfo():void 0);this.adapterInfo=new _p(s),this.gpuDataManager=bc(this),this.programManager=new um(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,wa(e.logLevel,!!e.debug),this.device.onuncapturederror=o=>{o.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${o.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){var e;typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&((e=this.env)!=null&&e.webgpu)&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Ve(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var i;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let n=0;n<t.length/2;n++){let a=r[n],s=a.kernelId,o=this.kernels.get(s),l=o.kernelType,d=o.kernelName,c=a.programName,h=a.inputTensorViews,f=a.outputTensorViews,_=t[n*2],g=t[n*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=_);let b=Number(_-this.queryTimeBase),S=Number(g-this.queryTimeBase);if(!Number.isSafeInteger(b)||!Number.isSafeInteger(S))throw new RangeError("incorrect timestamp range");if((i=this.env.webgpu.profiling)!=null&&i.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:h.map($=>({dims:$.dims,dataType:ht($.dataType)})),outputsMetadata:f.map($=>({dims:$.dims,dataType:ht($.dataType)})),kernelId:s,kernelType:l,kernelName:d,programName:c,startTime:b,endTime:S});else{let $="";h.forEach((T,I)=>{$+=`input[${I}]: [${T.dims}] | ${ht(T.dataType)}, `});let w="";f.forEach((T,I)=>{w+=`output[${I}]: [${T.dims}] | ${ht(T.dataType)}, `}),console.log(`[profiling] kernel "${s}|${l}|${d}|${c}" ${$}${w}start time: ${b} ns, execution time: ${S-b} ns`)}vr("GPU",`${c}::${_}::${g}`)}e.unmap(),this.pendingQueries.delete(e)}),Pe()}run(e,t,r,i,n,a){Ve(e.name);let s=[];for(let w=0;w<t.length;++w){let T=t[w].data;if(T===0)continue;let I=this.gpuDataManager.get(T);if(!I)throw new Error(`no GPU data for input: ${T}`);s.push(I)}let{outputs:o,dispatchGroup:l,programUniforms:d}=e.getRunData(t),c=r.length===0?o.map((w,T)=>T):r;if(c.length!==o.length)throw new Error(`Output size ${c.length} must be equal to ${o.length}.`);let h=[],f=[];for(let w=0;w<o.length;++w){if(!Number.isInteger(c[w])||c[w]<-3||c[w]>=a)throw new Error(`Invalid output index: ${c[w]}`);if(c[w]===-3)continue;let T=c[w]===-1,I=c[w]===-2,k=T||I?n(o[w].dataType,o[w].dims):i(c[w],o[w].dataType,o[w].dims);if(h.push(k),k.data===0)continue;let C=this.gpuDataManager.get(k.data);if(!C)throw new Error(`no GPU data for output: ${k.data}`);if(T&&this.temporaryData.push(C),I){let z=this.kernelPersistentData.get(this.currentKernelId);z||(z=[],this.kernelPersistentData.set(this.currentKernelId,z)),z.push(C)}f.push(C)}if(s.length!==t.length||f.length!==h.length){if(f.length===0)return Pe(e.name),h;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let _;if(d){let w=0,T=[];d.forEach(z=>{let v=typeof z.data=="number"?[z.data]:z.data;if(v.length===0)return;let B=z.type===10?2:4,P,G;z.type===10?(G=v.length>4?16:v.length>2?8:v.length*B,P=v.length>4?16:B*v.length):(G=v.length<=2?v.length*B:16,P=16),w=Math.ceil(w/G)*G,T.push(w);let V=z.type===10?8:4;w+=v.length>4?Math.ceil(v.length/V)*P:v.length*B});let I=16;w=Math.ceil(w/I)*I;let k=new ArrayBuffer(w);d.forEach((z,v)=>{let B=T[v],P=typeof z.data=="number"?[z.data]:z.data;if(z.type===6)new Int32Array(k,B,P.length).set(P);else if(z.type===12)new Uint32Array(k,B,P.length).set(P);else if(z.type===10)new Uint16Array(k,B,P.length).set(P);else if(z.type===1)new Float32Array(k,B,P.length).set(P);else throw new Error(`Unsupported uniform type: ${ht(z.type)}`)});let C=this.gpuDataManager.create(w,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,k,0,w),this.gpuDataManager.release(C.id),_={offset:0,size:w,buffer:C.buffer}}let g=this.programManager.normalizeDispatchGroupSize(l),b=g[1]===1&&g[2]===1,S=yp(e,t,b),$=this.programManager.getArtifact(S);if($||($=this.programManager.build(e,g),this.programManager.setArtifact(S,$),le("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),d&&$.uniformVariablesInfo){if(d.length!==$.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${$.uniformVariablesInfo.length}, got ${d.length} in program "${$.programInfo.name}".`);for(let w=0;w<d.length;w++){let T=d[w],I=T.type,k=typeof T.data=="number"?1:T.data.length,[C,z]=$.uniformVariablesInfo[w];if(I!==C||k!==z)throw new Error(`Uniform variable ${w} mismatch: expect type ${C} with size ${z}, got type ${I} with size ${k} in program "${$.programInfo.name}".`)}}if(le("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${g[0]}x${g[1]}x${g[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let w={kernelId:this.currentKernelId,programName:$.programInfo.name,inputTensorViews:t,outputTensorViews:h};this.pendingKernels.push(w),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(w)}return this.programManager.run($,s,f,g,_),Pe(e.name),h}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let n=om.get(e);if(!n)throw new Error(`kernel not implemented: ${e}`);let a={kernelType:e,kernelName:i,kernelEntry:n[0],attributes:[n[1],r]};this.kernels.set(t,a)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let n=i.kernelType,a=i.kernelName,s=i.kernelEntry,o=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${n}] ${a}" is not allowed to be called recursively`);this.currentKernelId=e,o[0]&&(o[1]=o[0](o[1]),o[0]=void 0),le("info",()=>`[WebGPU] Start to run kernel "[${n}] ${a}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,o[1]),0}catch(d){return r.push(Promise.resolve(`[WebGPU] Kernel "[${n}] ${a}" failed. ${d}`)),1}finally{l&&r.push(this.device.popErrorScope().then(d=>d?`GPU validation error for kernel "[${n}] ${a}": ${d.message}`:null));for(let d of this.temporaryData)this.gpuDataManager.release(d.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let n=this.sessionExternalDataMapping.get(e);n||(n=new Map,this.sessionExternalDataMapping.set(e,n));let a=n.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,a);return n.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Ln(this,e,t);return ba(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){le("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){le("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){le("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let n=this.getComputePassEncoder(),a=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),n.setPipeline(a.computePipeline),n.setBindGroup(0,a.bindGroup),n.dispatchWorkgroups(...a.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),pm={};rr(pm,{init:()=>cm});var jr,wp,cm,I_=L(()=>{"use strict";te(),ft(),ie(),Ry(),jr=class hm{constructor(t,r,i,n){this.module=t,this.dataType=r,this.data=i,this.dims=n}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(R.size(t)!==R.size(this.dims))throw new Error("Invalid new shape");return new hm(this.module,this.dataType,this.data,t)}},wp=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo,this.deviceLimits=t.device.limits;let i=e.PTR_SIZE,n=r/e.PTR_SIZE,a=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*n++,a));let s=Number(e.getValue(i*n++,a));this.outputCount=Number(e.getValue(i*n++,a)),this.customDataOffset=Number(e.getValue(i*n++,"*")),this.customDataSize=Number(e.getValue(i*n++,a));let o=[];for(let l=0;l<s;l++){let d=Number(e.getValue(i*n++,a)),c=Number(e.getValue(i*n++,"*")),h=Number(e.getValue(i*n++,a)),f=[];for(let _=0;_<h;_++)f.push(Number(e.getValue(i*n++,a)));o.push(new jr(e,d,c,f))}this.inputs=o}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var s;let r=((s=t==null?void 0:t.inputs)==null?void 0:s.map(o=>typeof o=="number"?this.inputs[o]:o))??this.inputs,i=(t==null?void 0:t.outputs)??[],n=(o,l,d)=>new jr(this.module,l,this.output(o,d),d),a=(o,l)=>{let d=Lt(o,l);if(!d)throw new Error(`Unsupported data type: ${o}`);let c=d>0?this.backend.gpuDataManager.create(d).id:0;return new jr(this.module,o,c,l)};return this.backend.run(e,r,i,n,a,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,n=i===4?"i32":"i64",a=this.module.stackAlloc((1+t.length)*i);this.module.setValue(a,t.length,n);for(let s=0;s<t.length;s++)this.module.setValue(a+i*(s+1),t[s],n);return this.module._JsepOutput(this.opKernelContext,e,a)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},cm=async(e,t,r,i)=>{let n=t.jsepInit;if(!n)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let a=(k_(),$r(lm)).WebGpuBackend,s=new a;await s.initialize(r,i),n("webgpu",[s,o=>s.alloc(Number(o)),o=>s.free(o),(o,l,d,c=!1)=>{if(c)le("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(o)}, dst=${Number(l)}, size=${Number(d)}`),s.memcpy(Number(o),Number(l));else{le("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(o)}, gpuDataId=${Number(l)}, size=${Number(d)}`);let h=t.HEAPU8.subarray(Number(o>>>0),Number(o>>>0)+Number(d));s.upload(Number(l),h)}},async(o,l,d)=>{le("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${o}, dataOffset=${l}, size=${d}`),await s.download(Number(o),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+d)>>>0))},(o,l,d)=>s.createKernel(o,Number(l),d,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),o=>s.releaseKernel(o),(o,l,d,c)=>{le("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${o}, contextDataOffset=${l}`);let h=new wp(t,s,Number(l));return s.computeKernel(Number(o),h,c)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let a=new wc(r);n("webnn",[a,()=>a.reserveTensorId(),s=>a.releaseTensorId(s),async(s,o,l,d,c)=>a.ensureTensor(s,o,l,d,c),(s,o)=>{a.uploadTensor(s,o)},async(s,o)=>a.downloadTensor(s,o),(s,o)=>a.registerMLContext(s,o),!!r.trace])}}}),bp,Aa,Oa,bt,$p,On,ai,Ba,Ra,fr,vp,Mt,fm,mm,Bn,Ma,Da,Na,gm=L(()=>{"use strict";Ge(),Ay(),Oy(),te(),Ft(),ma(),_a(),bp=(e,t)=>{ye()._OrtInit(e,t)!==0&&ce("Can't initialize onnxruntime.")},Aa=async e=>{bp(e.wasm.numThreads,ei(e.logLevel))},Oa=async(e,t)=>{var i,n;(n=(i=ye()).asyncInit)==null||n.call(i);let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let a=e.webgpu.powerPreference;if(a!==void 0&&a!=="low-power"&&a!=="high-performance")throw new Error(`Invalid powerPreference setting: "${a}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:a,forceFallbackAdapter:s}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let a=(I_(),$r(pm)).init;t==="webgpu"&&await a("webgpu",ye(),e,r),t==="webnn"&&await a("webnn",ye(),e)}},bt=new Map,$p=e=>{let t=ye(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,n,n+i)!==0&&ce("Can't get session input/output count.");let a=i===4?"i32":"i64";return[Number(t.getValue(n,a)),Number(t.getValue(n+i,a))]}finally{t.stackRestore(r)}},On=(e,t)=>{let r=ye(),i=r.stackSave(),n=0;try{let a=r.PTR_SIZE,s=r.stackAlloc(2*a);r._OrtGetInputOutputMetadata(e,t,s,s+a)!==0&&ce("Can't get session input/output metadata.");let o=Number(r.getValue(s,"*"));n=Number(r.getValue(s+a,"*"));let l=r.HEAP32[n/4];if(l===0)return[o,0];let d=r.HEAPU32[n/4+1],c=[];for(let h=0;h<d;h++){let f=Number(r.getValue(n+8+h*a,"*"));c.push(f!==0?r.UTF8ToString(f):Number(r.getValue(n+8+(h+d)*a,"*")))}return[o,l,c]}finally{r.stackRestore(i),n!==0&&r._OrtFree(n)}},ai=e=>{let t=ye(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Ba=async(e,t)=>{var h,f,_,g;let r,i,n=ye();Array.isArray(e)?[r,i]=e:e.buffer===n.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=ai(e);let a=0,s=0,o=0,l=[],d=[],c=[];try{if([s,l]=await hc(t),(t==null?void 0:t.externalData)&&n.mountExternalData){let v=[];for(let B of t.externalData){let P=typeof B=="string"?B:B.path,G=typeof B=="string"?B:B.data;v.push(ui(G).then(V=>{n.mountExternalData(P,V)}))}await Promise.all(v)}for(let v of(t==null?void 0:t.executionProviders)??[])if((typeof v=="string"?v:v.name)==="webnn"){if(n.shouldTransferToMLTensor=!1,typeof v!="string"){let B=v,P=B==null?void 0:B.context,G=B==null?void 0:B.gpuDevice,V=B==null?void 0:B.deviceType,U=B==null?void 0:B.powerPreference;P?n.currentContext=P:G?n.currentContext=await n.webnnCreateMLContext(G):n.currentContext=await n.webnnCreateMLContext({deviceType:V,powerPreference:U})}else n.currentContext=await n.webnnCreateMLContext();break}a=await n._OrtCreateSession(r,i,s),(h=n.webgpuOnCreateSession)==null||h.call(n,a),a===0&&ce("Can't create a session."),(f=n.jsepOnCreateSession)==null||f.call(n),n.currentContext&&(n.webnnRegisterMLContext(a,n.currentContext),n.currentContext=void 0,n.shouldTransferToMLTensor=!0);let[b,S]=$p(a),$=!!(t!=null&&t.enableGraphCapture),w=[],T=[],I=[],k=[],C=[];for(let v=0;v<b;v++){let[B,P,G]=On(a,v);B===0&&ce("Can't get an input name."),d.push(B);let V=n.UTF8ToString(B);w.push(V),I.push(P===0?{name:V,isTensor:!1}:{name:V,isTensor:!0,type:ht(P),shape:G})}for(let v=0;v<S;v++){let[B,P,G]=On(a,v+b);B===0&&ce("Can't get an output name."),c.push(B);let V=n.UTF8ToString(B);T.push(V),k.push(P===0?{name:V,isTensor:!1}:{name:V,isTensor:!0,type:ht(P),shape:G});{if($&&(t==null?void 0:t.preferredOutputLocation)===void 0){C.push("gpu-buffer");continue}let U=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((_=t==null?void 0:t.preferredOutputLocation)==null?void 0:_[V])??"cpu",O=n.webnnIsGraphOutput;if(U==="cpu"&&O&&O(a,V)){C.push("ml-tensor-cpu-output");continue}if(U!=="cpu"&&U!=="cpu-pinned"&&U!=="gpu-buffer"&&U!=="ml-tensor")throw new Error(`Not supported preferred output location: ${U}.`);if($&&U!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${U}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);C.push(U)}}let z=null;return C.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(o=n._OrtCreateBinding(a),o===0&&ce("Can't create IO binding."),z={handle:o,outputPreferredLocations:C,outputPreferredLocationsEncoded:C.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>Un(v))}),bt.set(a,[a,d,c,z,$,!1]),[a,w,T,I,k]}catch(b){throw d.forEach(S=>n._OrtFree(S)),c.forEach(S=>n._OrtFree(S)),o!==0&&n._OrtReleaseBinding(o)!==0&&ce("Can't release IO binding."),a!==0&&n._OrtReleaseSession(a)!==0&&ce("Can't release session."),b}finally{n._free(r),s!==0&&n._OrtReleaseSessionOptions(s)!==0&&ce("Can't release session options."),l.forEach(b=>n._free(b)),(g=n.unmountExternalData)==null||g.call(n)}},Ra=e=>{var l,d,c;let t=ye(),r=bt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,n,a,s,o]=r;s&&(o&&t._OrtClearBoundOutputs(s.handle)!==0&&ce("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&ce("Can't release IO binding.")),(l=t.jsepOnReleaseSession)==null||l.call(t,e),(d=t.webnnOnReleaseSession)==null||d.call(t,e),(c=t.webgpuOnReleaseSession)==null||c.call(t,e),n.forEach(h=>t._OrtFree(h)),a.forEach(h=>t._OrtFree(h)),t._OrtReleaseSession(i)!==0&&ce("Can't release session."),bt.delete(e)},fr=new Map,vp=1,Mt=new Map,fm=e=>{let t=ye(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a LoRA adapter. failed to allocate a buffer of size ${e.byteLength}.`);try{t.HEAPU8.set(e,r);let i=t._OrtCreateLoraAdapter(r,e.byteLength);i===0&&ce("Can't create a LoRA adapter.");let n=vp++;return fr.set(n,i),n}finally{t._free(r)}},mm=e=>{let t=ye(),r=fr.get(e);if(r===void 0)throw new Error(`cannot release LoRA adapter. invalid adapter id: ${e}`);if(Mt.has(e))throw new Error(`cannot release LoRA adapter. the adapter is used by a run in progress. adapter id: ${e}`);t._OrtReleaseLoraAdapter(r)!==0&&ce("Can't release LoRA adapter."),fr.delete(e)},Bn=async(e,t,r,i,n,a,s=!1)=>{if(!e){t.push(0);return}let o=ye(),l=o.PTR_SIZE,d=e[0],c=e[1],h=e[3],f=h,_,g;if(d==="string"&&(h==="gpu-buffer"||h==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&h!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${a} when enableGraphCapture is true.`);if(h==="gpu-buffer"){let $=e[2].gpuBuffer;g=Lt(Ut(d),c);{let w=o.jsepRegisterBuffer;if(!w)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');_=w(i,a,$,g)}}else if(h==="ml-tensor"){let $=e[2].mlTensor;g=Lt(Ut(d),c);let w=o.webnnRegisterMLTensor;if(!w)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');_=w(i,$,Ut(d),c)}else{let $=e[2];if(Array.isArray($)){g=l*$.length,_=o._malloc(g),r.push(_);for(let w=0;w<$.length;w++){if(typeof $[w]!="string")throw new TypeError(`tensor data at index ${w} is not a string`);o.setValue(_+w*l,Je($[w],r),"*")}}else{let w=o.webnnIsGraphInput,T=o.webnnIsGraphOutput;if(d!=="string"&&w&&T){let I=o.UTF8ToString(n);if(w(i,I)||T(i,I)){let k=Ut(d);g=Lt(k,c),f="ml-tensor";let C=o.webnnCreateTemporaryTensor,z=o.webnnUploadTensor;if(!C||!z)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await C(i,k,c);z(v,new Uint8Array($.buffer,$.byteOffset,$.byteLength)),_=v}else g=$.byteLength,_=o._malloc(g),r.push(_),o.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,g),_)}else g=$.byteLength,_=o._malloc(g),r.push(_),o.HEAPU8.set(new Uint8Array($.buffer,$.byteOffset,g),_)}}let b=o.stackSave(),S=o.stackAlloc(4*c.length);try{c.forEach((w,T)=>o.setValue(S+T*l,w,l===4?"i32":"i64"));let $=o._OrtCreateTensor(Ut(d),_,g,S,c.length,Un(f));$===0&&ce(`Can't create tensor for input/output. session=${i}, index=${a}.`),t.push($)}finally{o.stackRestore(b)}},Ma=async(e,t,r,i,n,a,s=[])=>{var O,H,Y,Q;let o=ye(),l=o.PTR_SIZE,d=bt.get(e);if(!d)throw new Error(`cannot run inference. invalid session id: ${e}`);let c=d[0],h=d[1],f=d[2],_=d[3],g=d[4],b=d[5],S=[];if(s.length>0){if(_)throw new Error("LoRA adapters are not supported for a session that uses IO binding, e.g. when an output is preferred to be on GPU, or when the WebNN execution provider produces an output.");for(let re of s){let J=fr.get(re);if(J===void 0)throw new Error(`cannot run inference. invalid LoRA adapter id: ${re}`);S.push(J)}}let $=t.length,w=i.length,T=0,I=[],k=[],C=[],z=[],v=[],B=o.stackSave(),P=o.stackAlloc($*l),G=o.stackAlloc($*l),V=o.stackAlloc(w*l),U=o.stackAlloc(w*l);try{for(let M of s)Mt.set(M,(Mt.get(M)??0)+1);[T,I]=cc(a,S),vt("wasm prepareInputOutputTensor");for(let M=0;M<$;M++)await Bn(r[M],k,z,e,h[t[M]],t[M],g);for(let M=0;M<w;M++)await Bn(n[M],C,z,e,f[i[M]],$+i[M],g);xt("wasm prepareInputOutputTensor");for(let M=0;M<$;M++)o.setValue(P+M*l,k[M],"*"),o.setValue(G+M*l,h[t[M]],"*");for(let M=0;M<w;M++)o.setValue(V+M*l,C[M],"*"),o.setValue(U+M*l,f[i[M]],"*");if(_&&!b){let{handle:M,outputPreferredLocations:K,outputPreferredLocationsEncoded:ee}=_;if(h.length!==$)throw new Error(`input count from feeds (${$}) is expected to be always equal to model's input count (${h.length}).`);vt("wasm bindInputsOutputs");for(let W=0;W<$;W++){let we=t[W];await o._OrtBindInput(M,h[we],k[W])!==0&&ce(`Can't bind input[${W}] for session=${e}.`)}for(let W=0;W<w;W++){let we=i[W];(O=n[W])!=null&&O[3]?(v.push(C[W]),o._OrtBindOutput(M,f[we],C[W],0)!==0&&ce(`Can't bind pre-allocated output[${W}] for session=${e}.`)):o._OrtBindOutput(M,f[we],0,ee[we])!==0&&ce(`Can't bind output[${W}] to ${K[W]} for session=${e}.`)}xt("wasm bindInputsOutputs"),bt.set(e,[c,h,f,_,g,!0])}(H=o.jsepOnRunStart)==null||H.call(o,c),(Y=o.webnnOnRunStart)==null||Y.call(o,c);let re;_?re=await o._OrtRunWithBinding(c,_.handle,w,V,T):re=await o._OrtRun(c,G,P,$,U,w,V,T),re!==0&&ce("failed to call OrtRun().");let J=[],_e=[];vt("wasm ProcessOutputTensor");for(let M=0;M<w;M++){let K=Number(o.getValue(V+M*l,"*"));if(K===C[M]||v.includes(C[M])){J.push(n[M]),K!==C[M]&&o._OrtReleaseTensor(K)!==0&&ce("Can't release tensor.");continue}let ee=o.stackSave(),W=o.stackAlloc(4*l),we=!1,$e,ge=0;try{o._OrtGetTensorData(K,W,W+l,W+2*l,W+3*l)!==0&&ce(`Can't access output tensor data on index ${M}.`);let Me=l===4?"i32":"i64",Be=Number(o.getValue(W,Me));ge=o.getValue(W+l,"*");let kt=o.getValue(W+l*2,"*"),It=Number(o.getValue(W+l*3,Me)),Fe=[];for(let Ie=0;Ie<It;Ie++)Fe.push(Number(o.getValue(kt+Ie*l,Me)));o._OrtFree(kt)!==0&&ce("Can't free memory for tensor dims.");let Re=Fe.reduce((Ie,Se)=>Ie*Se,1);$e=ht(Be);let fe=_==null?void 0:_.outputPreferredLocations[i[M]];if($e==="string"){if(fe==="gpu-buffer"||fe==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Ie=[];for(let Se=0;Se<Re;Se++){let Ue=o.getValue(ge+Se*l,"*"),tt=o.getValue(ge+(Se+1)*l,"*"),Et=Se===Re-1?void 0:tt-Ue;Ie.push(o.UTF8ToString(Ue,Et))}J.push([$e,Fe,Ie,"cpu"])}else if(fe==="gpu-buffer"&&Re>0){let Ie=o.jsepGetBuffer;if(!Ie)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Se=Ie(ge),Ue=Lt(Be,Re);if(Ue===void 0||!ga($e))throw new Error(`Unsupported data type: ${$e}`);we=!0,J.push([$e,Fe,{gpuBuffer:Se,download:o.jsepCreateDownloader(Se,Ue,$e),dispose:()=>{o._OrtReleaseTensor(K)!==0&&ce("Can't release tensor.")}},"gpu-buffer"])}else if(fe==="ml-tensor"&&Re>0){let Ie=o.webnnEnsureTensor,Se=o.webnnIsGraphInputOutputTypeSupported;if(!Ie||!Se)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Lt(Be,Re)===void 0||!ya($e))throw new Error(`Unsupported data type: ${$e}`);if(!Se(e,$e,!1))throw new Error(`preferredLocation "ml-tensor" for ${$e} output is not supported by current WebNN Context.`);let Ue=await Ie(e,ge,Be,Fe,!1);we=!0,J.push([$e,Fe,{mlTensor:Ue,download:o.webnnCreateMLTensorDownloader(ge,$e),dispose:()=>{o.webnnReleaseTensorId(ge),o._OrtReleaseTensor(K)}},"ml-tensor"])}else if(fe==="ml-tensor-cpu-output"&&Re>0){let Ie=o.webnnCreateMLTensorDownloader(ge,$e)(),Se=J.length;we=!0,_e.push((async()=>{let Ue=[Se,await Ie];return o.webnnReleaseTensorId(ge),o._OrtReleaseTensor(K),Ue})()),J.push([$e,Fe,[],"cpu"])}else{let Ie=oi($e),Se=new Ie(Re);new Uint8Array(Se.buffer,Se.byteOffset,Se.byteLength).set(o.HEAPU8.subarray(ge,ge+Se.byteLength)),J.push([$e,Fe,Se,"cpu"])}}finally{o.stackRestore(ee),$e==="string"&&ge&&o._free(ge),we||o._OrtReleaseTensor(K)}}_&&!g&&(o._OrtClearBoundOutputs(_.handle)!==0&&ce("Can't clear bound outputs."),bt.set(e,[c,h,f,_,g,!1]));for(let[M,K]of await Promise.all(_e))J[M][2]=K;return xt("wasm ProcessOutputTensor"),J}finally{(Q=o.webnnOnRunEnd)==null||Q.call(o,c),o.stackRestore(B),k.forEach(re=>o._OrtReleaseTensor(re)),C.forEach(re=>o._OrtReleaseTensor(re)),z.forEach(re=>o._free(re)),T!==0&&o._OrtReleaseRunOptions(T),I.forEach(re=>o._free(re));for(let re of s){let J=Mt.get(re)-1;J===0?Mt.delete(re):Mt.set(re,J)}}},Da=e=>{let t=ye(),r=bt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],n=t._OrtEndProfiling(i);n===0&&ce("Can't get an profile file name."),t._OrtFree(n)},Na=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),st,Ne,Qt,mr,gr,Kr,Rn,Zr,Dt,Nt,xp,ym,_m,wm,bm,$m,vm,xm,Sm,Tm,Pa=L(()=>{"use strict";Ge(),gm(),Ft(),ha(),_a(),st=()=>!!me.wasm.proxy&&typeof document<"u",Qt=!1,mr=!1,gr=!1,Zr=new Map,Dt=(e,t)=>{let r=Zr.get(e);r?r.push(t):Zr.set(e,[t])},Nt=()=>{if(Qt||!mr||gr||!Ne)throw new Error("worker not ready")},xp=e=>{switch(e.data.type){case"init-wasm":Qt=!1,e.data.err?(gr=!0,Rn[1](e.data.err)):(mr=!0,Rn[0]()),Kr&&(URL.revokeObjectURL(Kr),Kr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Zr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},ym=async()=>{if(!mr){if(Qt)throw new Error("multiple calls to 'initWasm()' detected.");if(gr)throw new Error("previous call to 'initWasm()' failed.");if(Qt=!0,st())return new Promise((e,t)=>{Ne==null||Ne.terminate(),dc().then(([r,i])=>{try{Ne=i,Ne.onerror=a=>t(a),Ne.onmessage=xp,Rn=[e,t];let n={type:"init-wasm",in:me};!n.in.wasm.wasmPaths&&(r||Pn)&&(n.in.wasm.wasmPaths={wasm:new URL("/LTP-ToolKitz/assets/ort-wasm-simd-threaded.jsep-Dt5UNR3U.wasm",import.meta.url).href}),Ne.postMessage(n),Kr=r}catch(n){t(n)}},t)});try{await fa(me.wasm),await Aa(me),mr=!0}catch(e){throw gr=!0,e}finally{Qt=!1}}},_m=async e=>{if(st())return Nt(),new Promise((t,r)=>{Dt("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:me}};Ne.postMessage(i)});await Oa(me,e)},wm=async e=>st()?(Nt(),new Promise((t,r)=>{Dt("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Ne.postMessage(i,[e.buffer])})):ai(e),bm=async(e,t)=>{if(st()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Nt(),new Promise((r,i)=>{Dt("create",[r,i]);let n={type:"create",in:{model:e,options:{...t}}},a=[];e instanceof Uint8Array&&a.push(e.buffer),Ne.postMessage(n,a)})}else return Ba(e,t)},$m=async e=>{if(st())return Nt(),new Promise((t,r)=>{Dt("release",[t,r]);let i={type:"release",in:e};Ne.postMessage(i)});Ra(e)},vm=async e=>{if(st())throw new Error("LoRA adapter is not supported for proxy.");let t=typeof e=="string"?await ui(e):e;return fm(t)},xm=async e=>{if(st())throw new Error("LoRA adapter is not supported for proxy.");mm(e)},Sm=async(e,t,r,i,n,a,s)=>{if(st()){if(s.length>0)throw new Error("LoRA adapter is not supported for proxy.");if(r.some(o=>o[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(n.some(o=>o))throw new Error("pre-allocated output tensor is not supported for proxy.");return Nt(),new Promise((o,l)=>{Dt("run",[o,l]);let d=r,c={type:"run",in:{sessionId:e,inputIndices:t,inputs:d,outputIndices:i,options:a}};Ne.postMessage(c,Na(d))})}else return Ma(e,t,r,i,n,a,s)},Tm=async e=>{if(st())return Nt(),new Promise((t,r)=>{Dt("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Ne.postMessage(i)});Da(e)}}),Ua,km=L(()=>{"use strict";Ge(),Pa(),Ua=class{async loadAdapter(e){Ve(),this.adapterId=await vm(e),Pe()}async dispose(){return xm(this.adapterId)}}}),Mn,Sp,Im,E_=L(()=>{"use strict";Ge(),km(),Pa(),te(),ca(),_a(),Mn=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Sp=e=>{switch(e[3]){case"cpu":return new et(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!ga(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:n}=e[2];return et.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:n})}case"ml-tensor":{let t=e[0];if(!ya(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:n}=e[2];return et.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:n})}default:throw new Error(`invalid data location: ${e[3]}`)}},Im=class{async fetchModelAndCopyToWasmMemory(e){return wm(await ui(e))}async loadModel(e,t){Ve();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await bm(r,t),Pe()}async dispose(){return $m(this.sessionId)}async run(e,t,r,i=[]){Ve();let n=i.map(_=>{if(!(_ instanceof Ua))throw new Error("LoRA adapter was not created by the WebAssembly backend.");return _.adapterId}),a=[],s=[];Object.entries(e).forEach(_=>{let g=_[0],b=_[1],S=this.inputNames.indexOf(g);if(S===-1)throw new Error(`invalid input '${g}'`);a.push(b),s.push(S)});let o=[],l=[];Object.entries(t).forEach(_=>{let g=_[0],b=_[1],S=this.outputNames.indexOf(g);if(S===-1)throw new Error(`invalid output '${g}'`);o.push(b),l.push(S)});let d=a.map((_,g)=>Mn(_,()=>`input "${this.inputNames[s[g]]}"`)),c=o.map((_,g)=>_?Mn(_,()=>`output "${this.outputNames[l[g]]}"`):null),h=await Sm(this.sessionId,s,d,l,c,r,n),f={};for(let _=0;_<h.length;_++)f[this.outputNames[l[_]]]=o[_]??Sp(h[_]);return Pe(),f}startProfiling(){}endProfiling(){Tm(this.sessionId)}}}),Em,C_=L(()=>{"use strict";Em=e=>{if(e!=null&&e.epContextDataRead)throw new Error('session option "epContextDataRead" is not supported by ONNX Runtime Web')}}),Cm={};rr(Cm,{OnnxruntimeWebAssemblyBackend:()=>Qn,initializeFlags:()=>Yn,wasmBackend:()=>zm});var Yn,Qn,zm,z_=L(()=>{"use strict";Ge(),km(),Pa(),E_(),C_(),Yn=()=>{(typeof me.wasm.initTimeout!="number"||me.wasm.initTimeout<0)&&(me.wasm.initTimeout=0);let e=me.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),me.wasm.simd=!1),typeof me.wasm.proxy!="boolean"&&(me.wasm.proxy=!1),typeof me.wasm.trace!="boolean"&&(me.wasm.trace=!1),typeof me.wasm.numThreads!="number"||!Number.isInteger(me.wasm.numThreads)||me.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)me.wasm.numThreads=1;else{let t=typeof navigator>"u"?hy("node:os").cpus().length:navigator.hardwareConcurrency;me.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Qn=class{async init(e){Yn(),await ym(),await _m(e)}async createInferenceSessionHandler(e,t){Em(t);let r=new Im;return await r.loadModel(e,t),r}async createLoraAdapterHandler(e){let t=new Ua;return await t.loadAdapter(e),t}},zm=new Qn});Ge();Ge();Ge();var A_="1.31.1",O_=nc;{let e=(z_(),$r(Cm)).wasmBackend;qt("webgpu",e,5),qt("webnn",e,5),qt("cpu",e,10),qt("wasm",e,10)}Object.defineProperty(me.versions,"web",{value:A_,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Am=Object.freeze(Object.defineProperty({__proto__:null,get InferenceSession(){return da},get LoraAdapter(){return pa},get TRACE(){return vr},get TRACE_EVENT_BEGIN(){return vt},get TRACE_EVENT_END(){return xt},get TRACE_FUNC_BEGIN(){return Ve},get TRACE_FUNC_END(){return Pe},get Tensor(){return et},default:O_,get env(){return me},get registerBackend(){return qt}},Symbol.toStringTag,{value:"Module"}));let La={verbose:!1,debug:!1,debugFolder:"out"},Om={mean:[.485,.456,.406],stdDeviation:[.229,.224,.225],maxSideLength:"auto",minimumAreaThreshold:20,paddingVertical:.4,paddingHorizontal:.6},Jn={imageHeight:48,strategy:"per-line",crossLineWidthFactor:1,minimumConfidence:.5,charactersDictionary:[],maxCropSourceSideLength:2e3,mainThreadYieldMs:0,recBatchSize:6,rotateVerticalCrops:!0,spaceRecovery:!1},B_=10,R_={executionProviders:["cpu"],graphOptimizationLevel:"all",enableCpuMemArena:!0,enableMemPattern:!0,executionMode:"sequential",interOpNumThreads:0,intraOpNumThreads:0},Bm="opencv",M_={engine:Bm},Dn={model:{},detection:Om,recognition:Jn,debugging:La,session:R_,processing:M_};function ea(e,...t){if(!t.length)return e;let r=t.shift();if(Nn(r)){for(let i in r)if(Object.prototype.hasOwnProperty.call(r,i)){if(i==="__proto__"||i==="constructor"||i==="prototype")continue;let n=r[i],a=e[i];Nn(n)?((!a||!Nn(a))&&(e[i]={}),ea(e[i],n)):n!==void 0&&(e[i]=n)}}return ea(e,...t)}let Tp=6e4;function D_(e,t){if(!e)return null;let r=e.trim();if(r==="")return null;let i=Number(r);if(Number.isFinite(i))return i<=0?0:Math.min(i*1e3,Tp);let n=Date.parse(r);return Number.isNaN(n)?null:Math.min(Math.max(n-t,0),Tp)}function N_(e){let t=500*2**e;return t+Math.random()*t}async function Rm(e,t={}){const{timeoutMs:r=3e5,retries:i=2,fallbackUrl:n=oy(e)}=t;let a;for(let o=0;o<=i;o++){let l=null;try{let d=await fetch(e,{signal:AbortSignal.timeout(r),referrerPolicy:"no-referrer"});if(!d.ok)throw l=D_(d.headers.get("retry-after"),Date.now()),new Error(`HTTP ${d.status} ${d.statusText}`);return await d.arrayBuffer()}catch(d){a=d,o<i&&await new Promise(c=>setTimeout(c,l??N_(o)))}}let s=new Error(`Failed to fetch ${e} after ${i+1} attempt(s): ${String(a)}`);if(!n)throw s;console.warn(`[ppu-paddle-ocr] ${s.message}
  retrying on ${n}`);try{return await Rm(n,{timeoutMs:r,retries:i,fallbackUrl:null})}catch(o){throw new Error(`${s.message}; mirror also failed: ${String(o)}`,{cause:s})}}function ta(e){return(typeof e=="string"?e:new TextDecoder("utf-8").decode(e)).split(/\r?\n/)}function Nn(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)&&!(e instanceof Date)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer)&&!ArrayBuffer.isView(e)}function P_(e,t){return e!=="auto"?e:Math.min(1920,Math.max(960,Math.round(t*.75/32)*32))}function Mm(e,t,r){let i=e,n=t,a=1;return Math.max(n,i)>r&&(a=r/(n>i?n:i),i=Math.round(i*a),n=Math.round(n*a)),{width:i,height:n,ratio:a}}function U_(e,t,r,i,n){let a=Math.round(e.height*i),s=Math.round(e.height*n),o=e.x-s,l=e.y-a;o=Math.max(0,o),l=Math.max(0,l);let d=Math.min(t,e.x+e.width+s),c=Math.min(r,e.y+e.height+a),h=d-o,f=c-l;return{x:o,y:l,width:h,height:f}}function L_(e,t,r,i){let n=e.x/t,a=e.y/t,s=e.width/t,o=e.height/t,l=Math.max(0,Math.round(n)),d=Math.max(0,Math.round(a)),c=Math.min(r-l,Math.round(s)),h=Math.min(i-d,Math.round(o));return{x:l,y:d,width:c,height:h}}function W_(e,t,r,i,n,a,s,o,l){let d=[];return e.iterate(c=>{let h=e.getRect(c);if(h.width*h.height<=s)return;let f=U_(h,t,r,o,l),_=L_(f,i,n,a);_.width>5&&_.height>5&&d.push(_)}),d}function q_(e,t,r){let i=[];for(let n of e){const{bbox:a}=n;let s={x:Math.max(0,a.x0),y:Math.max(0,a.y0),width:a.x1-a.x0,height:a.y1-a.y0};s.x+s.width>t&&(s.width=t-s.x),s.y+s.height>r&&(s.height=r-s.y),s.width>5&&s.height>5&&i.push(s)}return i}let V_=3;function G_(e,t,r,i,n){let o=e.getContext("2d").getImageData(0,0,t,r).data,l=r*t,d=new Float32Array(V_*l),c=i[0]??.485,h=i[1]??.456,f=i[2]??.406,_=n[0]??.229,g=n[1]??.224,b=n[2]??.225,S=1/(255*_),$=1/(255*g),w=1/(255*b),T=c/_,I=h/g,k=f/b,C=l,z=l*2;for(let v=0,B=0;v<l;v++,B+=4){let P=o[B],G=o[B+1],V=o[B+2];d[v]=P*S-T,d[C+v]=G*$-I,d[z+v]=V*w-k}return d}function kp(e,t,r,i){let n=i(t,r),a=n.getContext("2d"),s=a.createImageData(t,r),o=s.data,l=t*r;for(let d=0;d<l;d++){let c=e[d]||0,h=Math.round(c*255),f=d*4;o[f]=h,o[f+1]=h,o[f+2]=h,o[f+3]=255}return a.putImageData(s,0,0),n}class Dm{constructor(t,r,i={},n={},a="opencv"){xe(this,"options");xe(this,"debugging");xe(this,"session");xe(this,"platform");xe(this,"engine");xe(this,"lastDetectionCanvas",null);this.platform=t,this.session=r,this.options={...Om,...i},this.debugging={...La,...n},a==="opencv"&&!this.platform.imageProcessor?this.engine="canvas-native":this.engine=a}log(t){this.debugging.verbose&&console.log(`[DetectionService] ${t}`)}async run(t){this.log("Starting text detection process");try{let r;this.platform.isCanvas(t)?r=t:this.engine==="opencv"&&this.platform.imageProcessor?r=await this.platform.imageProcessor.prepareCanvas(t):r=await this.platform.canvas.prepareCanvas(t);let i=await this.preprocessDetection(r),n=await this.runInference(i.tensor,i.width,i.height);if(!n)return console.error("Text detection failed (output tensor is null)"),[];let a=this.postprocessDetection(n,i);if(this.debugging.debug&&this.debugging.debugFolder&&this.lastDetectionCanvas)try{await this.debugDetectionCanvas(this.lastDetectionCanvas,i.width,i.height),await this.debugDetectedBoxes(r,a)}catch(s){this.log(`Debug dump failed: ${s instanceof Error?s.message:String(s)}`)}return this.log(`Detected ${a.length} text boxes in image`),a}catch(r){return console.error("Error during text detection:",r instanceof Error?r.message:String(r)),[]}}async preprocessDetection(t){const{width:r,height:i}=t;let n=P_(this.options.maxSideLength??"auto",Math.max(r,i));const{width:a,height:s,ratio:o}=Mm(r,i,n);let l=Math.ceil(a/32)*32,d=Math.ceil(s/32)*32,c=this.platform.createCanvas(l,d);c.getContext("2d").drawImage(t,0,0,r,i,0,0,a,s);let f=this.options.mean??[.485,.456,.406],_=this.options.stdDeviation??[.229,.224,.225],g=G_(c,l,d,f,_);return this.log(`Detection preprocessed: original(${r}x${i}), model_input(${l}x${d}), resize_ratio: ${o.toFixed(4)}, engine: ${this.engine}`),{tensor:g,width:l,height:d,resizeRatio:o,originalWidth:r,originalHeight:i}}async runInference(t,r,i){let n;try{this.log("Running detection inference..."),n=new this.platform.ort.Tensor("float32",t,[1,3,i,r]);let a={x:n},o=(await this.session.run(a))[this.session.outputNames[0]||"sigmoid_0.tmp_0"];return this.log("Detection inference complete!"),o?o.data:(console.error(`Output tensor ${this.session.outputNames[0]} not found in detection results`),null)}catch(a){throw console.error("Error during model inference:",a instanceof Error?a.message:String(a)),a}finally{n==null||n.dispose()}}postprocessDetection(t,r,i=this.options.minimumAreaThreshold??50,n=this.options.paddingVertical||.4,a=this.options.paddingHorizontal||.6){this.log("Post-processing detection results...");const{width:s,height:o,resizeRatio:l,originalWidth:d,originalHeight:c}=r;if(this.engine==="opencv"&&this.platform.imageProcessor)return this.lastDetectionCanvas=this.debugging.debug&&this.debugging.debugFolder?kp(t,s,o,this.platform.createCanvas.bind(this.platform)):null,this.postprocessWithOpenCV(t,s,o,l,d,c,i,n,a);let h=kp(t,s,o,this.platform.createCanvas.bind(this.platform));return this.lastDetectionCanvas=h,this.postprocessWithCanvasNative(h,l,d,c,i,n,a)}postprocessWithOpenCV(t,r,i,n,a,s,o,l,d){let c=this.platform.imageProcessor,h=new c.cv.Mat(i,r,c.cv.CV_8UC1),f=h.data,_=r*i;for(let b=0;b<_;b++){let S=t[b]||0;f[b]=Math.round(Math.min(Math.max(S,0),1)*255)}let g=new c.ImageProcessor(h);try{let b=new c.Contours(g.toMat(),{mode:c.cv.RETR_LIST,method:c.cv.CHAIN_APPROX_SIMPLE}),S=W_(b,r,i,n,a,s,o,l,d);return b.destroy(),this.log(`Found ${S.length} potential text boxes (opencv)`),S}finally{g.destroy()}}postprocessWithCanvasNative(t,r,i,n,a,s,o){let d=this.platform.canvas.createProcessor(t).grayscale().threshold({thresh:0}).findRegions({foreground:"light",minArea:a,thresh:0,padding:{vertical:s,horizontal:o},scale:1/r}),c=q_(d,i,n);return this.log(`Found ${c.length} potential text boxes (canvas-native)`),c}async debugDetectionCanvas(t,r,i){let n=this.debugging.debugFolder??"";await this.platform.saveDebugImage(t,"detection-debug",n),this.log(`Probability map visualized and saved to: ${n}`)}async debugDetectedBoxes(t,r){let i=this.platform.isCanvas(t)?t:await this.platform.canvas.prepareCanvas(t),n=this.platform.createCanvas(i.width,i.height),a=n.getContext("2d");a.drawImage(i,0,0);for(let o of r){const{x:l,y:d,width:c,height:h}=o;this.platform.canvas.getToolkit().drawLine({ctx:a,x:l,y:d,width:c,height:h})}let s=this.debugging.debugFolder??"";await this.platform.saveDebugImage(n,"boxes-debug",s),this.log(`Boxes visualized and saved to: ${s}`)}}function Ip(e){return e.reason instanceof Error?e.reason:new DOMException("The batch operation was aborted.","AbortError")}function H_(e){if(Symbol.asyncIterator in e)return e[Symbol.asyncIterator]();let t=e[Symbol.iterator]();return{next:()=>Promise.resolve(t.next()),return:r=>{var i;return Promise.resolve(((i=t.return)==null?void 0:i.call(t,r))??{done:!0,value:void 0})}}}async function Ep(e,t,r,i){var w;const{settle:n,signal:a}=t;let s=Math.max(1,Math.floor(t.concurrency));if(a!=null&&a.aborted)throw Ip(a);let o=0,l=0,d=!1,c=!1,h,f=Array.isArray(e)?e:null,_=f?null:H_(e),g=Promise.resolve(),b=async()=>{let T=g,I;g=new Promise(k=>{I=k}),await T;try{return await _.next()}finally{I()}},S=()=>{d=!0};a==null||a.addEventListener("abort",S,{once:!0});let $=async()=>{var T;for(;!d;){let I,k;if(f){if(o>=f.length)return;k=o++,I=f[k]}else{let C=await b();if(C.done||d)return;k=o++,I=C.value}try{let C=await r(I,k);if(d)return;i({index:k,status:"fulfilled",value:C})}catch(C){if(n)i({index:k,status:"rejected",reason:C});else{d=!0,c=!0,h=C;return}}finally{l++,(T=t.onProgress)==null||T.call(t,l,t.total)}}};try{await Promise.all(Array.from({length:s},()=>$()))}finally{a==null||a.removeEventListener("abort",S),await((w=_==null?void 0:_.return)==null?void 0:w.call(_))}if(a!=null&&a.aborted)throw Ip(a);if(c)throw h}function F_(){let e=[],t=null,r=!1,i=null,n=()=>{let a=t;t=null,a==null||a()};return{push(a){e.push(a),n()},close(){r=!0,n()},fail(a){i={error:a},r=!0,n()},async*drain(){for(;;){for(;e.length>0;)yield e.shift();if(i)throw i.error;if(r)return;await new Promise(a=>{t=a})}}}}async function j_(e,t,r,i){let n=e.canvas.getToolkit(),a=[];for(const[s,o]of r.entries()){let l=n.crop({bbox:{x0:o.x,y0:o.y,x1:o.x+o.width,y1:o.y+o.height},canvas:t});if(i.saveCropsTo&&e.saveImage){let d=`crop_${String(s).padStart(3,"0")}.png`;await e.saveImage(l,[i.saveCropsTo,d].join(e.pathSeparator))}i.crop&&a.push(await K_(l))}return a}async function K_(e){let t=e;if(typeof t.toBuffer=="function"){let r=t.toBuffer("image/png");return r.buffer.slice(r.byteOffset,r.byteOffset+r.byteLength)}if(typeof t.convertToBlob=="function")return(await t.convertToBlob({type:"image/png"})).arrayBuffer();if(typeof t.toBlob=="function"){let r=t.toBlob.bind(t);return(await new Promise((n,a)=>r(s=>s?n(s):a(new Error("Canvas toBlob() returned null")),"image/png"))).arrayBuffer()}throw new Error("Canvas cannot be encoded to a PNG buffer on this platform")}function Z_(e){if(e.length===0)return{text:"",results:[],confidence:0};let t=e.map(i=>i.text).join(" "),r=e.reduce((i,n)=>i+n.confidence,0)/e.length;return{text:t,results:e,confidence:r}}function X_(e){if(e.length===0)return{text:"",lines:[],confidence:0};let t=[],r=[],i=e[0];if(!i)return{text:"",lines:[],confidence:0};let n=i.box.y,a=i.box.height;for(let d of e){const{box:c}=d;Math.abs(c.y-n)<a/2?(r.push(d),a=(a*(r.length-1)+c.height)/r.length):(r.sort((h,f)=>h.box.x-f.box.x),t.push(r),r=[d],n=c.y,a=c.height)}r.length>0&&(r.sort((d,c)=>d.box.x-c.box.x),t.push(r));let s=t.map(d=>d.map(c=>c.text).join(" ")).join(`
`),o=t.reduce((d,c)=>d+c.reduce((h,f)=>h+f.confidence,0),0),l=t.reduce((d,c)=>d+c.length,0);return{text:s,lines:t,confidence:l>0?o/l:0}}function Nm(e){if(e.length===0)return[];let t=[...e].sort((o,l)=>o.box.y-l.box.y||o.box.x-l.box.x),r=[],i=t[0];if(!i)return[];let n=[i],a=i.box.height,s=i.box.height;for(let o=1;o<t.length;o++){let l=t[o],d=t[o-1];if(!l||!d)continue;let c=Math.abs(l.box.y-d.box.y),h=s*.5;c<=h?(n.push(l),a+=l.box.height,s=a/n.length):(n.sort((f,_)=>f.box.x-_.box.x),r.push(n),n=[l],a=l.box.height,s=l.box.height)}return n.length>0&&(n.sort((o,l)=>o.box.x-l.box.x),r.push(n)),r}let Y_=4,Cp=16384;function Pm(e,t,r,i){let n=Math.min(...t.map(w=>w.box.x)),a=Math.min(...t.map(w=>w.box.y)),s=Math.max(...t.map(w=>w.box.x+w.box.width)),o=Math.max(...t.map(w=>w.box.y+w.box.height)),l={x:n,y:a,width:s-n,height:o-a},d=o-a,c=Math.max(1,Math.round(d*.4)),h=t.map(({box:w})=>Math.max(1,Math.round(w.width*Math.min(d/w.height,Y_)))),f=h.reduce((w,T)=>w+T,0)+c*(t.length-1);if(f>Cp){let w=Cp/f;h=h.map(T=>Math.max(1,Math.round(T*w))),c=Math.max(1,Math.floor(c*w))}let _=h.reduce((w,T)=>w+T,0)+c*(t.length-1),g=r(_,d),b=g.getContext("2d");b.fillStyle="white",b.fillRect(0,0,_,d);let S=0,$=[];for(let w=0;w<t.length;w++){let T=t[w],I=h[w];if(!T||I===void 0)continue;const{box:k}=T;let C=i.getToolkit().crop({bbox:{x0:k.x,y0:k.y,x1:k.x+k.width,y1:k.y+k.height},canvas:e});b.drawImage(C,0,0,k.width,k.height,S,0,I,d);let z=w<t.length-1?c:0;$.push(I+z),S+=I+z}return{mergedCanvas:g,mergedBox:l,cropWidths:$}}function Um(e,t,r){let i=[...e];if(t.length!==i.length||r.length===0)return J_(e,r);let n=r.reduce((l,d)=>l+d,0),a=r.map(()=>""),s=0,o=(r[0]??0)/n;for(let l=0;l<i.length;l++){let d=t[l]??0;for(;d>=o&&s<r.length-1;)s++,o+=(r[s]??0)/n;a[s]+=i[l]??""}return a}let Q_=4;function J_(e,t){if(t.length===1)return[e];let r=t.reduce((o,l)=>o+l,0),i=[...e],n=i.length>0?r/i.length:0,a=[],s=0;for(let o=0;o<t.length;o++){if(o===t.length-1){a.push(i.slice(s).join(""));break}let l=Math.min(s+Math.round((t[o]??0)/n),i.length),d=l,c=!1;for(let h=0;h<=Q_&&!c;h++)for(let f of[l-h,l+h]){let _=i[f];if(f>s&&f<i.length&&_!==void 0&&/\s/.test(_)){d=f,c=!0;break}}a.push(i.slice(s,d).join("")),s=c?d+1:d}return a}function ew(e,t,r,i){let n=[...e].sort((o,l)=>t(l)-t(o)),a=[],s=[];for(let o of n){let l=!1;for(let d=0;d<a.length;d++){let c=a[d],h=s[d];if(c===void 0||h===void 0)continue;let f=i*c.length;if(h+f+t(o)<=r){c.push(o),s[d]=h+t(o),l=!0;break}}l||(a.push([o]),s.push(t(o)))}return a}class Lm{constructor(t=10){xe(this,"cache",new Map);xe(this,"maxSize");this.maxSize=t}get(t){let r=this.cache.get(t);if(r!==void 0)return this.cache.delete(t),this.cache.set(t,r),r}set(t,r){if(this.cache.has(t))this.cache.delete(t);else if(this.cache.size>=this.maxSize){let i=this.cache.keys().next().value;i!==void 0&&this.cache.delete(i)}this.cache.set(t,r)}clear(){this.cache.clear()}static generateKey(t){let r=new Uint8Array(t);if(r.length===0)return"0_0";let i=Math.min(r.length,tw),n=r.length-1,a=0;for(let s=0;s<i;s++){let o=i===1?0:Math.round(s*n/(i-1));a=(a<<5)-a+(r[o]??0),a=a&a}return`${a}_${r.length}`}}let tw=4096,zp=new Lm;function Ap(e){return!!(e!=null&&e.noCache||e!=null&&e.dictionary||(e==null?void 0:e.strategy)!==void 0||(e==null?void 0:e.minimumConfidence)!==void 0||(e==null?void 0:e.spaceRecovery)!==void 0||(e==null?void 0:e.rotateVerticalCrops)!==void 0||(e==null?void 0:e.recBatchSize)!==void 0)}class rw{constructor(t,r){xe(this,"options",Dn);xe(this,"detectionSession",null);xe(this,"recognitionSession",null);xe(this,"detector",null);xe(this,"recognitor",null);xe(this,"platform");this.platform=t,this.options=ea({},Dn,r),this.options.session=this.options.session||Dn.session}log(t){var r;(r=this.options.debugging)!=null&&r.verbose&&console.log(`[PaddleOcrService:Base] ${t}`)}isInitialized(){return this.detectionSession!==null&&this.recognitionSession!==null}async destroy(){var t,r;await((t=this.detectionSession)==null?void 0:t.release()),await((r=this.recognitionSession)==null?void 0:r.release()),this.detectionSession=null,this.recognitionSession=null,this.detector=null,this.recognitor=null}async recognize(t,r){var i,n,a;(!this.detector||!this.recognitor)&&await this.initSessions();try{let s;if(typeof t=="string"){if(!t.startsWith("http")&&!t.startsWith("/"))throw new Error("Invalid image string format. Must be an HTTP URL, an absolute path, ArrayBuffer, or Canvas");s=await this.platform.loadResource(t,t)}else if(t instanceof ArrayBuffer)s=t;else if(typeof t.toBuffer=="function"){let S=t.toBuffer("image/png");s=S.buffer.slice(S.byteOffset,S.byteOffset+S.byteLength)}else{let b=t,w=b.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,b.width,b.height).data;s=w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength)}let o=Lm.generateKey(s);if(!Ap(r)){let b=zp.get(o);if(b)return this.log("Using cached OCR result"),r!=null&&r.flatten?{text:b.text,results:b.lines?b.lines.flat():b.results??[],confidence:b.confidence}:b}let l=[],d=typeof t=="string"||t instanceof ArrayBuffer?await this.platform.canvas.prepareCanvas(s):t;if(l=await this.detector.run(d),l.length===0)return r!=null&&r.flatten?{text:"",results:[],confidence:0}:{text:"",lines:[],confidence:0};let c=(i=this.options.recognition)==null?void 0:i.charactersDictionary;if(r!=null&&r.dictionary){let b="";if(typeof r.dictionary=="string"){let S=await this.platform.loadResource(r.dictionary,r.dictionary);b=new TextDecoder("utf-8").decode(S)}else b=new TextDecoder("utf-8").decode(r.dictionary);if(c=ta(b),c.length===0)throw new Error("Custom character dictionary is empty or could not be loaded.")}let h=(r==null?void 0:r.strategy)??((n=this.options.recognition)==null?void 0:n.strategy)??"per-line",f=await this.recognitor.run(d,l,c,h,r),_=X_(f),g=r!=null&&r.flatten?Z_(f):_;return Ap(r)||zp.set(o,g),g}catch(s){if((a=this.options.debugging)!=null&&a.verbose){let o=s instanceof Error?s:new Error(String(s));console.error("recognize: error",o.message,o.stack)}throw s}}async detect(t,r){var c;this.detector||await this.initSessions();const{crop:i,saveCropsTo:n,...a}=r??{};let s=Object.keys(a).length>0?new Dm(this.platform,this.detectionSession,{...this.options.detection,...a},this.options.debugging,((c=this.options.processing)==null?void 0:c.engine)??Bm):this.detector,o;if(typeof t=="string"){if(!t.startsWith("http")&&!t.startsWith("/"))throw new Error("Invalid image string format. Must be an HTTP URL, an absolute path, ArrayBuffer, or Canvas");o=await this.platform.canvas.prepareCanvas(await this.platform.loadResource(t,t))}else t instanceof ArrayBuffer?o=await this.platform.canvas.prepareCanvas(t):o=t;let l=(await s.run(o)).filter(h=>h.width>0&&h.height>0);if(!i&&!n)return{boxes:l};let d=await j_(this.platform,o,l,{crop:i,saveCropsTo:n});return i?{boxes:l,crops:d}:{boxes:l}}async batchRecognize(t,r){let i=(r==null?void 0:r.settle)??!1,n=[];return await Ep(t,{concurrency:this.resolveConcurrency(r==null?void 0:r.concurrency),settle:i,signal:r==null?void 0:r.signal,onProgress:r==null?void 0:r.onProgress,total:Array.isArray(t)?t.length:void 0},a=>this.recognize(a,r),a=>{n[a.index]=a}),i?n:n.map(a=>a.status==="fulfilled"?a.value:void 0)}async*batchRecognizeStream(t,r){let i=F_(),n=(async()=>{try{await Ep(t,{concurrency:this.resolveConcurrency(r==null?void 0:r.concurrency),settle:(r==null?void 0:r.settle)??!1,signal:r==null?void 0:r.signal,onProgress:r==null?void 0:r.onProgress,total:Array.isArray(t)?t.length:void 0},a=>this.recognize(a,r),a=>i.push(a)),i.close()}catch(a){i.fail(a)}})();yield*i.drain(),await n}resolveConcurrency(t){var n;return typeof t=="number"&&t>0?Math.floor(t):(((n=this.options.session)==null?void 0:n.executionProviders)??[]).some(a=>{let s=(typeof a=="string"?a:a.name).toLowerCase();return s!=="cpu"&&s!=="wasm"})?1:4}}let Op=new Set(["cpu","wasm"]);function iw(e){return typeof e=="string"?e:e.name}async function nw(e,t,r,i,n){const{onSessionFallback:a,...s}=r??{};try{return await e.InferenceSession.create(t,s)}catch(o){let d=(s.executionProviders??[]).map(iw);if(d.every(S=>Op.has(S))||d.length===0)throw o;let f=d.find(S=>Op.has(S))??(d.includes("wasm")?"wasm":"cpu"),_=o instanceof Error?o.message:String(o);i(`executionProviders=${JSON.stringify(d)} failed (${_}); falling back to ["${f}"].`);let g={...s,executionProviders:[f]};n==null||n({...g,onSessionFallback:a});let b=await e.InferenceSession.create(t,g);return a==null||a(o),b}}let ra=null;function aw(e){ra=e}function ot(){if(!ra)throw new Error('No canvas platform registered. Import "ppu-ocv" (Node), "ppu-ocv/web" (browser), "ppu-ocv/canvas" (Node canvas-only), "ppu-ocv/canvas-web" (browser canvas-only), or "ppu-ocv/canvas-mobile" (React Native / Skia) to auto-register.');return ra}function sw(e){return typeof e=="object"&&e!==null&&typeof e.getContext=="function"&&typeof e.width=="number"&&typeof e.height=="number"}let Wm={createCanvas(e,t){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,t);if(typeof document<"u"){let r=document.createElement("canvas");return r.width=e,r.height=t,r}throw new Error("No canvas implementation available in this environment.")},async loadImage(e){let t;if(e instanceof ArrayBuffer)t=new Blob([e]);else if(typeof e=="string")t=await(await fetch(e)).blob();else throw new Error("loadImage: unsupported source type");let r=await createImageBitmap(t),i=Wm.createCanvas(r.width,r.height);return i.getContext("2d").drawImage(r,0,0),r.close(),i},isCanvas(e){return typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas}};const Wt=class Wt{constructor(){xe(this,"step",0)}static getInstance(){return Wt._baseInstance||(Wt._baseInstance=new Wt),Wt._baseInstance}crop(t){const{bbox:r,canvas:i}=t;let n=ot().createCanvas(r.x1-r.x0,r.y1-r.y0);return n.getContext("2d").drawImage(i,r.x0,r.y0,r.x1-r.x0,r.y1-r.y0,0,0,n.width,n.height),n}isDirty(t){const{canvas:r,threshold:i=127.5,majorColorThreshold:n=.97}=t;let a=0,s=0,o=this.crop({bbox:{x0:r.width*.1,y0:r.height*.1,x1:r.width*.9,y1:r.height*.9},canvas:r}),d=o.getContext("2d").getImageData(0,0,o.width,o.height).data;for(let h=0;h<d.length;h+=4){let f=d[h],_=d[h+1],g=d[h+2];f>=i&&_>=i&&g>=i?a++:s++}return Math.max(a,s)/(s+a)<n}drawLine(t){const{ctx:r,x:i,y:n,width:a,height:s,lineWidth:o=2,color:l="blue"}=t;r.beginPath(),r.strokeStyle=l,r.lineWidth=o,r.strokeRect(i,n,a,s),r.closePath()}drawContour(t){const{ctx:r,contour:i,strokeStyle:n="red",lineWidth:a=2}=t;let s=i.data32S;if(!(s.length<4)){r.strokeStyle=n,r.lineWidth=a,r.beginPath(),r.moveTo(s[0]??0,s[1]??0);for(let o=2;o<s.length;o+=2)r.lineTo(s[o]??0,s[o+1]??0);r.closePath(),r.stroke()}}};xe(Wt,"_baseInstance",null);let ia=Wt;async function ow(e){return sw(e)?e:ot().loadImage(e)}async function uw(e){if(e instanceof ArrayBuffer)return e;if(typeof e.toBuffer=="function"){let a=e.toBuffer("image/png"),s=new ArrayBuffer(a.byteLength);return new Uint8Array(s).set(new Uint8Array(a)),s}let t=e.toBlob;if(typeof t=="function")return(await new Promise((s,o)=>{t.call(e,l=>l?s(l):o(new Error("toBlob returned null")),"image/png")})).arrayBuffer();if(typeof e.convertToBlob=="function")return(await e.convertToBlob({type:"image/png"})).arrayBuffer();if(typeof e.toDataURL=="function"){let s=e.toDataURL("image/png").replace(/^data:image\/png;base64,/,""),o=atob(s),l=new ArrayBuffer(o.length),d=new Uint8Array(l);for(let c=0;c<o.length;c++)d[c]=o.charCodeAt(c);return l}let i=e.getContext("2d").getImageData(0,0,e.width,e.height),n=new ArrayBuffer(i.data.byteLength);return new Uint8Array(n).set(new Uint8Array(i.data.buffer,i.data.byteOffset,i.data.byteLength)),n}function lw(e,t,r,i={}){const{foreground:n="light",thresh:a=127,minArea:s=1,maxArea:o=1/0,padding:l,scale:d=1}=i;let c=new Uint8Array(t*r),h=[],f=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]],_=g=>{let b=e[g]??0;return n==="light"?b>a:b<=a};for(let g=0;g<r;g++)for(let b=0;b<t;b++){let S=g*t+b;if(c[S]||(c[S]=1,!_(S*4)))continue;let $=[S],w=b,T=b,I=g,k=g,C=0;for(;$.length>0;){let z=$.pop();if(z===void 0)break;C++;let v=z%t,B=(z-v)/t;v<w?w=v:v>T&&(T=v),B<I?I=B:B>k&&(k=B);for(const[P,G]of f){let V=v+P,U=B+G;if(V<0||V>=t||U<0||U>=r)continue;let O=U*t+V;c[O]||(c[O]=1,_(O*4)&&$.push(O))}}if(C>=s&&C<=o){let z=w,v=I,B=T+1,P=k+1;if(l){let G=P-v,V=Math.round(G*(l.vertical??0)),U=Math.round(G*(l.horizontal??0));z=Math.max(0,z-U),v=Math.max(0,v-V),B=Math.min(t,B+U),P=Math.min(r,P+V)}d!==1&&(z=Math.max(0,Math.round(z*d)),v=Math.max(0,Math.round(v*d)),B=Math.round(B*d),P=Math.round(P*d)),h.push({bbox:{x0:z,y0:v,x1:B,y1:P},area:C})}}return h}class Bp{constructor(t){xe(this,"_canvas");this._canvas=t}get width(){return this._canvas.width}get height(){return this._canvas.height}resize(t){const{width:r,height:i}=t;let n=ot().createCanvas(r,i);return n.getContext("2d").drawImage(this._canvas,0,0,r,i),this._canvas=n,this}grayscale(){const{width:t,height:r}=this._canvas;let i=this._canvas.getContext("2d").getImageData(0,0,t,r),n=i.data;for(let s=0;s<n.length;s+=4){let o=Math.round(.299*(n[s]??0)+.587*(n[s+1]??0)+.114*(n[s+2]??0));n[s]=o,n[s+1]=o,n[s+2]=o}let a=ot().createCanvas(t,r);return a.getContext("2d").putImageData(i,0,0),this._canvas=a,this}convert(t={}){const{alpha:r=1,beta:i=0}=t;if(r===1&&i===0)return this;const{width:n,height:a}=this._canvas;let s=this._canvas.getContext("2d").getImageData(0,0,n,a),o=s.data;for(let d=0;d<o.length;d+=4)o[d]=Math.round((o[d]??0)*r+i),o[d+1]=Math.round((o[d+1]??0)*r+i),o[d+2]=Math.round((o[d+2]??0)*r+i);let l=ot().createCanvas(n,a);return l.getContext("2d").putImageData(s,0,0),this._canvas=l,this}invert(){const{width:t,height:r}=this._canvas;let i=this._canvas.getContext("2d").getImageData(0,0,t,r),n=i.data;for(let s=0;s<n.length;s+=4)n[s]=255-(n[s]??0),n[s+1]=255-(n[s+1]??0),n[s+2]=255-(n[s+2]??0);let a=ot().createCanvas(t,r);return a.getContext("2d").putImageData(i,0,0),this._canvas=a,this}threshold(t={}){const{thresh:r=127,maxValue:i=255}=t,{width:n,height:a}=this._canvas;let s=this._canvas.getContext("2d").getImageData(0,0,n,a),o=s.data;for(let d=0;d<o.length;d+=4){let h=(o[d]===o[d+1]&&o[d+1]===o[d+2]?o[d]??0:Math.round(.299*(o[d]??0)+.587*(o[d+1]??0)+.114*(o[d+2]??0)))>r?i:0;o[d]=h,o[d+1]=h,o[d+2]=h}let l=ot().createCanvas(n,a);return l.getContext("2d").putImageData(s,0,0),this._canvas=l,this}border(t={}){const{size:r=10,color:i="white"}=t,{width:n,height:a}=this._canvas;let s=ot().createCanvas(n+r*2,a+r*2),o=s.getContext("2d");return o.fillStyle=i,o.fillRect(0,0,s.width,s.height),o.drawImage(this._canvas,r,r),this._canvas=s,this}rotate(t){const{angle:r,cx:i=this._canvas.width/2,cy:n=this._canvas.height/2}=t;if(r===0)return this;const{width:a,height:s}=this._canvas;let o=ot().createCanvas(a,s),l=o.getContext("2d");return l.save(),l.translate(i,n),l.rotate(-r*Math.PI/180),l.drawImage(this._canvas,-i,-n),l.restore(),this._canvas=o,this}findRegions(t={}){const{width:r,height:i}=this._canvas;let n=this._canvas.getContext("2d").getImageData(0,0,r,i).data;return lw(n,r,i,t)}toCanvas(){return this._canvas}static async prepareCanvas(t){return ow(t)}static async prepareBuffer(t){return uw(t)}}aw(Wm);class Wa{constructor(){xe(this,"pathSeparator","/");xe(this,"ort",Am);xe(this,"canvas",{prepareCanvas:t=>Bp.prepareCanvas(t),createProcessor:t=>new Bp(t),getToolkit:()=>ia.getInstance()})}createCanvas(t,r){let i=ot().createCanvas(t,r);return i.getContext.bind(i)("2d",{willReadFrequently:!0}),i}isCanvas(t){return!!t&&typeof t.getContext=="function"}async loadResource(t,r){if(t instanceof ArrayBuffer)return t;let i=typeof t=="string"?t:r,n=await fetch(i,{referrerPolicy:"no-referrer"});if(!n.ok)throw new Error(`Failed to fetch resource from ${i}`);return n.arrayBuffer()}async saveDebugImage(t,r,i){return Promise.resolve()}}function dw(){return`https://cdn.jsdelivr.net/npm/onnxruntime-web@${me.versions.web??me.versions.common}/dist/`}function qm(){return typeof globalThis.WorkerGlobalScope=="function"}function pw(){!(typeof window<"u"||qm())||me.wasm.wasmPaths||(me.wasm.wasmPaths=dw())}pw();async function cw(){if(typeof navigator>"u")return!1;let e=navigator;if(!e.gpu||typeof e.gpu.requestAdapter!="function")return!1;try{let t=await e.gpu.requestAdapter();return t!=null}catch{return!1}}async function hw(){return await cw()?["webgpu","wasm"]:["wasm"]}class Rp extends Dm{constructor(t,r={},i={}){super(new Wa,t,r,i,"canvas-native")}}let fw=0,mw="<unk>",na=8,gw=1.5,yw=2.5;function Mp(e){return new RegExp("\\p{L}","u").test(e)?0:new RegExp("\\p{N}","u").test(e)?1:2}function _w(e,t){if(e.length<4)return;let r=[];for(let s=1;s<t.length;s++)r.push((t[s]??0)-(t[s-1]??0));let i=[...r].sort((s,o)=>s-o),n=i[Math.floor(i.length/2)]??0;if(n<=0)return;let a=i.find(s=>s>0)??0;if(!(a<=0))for(let s=e.length-1;s>=1;s--){let o=t[s-1]??0,l=t[s]??0,d=Mp(e[s]??"")===Mp(e[s-1]??"")?yw:gw;l-o>n+d*a&&e[s]!==" "&&e[s-1]!==" "&&e[s]!==e[s-1]&&(e.splice(s,0," "),t.splice(s,0,(o+l)/2))}}let ww=65248,bw=/[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;function $w(e,t){var r;for(let i=e.length-1;i>=1;i--)e[i]===" "&&e[i-1]===" "&&(e.splice(i,1),t.splice(i,1));if(!bw.test(e.join("")))for(let i=0;i<e.length;i++){let n=((r=e[i])==null?void 0:r.codePointAt(0))??0;n>=65281&&n<=65374?e[i]=String.fromCodePoint(n-ww):n===12288&&(e[i]=" ")}}function Vm(e,t,r,i,n=!1){let a=i.length,s=a-1,o=[],l=-1,d=0,c=0,h=[];for(let _=0;_<t;_++){let g=_*r,b=e[g],S=0;for(let $=1;$<r;$++){let w=e[g+$];w>b&&(b=w,S=$)}if(S===fw||S===l){l=S;continue}if(S>=0&&S<a){n&&S!==s&&(e[g+s]??0)>.001&&o[o.length-1]!==" "&&(o.push(" "),h.push((_+.5)/t));let $=i[S]??"";S===s?$!==mw&&(o.push(" "),d+=b,c++,h.push((_+.5)/t)):(o.push($),d+=b,c++,h.push((_+.5)/t))}l=S}_w(o,h),$w(o,h);let f=c>0?d/c:0;return{text:o.join(""),confidence:f,positions:h}}function vw(e){let t=e.length;for(;t>0&&e[t-1]==="";)t--;return e.slice(0,t)}function Gm(e,t){if(e.length===t)return e;let r=vw(e);if(r.length===t)return r;let i=["",...r[0]===""?r.slice(1):r];return i.length===t-1&&i.push(""),i}function xw(e,t,r,i=!1,n=!1){let a=e.data,s=e.dims,o=s[1],l=s[2]??r;if(!t)return{text:"",confidence:0,positions:[]};let d=Gm(t,l);return d.length!==l&&i&&console.warn(`Warning: Model output classes (${l}) does not match dictionary length (${t.length}).
 Consider using our model & dictionary catalogue at https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models.`),Vm(a,o,l,d,n)}function Sw(e,t,r,i,n=!1){let a=Gm(i,r);return Vm(e,t,r,a,n)}async function Hm(e,t,r,i){let n=e.width,a=e.height;if(a===0||n===0)throw new Error(`Crop dimensions are zero: ${n}x${a}`);let s=n/a,o=Math.max(na,Math.round(t*s));if(r){let c=new r.ImageProcessor(e);try{c.resize({width:o,height:t});let h=c.toMat();return h.isContinuous()&&(h.channels()===4||h.channels()===1)?{imageTensor:kw(h,o,t),tensorWidth:o,tensorHeight:t}:{imageTensor:Fm(c.toCanvas(),o,t),tensorWidth:o,tensorHeight:t}}finally{c.destroy()}}let l=i(e).resize({width:o,height:t});return{imageTensor:Tw(l,o,t),tensorWidth:o,tensorHeight:t}}function Tw(e,t,r){let i=e.toCanvas();return Fm(i,t,r)}function Fm(e,t,r){let a=e.getContext("2d").getImageData(0,0,t,r).data,s=r*t,o=new Float32Array(3*s),l=1/127.5;for(let d=0,c=0;d<s;d++,c+=4)o[d]=(a[c]??0)*l-1;return o.copyWithin(s,0,s),o.copyWithin(s*2,0,s),o}function kw(e,t,r){let i=e.channels(),n=e.data,a=r*t,s=new Float32Array(3*a),o=1/127.5;for(let l=0,d=0;l<a;l++,d+=i)s[l]=n[d]*o-1;return s.copyWithin(a,0,a),s.copyWithin(a*2,0,a),s}async function qa(e,t,r){let i=t.options.imageHeight??48,n=Math.max(1,t.options.recBatchSize??6),a=r??t.options.charactersDictionary??[],s=t.options.spaceRecovery??!1,o=t.engine==="opencv"?t.platform.imageProcessor:void 0,l=await Promise.all(e.map(h=>Hm(h,i,o,t.platform.canvas.createProcessor.bind(t.platform.canvas)))),d=l.map((h,f)=>f).sort((h,f)=>{var b,S;let _=((b=l[h])==null?void 0:b.tensorWidth)??0,g=((S=l[f])==null?void 0:S.tensorWidth)??0;return _-g}),c=Array.from({length:e.length});for(let h=0;h<d.length;h+=n){let f=d.slice(h,h+n),_=Math.max(...f.map($=>{var w;return((w=l[$])==null?void 0:w.tensorWidth)??1})),g=i*_,b=new Float32Array(f.length*3*g);f.forEach(($,w)=>{let T=l[$];if(!T)return;let I=w*3*g;for(let k=0;k<3;k++)for(let C=0;C<i;C++){let z=(k*i+C)*T.tensorWidth,v=I+(k*i+C)*_;b.set(T.imageTensor.subarray(z,z+T.tensorWidth),v);let B=T.imageTensor[z+T.tensorWidth-1]??0;b.fill(B,v+T.tensorWidth,v+_)}});let S;try{S=new t.platform.ort.Tensor("float32",b,[f.length,3,i,_]);let $=await t.runInference(S);const[,w,T]=$.dims;let I=$.data,k=(w??0)*(T??0);f.forEach((C,z)=>{var P;let v=(((P=l[C])==null?void 0:P.tensorWidth)??_)/_,B=Math.max(1,Math.min(w??0,Math.ceil((w??0)*v)));c[C]=Sw(I.subarray(z*k,z*k+B*(T??0)),B,T??0,a,s)})}finally{S==null||S.dispose()}}return c}function Iw(e){var i,n;let t=e.inputMetadata,r=(n=(i=t==null?void 0:t[0])==null?void 0:i.shape)==null?void 0:n[0];return typeof r!="number"||r<0}function Va(e,t){if(!(t.options.rotateVerticalCrops??!0)||e.height/e.width<1.5)return e;let r=t.platform.createCanvas(e.height,e.width),i=r.getContext("2d");return i.translate(0,e.width),i.rotate(-Math.PI/2),i.drawImage(e,0,0),r}function li(e,t,r){return r.getToolkit().crop({bbox:{x0:t.x,y0:t.y,x1:t.x+t.width,y1:t.y+t.height},canvas:e})}async function Ew(e,t,r){let i=t.options.imageHeight??48,n=t.engine==="opencv"?t.platform.imageProcessor:void 0;const{imageTensor:a,tensorWidth:s,tensorHeight:o}=await Hm(e,i,n,t.platform.canvas.createProcessor.bind(t.platform.canvas));let l;try{l=new t.platform.ort.Tensor("float32",a,[1,3,o,s]);let d=await t.runInference(l),c=r??t.options.charactersDictionary??[];return xw(d,c,s,t.debugging.verbose)}finally{l==null||l.dispose()}}function si(e){return[...e].sort((t,r)=>Math.abs(t.box.y-r.box.y)<(t.box.height+r.box.height)/4?t.box.x-r.box.x:t.box.y-r.box.y)}async function Cw(e,t,r,i,n){let a=r.debugging.debugFolder?`${r.debugging.debugFolder}${r.platform.pathSeparator}crops`:"";if(r.debugging.debug&&a){let o=r.platform.canvas.getToolkit();"clearOutput"in o&&typeof o.clearOutput=="function"&&o.clearOutput(a)}if(!r.debugging.debug){let o=t.map(({box:c})=>Va(li(e,c,r.platform.canvas),r)),l=await qa(o,r,n),d=t.map(({box:c},h)=>{var f,_;return{text:((f=l[h])==null?void 0:f.text)??"",box:c,confidence:((_=l[h])==null?void 0:_.confidence)??0}});return si(d)}let s=[];for(const{box:o,index:l}of t){let d=await i(e,o,l,t.length,a,n);d!==null&&s.push(d)}return si(s)}async function zw(e,t,r,i){let n=Nm(t),a=[],s=[];for(let d of n){let c=d[0];if(c)if(d.length===1)s.push(Va(li(e,c.box,r.platform.canvas),r)),a.push({lineBoxes:d,cropWidths:null});else{const{mergedCanvas:h,cropWidths:f}=Pm(e,d,r.platform.createCanvas.bind(r.platform),r.platform.canvas);s.push(h),a.push({lineBoxes:d,cropWidths:f})}}let o=await qa(s,r,i),l=[];return a.forEach((d,c)=>{let h=o[c];if(h)if(d.cropWidths===null){let f=d.lineBoxes[0];f&&l.push({text:h.text,box:f.box,confidence:h.confidence})}else{let f=Um(h.text,h.positions,d.cropWidths);for(let _=0;_<d.lineBoxes.length;_++){let g=d.lineBoxes[_];g&&l.push({text:(f[_]??"").trim(),box:g.box,confidence:h.confidence})}}}),si(l)}async function Aw(e,t,r,i){let n=Nm(t),a=r.options.imageHeight??48,s=20,o=[];for(let g of n)if(g.length===1){let b=g[0];if(!b)continue;let S=li(e,b.box,r.platform.canvas);o.push({canvas:S,boxes:g,cropWidths:[S.width]})}else{const{mergedCanvas:b,cropWidths:S}=Pm(e,g,r.platform.createCanvas.bind(r.platform),r.platform.canvas);o.push({canvas:b,boxes:g,cropWidths:S})}let l=o.map(({canvas:g,boxes:b,cropWidths:S},$)=>{let w=g.width/g.height,T=Math.max(na,Math.round(a*w));return{canvas:g,boxes:b,cropWidths:S,resizedWidth:T,originalHeight:g.height,index:$}}),d=Math.max(...l.map(g=>g.resizedWidth)),c=r.options.crossLineWidthFactor??1.5,h=Math.round(d*c),f=ew(l,g=>g.resizedWidth,h,s),_=[];for(let g of f){let b=[...g].sort((U,O)=>U.index-O.index),S=Math.max(...b.map(U=>U.originalHeight)),$=b.map(U=>{if(U.originalHeight>=S)return U.resizedWidth;let O=S/U.originalHeight;return Math.max(na,Math.round(U.resizedWidth*O))}),T=$.reduce((U,O)=>U+O,0)+s*(b.length-1),I=r.platform.createCanvas(T,a),k=I.getContext("2d");k.fillStyle="white",k.fillRect(0,0,T,a);let C=0;for(let U=0;U<b.length;U++){let O=b[U],H=$[U];O===void 0||H===void 0||(k.drawImage(O.canvas,0,0,O.canvas.width,O.canvas.height,C,0,H,a),C+=H,U<b.length-1&&(C+=s))}const{text:z,confidence:v,positions:B}=await Ew(I,r,i);let P=[],G=[];for(let U=0;U<b.length;U++){let O=b[U],H=$[U];if(!O||H===void 0)continue;let Y=H/O.canvas.width;for(let Q=0;Q<O.boxes.length;Q++){let re=O.boxes[Q];if(!re)continue;let J=(O.cropWidths[Q]??0)*Y;Q===O.boxes.length-1&&U<b.length-1&&(J+=s),P.push(J),G.push(re)}}let V=Um(z,B,P);for(let U=0;U<G.length;U++){let O=G[U];O&&_.push({text:(V[U]??"").trim(),box:O.box,confidence:v})}}return si(_)}class Ow{constructor(t,r,i={},n={},a="opencv"){xe(this,"options");xe(this,"debugging");xe(this,"session");xe(this,"platform");xe(this,"engine");this.platform=t,this.session=r,this.options={...Jn,...i},this.debugging={...La,...n},a==="opencv"&&!this.platform.imageProcessor?this.engine="canvas-native":this.engine=a}log(t){this.debugging.verbose&&console.log(`[RecognitionService] ${t}`)}async run(t,r,i,n="per-line",a){this.log("Starting text recognition process");try{let s;this.platform.isCanvas(t)?s=t:this.engine==="opencv"&&this.platform.imageProcessor?s=await this.platform.imageProcessor.prepareCanvas(t):s=await this.platform.canvas.prepareCanvas(t);let o=this.filterValidBoxes(r);if(o.length===0)return[];const{canvas:l,ratio:d}=this.buildCropCanvas(s);let c=d===1?o:o.map(g=>({...g,box:Np(g.box,d)})),h=this.buildContext(a),f;switch(n){case"cross-line":f=await Aw(l,c,h,i);break;case"per-line":f=await zw(l,c,h,i);break;case"per-box":default:f=await Cw(l,c,h,(g,b,S,$,w,T)=>this.processBox(g,b,S,$,w,h,T),i)}d!==1&&(f=f.map(g=>({...g,box:Np(g.box,1/d)})));let _=(a==null?void 0:a.minimumConfidence)??this.options.minimumConfidence??Jn.minimumConfidence??Dp;return _>Dp?f.filter(g=>{let b=/[\p{L}\p{N}]/u.test(g.text)?_:Math.min(Bw,_+Mw);return g.confidence>=b}):f}catch(s){return console.error("Error during text recognition:",s instanceof Error?s.message:String(s)),[]}}buildContext(t){let r={...this.options,...(t==null?void 0:t.spaceRecovery)!==void 0?{spaceRecovery:t.spaceRecovery}:{},...(t==null?void 0:t.rotateVerticalCrops)!==void 0?{rotateVerticalCrops:t.rotateVerticalCrops}:{},...(t==null?void 0:t.recBatchSize)!==void 0?{recBatchSize:t.recBatchSize}:{}};return{platform:this.platform,options:Iw(this.session)?r:{...r,recBatchSize:Rw},debugging:this.debugging,engine:this.engine,runInference:i=>this.runInference(i)}}filterValidBoxes(t){return t.map((r,i)=>({box:r,index:i})).filter(({box:r,index:i})=>this.isValidBox(r,i))}buildCropCanvas(t){const{width:r,height:i}=t;let n=this.options.maxCropSourceSideLength??2e3;const{width:a,height:s,ratio:o}=Mm(r,i,n);if(o===1)return{canvas:t,ratio:1};let l=this.platform.createCanvas(a,s);return l.getContext("2d").drawImage(t,0,0,r,i,0,0,a,s),{canvas:l,ratio:o}}async processBox(t,r,i,n,a,s,o){let l=Date.now();try{let d=Va(li(t,r,this.platform.canvas),s);const[c]=await qa([d],s,o);let h=(c==null?void 0:c.text)??"",f=(c==null?void 0:c.confidence)??0;if(this.debugging.debug&&a){await this.platform.saveDebugImage(d,`crop_${String(i).padStart(3,"0")}.png`,a);let _=Date.now()-l;this.log(`Box ${i+1}/${n}: [x:${r.x}, y:${r.y}, w:${r.width}, h:${r.height}]
	 -> "${h}" (processed in ${_}ms)
`)}return{text:h,box:r,confidence:f}}catch(d){let c=d instanceof Error?d:new Error(String(d));return console.error(`Error processing box ${i+1}: ${c.message}`,c.stack),null}}isValidBox(t,r){return t.width<=0||t.height<=0?(console.warn(`Skipping invalid box ${r+1}: w=${t.width}, h=${t.height}`),!1):!0}async runInference(t){let r=this.options.mainThreadYieldMs??0;r>0&&await new Promise(o=>setTimeout(o,r));let i={x:t},n=await this.session.run(i),a=Object.keys(n)[0],s=a?n[a]:void 0;if(!s)throw new Error(`Recognition output tensor '${a}' not found. Available keys: ${Object.keys(n)}`);return s}}let Dp=0,Bw=1,Rw=1,Mw=.3;function Np(e,t){return{x:Math.round(e.x*t),y:Math.round(e.y*t),width:Math.max(1,Math.round(e.width*t)),height:Math.max(1,Math.round(e.height*t))}}function Dw(e,t=typeof window<"u"&&!qm()){return t?{mainThreadYieldMs:B_,...e}:e}class Pp extends Ow{constructor(t,r={},i={}){super(new Wa,t,Dw(r),i,"canvas-native")}}let Nw={graphOptimizationLevel:"all"};class Uw extends rw{constructor(t){super(new Wa,t),(this.options.session===void 0||Object.keys(this.options.session).length===0)&&(this.options.session=Nw)}async initSessions(){throw new Error("Initialization is handled proactively in PaddleOcrService. Call initialize() instead.")}async _loadResource(t,r){if(t instanceof ArrayBuffer)return this.log("Loading resource from ArrayBuffer"),t;let i=typeof t=="string"?t:r;return this.log(`Fetching resource from URL: ${i}`),Rm(i)}async _resolveSessionExecutionProviders(){let t=this.options.session??{};if(t.executionProviders&&t.executionProviders.length>0){this.log(`Using user-provided executionProviders: ${JSON.stringify(t.executionProviders)}`);return}let r=await hw();this.options.session={...t,executionProviders:r},this.log(`Resolved executionProviders: ${JSON.stringify(r)}`)}async _createSession(t){return nw(Am,t,this.options.session,r=>console.warn(`[PaddleOcrService] ${r}`),r=>this.options.session=r)}async initialize(){var t,r,i;try{this.log("Initializing PaddleOcrService (Web)..."),await this._resolveSessionExecutionProviders();const[n,a,s]=await Promise.all([this._loadResource((t=this.options.model)==null?void 0:t.detection,Xt.detection),this._loadResource((r=this.options.model)==null?void 0:r.recognition,Xt.recognition),this._loadResource((i=this.options.model)==null?void 0:i.charactersDictionary,Xt.charactersDictionary)]),[o,l]=await Promise.all([this._createSession(new Uint8Array(n)),this._createSession(new Uint8Array(a))]);this.detectionSession=o,this.recognitionSession=l,this.options.model&&(this.options.model.detection=n),this.options.model&&(this.options.model.recognition=a),this.log(`Detection ONNX model loaded successfully
	input: ${o.inputNames}
	output: ${o.outputNames}`),this.log(`Recognition ONNX model loaded successfully
	input: ${l.inputNames}
	output: ${l.outputNames}`);let d=ta(s);if(d.length===0)throw new Error("Character dictionary is empty or could not be loaded.");this.options.model&&(this.options.model.charactersDictionary=s),this.options.recognition&&(this.options.recognition.charactersDictionary=d),this.log(`Character dictionary loaded with ${d.length} entries.`),this.detector=new Rp(o,this.options.detection,this.options.debugging),this.recognitor=new Pp(l,this.options.recognition,this.options.debugging),this.options.model&&(this.options.model.detection=void 0),this.options.model&&(this.options.model.recognition=void 0)}catch(n){throw console.error("Failed to initialize PaddleOcrService Web:",n),n}}async changeDetectionModel(t){var i;this.log("Changing detection model...");let r=await this._loadResource(t,Xt.detection);await((i=this.detectionSession)==null?void 0:i.release()),this.detectionSession=await this._createSession(new Uint8Array(r)),this.detector=new Rp(this.detectionSession,this.options.detection,this.options.debugging),this.options.model&&(this.options.model.detection=r),this.log("Detection model changed successfully.")}async changeRecognitionModel(t){var i;this.log("Changing recognition model...");let r=await this._loadResource(t,Xt.recognition);await((i=this.recognitionSession)==null?void 0:i.release()),this.recognitionSession=await this._createSession(new Uint8Array(r)),this.recognitor=new Pp(this.recognitionSession,this.options.recognition,this.options.debugging),this.options.model&&(this.options.model.recognition=r),this.log("Recognition model changed successfully.")}async changeTextDictionary(t){this.log("Changing text dictionary...");let r=await this._loadResource(t,Xt.charactersDictionary),i=ta(r);if(i.length===0)throw new Error("Character dictionary is empty or could not be loaded.");this.options.model&&(this.options.model.charactersDictionary=r),this.options.recognition&&(this.options.recognition.charactersDictionary=i),this.log(`Character dictionary changed successfully with ${i.length} entries.`)}async recognize(t,r){return super.recognize(t,r)}}export{La as DEFAULT_DEBUGGING_OPTIONS,Om as DEFAULT_DETECTION_OPTIONS,ly as DEFAULT_MODEL,Xt as DEFAULT_MODEL_URLS,Dn as DEFAULT_PADDLE_OPTIONS,Bm as DEFAULT_PROCESSING_ENGINE,M_ as DEFAULT_PROCESSING_OPTIONS,Jn as DEFAULT_RECOGNITION_OPTIONS,ay as DICT_BASE_URL,Rp as DetectionService,Qr as MODEL_BASE_URL,Uw as PaddleOcrService,Pp as RecognitionService,uy as V6_TINY_MODEL,hw as getDefaultWebExecutionProviders,cw as isWebGpuAvailable,qm as isWebWorker};

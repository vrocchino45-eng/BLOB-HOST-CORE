// NF02 proposal verifier. No game import and no inferred unit conversions.
const keys=(object,fields)=>object&&Object.getPrototypeOf(object)===Object.prototype
  && Object.keys(object).length===fields.length && fields.every(k=>Object.hasOwn(object,k));
const expectedDimensions={"length":[1,0,0],"area":[2,0,0],"volume":[3,0,0],"time":[0,0,1],"mass":[0,1,0],"density":[-3,1,0],"velocity":[1,0,-1],"acceleration":[1,0,-2],"momentum":[1,1,-1],"impulse":[1,1,-1],"force":[1,1,-2],"angularMomentum":[2,1,-1],"torque":[2,1,-2],"energy":[2,1,-2],"power":[2,1,-3],"pressure":[-1,1,-2],"frequency":[0,0,-1],"linearDamping":[0,0,-1],"dynamicViscosity":[-1,1,-1],"frictionCoefficient":[0,0,0],"restitution":[0,0,0]};
const equal=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);

export function verifyNFContract(value) {
  if (!keys(value,['schema','revision','status','governingSource','mechanicalBases','exponentOrder','inventoryUnit','SI',
    'dimensionVectors','ownerIndices','frames','timeDomains','analyticalTolerance'])) throw new TypeError('invalid contract fields');
  if (value.schema!=='blob.numerical-contract.v1'||value.revision!==1||value.status!=='proposed'
    || !/^[a-f0-9]{40}$/.test(value.governingSource)) throw new TypeError('invalid proposal identity');
  if (!equal(value.mechanicalBases,['Lw','Mr','Ts']) || !equal(value.exponentOrder,['length','mass','time'])
    || value.inventoryUnit!=='Q') throw new TypeError('physical and inventory bases must be independent');
  if (!keys(value.SI,['metersPerLw','kilogramsPerMr','secondsPerTs']) || value.SI.metersPerLw!==null
    || value.SI.kilogramsPerMr!==null||value.SI.secondsPerTs!==1) throw new TypeError('runtime has no admitted SI length or mass');
  if (!keys(value.dimensionVectors,Object.keys(expectedDimensions))
    || Object.entries(expectedDimensions).some(([k,v])=>!equal(value.dimensionVectors[k],v))) throw new TypeError('inconsistent dimensions');
  if (!equal(value.ownerIndices,['pressure01','conductivity01','resistance01','reserve01','viscosityIndex'])
    || !equal(value.frames,['silt-local','core-local','world','camera-view','clip'])
    || !equal(value.timeDomains,['wall','simulation','mounted-ecology','presentation','audio'])
    || !keys(value.analyticalTolerance,['absolute','relative'])
    || value.analyticalTolerance.absolute!==1e-12||value.analyticalTolerance.relative!==1e-12) throw new TypeError('invalid scope or tolerance');
  return true;
}

export function convertUnits(value, [length,mass,time], {metersPerLw,kilogramsPerMr,secondsPerTs}, toSI=true) {
  if (!Number.isFinite(value)||![length,mass,time].every(Number.isSafeInteger)) throw new TypeError('invalid dimensional value');
  const component=(scale,power)=>{
    if (power===0)return 1;
    if (!Number.isFinite(scale)||scale<=0)throw new RangeError('missing admitted scale for exponent');
    return scale**power;
  };
  const factor=component(metersPerLw,length)*component(kilogramsPerMr,mass)*component(secondsPerTs,time);
  if (!Number.isFinite(factor)||factor<=0)throw new RangeError('invalid conversion factor');
  const result=toSI?value*factor:value/factor;
  if (!Number.isFinite(result))throw new RangeError('conversion overflow');
  return result;
}

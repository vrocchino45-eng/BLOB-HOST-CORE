// The visual language is a leading crest with a quieter, delayed answer.
// Owners supply their own receipt age. This module owns neither events nor state.
export const CASCADE_CRESTS = Object.freeze([
  Object.freeze({ delay: 0, gain: 1 }),
  Object.freeze({ delay: 0.34, gain: 0.64 })
]);

export function sampleCascadeCrest(age, crest, duration) {
  const progress = (age - crest.delay) / duration;
  if (!(progress >= 0 && progress < 1)) return { progress: 0, strength: 0 };
  const attack = Math.min(1, 0.68 + progress * 3.2);
  return { progress, strength: crest.gain * attack * (1 - progress) ** 1.25 };
}

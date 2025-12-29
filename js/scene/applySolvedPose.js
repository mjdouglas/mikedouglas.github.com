/**
 * Applies the solved pose from GLTF animation data
 * @param {THREE.Object3D} model - The GLTF model
 * @param {THREE.AnimationClip[]} animations - GLTF animation clips
 */
export function applySolvedPoseFromAnimation(model, animations) {
  if (!animations || animations.length === 0) {
    return;
  }

  animations.forEach(clip => {
    clip.tracks.forEach(track => {
      const nameParts = track.name.split('.');
      if (nameParts.length < 2) return;

      const targetName = nameParts[0];
      const property = nameParts[1];
      const target = model.getObjectByName(targetName);
      if (!target) return;

      const valueSize = track.getValueSize();
      const values = track.values;
      const finalValues = values.slice(values.length - valueSize);

      switch (property) {
        case 'quaternion':
          target.quaternion.fromArray(finalValues);
          break;
        case 'position':
          target.position.fromArray(finalValues);
          break;
        case 'scale':
          target.scale.fromArray(finalValues);
          break;
        default:
          break;
      }
    });
  });

  model.updateMatrixWorld(true);
  console.log('Applied solved pose from GLTF animation');
}

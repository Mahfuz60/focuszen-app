export function getFocusPresetAppearance(
  active: boolean,
  activeColor: string,
  idleBorderColor: string
) {
  if (active) {
    return {
      backgroundColor: activeColor,
      borderColor: activeColor,
      valueColor: '#ffffff',
      labelColor: '#ffffff',
    };
  }

  return {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: idleBorderColor,
    valueColor: '#12253d',
    labelColor: '#5e7087',
  };
}

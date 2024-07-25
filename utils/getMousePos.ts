export const getMousePos = (e: MouseEvent | Touch) => {
  return {
    x: e.clientX,
    y: e.clientY,
  };
};

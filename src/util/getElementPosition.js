
/* eslint-disable operator-assignment */

// Helper function to get an element's exact position
export default function getElementPosition(el) {
  let xPos = 0;
  let yPos = 0;

  while (el) {
    if (el.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      const yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    // eslint-disable-next-line no-param-reassign
    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

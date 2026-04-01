/**
 * Page Replacement Algorithms
 * Input: pages (array of page numbers), frameCount
 * Output: { frames (history), faults, hits }
 */

export function fifo(pages, frameCount) {
  const frames = [];
  const history = [];
  let faults = 0;
  const queue = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const snapshot = [...frames];
    let fault = false;

    if (!frames.includes(page)) {
      fault = true;
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        queue.push(page);
      } else {
        const evict = queue.shift();
        const idx = frames.indexOf(evict);
        frames[idx] = page;
        queue.push(page);
      }
    }

    history.push({ page, frames: [...frames], fault });
  }

  return { history, faults, hits: pages.length - faults };
}

export function lru(pages, frameCount) {
  const frames = [];
  const history = [];
  let faults = 0;
  const recent = []; // tracks usage order (most recent at end)

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let fault = false;

    if (!frames.includes(page)) {
      fault = true;
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        // Find LRU: page in recent[] that appears least recently
        let lruPage = null;
        for (let j = 0; j < recent.length; j++) {
          if (frames.includes(recent[j])) {
            lruPage = recent[j];
            break;
          }
        }
        const idx = frames.indexOf(lruPage);
        frames[idx] = page;
        const ri = recent.indexOf(lruPage);
        if (ri !== -1) recent.splice(ri, 1);
      }
    } else {
      // Remove from recent and re-add at end (most recent)
      const ri = recent.indexOf(page);
      if (ri !== -1) recent.splice(ri, 1);
    }
    recent.push(page);
    history.push({ page, frames: [...frames], fault });
  }

  return { history, faults, hits: pages.length - faults };
}

export function optimal(pages, frameCount) {
  const frames = [];
  const history = [];
  let faults = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let fault = false;

    if (!frames.includes(page)) {
      fault = true;
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        // Find which frame will not be used for longest time
        let replaceIdx = 0;
        let farthest = -1;
        for (let f = 0; f < frames.length; f++) {
          const nextUse = pages.indexOf(frames[f], i + 1);
          if (nextUse === -1) { replaceIdx = f; break; }
          if (nextUse > farthest) { farthest = nextUse; replaceIdx = f; }
        }
        frames[replaceIdx] = page;
      }
    }

    history.push({ page, frames: [...frames], fault });
  }

  return { history, faults, hits: pages.length - faults };
}

/**
 * Paging simulation: given page size and logical addresses
 */
export function simulatePaging(pageSize, numFrames, logicalAddresses) {
  const pageTable = {};
  const frames = Array(numFrames).fill(null);
  let nextFrame = 0;

  return logicalAddresses.map((addr) => {
    const pageNum = Math.floor(addr / pageSize);
    const offset = addr % pageSize;
    let frameNum = pageTable[pageNum];
    let fault = false;

    if (frameNum === undefined) {
      fault = true;
      frameNum = nextFrame % numFrames;
      // Find which page was evicted
      const evictedPage = Object.keys(pageTable).find((k) => pageTable[k] === frameNum);
      if (evictedPage !== undefined) delete pageTable[evictedPage];
      pageTable[pageNum] = frameNum;
      frames[frameNum] = pageNum;
      nextFrame++;
    }

    const physicalAddr = frameNum * pageSize + offset;
    return { logicalAddr: addr, pageNum, offset, frameNum, physicalAddr, fault };
  });
}

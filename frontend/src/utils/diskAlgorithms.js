/**
 * Disk Scheduling Algorithms
 * Input: requests (array of cylinder numbers), initialHead, diskSize
 * Output: { order, totalSeek, seekSequence }
 */

export function fcfsDisk(requests, initialHead) {
  const order = [initialHead, ...requests];
  let totalSeek = 0;
  const seekSequence = [initialHead];

  for (let i = 0; i < requests.length; i++) {
    totalSeek += Math.abs(order[i + 1] - order[i]);
    seekSequence.push(requests[i]);
  }

  return { order: seekSequence, totalSeek };
}

export function sstf(requests, initialHead) {
  const remaining = [...requests];
  const seekSequence = [initialHead];
  let head = initialHead;
  let totalSeek = 0;

  while (remaining.length > 0) {
    remaining.sort((a, b) => Math.abs(a - head) - Math.abs(b - head));
    const next = remaining.shift();
    totalSeek += Math.abs(next - head);
    head = next;
    seekSequence.push(next);
  }

  return { order: seekSequence, totalSeek };
}

export function scan(requests, initialHead, diskSize = 200, direction = 'right') {
  const sorted = [...requests].sort((a, b) => a - b);
  const seekSequence = [initialHead];
  let totalSeek = 0;
  let head = initialHead;

  const right = sorted.filter((r) => r >= head);
  const left = sorted.filter((r) => r < head).reverse();

  if (direction === 'right') {
    // Go right to disk end, then left
    [...right, diskSize - 1, ...left].forEach((r) => {
      if (!seekSequence.includes(r) || r === diskSize - 1) {
        totalSeek += Math.abs(r - head);
        head = r;
        if (r !== diskSize - 1 || !seekSequence.includes(diskSize - 1)) {
          seekSequence.push(r);
        }
      }
    });
  } else {
    [...left, 0, ...right].forEach((r) => {
      totalSeek += Math.abs(r - head);
      head = r;
      seekSequence.push(r);
    });
  }

  // Clean: only include actual requests + endpoints
  const cleanSeq = [initialHead];
  const targets = new Set([...requests]);
  let cHead = initialHead;
  
  const order = direction === 'right'
    ? [...right, ...left]
    : [...left, ...right];
  
  order.forEach((r) => {
    if (targets.has(r)) {
      cleanSeq.push(r);
    }
  });
  
  let totalSeekClean = 0;
  for (let i = 1; i < cleanSeq.length; i++) {
    totalSeekClean += Math.abs(cleanSeq[i] - cleanSeq[i - 1]);
  }

  return { order: cleanSeq, totalSeek: totalSeekClean };
}

export function cscan(requests, initialHead, diskSize = 200) {
  const sorted = [...requests].sort((a, b) => a - b);
  const seekSequence = [initialHead];
  let totalSeek = 0;
  let head = initialHead;

  const right = sorted.filter((r) => r >= head);
  const left = sorted.filter((r) => r < head);

  // Go right to end, jump to start, continue right
  const order = [...right, diskSize - 1, 0, ...left];
  
  order.forEach((point) => {
    totalSeek += Math.abs(point - head);
    head = point;
    seekSequence.push(point);
  });

  return { order: seekSequence, totalSeek };
}

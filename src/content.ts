console.log('Content.ts loaded');

const valid_containers = ['article', 'section', 'main'];
const containers = document.querySelectorAll(valid_containers.join(', '));

// get links in containers
const links: HTMLAnchorElement[] = [];
for (const container of containers) {
  const linkTmp = container.querySelectorAll('a');

  // add to links if it isn't already in the list
  for (const link of linkTmp) {
    if (!links.includes(link)) {
      links.push(link);
    }
  }
}

links.forEach((link) => link.addEventListener('mouseenter', console.log));

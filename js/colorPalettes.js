// Color palettes with titles and songs
export const palettes = {
  classic: {
    title: 'Old School',
    song: 'Take On Me',
    artist: 'a-ha',
    url: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L',
    audioFile: 'audio/classic.mp3',
  },
  miami: {
    title: 'Vice City Nights',
    song: 'Midnight City',
    artist: 'M83',
    url: 'https://open.spotify.com/track/1eyzqe2QqGZUmfcPZtrIyt',
    audioFile: 'audio/miami.mp3',
  },
  synthwave: {
    title: 'Retrowave Dreams',
    song: 'Nightcall',
    artist: 'Kavinsky',
    url: 'https://open.spotify.com/track/0U0ldCRmgCqhVvD6ksG63j',
    audioFile: 'audio/synthwave.mp3',
  },
  neonTokyo: {
    title: 'Akihabara Nights',
    song: 'Flyday Chinatown',
    artist: 'Yasuha',
    url: 'https://open.spotify.com/track/2uXlHiOE4o5xHOCiob8DKn',
    audioFile: 'audio/neonTokyo.mp3',
  },
  sunset: {
    title: 'Golden Hour',
    song: 'Sunset Lover',
    artist: 'Petit Biscuit',
    url: 'https://open.spotify.com/track/3WRQUvzRvBDr4AxMWhXc5E',
    audioFile: 'audio/sunset.mp3',
  },
  ocean: {
    title: 'Deep Blue',
    song: 'Says',
    artist: 'Nils Frahm',
    url: 'https://open.spotify.com/track/5626KdflSKfeDK7RJQfSrE',
    audioFile: 'audio/ocean.mp3',
  },
  aurora: {
    title: 'Northern Lights',
    song: 'Svefn-g-englar',
    artist: 'Sigur Rós',
    url: 'https://open.spotify.com/track/07eGxuz8bL6QMsRqEe1Adu',
    audioFile: 'audio/aurora.mp3',
  },
  candy: {
    title: 'Sugar Rush',
    song: 'Call Me Maybe',
    artist: 'Carly Rae Jepsen',
    url: 'https://open.spotify.com/track/3TGRqZ0a2l1LRblBkJoaDx',
    audioFile: 'audio/candy.mp3',
  },
  fire: {
    title: 'Inferno',
    song: 'Through the Fire and Flames',
    artist: 'DragonForce',
    url: 'https://open.spotify.com/track/6nnacTL5on2aVsRhVDNUSo',
    audioFile: 'audio/fire.mp3',
  },
  ice: {
    title: 'Frozen Static',
    song: 'Intro',
    artist: 'The xx',
    url: 'https://open.spotify.com/track/5VfEuwErhx6X4eaPbyBfyu',
    audioFile: 'audio/ice.mp3',
  },
  forest: {
    title: 'Emerald Canopy',
    song: 'Holocene',
    artist: 'Bon Iver',
    url: 'https://open.spotify.com/track/35KiiILklye1JRRctaLUb4',
    audioFile: 'audio/forest.mp3',
  },
  galaxy: {
    title: 'Event Horizon',
    song: 'Space Oddity',
    artist: 'David Bowie',
    url: 'https://open.spotify.com/track/72Z17vmmeQKAg8bptWvpVG',
    audioFile: 'audio/galaxy.mp3',
  },
};

export const paletteNames = Object.keys(palettes);

export function getRandomPaletteName() {
  return paletteNames[Math.floor(Math.random() * paletteNames.length)];
}

export function titleToSlug(title) {
  return title.toLowerCase().replace(/\s+/g, '-');
}

export function getPaletteNameBySlug(slug) {
  return paletteNames.find(name => titleToSlug(palettes[name].title) === slug);
}

export function getPaletteInfo(paletteName = null) {
  if (!paletteName) {
    paletteName = getRandomPaletteName();
  }
  const palette = palettes[paletteName];
  console.log('Using color palette:', paletteName, '-', palette.title);
  return {
    name: paletteName,
    title: palette.title,
    song: palette.song,
    artist: palette.artist,
    url: palette.url,
    audioFile: palette.audioFile,
    texturePath: `textures/Rubik_baseColor_${paletteName}.png`,
  };
}

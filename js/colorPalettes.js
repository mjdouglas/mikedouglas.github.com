// Color palettes with titles and songs
export const palettes = {
  classic: {
    title: 'Old School',
    song: 'Take On Me',
    artist: 'a-ha',
    url: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L',
  },
  miami: {
    title: 'Vice City Nights',
    song: 'Midnight City',
    artist: 'M83',
    url: 'https://open.spotify.com/track/1eyzqe2QqGZUmfcPZtrIyt',
  },
  synthwave: {
    title: 'Retrowave Dreams',
    song: 'Nightcall',
    artist: 'Kavinsky',
    url: 'https://open.spotify.com/track/0U0ldCRmgCqhVvD6ksG63j',
  },
  neonTokyo: {
    title: 'Akihabara Nights',
    song: 'Flyday Chinatown',
    artist: 'Yasuha',
    url: 'https://open.spotify.com/track/2uXlHiOE4o5xHOCiob8DKn',
  },
  sunset: {
    title: 'Golden Hour',
    song: 'Sunset Lover',
    artist: 'Petit Biscuit',
    url: 'https://open.spotify.com/track/3WRQUvzRvBDr4AxMWhXc5E',
  },
  ocean: {
    title: 'Deep Blue',
    song: 'Says',
    artist: 'Nils Frahm',
    url: 'https://open.spotify.com/track/5626KdflSKfeDK7RJQfSrE',
  },
  aurora: {
    title: 'Northern Lights',
    song: 'Svefn-g-englar',
    artist: 'Sigur Rós',
    url: 'https://open.spotify.com/track/07eGxuz8bL6QMsRqEe1Adu',
  },
  candy: {
    title: 'Sugar Rush',
    song: 'Call Me Maybe',
    artist: 'Carly Rae Jepsen',
    url: 'https://open.spotify.com/track/3TGRqZ0a2l1LRblBkJoaDx',
  },
  fire: {
    title: 'Inferno',
    song: 'Through the Fire and Flames',
    artist: 'DragonForce',
    url: 'https://open.spotify.com/track/6nnacTL5on2aVsRhVDNUSo',
  },
  ice: {
    title: 'Frozen Static',
    song: 'Intro',
    artist: 'The xx',
    url: 'https://open.spotify.com/track/5VfEuwErhx6X4eaPbyBfyu',
  },
  forest: {
    title: 'Emerald Canopy',
    song: 'Holocene',
    artist: 'Bon Iver',
    url: 'https://open.spotify.com/track/35KiiILklye1JRRctaLUb4',
  },
  galaxy: {
    title: 'Event Horizon',
    song: 'Space Oddity',
    artist: 'David Bowie',
    url: 'https://open.spotify.com/track/72Z17vmmeQKAg8bptWvpVG',
  },
};

export const paletteNames = Object.keys(palettes);

export function getRandomPaletteName() {
  return paletteNames[Math.floor(Math.random() * paletteNames.length)];
}

export function getSpotifyEmbedUrl(trackUrl) {
  const trackId = trackUrl.split('/track/')[1];
  return `https://open.spotify.com/embed/track/${trackId}`;
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
    embedUrl: getSpotifyEmbedUrl(palette.url),
    texturePath: `textures/Rubik_baseColor_${paletteName}.png`,
  };
}

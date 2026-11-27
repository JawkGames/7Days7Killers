export const GAME_CONFIG = {
  gameTitle: '7 Days 7 Killers',
  packageId: 'com.jawk.sevendayssevenkillers',
  version: 'v0.1.3',
  designWidth: 1600,
  designHeight: 900,
  parallaxMargin: 110,
  dailySummonLimit: 4,
  totalDays: 7,
  totalKillers: 7,
  boilFps: 7,
  depth: {
    bg: 0.18,
    door: 0.22,
    shadow: 0.28,
    chair: 0.42,
    suspect: 0.50,
    bulb: 0.66,
    desk: 0.92,
    smoke: 1.05
  },
  palette: {
    voidBg: '#0b0e0c',
    moldGreen: '#263228',
    bruiseViolet: '#312336',
    dirtyAmber: '#d9b566',
    amberGlow: 'rgba(217, 181, 102, 0.24)',
    hallLight: 'rgba(188, 198, 158, 0.34)',
    bloodInk: '#8d2424',
    paperText: '#dfd8c8',
    mutedText: '#9c9688'
  }
};

export function isNativeMobileApp() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
    return Boolean(window.Capacitor.isNativePlatform());
  }
  if (window.cordova || window.AndroidBridge) return true;
  const proto = window.location?.protocol || '';
  if (proto === 'capacitor:' || proto === 'app:') return true;
  const ua = navigator.userAgent || '';
  if (/; wv\)/i.test(ua)) return true;
  return false;
}

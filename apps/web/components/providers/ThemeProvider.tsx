'use client';

import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi, StoreSettings, DEFAULT_SETTINGS, resolveFontFamily } from '@pizza/shared';

const ThemeContext = createContext<StoreSettings>(DEFAULT_SETTINGS);

function toOverlayOpacity(value?: number) {
  const parsed = Number(value);
  const percent = Number.isFinite(parsed) ? parsed : DEFAULT_SETTINGS.backgroundImageOpacity;
  return String(Math.max(0, Math.min(100, percent)) / 100);
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.get,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });

  const loadedFontsRef = useRef<string>('');

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement.style;
    root.setProperty('--brand-navy', settings.colors.navy);
    root.setProperty('--brand-navy-2', settings.colors.navy2);
    root.setProperty('--brand-red', settings.colors.red);
    root.setProperty('--brand-red-2', settings.colors.red2);
    root.setProperty('--brand-yellow', settings.colors.yellow);
    root.setProperty('--brand-gray', settings.colors.gray);
    root.setProperty('--brand-white', settings.colors.white);

    // Load Google Fonts dynamically if different from defaults
    const bannerFamilyRaw = settings.banner?.fontFamily ?? DEFAULT_SETTINGS.banner.fontFamily;
    const fontsKey = `${settings.fontBody}|${settings.fontHeading}|${bannerFamilyRaw}`;
    if (fontsKey !== loadedFontsRef.current) {
      loadedFontsRef.current = fontsKey;
      const bodyFamily = resolveFontFamily(settings.fontBody);
      const headingFamily = resolveFontFamily(settings.fontHeading);
      const bannerFamily = resolveFontFamily(bannerFamilyRaw);
      const defaultBodyFamily = resolveFontFamily(DEFAULT_SETTINGS.fontBody);
      const defaultHeadingFamily = resolveFontFamily(DEFAULT_SETTINGS.fontHeading);
      const defaultBannerFamily = resolveFontFamily(DEFAULT_SETTINGS.banner.fontFamily);
      const families: string[] = [];

      if (bodyFamily !== defaultBodyFamily) families.push(bodyFamily.replace(/ /g, '+'));
      if (headingFamily !== defaultHeadingFamily && headingFamily !== bodyFamily) {
        families.push(headingFamily.replace(/ /g, '+'));
      }
      if (bannerFamily !== defaultBannerFamily && bannerFamily !== bodyFamily && bannerFamily !== headingFamily) {
        families.push(bannerFamily.replace(/ /g, '+'));
      }

      if (families.length > 0) {
        const existingLink = document.getElementById('dynamic-fonts');
        if (existingLink) existingLink.remove();

        const link = document.createElement('link');
        link.id = 'dynamic-fonts';
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}:wght@400;500;600;700;800`).join('&')}&display=swap`;
        document.head.appendChild(link);
      }

      document.documentElement.style.setProperty('--font-body', `'${bodyFamily}', sans-serif`);
      document.documentElement.style.setProperty('--font-heading', `'${headingFamily}', sans-serif`);
      document.documentElement.style.setProperty('--font-banner', `'${bannerFamily}', sans-serif`);
    }

    // Apply background image
    const bgOverlay = document.getElementById('theme-bg-overlay');
    const overlayOpacity = toOverlayOpacity(settings.backgroundImageOpacity);
    if (settings.backgroundImageUrl) {
      if (bgOverlay) {
        bgOverlay.style.backgroundImage = `url("${settings.backgroundImageUrl}")`;
        bgOverlay.style.opacity = overlayOpacity;
        bgOverlay.style.display = '';
      } else {
        const div = document.createElement('div');
        div.id = 'theme-bg-overlay';
        div.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;';
        div.style.opacity = overlayOpacity;
        div.style.backgroundImage = `url("${settings.backgroundImageUrl}")`;
        document.body.appendChild(div);
      }
    } else if (bgOverlay) {
      bgOverlay.style.display = 'none';
    }
  }, [settings]);

  return (
    <ThemeContext.Provider value={settings ?? DEFAULT_SETTINGS}>
      {children}
    </ThemeContext.Provider>
  );
}

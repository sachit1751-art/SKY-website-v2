import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePerformanceTier } from '../context/PerformanceContext';

interface LargeGeometricShape {
  id: number;
  type: 'swoosh-arc' | 'giant-loop' | 'thick-ring' | 'curved-band' | 'organic-blob';
  width: string; // e.g., '500px'
  height: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  colorLight: string; // Google brand colors
  colorDark: string;
  opacityLight: number;
  opacityDark: number;
  duration: number; // slow rotation duration
  direction: 'normal' | 'reverse';
  transformOrigin: string;
  parallaxFactor: number;
}

// Static shape definitions outside component to prevent recreation
const shapes: LargeGeometricShape[] = [
  {
    id: 1,
    type: 'swoosh-arc',
    width: '550px',
    height: '550px',
    top: '-8%',
    left: '-12%',
    colorLight: '#EA4335', // Soft Pixel Red
    colorDark: '#EA4335',
    opacityLight: 0.18,
    opacityDark: 0.12,
    duration: 55,
    direction: 'normal',
    transformOrigin: '48% 52%',
    parallaxFactor: 0.03,
  },
  {
    id: 2,
    type: 'thick-ring',
    width: '450px',
    height: '450px',
    top: '12%',
    right: '-10%',
    colorLight: '#4285F4', // Soft Pixel Blue
    colorDark: '#4285F4',
    opacityLight: 0.15,
    opacityDark: 0.11,
    duration: 65,
    direction: 'reverse',
    transformOrigin: '50% 50%',
    parallaxFactor: 0.04,
  },
  {
    id: 3,
    type: 'curved-band',
    width: '600px',
    height: '400px',
    bottom: '22%',
    left: '-15%',
    colorLight: '#FBBC05', // Soft Pixel Yellow
    colorDark: '#FBBC05',
    opacityLight: 0.20,
    opacityDark: 0.14,
    duration: 75,
    direction: 'normal',
    transformOrigin: '40% 60%',
    parallaxFactor: 0.02,
  },
  {
    id: 4,
    type: 'giant-loop',
    width: '500px',
    height: '500px',
    bottom: '-10%',
    right: '-12%',
    colorLight: '#34A853', // Soft Pixel Green
    colorDark: '#34A853',
    opacityLight: 0.16,
    opacityDark: 0.11,
    duration: 48,
    direction: 'reverse',
    transformOrigin: '55% 45%',
    parallaxFactor: 0.05,
  },
];

export const GeometricBackground: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { tier, prefersReducedMotion } = usePerformanceTier();
  const isVeryLowEnd = tier === 'low';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const disableAnimations = prefersReducedMotion || isVeryLowEnd || !isInView;

  // Reduce shape count for low end
  const activeShapes = isVeryLowEnd ? shapes.slice(0, 2) : shapes;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 transform-gpu" style={{ contain: 'paint layout' }}>
      <style>{`
        @keyframes pixel-slow-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pixel-slow-rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-pixel-rotate {
          animation: pixel-slow-rotate linear infinite;
          will-change: transform;
        }
        .animate-pixel-rotate-reverse {
          animation: pixel-slow-rotate-reverse linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pixel-rotate, .animate-pixel-rotate-reverse {
            animation: none !important;
          }
        }
      `}</style>

      {activeShapes.map((shape) => {
        const isDark = theme === 'dark';
        const color = isDark ? shape.colorDark : shape.colorLight;
        const opacity = isDark ? shape.opacityDark : shape.opacityLight;

        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          width: shape.width,
          height: shape.height,
          top: shape.top,
          bottom: shape.bottom,
          left: shape.left,
          right: shape.right,
          opacity: opacity,
          filter: 'none',
          willChange: 'transform',
        };

        const rotationClass = disableAnimations
          ? ''
          : shape.direction === 'normal'
          ? 'animate-pixel-rotate'
          : 'animate-pixel-rotate-reverse';

        const rotationStyle: React.CSSProperties = disableAnimations
          ? {}
          : {
              animationDuration: `${shape.duration}s`,
              transformOrigin: shape.transformOrigin,
            };

        return (
          <div
            key={shape.id}
            className="pointer-events-none transform-gpu"
            style={baseStyle}
          >
            <div
              className={`w-full h-full ${rotationClass}`}
              style={rotationStyle}
            >
              {shape.type === 'swoosh-arc' && (
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ color }}
                >
                  <path
                    d="M 20 180 C 40 100, 100 40, 180 20"
                    stroke="currentColor"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 40 150 A 100 100 0 0 1 150 40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="4 20"
                    className="opacity-60"
                  />
                </svg>
              )}

              {shape.type === 'thick-ring' && (
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ color }}
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="opacity-30"
                  />
                  <path
                    d="M 40 100 A 60 60 0 0 1 160 100"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {shape.type === 'curved-band' && (
                <svg
                  viewBox="0 0 300 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ color }}
                >
                  <path
                    d="M 15 150 Q 150 20 285 150"
                    stroke="currentColor"
                    strokeWidth="28"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 45 130 Q 150 40 255 130"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="12 12"
                    className="opacity-50"
                  />
                </svg>
              )}

              {shape.type === 'giant-loop' && (
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ color }}
                >
                  <path
                    d="M 30 100 A 70 70 0 1 0 170 100 A 70 70 0 1 0 30 100"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="200 40"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-40"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

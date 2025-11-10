import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        background: {
          color: {
            value: "#000000ff", // change to dark for dark mode
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "bubble", 
            },
            resize: true,
          },
          modes: {
            bubble: {
              distance: 100,
              size: 5,
              duration: 2,
              opacity: 0.8,
            },
          },
        },
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              area: 600,
            },
          },
          color: {
            value: "#ffffffff",
          },
          shape: {
            type: "circle", // round bubbles
          },
          opacity: {
            value: 0.3,
            anim: {
              enable: true,
              speed: .5,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: { min: 4, max: 8 },
            anim: {
              enable: true,
              speed: 3,
              size_min: 2,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            outModes: {
              default: "out",
            },
          },
          links: {
            enable: false, 
          },
        },
        detectRetina: true,
      }}
    />
  );
}

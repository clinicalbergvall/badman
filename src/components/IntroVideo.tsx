import React, { useRef, useEffect, useState } from 'react';

interface IntroVideoProps {
  onComplete: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Attempt to play automatically
      videoElement.play().catch((error) => {
        console.warn("Autoplay prevented:", error);
        videoElement.muted = true;
        videoElement.play().catch(e => console.error("Muted autoplay also failed", e));
      });

      const handleEnded = () => {
        setIsFading(true);
        // Wait for fade animation to finish before calling onComplete
        setTimeout(() => {
          onComplete();
        }, 1000); // Match transition duration
      };

      videoElement.addEventListener('ended', handleEnded);

      return () => {
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      {failed ? (
        <img
          src="/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg"
          alt="Intro"
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src="/assets/images/VIDEOHERO.mp4"
          poster="/assets/cleaning/pexels-tima-miroshnichenko-6195956.jpg"
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

export default IntroVideo;

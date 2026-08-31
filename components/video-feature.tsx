'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';

const VIDEO_ID = 'XpT_BVoM-o0';
const VIDEO_TITLE = 'Inauguration highlights | Cattle Valley';

export function VideoFeature() {
  const [playing, setPlaying] = useState(false);
  return <section className="section video-feature"><div className="shell">
    <span className="eyebrow">Inauguration film</span>
    <h2 className="display section-title">See Cattle Valley in motion.</h2>
    <p className="lede">Highlights from the grand inauguration — a walk through the habitat, the hubs, and the people building it.</p>
    <div className="video-frame">
      {playing
        ? <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title={VIDEO_TITLE}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        : <button type="button" className="video-play" onClick={() => setPlaying(true)} aria-label="Play the Cattle Valley inauguration film">
            <img src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`} alt="" loading="lazy" />
            <span className="video-play-btn"><Play size={30} fill="currentColor" /></span>
          </button>}
    </div>
  </div></section>;
}

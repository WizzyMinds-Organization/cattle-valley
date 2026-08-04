import { Footer, PageHero } from '@/components/site-chrome';
import { CareersBrowser } from '@/components/careers-browser';

export default function Careers() {
  return <><PageHero eyebrow="Join us" title="Careers at Graze Valley." copy="Open roles across our hubs and teams. Filter by department to find what fits." /><main className="content"><div className="shell"><CareersBrowser /></div></main><Footer /></>;
}

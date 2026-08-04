import { Footer, PageHero } from '@/components/site-chrome';
import { InvestorGalleryBrowser } from '@/components/investor-gallery-browser';

export default function InvestorGallery() {
  return <><PageHero eyebrow="For investors" title="Investor gallery." copy="Inspection and monthly progress photos from each hub, organised by category and date." /><main className="content"><div className="shell"><InvestorGalleryBrowser /></div></main><Footer /></>;
}

import ImpactContribution from "./(public)/impactContribution";
import Header from "./(public)/header";
import TrackYourImpact from "./(public)/trackImpact";
import DonateCta from "./(public)/donateCta";
import HowItWorks from "./(public)/howItWorks";
import FeaturedDelivery from "./(public)/featuredDelivery";
import { StickyDonate } from "@/components/ui/stickyDonate";
import Footer from "./(public)/footer";

export default function Home() {

  return (
    <>
      <Header />
      <HowItWorks />
      <FeaturedDelivery />
      <ImpactContribution />
      <DonateCta />
      <TrackYourImpact />
      <StickyDonate />
      <Footer />
    </>
  );
}

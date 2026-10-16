import ImpactContribution from "./(public)/impactContribution";
import Header from "./(public)/header";
import TrackYourImpact from "./(public)/trackImpact";
import DonateCta from "./(public)/donateCta";
import { StickyDonate } from "@/components/ui/stickyDonate";
import Footer from "./(public)/footer";

export default function Home() {

  return (
    <>
      <Header />
      <ImpactContribution />
      <DonateCta />
      <TrackYourImpact />
      <StickyDonate />
      <Footer />
    </>
  );
}

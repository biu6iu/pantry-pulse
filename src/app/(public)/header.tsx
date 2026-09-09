import {StatsBanner, ImageBanner} from '../../components/ui/ui';
import {IMAGES} from '../../components/statsData';


export default function Header() {
  return (
    <>

      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold">Medical Pantry</span>


        <nav className="flex gap-6">
          <a href="/impact">Impact</a>
          <a href="/redistribution">Redistribution</a>
        </nav>
      </header>


      <StatsBanner />
      <ImageBanner
        src={IMAGES.heroSecondary}
        alt="Medical Pantry hero banner"
        overlay={[
          { text: 'CO2 emissions globally produced', top: '40%', left: '10%', fontSize: '2rem' },
          { text: 'by the healthcare sector', top: '52%', left: '10%', fontSize: '1.25rem' },
        ]}
        height="400px"
      />

    </>
  );
}

export function imageStats(){

}
import {StatsBanner, ImageBanner} from '../../components/ui/ui';
import {IMAGES} from '../../components/statsData';
import { constants } from 'node:fs';


export default function Header() {
  return (
    <>

      <header className="flex items-center justify-between px-6 py-4 bg-brand-blue t">
        <span className="text-xl font-bold text-white">Medical Pantry</span>

        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-white">
            <a href="/impact">Impact </a>
            <a href="/redistribution">Redistribution</a>
          </nav>
          <nav className="flex gap-6 text-white font-bold bg-brand-red p-3">
            <a href="/donate">DONATE</a>
          </nav>
        </div>
      </header>


      <StatsBanner />
      
      <ImageBanner
        src={IMAGES.mocBanner}
        alt="Medical Pantry hero banner"
        overlay={[
          {
            top: '45%',
            left: '50%',
            fontSize: '1.25rem',
            text: (
              <>
                <span style={{ fontSize: '4em', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  36%
                </span>
                of CO<sub>2</sub> emissions reduced globally
              </>
            ),
          },
        ]}
        height = "400px"
      />

    </>
  );
}

export function imageStats(){

}
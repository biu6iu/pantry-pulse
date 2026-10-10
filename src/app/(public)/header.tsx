import {StatsBanner, ImageBanner} from '../../components/ui/ui';
import {IMAGES, STATS} from '../../components/statsData';
import { getImpactReport } from '@/lib/api/server';
import { formatWeight } from '@/lib/format';

export default async function Header() {
  const report = await getImpactReport();
  const overall = report?.overall;

  const co2e = overall ? formatWeight(overall.totalCO2eAvoidedKg) : null;
  const waste = overall ? formatWeight(overall.totalWeightDivertedKg) : null;

  // real figures first, then the static stats
  const stats = [
    ...(waste ? [`PREVENTED ${waste.value} ${waste.unit.toUpperCase()} OF WASTE`] : []),
    ...(co2e ? [`AVOIDED ${co2e.value} ${co2e.unit.toUpperCase()} OF CO2e EMISSIONS`] : []),
    ...STATS,
  ];

  return (
    <>

      <header className="flex items-center justify-between px-6 py-4 bg-brand-blue t">

        {/** the left section of the banner */}
        <div className="flex items-center gap-3">
          <div className="logo-container">
            {/* Render the image using the imported variable */}
            <img
              src={IMAGES.logo} alt="Company Logo" className="header-logo"
              style = {{height: '40px'}}
            />
          </div>
        
          <span className="text-xl font-bold text-white">Medical Pantry - Pantry Pulse</span>
        </div>

        {/** page navigation section */}
        <nav className="flex items-center gap-8 text-white">
          <a href="https://medicalpantry.org/" className="font-medium hover:underline">
            Main Site
          </a>
          {/* pill with a lighter rim and lip underneath, like the button on medicalpantry.org */}
          <a
            href="https://www.givenow.com.au/medicalpantry"
            className="rounded-full border border-[#f08a8d] bg-brand-red px-5 py-1.5 font-bold shadow-[0_4px_0_#e8676b] hover:brightness-110"
          >
            Donate
          </a>
        </nav>
      </header>


      <StatsBanner stats={stats} />

      <ImageBanner
        src={IMAGES.mocBanner}
        alt="Medical Pantry hero banner"
        overlay={co2e ? [
          {
            top: '20%',
            left: '50%',
            fontSize: '1.25rem',
            text: (
              <>
                <span style={{ fontSize: '7em', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  {co2e.value}
                  <span style={{ fontSize: '0.4em' }}> {co2e.unit}</span>
                </span>
                of CO<sub>2</sub>e emissions avoided through delivered donations
              </>
            ),
          },
        ] : []

      }
        height = "300px"
      />

    </>
  );
}

export function imageStats(){

}
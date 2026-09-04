import {StatsBanner} from '../../components/ui/ui';


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

    </>
  );
}
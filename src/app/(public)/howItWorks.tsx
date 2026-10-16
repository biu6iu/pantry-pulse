// how it works: the three steps from surplus to delivery, between the hero and the featured delivery

const STEPS = [
  {
    title: 'Surplus is saved',
    text: 'Unused medical supplies that would otherwise be thrown away are donated to Medical Pantry.',
  },
  {
    title: 'Volunteers sort and pack',
    text: 'Our volunteers check, sort and pack every item. There are no paid staff.',
  },
  {
    title: 'Delivered where it is needed',
    text: 'Wildlife rescues, vet clinics and health services order what they need, and we get it to them.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white px-6 py-16 font-sans text-brand-blue">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
          How it works
        </h2>

        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-2xl font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-lg leading-relaxed text-brand-blue/85">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

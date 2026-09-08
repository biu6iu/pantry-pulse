/* header components */

/* impact and contribution components*/

const DUMMY_VAL = 1024
const STATS = [
    { value: DUMMY_VAL, label: "locations have received your donations" },
    { value: DUMMY_VAL, label: "organisations are donating" },
    { value: DUMMY_VAL, label: "items have been saved from landfill" },
    { value: DUMMY_VAL, label: "locations have received your donations" },
];

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
            <path d="M12 21s-6.7-4.35-9.33-8.22C.8 9.7 2.05 6 5.2 6c1.74 0 3.01 1.05 3.8 2.4C9.79 7.05 11.06 6 12.8 6c3.15 0 4.4 3.7 2.53 6.78C18.7 16.65 12 21 12 21z" />
        </svg>
    );
}

export function ImpactSection() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="mb-10 text-4xl font-bold uppercase tracking-tight text-black md:text-5xl">
                Our Impact
            </h2>

        <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6 text-base leading-7 text-black md:text-lg">
                <p>
                    Placeholder text
                </p>
                <p>
                    Placeholder thank you text
                </p>
            </div>
            <img
            src="/impact.jpg"
            alt="Volunteers packing donated medical supplies"
            className="h-64 w-full rounded-3xl object-cover md:h-80"
            />
            </div>
        </section>
    );
}
export function ContributionSection() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="mb-10 text-4xl font-bold uppercase tracking-tight text-[#1b365d] md:text-5xl">
                Your Contribution Means...
            </h2>
        <div className="grid items-center gap-10 md:grid-cols-2">
            <img
            src="/contribution.jpg"
            alt="Volunteer with rescue cats"
            className="h-64 w-full rounded-3xl object-cover md:h-80"
            />

            <ul className="relative space-y-10 pl-2">
                <span
                    className="absolute bottom-4 left-[15px] top-4 w-px bg-[#e31c3d]"
                    aria-hidden="true"
                />
                {STATS.map((stat) => (
                    <li key={stat.label} className="relative flex items-start gap-5">
                        <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e31c3d]">
                            <HeartIcon />
                        </span>
                        <div>
                            <p className="text-4xl font-bold leading-none text-[#1b365d] md:text-5xl">
                                {stat.value}
                            </p>
                            <p className="mt-2 text-sm text-black md:text-base">{stat.label}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        </section>
        );
    }

/* redistribution components*/
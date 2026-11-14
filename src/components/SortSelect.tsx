'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  value: string;
  options: { value: string; label: string }[];
};

export function SortSelect({ value, options }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <select
      className="h-10 rounded-full border border-black/10 bg-white px-4 text-sm text-ink/80 outline-none focus:border-brass"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        if (e.target.value === 'new') next.delete('sort');
        else next.set('sort', e.target.value);
        next.delete('page');
        const qs = next.toString();
        router.push(qs ? `/catalog?${qs}` : '/catalog');
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

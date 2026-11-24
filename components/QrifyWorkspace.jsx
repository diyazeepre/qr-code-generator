'use client';

import { useState } from 'react';
import QrWorkbench from './QrWorkbench';
import { ArrowUpRight } from 'lucide-react';

const FORMAT_TEMPLATES = [
  {
    id: 'website',
    title: 'Website URLs',
    description:
      'Direct visitors to landing pages, restaurant menus, portfolios, or documentation with or without an https:// prefix.',
    example: 'https://developer.mozilla.org',
  },
  {
    id: 'text',
    title: 'Plain Text & Notes',
    description:
      'Encode serial numbers, locker combinations, event instructions, or short announcements that scan offline.',
    example: 'Conference Wi-Fi check-in desk opens at 08:30 AM in Hall B.',
  },
  {
    id: 'email',
    title: 'Pre-filled Email Links',
    description:
      'Launch a visitor’s default mail app with the recipient address and subject line already populated.',
    example: 'mailto:support@qrify.app?subject=Product%20Feedback',
  },
  {
    id: 'wifi',
    title: 'Guest Wi-Fi Access',
    description:
      'Share network credentials cleanly so guests join without typing long passwords manually.',
    example: 'WIFI:T:WPA;S:StudioGuest;P:Welcome2026;;',
  },
];

export default function QrifyWorkspace() {
  const [selectedSample, setSelectedSample] = useState(null);

  const handleLoadTemplate = (value) => {
    setSelectedSample({ value, id: Date.now() });
    const section = document.getElementById('generator');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <section id="generator" className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl [text-wrap:balance]">
            Instant QR codes for links and text.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#475569]">
            Enter any website URL or plain text to preview a crisp QR code immediately and download it as a high-resolution PNG.
          </p>
        </div>

        <QrWorkbench
          externalSample={selectedSample}
          onConsumeSample={() => setSelectedSample(null)}
        />
      </section>

      <section
        id="formats"
        className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
              Built for everyday links and structured payloads
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Load any example below into the generator to test instant encoding and PNG export.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#E2E8F0] sm:grid-cols-2 lg:grid-cols-4">
            {FORMAT_TEMPLATES.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between bg-[#FFFFFF] p-6"
              >
                <div>
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                  <p className="truncate font-mono-tabular text-xs text-[#64748B]">
                    {item.example}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate(item.example)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    <span>Load example</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

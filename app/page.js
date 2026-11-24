import HeaderNav from '@/components/HeaderNav';
import QrifyWorkspace from '@/components/QrifyWorkspace';

const STEPS = [
  {
    number: '01.',
    title: 'Enter a URL or text',
    body: 'Paste any web address, email link, or plain text message. Full https:// URLs and bare domain names both encode reliably.',
  },
  {
    number: '02.',
    title: 'Preview & refine output',
    body: 'Your QR code updates immediately on screen. Adjust color contrast, error correction level, or PNG resolution if needed.',
  },
  {
    number: '03.',
    title: 'Download crisp PNG',
    body: 'Export a print-ready PNG up to 2048 × 2048 px, copy the image to your clipboard, or download a vector SVG.',
  },
];

const FAQS = [
  {
    question: 'Do website URLs need https:// to generate a QR code?',
    answer:
      'No. QRify generates a scannable QR code for both full URLs (https://example.com) and bare domains (example.com). Adding https:// is recommended when you want mobile cameras to open the link directly in a browser.',
  },
  {
    question: 'Are my URLs or text sent to an external server?',
    answer:
      'No. Every QR code is encoded and rendered directly inside your browser using client-side JavaScript, with no external database or backend API calls.',
  },
  {
    question: 'Which PNG resolution should I pick?',
    answer:
      '512 px works well for web pages and slide decks. Choose 1024 px for flyers and menus, or 2048 px for large posters and print signage.',
  },
  {
    question: 'What does Error Correction Level do?',
    answer:
      'Higher levels (Q or H) embed extra redundant data so the QR code stays scannable even if the printed label is slightly smudged or creased.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <HeaderNav />

      <main className="flex-1">
        <QrifyWorkspace />

        <section
          id="how-it-works"
          className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
                From link to print-ready PNG in seconds
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="border-t border-[#CBD5E1] pt-5"
                >
                  <p className="font-mono-tabular text-sm font-medium text-[#1D4ED8]">
                    {step.number}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#0F172A]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
                Frequently asked questions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
              {FAQS.map((faq) => (
                <div
                  key={faq.question}
                  className="border-b border-[#E2E8F0] pb-6"
                >
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-xs text-[#64748B] sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-bold text-[#0F172A]">QRify</span>
            <span aria-hidden="true">·</span>
            <span>Client-side QR code generator</span>
          </div>
          <p>All QR codes are generated locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}

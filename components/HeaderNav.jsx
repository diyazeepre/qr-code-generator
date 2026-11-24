'use client';

export default function HeaderNav() {
  const handleFocusGenerator = () => {
    const section = document.getElementById('generator');
    const input = document.getElementById('qr-input');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (input) {
      window.setTimeout(() => {
        input.focus();
      }, 150);
    }
  };

  return (
    <header className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#generator"
          className="font-display text-xl font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm"
        >
          QRify
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]"
        >
          <a
            href="#generator"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 decoration-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
          >
            Generator
          </a>
          <a
            href="#formats"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 decoration-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
          >
            Formats
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 decoration-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 decoration-[#CBD5E1] transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={handleFocusGenerator}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Create QR Code
          </button>
        </div>
      </div>
    </header>
  );
}

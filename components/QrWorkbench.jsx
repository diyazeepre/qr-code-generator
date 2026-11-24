'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  QrCode,
  RotateCcw,
} from 'lucide-react';

const COLOR_PRESETS = [
  { id: 'classic', label: 'Classic Ink', fg: '#0F172A', bg: '#FFFFFF' },
  { id: 'cobalt', label: 'Cobalt', fg: '#1E3A8A', bg: '#FFFFFF' },
  { id: 'forest', label: 'Forest', fg: '#14532D', bg: '#FFFFFF' },
  { id: 'slate', label: 'Slate', fg: '#1E293B', bg: '#F8FAFC' },
];

const ERROR_LEVELS = [
  { value: 'L', label: 'L · 7%' },
  { value: 'M', label: 'M · 15%' },
  { value: 'Q', label: 'Q · 25%' },
  { value: 'H', label: 'H · 30%' },
];

const EXPORT_SIZES = [
  { value: 512, label: '512 px' },
  { value: 1024, label: '1024 px' },
  { value: 2048, label: '2048 px' },
];

const QUICK_SAMPLES = [
  { id: 'url', label: 'Website URL', value: 'https://qrify.app/menu' },
  { id: 'text', label: 'Plain Text', value: 'Welcome to the Design Review — Room 4B at 2:30 PM' },
  { id: 'email', label: 'Email', value: 'mailto:hello@example.com?subject=QRify%20Inquiry' },
  { id: 'phone', label: 'Phone', value: 'tel:+14155550199' },
];

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance({ r, g, b }) {
  const toLinear = (c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(fgHex, bgHex) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return 21;
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function detectPayloadInfo(rawValue) {
  const value = rawValue.trim();
  if (!value) {
    return { kind: 'Empty', needsProtocolHint: false };
  }
  if (/^https?:\/\//i.test(value)) {
    return { kind: 'Website URL', needsProtocolHint: false };
  }
  if (/^mailto:/i.test(value)) {
    return { kind: 'Email Link', needsProtocolHint: false };
  }
  if (/^tel:/i.test(value)) {
    return { kind: 'Phone Link', needsProtocolHint: false };
  }
  if (/^WIFI:/i.test(value)) {
    return { kind: 'Wi-Fi Network', needsProtocolHint: false };
  }
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]{2,})+(\/[^\s]*)?$/i.test(value)) {
    return { kind: 'Website URL', needsProtocolHint: true };
  }
  return { kind: 'Plain Text', needsProtocolHint: false };
}

function buildDownloadFilename(rawValue, ext) {
  const trimmed = rawValue.trim();
  if (!trimmed) return `qrify-code.${ext}`;

  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    if (/^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(trimmed)) {
      const parsed = new URL(candidate);
      const slug = parsed.hostname.replace(/^www\./, '').replace(/[^a-z0-9-]+/gi, '-');
      if (slug) return `qrify-${slug}.${ext}`;
    }
  } catch {
    // Fall back to sanitized text slug
  }

  const textSlug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);

  return `qrify-${textSlug || 'code'}.${ext}`;
}

export default function QrWorkbench({ externalSample, onConsumeSample }) {
  const [inputValue, setInputValue] = useState('');
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState('M');
  const [exportSize, setExportSize] = useState(1024);

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const showTransientFeedback = (message) => {
    setFeedbackMessage(message);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackMessage('');
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (externalSample && typeof externalSample.value === 'string') {
      setInputValue(externalSample.value);
      setValidationError('');
      setGenerationError('');
      if (onConsumeSample) {
        onConsumeSample();
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [externalSample, onConsumeSample]);

  useEffect(() => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setQrDataUrl('');
      setQrSvg('');
      setGenerationError('');
      return;
    }

    let cancelled = false;

    const generateQr = async () => {
      try {
        const options = {
          width: exportSize,
          margin: 3,
          errorCorrectionLevel: errorLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        };

        const [dataUrl, svgString] = await Promise.all([
          QRCode.toDataURL(trimmed, options),
          QRCode.toString(trimmed, {
            type: 'svg',
            margin: 3,
            errorCorrectionLevel: errorLevel,
            color: {
              dark: fgColor,
              light: bgColor,
            },
          }),
        ]);

        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setQrSvg(svgString);
          setGenerationError('');
        }
      } catch (err) {
        if (!cancelled) {
          setQrDataUrl('');
          setQrSvg('');
          setGenerationError(
            err instanceof Error && err.message
              ? `Could not encode QR code: ${err.message}`
              : 'Text exceeds maximum QR code capacity. Try shortening your input or lowering error correction.'
          );
        }
      }
    };

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [inputValue, fgColor, bgColor, errorLevel, exportSize]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    if (nextValue.trim().length > 0 && validationError) {
      setValidationError('');
    }
  };

  const handleGenerateSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setValidationError('Please enter text or a website URL to generate a QR code.');
      setQrDataUrl('');
      setQrSvg('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    setValidationError('');

    try {
      const options = {
        width: exportSize,
        margin: 3,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      };

      const [dataUrl, svgString] = await Promise.all([
        QRCode.toDataURL(trimmed, options),
        QRCode.toString(trimmed, {
          type: 'svg',
          margin: 3,
          errorCorrectionLevel: errorLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        }),
      ]);

      setQrDataUrl(dataUrl);
      setQrSvg(svgString);
      setGenerationError('');
      showTransientFeedback('QR code generated');

      if (window.innerWidth < 1024 && previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      setGenerationError(
        err instanceof Error && err.message
          ? `Could not encode QR code: ${err.message}`
          : 'Could not generate QR code for this input.'
      );
    }
  };

  const handleClear = () => {
    setInputValue('');
    setQrDataUrl('');
    setQrSvg('');
    setValidationError('');
    setGenerationError('');
    setFeedbackMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePrependHttps = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setInputValue(`https://${trimmed}`);
      setValidationError('');
    }
  };

  const handleDownloadPng = () => {
    if (!inputValue.trim()) {
      setValidationError('Enter text or a website URL before downloading a PNG.');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = buildDownloadFilename(inputValue, 'png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTransientFeedback('PNG downloaded');
  };

  const handleDownloadSvg = () => {
    if (!inputValue.trim()) {
      setValidationError('Enter text or a website URL before downloading an SVG.');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }
    if (!qrSvg) return;

    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildDownloadFilename(inputValue, 'svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showTransientFeedback('SVG downloaded');
  };

  const handleCopyPng = async () => {
    if (!inputValue.trim()) {
      setValidationError('Enter text or a website URL before copying the QR image.');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showTransientFeedback('PNG copied to clipboard');
      } else {
        showTransientFeedback('Clipboard image copy unsupported in this browser');
      }
    } catch {
      showTransientFeedback('Could not copy image — use Download PNG');
    }
  };

  const trimmedValue = inputValue.trim();
  const payloadInfo = detectPayloadInfo(trimmedValue);
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const isLowContrast = contrastRatio < 3.0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
      {/* Left Column: Input & Customization Workbench */}
      <form
        onSubmit={handleGenerateSubmit}
        noValidate
        className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8 lg:col-span-7"
      >
        <div className="space-y-6">
          {/* Input Header & Textarea */}
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <label
                htmlFor="qr-input"
                className="font-display text-sm font-semibold text-[#0F172A]"
              >
                Text or Website URL
              </label>
              <span className="font-mono-tabular text-xs text-[#64748B]">
                {trimmedValue.length} chars
              </span>
            </div>

            <textarea
              ref={inputRef}
              id="qr-input"
              name="qrInput"
              rows={4}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleGenerateSubmit(e);
                }
              }}
              aria-invalid={Boolean(validationError || generationError)}
              aria-describedby={
                validationError
                  ? 'qr-input-error'
                  : generationError
                    ? 'qr-generation-error'
                    : 'qr-input-help'
              }
              placeholder="https://example.com or any text message..."
              className={`w-full resize-y rounded-lg border bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 ${
                validationError || generationError
                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                  : 'border-[#CBD5E1] focus:border-[#1D4ED8] focus:ring-[#1D4ED8]/20'
              }`}
            />

            {/* Validation Error / Helper Row */}
            {validationError ? (
              <p
                id="qr-input-error"
                role="alert"
                className="mt-2 flex items-center gap-2 text-sm font-medium text-[#DC2626]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            ) : generationError ? (
              <p
                id="qr-generation-error"
                role="alert"
                className="mt-2 flex items-center gap-2 text-sm font-medium text-[#DC2626]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{generationError}</span>
              </p>
            ) : (
              <div
                id="qr-input-help"
                className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]"
              >
                <span>QR preview updates automatically as you type or paste.</span>
                {payloadInfo.needsProtocolHint && (
                  <button
                    type="button"
                    onClick={handlePrependHttps}
                    className="font-medium text-[#1D4ED8] hover:text-[#1E40AF] hover:underline underline-offset-2 cursor-pointer whitespace-nowrap"
                  >
                    Add https:// prefix
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              <span>Generate QR Code</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>

          {/* Quick Sample Inputs */}
          <div className="border-t border-[#E2E8F0] pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-[#64748B]">Try sample:</span>
              {QUICK_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setInputValue(sample.value);
                    setValidationError('');
                    setGenerationError('');
                  }}
                  className="inline-flex min-h-[34px] items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* QR Styling & Technical Settings (Separated by hairline dividers, zero nested cards) */}
          <div className="border-t border-[#E2E8F0] pt-5 space-y-5">
            {/* Color Palette & Pickers */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-semibold text-[#0F172A]">Color Palette</span>
                <span className="font-mono-tabular text-xs text-[#64748B]">
                  {fgColor.toUpperCase()} / {bgColor.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {COLOR_PRESETS.map((preset) => {
                  const isActive =
                    fgColor.toLowerCase() === preset.fg.toLowerCase() &&
                    bgColor.toLowerCase() === preset.bg.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFgColor(preset.fg);
                        setBgColor(preset.bg);
                      }}
                      aria-pressed={isActive}
                      className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A]'
                          : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-sm border border-[#CBD5E1]"
                        style={{ backgroundColor: preset.fg }}
                        aria-hidden="true"
                      />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}

                <div className="flex items-center gap-2 pl-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#475569] cursor-pointer">
                    <span>Code</span>
                    <input
                      type="color"
                      aria-label="QR foreground color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border border-[#CBD5E1] bg-white p-0.5"
                    />
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#475569] cursor-pointer">
                    <span>Back</span>
                    <input
                      type="color"
                      aria-label="QR background color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border border-[#CBD5E1] bg-white p-0.5"
                    />
                  </label>
                </div>
              </div>

              {isLowContrast && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] px-3 py-2 text-xs text-[#92400E]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Low color contrast ({contrastRatio.toFixed(1)}:1) may prevent reliable scanning.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFgColor('#0F172A');
                      setBgColor('#FFFFFF');
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-[#92400E] underline underline-offset-2 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Reset colors
                  </button>
                </div>
              )}
            </div>

            {/* Error Correction & PNG Export Size */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-xs font-semibold text-[#0F172A]">
                  Error Correction
                </span>
                <div
                  role="group"
                  aria-label="Error correction level"
                  className="grid grid-cols-4 gap-1 rounded-lg bg-[#F1F5F9] p-1"
                >
                  {ERROR_LEVELS.map((level) => {
                    const active = errorLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setErrorLevel(level.value)}
                        aria-pressed={active}
                        className={`min-h-[34px] rounded-md px-2 py-1 font-mono-tabular text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xs font-semibold text-[#0F172A]">
                  PNG Export Size
                </span>
                <div
                  role="group"
                  aria-label="PNG export resolution"
                  className="grid grid-cols-3 gap-1 rounded-lg bg-[#F1F5F9] p-1"
                >
                  {EXPORT_SIZES.map((size) => {
                    const active = exportSize === size.value;
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setExportSize(size.value)}
                        aria-pressed={active}
                        className={`min-h-[34px] rounded-md px-2 py-1 font-mono-tabular text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Right Column: Clean & Attractive QR Code Preview */}
      <section
        ref={previewRef}
        aria-label="QR code preview"
        className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8 lg:col-span-5"
      >
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-sm font-semibold text-[#0F172A]">
              Live Preview
            </h2>
            {feedbackMessage ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {feedbackMessage}
              </span>
            ) : (
              <span className="font-mono-tabular text-xs text-[#64748B]">
                {qrDataUrl ? `${exportSize} × ${exportSize} px` : 'Ready'}
              </span>
            )}
          </div>

          {/* Architectural Dot-Grid Stage */}
          <div className="qr-stage-grid flex min-h-[310px] sm:min-h-[340px] items-center justify-center rounded-xl border border-[#E2E8F0] p-6 sm:p-8">
            {qrDataUrl ? (
              <div
                className="qr-preview-frame qr-image-enter relative rounded-xl p-4 sm:p-5 transition-colors"
                style={{ backgroundColor: bgColor }}
              >
                <img
                  src={qrDataUrl}
                  alt={`Generated QR code for ${trimmedValue}`}
                  width={240}
                  height={240}
                  className="h-[220px] w-[220px] sm:h-[240px] sm:w-[240px] object-contain"
                />
              </div>
            ) : (
              <div className="flex max-w-[240px] flex-col items-center text-center">
                <div
                  aria-hidden="true"
                  className="mb-4 flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#FFFFFF]/90"
                >
                  <QrCode className="h-14 w-14 text-[#94A3B8]" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-[#334155]">
                  No QR code generated yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  Enter a website URL or text message to render a scannable QR code here.
                </p>
              </div>
            )}
          </div>

          {/* Unboxed Metadata Summary */}
          <div className="mt-4 min-h-[40px] border-b border-[#E2E8F0] pb-4">
            {qrDataUrl ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-medium text-[#334155]">{payloadInfo.kind}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{trimmedValue.length} chars</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">ECC {errorLevel}</span>
                </div>
                <p
                  title={trimmedValue}
                  className="truncate font-mono-tabular text-xs text-[#475569]"
                >
                  {trimmedValue}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">
                Supports web links, plain text, email links, and phone numbers.
              </p>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E293B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap cursor-pointer"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download PNG</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyPng}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

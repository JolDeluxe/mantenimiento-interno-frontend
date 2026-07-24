const MAX_CODE_LENGTH = 50;
const CODE_PATTERN = /^[A-Z0-9_-]+$/;
const DEFAULT_PUBLIC_PORTAL_URL = 'https://cuadra-mbc-mantenimiento-publico.netlify.app';

function hasControlCharacters(value) {
  return [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

function normalizeMachineCode(codigo) {
  if (typeof codigo !== 'string') return null;

  const candidate = codigo.trim().toUpperCase();
  if (!candidate || candidate.length > MAX_CODE_LENGTH) return null;
  if (hasControlCharacters(candidate)) return null;
  if (/[\\/]/.test(candidate)) return null;
  if (/\s/.test(candidate)) return null;
  if (!CODE_PATTERN.test(candidate)) return null;

  return candidate;
}

function getPublicPortalBaseUrl() {
  const rawUrl = import.meta.env?.VITE_PUBLIC_PORTAL_URL;
  const candidateUrl = typeof rawUrl === 'string' && rawUrl.trim()
    ? rawUrl.trim()
    : DEFAULT_PUBLIC_PORTAL_URL;

  let parsedUrl;
  try {
    parsedUrl = new URL(candidateUrl);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== 'https:') return null;
  if (parsedUrl.username || parsedUrl.password) return null;
  if (parsedUrl.pathname && parsedUrl.pathname !== '/') return null;
  if (parsedUrl.search || parsedUrl.hash) return null;

  return parsedUrl.origin;
}

export function buildMachineQrPayload(codigo) {
  const machineCode = normalizeMachineCode(codigo);
  if (!machineCode) return null;

  const baseUrl = getPublicPortalBaseUrl();
  if (!baseUrl) return null;

  const url = new URL('/nuevo-reporte', `${baseUrl}/`);
  url.searchParams.set('prefill', machineCode);

  return url.toString();
}

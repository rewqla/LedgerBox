import dns from 'node:dns/promises';
import net from 'node:net';

function isPrivateIpv4(ip: string): boolean {
  const octets = ip.split('.').map(Number);

  if (octets.length !== 4 || octets.some((item) => Number.isNaN(item))) {
    return true;
  }

  const [a, b] = octets;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  );
}

export function assertPublicPhotoImportUrl(rawUrl: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Невалідний URL для імпорту фото.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Дозволені лише http/https URL для імпорту фото.');
  }

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Імпорт із localhost заборонений.');
  }

  return parsed;
}

async function assertHostnameResolvesToPublicIps(hostname: string) {
  const records = await dns.lookup(hostname, { all: true });

  if (records.length === 0) {
    throw new Error('Не вдалося отримати IP-адресу для photo import URL.');
  }

  for (const record of records) {
    if (
      (record.family === 4 && isPrivateIpv4(record.address)) ||
      (record.family === 6 && isPrivateIpv6(record.address))
    ) {
      throw new Error('Приватні та link-local адреси для photo import заборонені.');
    }
  }
}

export async function assertRemotePhotoUrlIsSafe(rawUrl: string): Promise<URL> {
  const parsed = assertPublicPhotoImportUrl(rawUrl);
  const hostname = parsed.hostname;
  const ipVersion = net.isIP(hostname);

  if (ipVersion === 4 && isPrivateIpv4(hostname)) {
    throw new Error('Приватні IPv4-адреси для photo import заборонені.');
  }

  if (ipVersion === 6 && isPrivateIpv6(hostname)) {
    throw new Error('Приватні IPv6-адреси для photo import заборонені.');
  }

  if (ipVersion === 0) {
    await assertHostnameResolvesToPublicIps(hostname);
  }

  return parsed;
}

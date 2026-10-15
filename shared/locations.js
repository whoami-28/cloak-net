/**
 * CloakNet - Preset Locations (VeePN-style)
 * Каталог локаций с регионами, флагами и кодами дата-центров Cloudflare
 */

export const REGIONS = [
  { id: 'all', name: 'Все' },
  { id: 'recommended', name: 'Рекомендуемые' },
  { id: 'europe', name: 'Европа' },
  { id: 'americas', name: 'Америка' },
  { id: 'asia', name: 'Азия' }
];

export const LOCATIONS = [
  {
    id: "auto-cf",
    country: "Auto (Fastest)",
    countryRu: "Авто (Быстрый)",
    city: "Cloudflare Edge",
    countryCode: "cf",
    flag: "icons/icon32.png",
    ping: 25,
    isRecommended: true,
    region: "recommended",
    datacenter: "AUTO",
    type: "cloudflare"
  },
  {
    id: "nl-ams",
    country: "Netherlands",
    countryRu: "Нидерланды",
    city: "Амстердам",
    countryCode: "nl",
    flag: "icons/flags/nl.svg",
    ping: 38,
    isRecommended: true,
    region: "europe",
    datacenter: "AMS",
    type: "cloudflare"
  },
  {
    id: "de-fra",
    country: "Germany",
    countryRu: "Германия",
    city: "Франкфурт",
    countryCode: "de",
    flag: "icons/flags/de.svg",
    ping: 44,
    isRecommended: true,
    region: "europe",
    datacenter: "FRA",
    type: "cloudflare"
  },
  {
    id: "gb-lon",
    country: "United Kingdom",
    countryRu: "Великобритания",
    city: "Лондон",
    countryCode: "gb",
    flag: "icons/flags/gb.svg",
    ping: 52,
    isRecommended: true,
    region: "europe",
    datacenter: "LHR",
    type: "cloudflare"
  },
  {
    id: "fr-par",
    country: "France",
    countryRu: "Франция",
    city: "Париж",
    countryCode: "fr",
    flag: "icons/flags/fr.svg",
    ping: 55,
    isRecommended: false,
    region: "europe",
    datacenter: "CDG",
    type: "cloudflare"
  },
  {
    id: "us-nyc",
    country: "United States",
    countryRu: "США",
    city: "Нью-Йорк",
    countryCode: "us",
    flag: "icons/flags/us.svg",
    ping: 105,
    isRecommended: true,
    region: "americas",
    datacenter: "EWR",
    type: "cloudflare"
  },
  {
    id: "ca-tor",
    country: "Canada",
    countryRu: "Канада",
    city: "Торонто",
    countryCode: "ca",
    flag: "icons/flags/ca.svg",
    ping: 120,
    isRecommended: false,
    region: "americas",
    datacenter: "YYZ",
    type: "cloudflare"
  },
  {
    id: "sg-sin",
    country: "Singapore",
    countryRu: "Сингапур",
    city: "Сингапур",
    countryCode: "sg",
    flag: "icons/flags/sg.svg",
    ping: 175,
    isRecommended: true,
    region: "asia",
    datacenter: "SIN",
    type: "cloudflare"
  },
  {
    id: "jp-tyo",
    country: "Japan",
    countryRu: "Япония",
    city: "Токио",
    countryCode: "jp",
    flag: "icons/flags/jp.svg",
    ping: 215,
    isRecommended: false,
    region: "asia",
    datacenter: "NRT",
    type: "cloudflare"
  }
];

export function getLocationById(id) {
  return LOCATIONS.find(loc => loc.id === id) || LOCATIONS[0];
}

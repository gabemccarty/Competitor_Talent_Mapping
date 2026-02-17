#!/usr/bin/env node
/**
 * Talent Map Generator
 * Reads Gem CSV export, infers tiers/departments, groups by location,
 * outputs single HTML with interactive globe and per-location org charts.
 *
 * Usage: node generate.js [path/to/export.csv] [--company "Company Name"]
 *        If no path, reads from stdin. Default company filter: any (no filter).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveLocation } from './cities.js';
import { inferTier, tierLevelNames } from './tiers.js';
import { inferDepartment, departmentColors } from './departments.js';
import { getHtmlTemplate } from './template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0];
  const sep = header.includes('\t') ? '\t' : ',';
  const cols = parseRow(header, sep);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i], sep);
    const row = {};
    cols.forEach((c, j) => {
      row[c] = cells[j] != null ? String(cells[j]).trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

function parseRow(line, sep) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      cur += ch;
    } else if (ch === sep) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function normalizeColumnName(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function findColumn(row, ...candidates) {
  const keys = Object.keys(row);
  const normalized = {};
  keys.forEach((k) => {
    normalized[normalizeColumnName(k)] = k;
  });
  for (const c of candidates) {
    const n = normalizeColumnName(c);
    if (normalized[n]) return row[normalized[n]];
    if (normalized[c]) return row[normalized[c]];
  }
  return '';
}

function getEmployeeFromRow(row, companyFilter) {
  const company = findColumn(row, 'Company', 'Current Company', 'Employer', 'Organization');
  if (companyFilter && company && !company.toLowerCase().includes(companyFilter.toLowerCase())) {
    return null;
  }
  const first = findColumn(row, 'First Name', 'FirstName', 'First');
  const last = findColumn(row, 'Last Name', 'LastName', 'Last');
  const name = [first, last].filter(Boolean).join(' ') || findColumn(row, 'Name', 'Full Name') || 'Unknown';
  const title = findColumn(row, 'Title', 'Job Title', 'Position', 'Current Title') || '';
  const location = findColumn(row, 'Location', 'Office', 'City', 'Geography') || '';
  const linkedin = findColumn(row, 'LinkedIn', 'LinkedIn URL', 'Profile URL') || '';
  const email = findColumn(row, 'Email', 'Email Address') || '';
  return { name, title, location, linkedin, email, company };
}

function buildLocationKey(resolved) {
  if (!resolved || resolved.label === 'Remote') return resolved ? resolved.label : 'Unknown';
  const [lat, lng] = [resolved.lat.toFixed(2), resolved.lng.toFixed(2)];
  return `${resolved.label}|${lat}|${lng}`;
}

function buildByLocation(employees) {
  const byLocation = new Map();
  for (const emp of employees) {
    const resolved = resolveLocation(emp.location);
    const key = buildLocationKey(resolved || { lat: 0, lng: 0, label: emp.location || 'Unknown' });
    if (!byLocation.has(key)) {
      byLocation.set(key, {
        label: (resolved && resolved.label) || emp.location || 'Unknown',
        lat: (resolved && resolved.lat) ?? 0,
        lng: (resolved && resolved.lng) ?? 0,
        employees: [],
      });
    }
    byLocation.get(key).employees.push(emp);
  }
  return byLocation;
}

function buildDepartmentsForEmployees(employees) {
  const depts = {};
  for (const emp of employees) {
    const dept = inferDepartment(emp.title);
    const tier = inferTier(emp.title);
    if (!depts[dept]) {
      depts[dept] = { total: 0, hierarchy: {} };
    }
    const tierStr = String(tier);
    if (!depts[dept].hierarchy[tierStr]) {
      depts[dept].hierarchy[tierStr] = { level: tierLevelNames[tier], employees: [] };
    }
    depts[dept].hierarchy[tierStr].employees.push({
      name: emp.name,
      title: emp.title,
      location: emp.location,
      linkedin: emp.linkedin,
    });
    depts[dept].total++;
  }
  const tierOrder = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (const dept of Object.keys(depts)) {
    const sorted = {};
    for (const t of tierOrder) {
      if (depts[dept].hierarchy[t]) sorted[t] = depts[dept].hierarchy[t];
    }
    depts[dept].hierarchy = sorted;
  }
  return depts;
}

function main() {
  const args = process.argv.slice(2);
  let csvPath = null;
  let companyFilter = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--company' && args[i + 1]) {
      companyFilter = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      csvPath = args[i];
    }
  }

  let csvText;
  if (csvPath) {
    csvText = fs.readFileSync(path.resolve(process.cwd(), csvPath), 'utf8');
  } else {
    csvText = fs.readFileSync(process.stdin.fd, 'utf8');
  }

  const rows = parseCSV(csvText);
  const employees = [];
  for (const row of rows) {
    const emp = getEmployeeFromRow(row, companyFilter);
    if (emp && emp.name && emp.name !== 'Unknown') employees.push(emp);
  }

  const byLocation = buildByLocation(employees);
  const locations = [];
  for (const [key, data] of byLocation.entries()) {
    const { label, lat, lng, employees: emps } = data;
    const departments = buildDepartmentsForEmployees(emps);
    locations.push({
      key,
      label,
      lat,
      lng,
      count: emps.length,
      departments,
    });
  }

  locations.sort((a, b) => b.count - a.count);

  const companyName = companyFilter || 'Company';
  const html = getHtmlTemplate({
    companyName,
    totalEmployees: employees.length,
    locations,
    tierLevelNames: tierLevelNames,
    departmentColors,
  });

  const outDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Wrote %s (%d employees, %d locations)', outPath, employees.length, locations.length);
}

main();

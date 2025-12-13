/**
 * Version Management
 * Generates version.json at build time
 */

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

const version = process.env.npm_package_version || '1.0.0';
const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildDate = new Date().toISOString();

const versionInfo = {
    version,
    gitHash,
    buildDate,
    environment: process.env.NODE_ENV || 'development',
};

writeFileSync(
    './public/version.json',
    JSON.stringify(versionInfo, null, 2)
);

console.log('✅ Version file generated:', versionInfo);

import puppeteer from 'puppeteer';
import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import dayjs, { ManipulateType } from 'dayjs';
import { timeStamp } from 'console';

const url = 'youtube.com'; // Replace with the desired website
const startDate = '2020-01-01';
const endDate = '2020-02-01';
const interval = 'month';
const outputDir = './snapshots';
const jsonOutputPath = './snapshots_with_js.json';

interface Snapshot {
    timestamp: string;
    url: string;
    htmlPath: string;
    cssVariables: { [key: string]: string };
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
async function fetchAvailableDates(yearFrom: number, yearTo: number): Promise<string[]> {
  const availableDates: string[] = [];

  for (let currentYear = yearFrom; currentYear <= yearTo; currentYear++) {
      const apiUrl = `https://web.archive.org/__wb/calendarcaptures/2?url=${url}&date=${currentYear}&groupby=day`;

      try {
          const response = await axios.get(apiUrl);
          const data = response.data;
          // Extract all dates where snapshots exist
          if (data && data.items) {
              data.items.forEach((day: any) => {
                  if (day[2] > 0) {  // Day has captures
                      const date = dayjs(`${currentYear}${String(day[0]).padStart(2, '0')}`);
                      availableDates.push(date.format('YYYYMMDD'));
                  }
              });
          }

      } catch (error) {
          console.error(`Error fetching available dates for ${currentYear}:`, error);
          continue; // Continue with the next year if there's an error
      }
  }

  return availableDates;
}
// Generate timestamps at regular intervals
function filterDatesByInterval(dates: string[], interval: ManipulateType): string[] {
  const filteredDates: string[] = [];
  let lastDate = dayjs(dates[0], 'YYYYMMDD');

  for (const dateStr of dates) {
    const date = dayjs(dateStr, 'YYYYMMDD');
    if (date.diff(lastDate, interval) >= 1) {
      filteredDates.push(date.format('YYYYMMDD'));
      lastDate = date;
    }
  }

  // Ensure at least one date is added if available
  if (filteredDates.length === 0 && dates.length > 0) {
    filteredDates.push(dayjs(dates[0], 'YYYYMMDD').format('YYYYMMDDHHmmss'));
  }

  return filteredDates;
}
function extractCSSVariablesFromHTML(html: string): { [key: string]: string } {
    const cssVariables: { [key: string]: string } = {};
  
    // Match all CSS variables in <style> tags
    const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;
    let match;
    while ((match = cssVarRegex.exec(html)) !== null) {
      const [_, name, value] = match;
      cssVariables[`--${name.trim()}`] = value.trim();
    }
  
    return cssVariables;
  }

  async function makeArchiveUrl(timestamp: string){
  const response = await axios.get(`https://web.archive.org/__wb/calendarcaptures/2?url=${url}&date=${timestamp}`)
  const data = response.data;
  console.log(data);
}
// Fetch CSS variables using Puppeteer
async function fetchSnapshotWithPuppeteer( timestamp: string): Promise<Snapshot | null> {
    makeArchiveUrl(timestamp)
    return;
    const snapshotUrl = `http://web.archive.org/web/${timestamp}/${url}`;
    const htmlFilePath = path.join(outputDir, `snapshot_${timestamp}.html`);
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox'],
        // executablePath: "C:\Program Files\Google\Chrome\Application"
    });
    try {

        const page = await browser.newPage();
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
        await page.goto(snapshotUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => {
            // Check if the CSS variable is defined in the :root element
            const root = document.documentElement;
            const style = getComputedStyle(root);
            return style.getPropertyValue('--yt-brand-youtube-red').trim() !== '';
          }, { timeout: 50000 });
        const htmlContent = await page.content();
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
        const cssVariables = extractCSSVariablesFromHTML(htmlContent);
        await browser.close();

        return {
            timestamp,
            url: snapshotUrl,
            htmlPath: htmlFilePath,
            cssVariables,
        };
    } catch (error) {
        await browser.close();
        console.error(`Failed to fetch ${snapshotUrl}:`, error.message);
        return null;
    }
}

// Save snapshots as JSON
function saveSnapshotsToJson(snapshots: Snapshot[], outputFilePath: string) {
    const jsonData = JSON.stringify(snapshots, null, 2);
    fs.writeFileSync(outputFilePath, jsonData, 'utf-8');
}

// Main function to run the script
async function main() {
    const availableDates = await fetchAvailableDates(parseInt(startDate.split("-")[0]), parseInt(endDate.split("-")[0]));
    if (availableDates.length === 0) {
      console.log('No snapshots available for the specified year.');
      return;
    }
    
    // Filter dates to get snapshots at the specified interval
    const timestamps = filterDatesByInterval(availableDates, interval);
    
    const snapshots: Snapshot[] = [];

    for (const timestamp of timestamps) {
        const snapshot = await fetchSnapshotWithPuppeteer(timestamp);
        if (snapshot) {
            snapshots.push(snapshot);
            console.log(`Fetched snapshot at ${timestamp} and saved HTML with JS-rendered CSS variables.`);
        } else {
            console.log(`No snapshot available for ${timestamp}`);
        }
    }

    saveSnapshotsToJson(snapshots, jsonOutputPath);
    console.log(`Saved ${snapshots.length} snapshots with CSS variables to ${jsonOutputPath}`);
}

main();

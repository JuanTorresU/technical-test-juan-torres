import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { provideZonelessChangeDetection } from '@angular/core';

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
  
  // We need to provide the zoneless change detection here if the app defaults to zoneless globally
  getTestBed().configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
} catch (e) {
  console.error("FAILED TO INIT TEST ENV:", e);
}

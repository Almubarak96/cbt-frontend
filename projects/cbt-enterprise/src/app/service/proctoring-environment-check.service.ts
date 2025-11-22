// import { Injectable } from '@angular/core';
// import { Observable, from, of } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';

// /**
//  * Environment Check Service
//  * Performs comprehensive system checks to ensure candidate's environment meets exam requirements
//  * 
//  * Phase 1: Basic hardware, software, and permission checks
//  * Phase 2: Network quality testing, advanced diagnostics, and AI-based environment analysis
//  */
// @Injectable({
//     providedIn: 'root'
// })
// export class ProctoringEnvironmentCheckService {

//     constructor() { }

//     /**
//      * Perform comprehensive environment check
//      * Returns observable with check results
//      */
//     performEnvironmentCheck(): Observable<EnvironmentCheckResult> {
//         return from(this.executeComprehensiveCheck());
//     }

//     /**
//      * Execute all environment checks with proper error handling
//      */
//     private async executeComprehensiveCheck(): Promise<EnvironmentCheckResult> {
//         try {
//             // Execute all checks in parallel with proper error handling
//             const checkResults = await Promise.all([
//                 this.checkCamera().catch(error => this.handleCheckError('Camera', error)),
//                 this.checkMicrophone().catch(error => this.handleCheckError('Microphone', error)),
//                 this.checkBrowserCompatibility().catch(error => this.handleCheckError('Browser', error)),
//                 this.checkInternetConnection().catch(error => this.handleCheckError('Internet', error)),
//                 this.checkScreenResolution().catch(error => this.handleCheckError('Screen', error)),
//                 this.checkOperatingSystem().catch(error => this.handleCheckError('Operating System', error)),
//                 this.checkPlugins().catch(error => this.handleCheckError('Plugins', error))
//             ]);

//             // Collect system information
//             const systemInfo = await this.collectSystemInfo();

//             // Determine overall status
//             const overallStatus = this.determineOverallStatus(checkResults);

//             return {
//                 overallStatus,
//                 checks: {
//                     camera: checkResults[0],
//                     microphone: checkResults[1],
//                     browser: checkResults[2],
//                     internet: checkResults[3],
//                     screen: checkResults[4],
//                     os: checkResults[5],
//                     plugins: checkResults[6]
//                 },
//                 systemInfo,
//                 timestamp: new Date()
//             };

//         } catch (error) {
//             // Fallback result if comprehensive check fails
//             return this.getFallbackCheckResult(error);
//         }
//     }

//     /**
//      * Handle individual check errors gracefully
//      */
//     private handleCheckError(checkName: string, error: any): CheckResult {
//         console.error(`${checkName} check failed:`, error);

//         return {
//             passed: false,
//             message: `${checkName} check failed`,
//             error: error instanceof Error ? error.message : 'Unknown error occurred',
//             details: {
//                 error: error?.toString() || 'Unknown error',
//                 timestamp: new Date().toISOString()
//             }
//         };
//     }

//     /**
//      * Determine overall check status
//      */
//     private determineOverallStatus(checkResults: CheckResult[]): 'PASSED' | 'FAILED' | 'WARNING' {
//         const passedChecks = checkResults.filter(check => check.passed).length;
//         const totalChecks = checkResults.length;

//         if (passedChecks === totalChecks) {
//             return 'PASSED';
//         } else if (passedChecks >= Math.floor(totalChecks * 0.7)) { // 70% passed
//             return 'WARNING';
//         } else {
//             return 'FAILED';
//         }
//     }

//     /**
//      * Check camera availability, permissions, and functionality
//      */
//     private async checkCamera(): Promise<CheckResult> {
//         try {
//             // Check if media devices are supported
//             if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
//                 return {
//                     passed: false,
//                     message: 'Camera API not supported',
//                     error: 'Media Devices API not available',
//                     details: { supported: false }
//                 };
//             }

//             // Enumerate available devices
//             const devices = await navigator.mediaDevices.enumerateDevices();
//             const cameras = devices.filter(device =>
//                 device.kind === 'videoinput' && device.deviceId !== ''
//             );

//             if (cameras.length === 0) {
//                 return {
//                     passed: false,
//                     message: 'No camera detected',
//                     details: {
//                         detected: false,
//                         deviceCount: 0
//                     }
//                 };
//             }

//             // Test camera access with specific constraints
//             const constraints = {
//                 video: {
//                     width: { ideal: 1280 },
//                     height: { ideal: 720 },
//                     frameRate: { ideal: 30 }
//                 }
//             };

//             const stream = await navigator.mediaDevices.getUserMedia(constraints);

//             // Test if stream is actually working
//             const videoTrack = stream.getVideoTracks()[0];
//             const capabilities = videoTrack.getCapabilities();
//             const settings = videoTrack.getSettings();

//             // Clean up
//             stream.getTracks().forEach(track => track.stop());

//             return {
//                 passed: true,
//                 message: `Camera ready (${cameras.length} device(s) available)`,
//                 details: {
//                     deviceCount: cameras.length,
//                     deviceLabels: cameras.map(cam => cam.label || 'Unknown Camera'),
//                     capabilities: {
//                         width: capabilities?.width,
//                         height: capabilities?.height,
//                         frameRate: capabilities?.frameRate
//                     },
//                     settings: {
//                         width: settings?.width,
//                         height: settings?.height,
//                         frameRate: settings?.frameRate
//                     }
//                 }
//             };

//         } catch (error) {
//             return {
//                 passed: false,
//                 message: 'Camera access denied or unavailable',
//                 error: error instanceof Error ? error.message : 'Camera permission denied',
//                 details: {
//                     error: error?.toString(),
//                     permissionDenied: true
//                 }
//             };
//         }
//     }

//     /**
//      * Check microphone availability and permissions
//      */
//     private async checkMicrophone(): Promise<CheckResult> {
//         try {
//             if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
//                 return {
//                     passed: false,
//                     message: 'Microphone API not supported',
//                     error: 'Media Devices API not available',
//                     details: { supported: false }
//                 };
//             }

//             const devices = await navigator.mediaDevices.enumerateDevices();
//             const microphones = devices.filter(device =>
//                 device.kind === 'audioinput' && device.deviceId !== ''
//             );

//             if (microphones.length === 0) {
//                 return {
//                     passed: false,
//                     message: 'No microphone detected',
//                     details: {
//                         detected: false,
//                         deviceCount: 0
//                     }
//                 };
//             }

//             // Test microphone access
//             const constraints = {
//                 audio: {
//                     echoCancellation: true,
//                     noiseSuppression: true,
//                     autoGainControl: true
//                 }
//             };

//             const stream = await navigator.mediaDevices.getUserMedia(constraints);
//             const audioTrack = stream.getAudioTracks()[0];
//             const settings = audioTrack.getSettings();

//             // Clean up
//             stream.getTracks().forEach(track => track.stop());

//             return {
//                 passed: true,
//                 message: `Microphone ready (${microphones.length} device(s) available)`,
//                 details: {
//                     deviceCount: microphones.length,
//                     deviceLabels: microphones.map(mic => mic.label || 'Unknown Microphone'),
//                     settings: {
//                         channelCount: settings?.channelCount,
//                         sampleRate: settings?.sampleRate,
//                         sampleSize: settings?.sampleSize
//                     }
//                 }
//             };

//         } catch (error) {
//             return {
//                 passed: false,
//                 message: 'Microphone access denied or unavailable',
//                 error: error instanceof Error ? error.message : 'Microphone permission denied',
//                 details: {
//                     error: error?.toString(),
//                     permissionDenied: true
//                 }
//             };
//         }
//     }

//     /**
//      * Check browser compatibility and features
//      */
//     private async checkBrowserCompatibility(): Promise<CheckResult> {
//         const userAgent = navigator.userAgent.toLowerCase();
//         const browserInfo = this.analyzeBrowser(userAgent);

//         // Check required APIs
//         const requiredApis = {
//             mediaDevices: !!navigator.mediaDevices,
//             getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
//             enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
//             fullscreen: !!document.documentElement.requestFullscreen,
//             webRTC: !!window.RTCPeerConnection,
//             websocket: !!window.WebSocket
//         };

//         const missingApis = Object.entries(requiredApis)
//             .filter(([_, supported]) => !supported)
//             .map(([api]) => api);

//         const isSupported = browserInfo.supported && missingApis.length === 0;

//         return {
//             passed: isSupported,
//             message: isSupported
//                 ? `Browser compatible (${browserInfo.name} ${browserInfo.version})`
//                 : `Browser not fully supported (${browserInfo.name})`,
//             error: missingApis.length > 0 ? `Missing APIs: ${missingApis.join(', ')}` : undefined,
//             details: {
//                 browser: browserInfo.name,
//                 version: browserInfo.version,
//                 userAgent: navigator.userAgent,
//                 platform: navigator.platform,
//                 requiredApis,
//                 missingApis,
//                 supported: browserInfo.supported
//             }
//         };
//     }

//     /**
//      * Check internet connection quality and stability
//      */
//     private async checkInternetConnection(): Promise<CheckResult> {
//         try {
//             // Simple latency test
//             const latencyStart = performance.now();

//             // Use a reliable endpoint for connectivity test
//             const response = await fetch('https://www.google.com/favicon.ico', {
//                 method: 'HEAD',
//                 cache: 'no-cache',
//                 mode: 'no-cors'
//             });

//             const latency = performance.now() - latencyStart;

//             // Basic speed test (download small file)
//             const speedTestStart = performance.now();
//             await fetch('https://httpbin.org/bytes/1024', { cache: 'no-cache' });
//             const downloadSpeed = performance.now() - speedTestStart;

//             const isStable = latency < 1000; // Less than 1 second
//             const speedScore = downloadSpeed < 2000 ? 'good' : downloadSpeed < 5000 ? 'fair' : 'poor';

//             return {
//                 passed: isStable,
//                 message: isStable
//                     ? `Internet connection stable (latency: ${Math.round(latency)}ms)`
//                     : `Internet connection unstable (latency: ${Math.round(latency)}ms)`,
//                 details: {
//                     latency: Math.round(latency),
//                     downloadSpeed: Math.round(downloadSpeed),
//                     speedScore,
//                     online: navigator.onLine,
//                     timestamp: new Date().toISOString()
//                 }
//             };

//         } catch (error) {
//             return {
//                 passed: false,
//                 message: 'Internet connection test failed',
//                 error: error instanceof Error ? error.message : 'Connectivity test failed',
//                 details: {
//                     online: navigator.onLine,
//                     error: error?.toString(),
//                     timestamp: new Date().toISOString()
//                 }
//             };
//         }
//     }

//     /**
//      * Check screen resolution and display capabilities
//      */
//     private async checkScreenResolution(): Promise<CheckResult> {
//         const width = screen.width;
//         const height = screen.height;
//         const minWidth = 1024;
//         const minHeight = 768;

//         const isAdequate = width >= minWidth && height >= minHeight;
//         const pixelRatio = window.devicePixelRatio || 1;

//         return {
//             passed: isAdequate,
//             message: isAdequate
//                 ? `Screen resolution adequate (${width}x${height})`
//                 : `Screen resolution too low (${width}x${height}) - Minimum: ${minWidth}x${minHeight}`,
//             details: {
//                 width,
//                 height,
//                 minWidth,
//                 minHeight,
//                 pixelRatio,
//                 colorDepth: screen.colorDepth,
//                 adequate: isAdequate
//             }
//         };
//     }

//     /**
//      * Check operating system compatibility
//      */
//     private async checkOperatingSystem(): Promise<CheckResult> {
//         const platform = navigator.platform.toLowerCase();
//         const userAgent = navigator.userAgent.toLowerCase();

//         const osInfo = this.analyzeOperatingSystem(platform, userAgent);
//         const isSupported = osInfo.supported;

//         return {
//             passed: isSupported,
//             message: isSupported
//                 ? `Operating system supported (${osInfo.name})`
//                 : `Unsupported operating system (${osInfo.name})`,
//             details: {
//                 platform: navigator.platform,
//                 name: osInfo.name,
//                 version: osInfo.version,
//                 supported: osInfo.supported,
//                 architecture: osInfo.architecture
//             }
//         };
//     }

//     /**
//      * Check for prohibited plugins and extensions
//      */
//     private async checkPlugins(): Promise<CheckResult> {
//         const plugins = Array.from(navigator.plugins).map(plugin => ({
//             name: plugin.name,
//             filename: plugin.filename,
//             description: plugin.description
//         }));

//         const prohibitedPlugins = [
//             'Chrome Remote Desktop',
//             'TeamViewer',
//             'AnyDesk',
//             'Remote Desktop',
//             'VNC',
//             'Screen Sharing'
//         ];

//         const foundProhibited = plugins.filter(plugin =>
//             prohibitedPlugins.some(prohibited =>
//                 plugin.name.toLowerCase().includes(prohibited.toLowerCase())
//             )
//         );

//         const hasProhibited = foundProhibited.length > 0;

//         return {
//             passed: !hasProhibited,
//             message: hasProhibited
//                 ? `Prohibited plugins detected: ${foundProhibited.map(p => p.name).join(', ')}`
//                 : 'No prohibited plugins detected',
//             details: {
//                 plugins,
//                 prohibitedPlugins: foundProhibited,
//                 pluginCount: plugins.length,
//                 hasProhibited
//             }
//         };
//     }

//     /**
//      * Analyze browser from user agent
//      */
//     private analyzeBrowser(userAgent: string): BrowserInfo {
//         const isChrome = /chrome|chromium/i.test(userAgent) && !/edg/i.test(userAgent);
//         const isFirefox = /firefox|fxios/i.test(userAgent);
//         const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
//         const isEdge = /edg/i.test(userAgent);

//         // Extract version
//         const versionMatch = userAgent.match(/(chrome|firefox|safari|edg)\/?\s*(\d+)/i);
//         const version = versionMatch ? versionMatch[2] : 'unknown';

//         let name = 'Unknown';
//         if (isChrome) name = 'Chrome';
//         else if (isFirefox) name = 'Firefox';
//         else if (isSafari) name = 'Safari';
//         else if (isEdge) name = 'Edge';

//         // Supported browsers (Chrome, Firefox, Safari, Edge)
//         const supported = isChrome || isFirefox || isSafari || isEdge;

//         return { name, version, supported };
//     }

//     /**
//      * Analyze operating system from platform and user agent
//      */
//     private analyzeOperatingSystem(platform: string, userAgent: string): OSInfo {
//         let name = 'Unknown';
//         let version = 'unknown';
//         let architecture = 'unknown';

//         if (platform.includes('win')) {
//             name = 'Windows';
//             // Extract Windows version
//             const winVersionMatch = userAgent.match(/windows nt (\d+\.\d+)/i);
//             if (winVersionMatch) version = winVersionMatch[1];
//         } else if (platform.includes('mac')) {
//             name = 'macOS';
//             const macVersionMatch = userAgent.match(/mac os x (\d+[._]\d+[._]\d+)/i);
//             if (macVersionMatch) version = macVersionMatch[1].replace(/_/g, '.');
//         } else if (platform.includes('linux')) {
//             name = 'Linux';
//         }

//         // Check architecture
//         if (userAgent.includes('wow64') || userAgent.includes('win64')) {
//             architecture = '64-bit';
//         } else if (userAgent.includes('win32')) {
//             architecture = '32-bit';
//         }

//         // Supported operating systems
//         const supported = name !== 'Unknown';

//         return { name, version, architecture, supported };
//     }

//     /**
//      * Collect comprehensive system information
//      */
//     private async collectSystemInfo(): Promise<SystemInformation> {
//         const cameraCheck = await this.checkCamera().catch(() => ({ passed: false } as CheckResult));
//         const microphoneCheck = await this.checkMicrophone().catch(() => ({ passed: false } as CheckResult));

//         return {
//             os: navigator.platform,
//             browser: this.analyzeBrowser(navigator.userAgent.toLowerCase()).name,
//             browserVersion: this.analyzeBrowser(navigator.userAgent.toLowerCase()).version,
//             screenResolution: `${screen.width}x${screen.height}`,
//             camera: cameraCheck.passed,
//             microphone: microphoneCheck.passed,
//             speakers: true, // Assume speakers are available
//             plugins: Array.from(navigator.plugins).map(p => p.name),
//             timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//             language: navigator.language,
//             userAgent: navigator.userAgent,
//             cpuCores: navigator.hardwareConcurrency || 'unknown',
//             deviceMemory: (navigator as any).deviceMemory || 'unknown',
//             maxTouchPoints: navigator.maxTouchPoints || 0,
//             pdfViewerEnabled: navigator.pdfViewerEnabled || false
//         };
//     }

//     /**
//      * Fallback result when comprehensive check fails
//      */
//     private getFallbackCheckResult(error: any): EnvironmentCheckResult {
//         const errorMessage = error instanceof Error ? error.message : 'Comprehensive check failed';

//         return {
//             overallStatus: 'FAILED',
//             checks: {
//                 camera: { passed: false, message: 'Check failed', error: errorMessage },
//                 microphone: { passed: false, message: 'Check failed', error: errorMessage },
//                 browser: { passed: false, message: 'Check failed', error: errorMessage },
//                 internet: { passed: false, message: 'Check failed', error: errorMessage },
//                 screen: { passed: false, message: 'Check failed', error: errorMessage },
//                 os: { passed: false, message: 'Check failed', error: errorMessage },
//                 plugins: { passed: false, message: 'Check failed', error: errorMessage }
//             },
//             systemInfo: {
//                 os: 'unknown',
//                 browser: 'unknown',
//                 browserVersion: 'unknown',
//                 screenResolution: 'unknown',
//                 camera: false,
//                 microphone: false,
//                 speakers: false,
//                 plugins: [],
//                 timezone: 'unknown',
//                 language: 'unknown',
//                 userAgent: navigator.userAgent
//             },
//             timestamp: new Date()
//         };
//     }
// }

// /**
//  * Interface Definitions
//  */

// export interface EnvironmentCheckResult {
//     overallStatus: 'PASSED' | 'FAILED' | 'WARNING';
//     checks: {
//         camera: CheckResult;
//         microphone: CheckResult;
//         browser: CheckResult;
//         internet: CheckResult;
//         screen: CheckResult;
//         os: CheckResult;
//         plugins: CheckResult;
//     };
//     systemInfo: SystemInformation;
//     timestamp: Date;
// }

// export interface CheckResult {
//     passed: boolean;
//     message: string;
//     error?: string;
//     details?: any;
// }

// export interface SystemInformation {
//     os: string;
//     browser: string;
//     browserVersion: string;
//     screenResolution: string;
//     camera: boolean;
//     microphone: boolean;
//     speakers: boolean;
//     internetSpeed?: number;
//     plugins: string[];
//     timezone: string;
//     language: string;
//     userAgent: string;
//     cpuCores?: number | string;
//     deviceMemory?: number | string;
//     maxTouchPoints?: number;
//     pdfViewerEnabled?: boolean;
// }

// interface BrowserInfo {
//     name: string;
//     version: string;
//     supported: boolean;
// }

// interface OSInfo {
//     name: string;
//     version: string;
//     architecture: string;
//     supported: boolean;
// }
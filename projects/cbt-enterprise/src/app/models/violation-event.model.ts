/**
 * Violation Event Model
 * Represents suspicious activities detected during proctoring
 * 
 * Phase 1: Basic violation tracking with evidence
 * Phase 2: Enhanced with AI confidence scores and detailed analysis
 */
export interface ViolationEvent {
  id?: number;
  eventId: string;
  sessionId: string;
  type: ViolationType;
  severity: Severity;
  description: string;
  evidenceUrl?: string;
  violationTime: Date;
  metadata: ViolationMetadata;
  confidenceScore?: number; // Phase 2
  aiAnalysis?: any; // Phase 2
  reviewed: boolean;
  reviewerNotes?: string;
  createdAt: Date;
}

/**
 * Types of violations that can be detected
 */
export enum ViolationType {
  TAB_SWITCH = 'TAB_SWITCH',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  NO_FACE = 'NO_FACE',
  VOICE_DETECTED = 'VOICE_DETECTED',
  UNAUTHORIZED_DEVICE = 'UNAUTHORIZED_DEVICE',
  SCREEN_SHARE_FAILURE = 'SCREEN_SHARE_FAILURE',
  NETWORK_ANOMALY = 'NETWORK_ANOMALY',
  SYSTEM_MANIPULATION = 'SYSTEM_MANIPULATION'
}

/**
 * Severity levels for violations
 */
export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Metadata associated with violation events
 */
export interface ViolationMetadata {
  tabUrl?: string;
  faceCount?: number;
  audioLevel?: number;
  deviceType?: string;
  networkStatus?: string;
  screenshot?: string;
  timestamp: number;
  [key: string]: any;
}
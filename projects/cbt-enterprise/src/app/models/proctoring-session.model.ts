/**
 * Proctoring Session Model
 * Represents a candidate's proctoring session with all monitoring data
 * 
 * Phase 1: Basic session information and status tracking
 * Phase 2: Will include AI behavior metrics and advanced analytics
 */
export interface ProctoringSession {
  id?: number;
  sessionId: string;
  examAttemptId: string;
  candidateId: string;
  candidateName: string;
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  systemInfo: SystemInformation;
  mediaStorage: MediaStorage;
  behaviorMetrics?: BehaviorMetrics; // Phase 2
  aiAnalysis?: AIAnalysis; // Phase 2
  updatedAt: Date;
}

/**
 * Session status enumeration
 */
export enum SessionStatus {
  INITIATED = 'INITIATED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
  FAILED = 'FAILED'
}

/**
 * System information collected during environment check
 */
export interface SystemInformation {
  os: string;
  browser: string;
  browserVersion: string;
  screenResolution: string;
  camera: boolean;
  microphone: boolean;
  speakers: boolean;
  internetSpeed?: number;
  plugins: string[];
  timezone: string;
  language: string;
  userAgent: string;
}

/**
 * Media storage locations for recordings and screenshots
 */
export interface MediaStorage {
  videoRecordings: string[];
  screenCaptures: string[];
  audioRecordings: string[];
  evidence: string[];
}

/**
 * Behavior metrics placeholder for Phase 2 AI features
 */
export interface BehaviorMetrics {
  gazeAnalysis?: any;
  facialExpressions?: any;
  headMovement?: any;
  attentionScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * AI analysis placeholder for Phase 2 features
 */
export interface AIAnalysis {
  cheatingProbability?: number;
  anomalyDetection?: any;
  patternAnalysis?: any;
  confidenceScore?: number;
}
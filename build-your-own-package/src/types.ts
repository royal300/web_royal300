export interface SurveyAnswers {
  platform: string;
  goal: string;
  frequency: string;
  tone: string;
}

export interface WeeklyPost {
  day: string;
  contentType: string;
  topic: string;
  description: string;
}

export interface PostTemplate {
  title: string;
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
}

export interface GeneratedPackage {
  profileName: string;
  strategyName: string;
  strategyOverview: string;
  platformPlaybook: string[];
  weeklySchedule: WeeklyPost[];
  postConcepts: PostTemplate[];
  actionPlan: string[];
}

export interface SavedPackage {
  id: string;
  answers: SurveyAnswers;
  packageData: GeneratedPackage;
  timestamp: string;
}

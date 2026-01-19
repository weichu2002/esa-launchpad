export interface ProjectState {
  repoUrl: string;
  diagnosis: Diagnosis | null;
  patches: PatchFile[];
  useEdgeKV?: boolean;
  kvNamespace?: string;
  useCustomHeaders?: boolean;
}

export interface Diagnosis {
  framework: 'react' | 'vue' | 'nextjs' | 'vite' | 'other';
  projectName: string;
  branch: string;
  isSpa: boolean;
  installCmd: string;
  buildCmd: string;
  outputDir: string;
  rootDir: string;
  functionPath?: string;
  nodejsVersion: string;
  hasApiRoutes: boolean;
  requiredEnvVars: string[];
  missingConfigs: {
    esaJsonc: boolean;
    edgeFunctions: boolean;
  };
}

export interface PatchFile {
  path: string;
  content: string;
  type: 'new' | 'modified' | 'doc';
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
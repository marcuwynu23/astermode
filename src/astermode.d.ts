export interface AsterModeOptions {
  enabled?: boolean;
  cacheBypassDefault?: boolean;
}

export interface VitePluginLike {
  name: string;
  apply?: "serve" | "build";
  enforce?: "pre" | "post";
  configResolved?: (config: { command: "build" | "serve" }) => void;
  transformIndexHtml?: (
    html: string
  ) =>
    | string
    | {
        html: string;
        tags: Array<{
          tag: string;
          attrs?: Record<string, string>;
          children?: string;
          injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
        }>;
      };
}

declare function astermode(options?: AsterModeOptions): VitePluginLike;

export default astermode;

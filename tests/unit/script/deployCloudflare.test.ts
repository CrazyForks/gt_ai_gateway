import { describe, expect, it } from "vitest";

const deployCloudflare = require("../../../script/deploy-cloudflare.js") as {
    getR2SkipReason: (error: Error, action: string, bucketName: string) => string;
    isR2UnavailableError: (error: Error) => boolean;
    isSkippableR2Error: (error: Error) => boolean;
};


describe("deploy-cloudflare", () => {
    it("treats Cloudflare R2 disabled errors as skippable", () => {
        const error = Object.assign(new Error("Command failed: npx wrangler r2 bucket list"), {
            stderr: `
✘ [ERROR] A request to the Cloudflare API (/accounts/test/r2/buckets) failed.
  Please enable R2 through the Cloudflare Dashboard. [code: 10042]
`,
        });

        expect(deployCloudflare.isR2UnavailableError(error)).toBe(true);
        expect(deployCloudflare.isSkippableR2Error(error)).toBe(true);
        expect(deployCloudflare.getR2SkipReason(error, "checking", "gt-ai-gateway-objects"))
            .toBe("Cloudflare R2 is not enabled for this account while checking bucket gt-ai-gateway-objects.");
    });
});

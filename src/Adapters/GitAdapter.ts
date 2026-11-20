import { execFileSync } from "node:child_process";

const ISO_DATE_LENGTH = 10;

export class GitAdapter {
  // Why: the sitemap needs the date of the last commit that touched the site, and today is the answer when git has none.
  static lastModified(): string {
    try {
      const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", "src", "design"], {
        encoding: "utf8",
      }).trim();
      return date === "" ? GitAdapter.today() : date;
    } catch {
      return GitAdapter.today();
    }
  }

  private static today(): string {
    return new Date().toISOString().slice(0, ISO_DATE_LENGTH);
  }
}

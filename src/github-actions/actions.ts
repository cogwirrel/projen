import { ActionMetadata, RunsUsing } from "../github/actions-metadata-model";
import { TypeScriptProject, TypeScriptProjectOptions } from "../typescript";
import { YamlFile } from "../yaml";

/**
 * Properties for creating a GitHubActionTypeScriptProject
 */
export interface GitHubActionTypeScriptOptions
  extends TypeScriptProjectOptions {
  /**
   * Every GitHub Action must have a metadata file named `action.yml`.
   * Projen will manage this file for you using the specifications of
   * this property.
   */
  readonly metadata?: ActionMetadata;
}

/**
 * Create a GitHub Action with TypeScript.
 *
 * @pjid github-action-ts
 */
export class GitHubActionTypeScriptProject extends TypeScriptProject {
  constructor(options: GitHubActionTypeScriptOptions) {
    super(options);

    // standard GitHub action packages
    this.addDeps("@actions/core", "@actions/github");

    // package as a single runnable .js file in /dist
    this.addDevDeps("@vercel/ncc");
    this.packageTask.reset("ncc build --source-map --license licenses.txt");

    this.package.addField("main", "lib/index.js");
    this.addGitIgnore("!/dist/");
    this.annotateGenerated("/dist/**");

    // Create metadata for projen managed `action.yml` file.
    const defaultMetadataOptions: ActionMetadata = {
      name: this.name,
      description: `A GitHub Action for ${this.name}`,
      runs: {
        using: RunsUsing.NODE_16,
        main: "lib/index.js",
      },
    };

    new YamlFile(this, "action.yml", {
      obj: {
        ...defaultMetadataOptions,
        ...options.metadata,
      },
    });
  }
}
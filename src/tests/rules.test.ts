import path from "path"
import rulesIndex from "../index"
import fs from "fs"

const rulesDirPath = path.join(path.dirname(__dirname), "rules")

describe("rules snapshot", () => {
  it("matches the expected content", () => {
    const rules = fs
      .readdirSync(rulesDirPath)
      .filter((x) => x !== "index.ts")
      .map((x) => path.parse(x).name)
      .sort()
    const indexRules = Object.keys(rulesIndex.rules).sort()
    expect(rules).toEqual(indexRules)
  })
})

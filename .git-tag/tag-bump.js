#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function hasCommits() {
  try {
    run("git rev-parse --verify HEAD");
    return true;
  } catch {
    return false;
  }
}

function getLastTag() {
  try {
    const tags = run("git tag --list").split("\n");
    if (!tags.length) return "v0.0.0";

    return tags.reduce((max, tag) => {
      const parse = v => v.replace(/^v/, "").split(".").map(Number);
      const [m1, n1, p1] = parse(max);
      const [m2, n2, p2] = parse(tag);

      if (m2 > m1) return tag;
      if (m2 === m1 && n2 > n1) return tag;
      if (m2 === m1 && n2 === n1 && p2 > p1) return tag;
      return max;
    }, tags[0]);
  } catch {
    return "v0.0.0";
  }
}

function bumpVersion(lastTag, commitMsg) {
  const version = lastTag.replace(/^v/, "");
  let [major, minor, patch] = version.split(".").map(Number);

  const msg = commitMsg.toLowerCase();

  if (msg.includes("breaking")) {
    major++;
    minor = 0;
    patch = 0;
  } else if (msg.includes("feat")) {
    minor++;
    patch = 0;
  } else if (msg.includes("fix")) {
    patch++;
  } else {
    return null;
  }

  return `v${major}.${minor}.${patch}`;
}



// function bumpVersion(lastTag, commitMsg) {
//   const version = lastTag.replace(/^v/, "");
//   let [major, minor, patch] = version.split(".").map(Number);

//   const msg = commitMsg.trim();

  
//   if (/^breaking/i.test(msg)) {
// 	  major++;
// 	  minor = 0;
//     patch = 0;
//   } else if (/^feat/i.test(msg)) {
// 	  minor++;
//     patch = 0;
//   } else if (/^fix/i.test(msg)) {
// 	  patch++;
//   } else {
// 	return null;
//   }

//   return `v${major}.${minor}.${patch}`;
// }


function createTag(tag) {
  run(`git tag ${tag}`);
  run(`git push origin ${tag}`);
}


function main() {
  if (!hasCommits()) {
    console.log("has no commits")
  }
  const lastTag = getLastTag();
  console.log("last tag: " + lastTag)
  const commitMsg = run("git log -1 --pretty=%B").trim();
  console.log("last commitMsg: " + commitMsg)
  const newTag = bumpVersion(lastTag, commitMsg);
  if (newTag) {
    createTag(newTag);
  }
}

main();

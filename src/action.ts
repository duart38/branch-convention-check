/*
 *   Copyright (c) 2022 Duart Snel
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */
import { getInput, info, notice, setFailed } from '@actions/core';
import { context } from '@actions/github';
import exec from '@actions/exec';

try {
  let myOutput = '';

  await exec.exec('printenv',[], {
    listeners: {
      stdout: (data) => {
        myOutput += data.toString();
      }
    }
  });

  const ref = context.ref;
  const branchName = ref.split("/")[ref.split("/").length - 1];
  console.log(`Running branch naming check for name ${branchName}`);

  const standard_branch = new RegExp(getInput("standard_branch_check"));
  const ignore_branch = new RegExp(getInput("ignore_branch_check"));
  if (ignore_branch.test(branchName)) {
    notice(`Ignoring branch ${branchName} as per specification`);
  } else if (standard_branch.test(branchName)) {
    info("Branch naming check passed.");
  } else {
    const caught = checkIgnored(branchName);
    // nothing was caught.. fail..
    if (caught === false) setFailed("Please make sure your branch complies with our naming conventions.");
  }
} catch (error: any) {
  setFailed(error.message);
}

/**
 * Check wether the passed in string should be ignored as per the specifications in branching.yml
 * @param bn  
 * @returns Boolean
 */
function checkIgnored(bn: string) {
  var toIgnore = getInput("ignore").split(",");
  var caught = false; // holds a boolean to dictate if this branch was ignored or not.
  toIgnore.forEach(element => {
    if (bn === element) {
      notice(`Ignoring branch ${element} as per specification`);
      caught = true; // break when found
    }
  });
  return caught;
}
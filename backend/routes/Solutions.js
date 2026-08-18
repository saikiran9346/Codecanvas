const express = require("express");
const router = express.Router();
const Solution = require("../models/Solution");
const auth = require("../middleware/auth");
const axios = require("axios");
const JUDGE0_LANGUAGE_IDS = {
  cpp: 105,
  python: 100,
  java: 91,
  javascript: 93,
};

function normalizeOutput(str) {
  if (!str) return "";
  return str
    .replace(/[\[\],]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseTestCasesFromProblem(problemData) {
  const testCases = [];
  const expectedOutputs = [];

  // Extract examples from question HTML
  const exampleRegex = /<strong>Input:<\/strong>([\s\S]*?)<strong>Output:<\/strong>([\s\S]*?)(?:<strong>Explanation:<\/strong>|<strong>Example|\n<p>&nbsp;<\/p>|<\/pre>|$)/gi;
  let match;
  const htmlExamples = [];
  while ((match = exampleRegex.exec(problemData.question || "")) !== null) {
    const rawInput = match[1].replace(/<[^>]+>/g, '').trim();
    const rawOutput = match[2].replace(/<[^>]+>/g, '').trim();
    htmlExamples.push({ input: rawInput, output: rawOutput });
  }

  // Parse exampleTestcases lines
  const rawLines = (problemData.exampleTestcases || "")
    .trim()
    .split('\n')
    .filter(l => l.trim() !== '');

  if (htmlExamples.length > 0) {
    const numExamples = htmlExamples.length;
    const linesPerCase = Math.max(1, Math.floor(rawLines.length / numExamples));

    for (let i = 0; i < numExamples; i++) {
      const caseLines = rawLines.slice(i * linesPerCase, (i + 1) * linesPerCase);
      const stdinInput = caseLines.length > 0 ? caseLines.join('\n') : htmlExamples[i].input;
      testCases.push(stdinInput);
      expectedOutputs.push(htmlExamples[i].output);
    }
  } else if (rawLines.length > 0) {
    testCases.push(rawLines.join('\n'));
    expectedOutputs.push("");
  }

  return { testCases, expectedOutputs };
}

router.post("/submit", auth, async (req, res) => {
  try {
    const { problemSlug, code, language } = req.body;
    console.log("Received submission request:", { problemSlug, language });
    console.log("Fetching problem details from LeetCode API...");
    const leetcodeResponse = await axios.get(`https://leetcode-api-mu.vercel.app/select?titleSlug=${problemSlug}`);
    const problemData = leetcodeResponse.data;
    
    const { testCases, expectedOutputs } = parseTestCasesFromProblem(problemData);
    console.log("Parsed test cases count:", testCases.length);

    const testResults = [];
    let allTestsPassed = true;
    const judgeUrl = process.env.JUDGE_URL || "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
    console.log("Using judge URL:", judgeUrl);
    
    const languageId = JUDGE0_LANGUAGE_IDS[language] || JUDGE0_LANGUAGE_IDS.cpp;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const expectedOutput = expectedOutputs[i] || '';
      
      try {
        console.log(`Running test case ${i + 1}:`, testCase);
        
        const response = await axios.post(
          judgeUrl,
          {
            source_code: code,
            language_id: languageId,
            stdin: testCase,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        console.log(`Judge API response for test case ${i + 1}:`, response.data);

        const { stdout, stderr, compile_output } = response.data;
        
        if (compile_output) {
          const errorMsg = compile_output.trim();
          console.log(`Test case ${i + 1} compilation error:`, errorMsg);
          testResults.push({
            input: testCase,
            expected: expectedOutput,
            error: errorMsg,
            passed: false,
          });
          allTestsPassed = false;
          break; // Stop running remaining cases on compilation error
        } else if (stderr) {
          const errorMsg = stderr.trim();
          const actualOutput = (stdout || "").trim();
          console.log(`Test case ${i + 1} runtime error:`, errorMsg);
          testResults.push({
            input: testCase,
            output: actualOutput,
            expected: expectedOutput,
            passed: false,
            error: errorMsg,
          });
          allTestsPassed = false;
        } else {
          const actualOutput = (stdout || "").trim();
          console.log(`Test case ${i + 1} output:`, actualOutput);
          console.log(`Expected output:`, expectedOutput);
          
          const normActual = normalizeOutput(actualOutput);
          const normExpected = normalizeOutput(expectedOutput);
          const passed = normActual === normExpected || actualOutput === expectedOutput.trim();
          
          console.log(`Test case ${i + 1} passed:`, passed, `("${normActual}" vs "${normExpected}")`);
          
          testResults.push({
            input: testCase,
            output: actualOutput,
            expected: expectedOutput,
            passed,
            error: null,
          });

          if (!passed) {
            allTestsPassed = false;
          }
        }
      } catch (error) {
        console.error(`Error in test case ${i + 1}:`, error);
        testResults.push({
          input: testCase,
          expected: expectedOutput,
          error: error.message,
          passed: false,
        });
        allTestsPassed = false;
      }
    }

    console.log("Sending response:", testResults);

    // Only save solution if all tests passed
    if (allTestsPassed) {
      const solution = new Solution({
        problemSlug,
        code,
        language,
        author: req.user.user_id,
      });

      await solution.save();
      console.log("Solution saved to database");

      // Explicitly construct the success response object including testResults
      const successResponse = {
        success: true,
        message: "Solution submitted successfully!",
        passed: true,
        details: "All test cases passed",
        testResults: testResults.map(result => ({
          input: result.input,
          output: result.output,
          expected: result.expected,
          passed: result.passed
          // Error is excluded here for a successful test case result
        }))
      };

      res.json(successResponse);
    } else {
      // Keep the existing failure response structure
      res.json({
        success: false,
        message: "Solution failed test cases",
        passed: false,
        details: "Some test cases failed",
        testResults: testResults.map(result => ({
          input: result.input,
          output: result.output,
          expected: result.expected,
          passed: result.passed,
          error: result.error
        }))
      });
    }

  } catch (err) {
    console.error("Error in submission:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during submission and testing.",
      passed: false,
      details: err.message,
      testResults: [
        {
          input: "N/A",
          output: "N/A",
          expected: "N/A",
          passed: false,
          error: `Backend Error: ${err.message}`
        }
      ]
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    // Check if solution exists and user is the author
    if (!solution) {
      return res.status(404).json({ error: "Solution not found" });
    }
    console.log(solution.author, req.user.user_id);
    if (solution.author.toString() !== req.user.user_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this solution" });
    }

    await Solution.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Solution deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all solutions for a problem
router.get("/:problemSlug", async (req, res) => {
  try {
    const solutions = await Solution.find({
      problemSlug: req.params.problemSlug,
    })
      .populate("author", "Username _id")
      .sort({ createdAt: -1 });

    res.json(solutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get solution detail
router.get("/detail/:id", async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id).populate(
      "author",
      "Username _id"
    );
    res.json(solution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle voting
router.post("/vote", async (req, res) => {
  try {
    const { solutionId, voteType } = req.body;
    const solution = await Solution.findById(solutionId);

    if (!solution) {
      return res.status(404).json({ error: "Solution not found" });
    }

    // Update votes
    solution.votes += voteType === "upvote" ? 1 : -1;
    await solution.save();

    res.json({ success: true, votes: solution.votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
